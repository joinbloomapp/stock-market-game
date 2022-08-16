/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable, Logger } from "@nestjs/common";
import { AbstractMinutesService } from "../abstract-minutes.service";
import { MinuteBarData } from "./dto/minute-bar-data.dto";
import {
  StockPriceEntity,
  CurrentPositionEntity,
  StockEntity,
} from "@bloom-smg/postgresql";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import ormConfig from "src/system/OrmConfig";
import { stringify } from "JSONStream";
import { mapSync } from "src/utils/typeorm/map-stream";

interface HistoricalAggBatchT {
  playerId: string;
  gameId: string;
  improvement: string;
  stockId: string;
}

@Injectable()
export class StockMinutesService extends AbstractMinutesService {
  logger = new Logger(StockMinutesService.name);
  url = "wss://delayed.polygon.io/stocks";

  batchSize = 3;

  constructor() {
    super();
    this.minuteBarThrottleCache = {};
    this.insertHistoricalAggregateBatch = [];
    this.numberOfPGs = 0;
  }

  async onConnect() {
    this.socket.send(
      JSON.stringify({
        action: "subscribe",
        params: "AM.*",
      })
    );
  }

  private minuteBarThrottleCache: { [key: string]: number };

  clearCache() {
    this.minuteBarThrottleCache = {};
    this.numberOfPGs = 0;
  }

  async receive(data) {
    // polygon returns events in arrays
    for (const x of data) {
      switch (x.ev) {
        case "AM": {
          const lastExecution = this.minuteBarThrottleCache[x.sym];
          // wait every 5 minutes to perform for an individual stock
          if (lastExecution && Date.now() - lastExecution < 1000 * 60 * 5) {
            continue;
          }
          this.updateCurrentPositionBackPressure.push(x);
          await this.updateCurrentPositionsConsumer();
        }
      }
    }
  }

  maxNumberOfPGs = 30;
  // leave ten for other tasks that use default connection
  // and 10 more in case the counter goes above the max since event listener fun :)
  numberOfPGs: number;

  canCreateNewPG(): boolean {
    return this.numberOfPGs < this.maxNumberOfPGs;
  }

  private updateCurrentPositionBackPressure: MinuteBarData[] = [];

  /**
   * Since we get so much shit, inspired by the task worker, we basically
   * make a consumer to avoid race conditions and also to use a small number
   * of connections to perform queries and avoid too many connections.
   */
  async updateCurrentPositionsConsumer() {
    if (!this.canCreateNewPG()) return;
    this.numberOfPGs++;
    const consumerId = uuidv4();
    let conn: Connection;
    try {
      conn = await createConnection({
        ...ormConfig,
        ...{ name: consumerId },
      });
    } catch (e) {
      // Typically too many clients. It's fine, just move on because
      // we'll let the cache handle the rest.
      this.logger.error(`${consumerId} had an issue: ${e}`);
      this.numberOfPGs--;
      return;
    }
    if (this.insertHistoricalAggregateBatch.length >= this.batchSize) {
      try {
        await this.batchInsertHistoricalAggregatePosition(conn);
      } catch {
        //
      }
    }
    while (this.updateCurrentPositionBackPressure.length > 0) {
      try {
        const data = this.updateCurrentPositionBackPressure.shift();
        await this.updateCurrentPositions(conn, data);
        this.minuteBarThrottleCache[data.sym] = Date.now();
      } catch {
        break;
      }
    }
    if (conn && conn.isConnected) {
      await conn.close();
    }
    this.numberOfPGs--;
  }

  /**
   * Updates stock price table, current positions, and historical positions.
   *
   * 1. A minute bar event is received, so we update the stock price table
   * 2. We now need to grab each current position. We multiply the given price
   * by the current quantity and add it to the historical position table to keep
   * the historical position table up to date. We don't update a value in
   * current position since that can slow us down, and that current position
   * pricing can be found via the historical position table.
   * 3. For historical aggregate, we use the old and new position's values'
   * difference and add it to the historical aggregate record that matches
   * the user.
   */
  async updateCurrentPositions(conn: Connection, data: MinuteBarData) {
    const stockPriceRepo = conn.getRepository(StockPriceEntity);
    let stockPriceEntity: Partial<StockPriceEntity> =
      await stockPriceRepo.findOne(
        { ticker: data.sym },
        { select: ["id", "price", "stockId", "lastUpdated"] }
      );
    let newPrice = (data.h + data.l) / 2;
    if (newPrice < 0) {
      newPrice = 0; // in case of rounding error
    }
    if (!stockPriceEntity) {
      // Check if the stock even exists
      const stockRepo = conn.getRepository(StockEntity);
      const stockEntity = await stockRepo.findOne(
        { ticker: data.sym },
        { select: ["id"] }
      );
      if (!stockEntity) {
        // this.logger.error(`${data.sym} does not exist`);
        this.minuteBarThrottleCache[data.sym] = Date.now();
        return;
      }
      const ret = await stockPriceRepo.insert({
        stockId: stockEntity.id,
        ticker: data.sym,
        price: newPrice,
        oldPrice: 0,
        percentChange: 0,
      });
      stockPriceEntity = {
        id: ret.identifiers[0].id,
        stockId: stockEntity.id,
        ticker: data.sym,
        price: newPrice,
        stock: stockEntity,
        lastUpdated: new Date(),
        oldPrice: 0,
        percentChange: 0,
      };
    } else {
      // decide whether to change the old price or not. We know it's on a
      // new trading day whether the length of time between close and open
      // is greater than 8 hours (closes at 16:15 (due to delayed websocket)
      // and opens at 9:45 (due to delayed websocket)) which is more than the
      // typical 7 hours already.
      let partialEntity;
      if (
        Date.now() - stockPriceEntity.lastUpdated.getTime() >
        1000 * 60 * 60 * 8
      ) {
        partialEntity = {
          price: newPrice,
          oldPrice: stockPriceEntity.price,
          percentChange:
            (newPrice - stockPriceEntity.price) / stockPriceEntity.price,
        } as Partial<StockPriceEntity>;
      } else {
        partialEntity = { price: newPrice } as Partial<StockPriceEntity>;
      }

      await stockPriceRepo.update(stockPriceEntity.id, partialEntity);
    }

    // Start updating the historical positions
    // ---------------------------------------
    // prepare improvement for SQL string
    const improvement: number = parseFloat(
      (newPrice - stockPriceEntity.price + 0.0000000001).toFixed(3)
    );

    // We need to fetch all CurrentPosition records and batch insert them
    // into the historical aggregates
    const query = conn
      .getRepository(CurrentPositionEntity)
      .createQueryBuilder("e")
      .where("e.stockId = :stockId", { stockId: stockPriceEntity.stockId })
      .andWhere("e.isActive = true");
    if (process.env.NODE_ENV !== "test") {
      const stream = await query.stream();

      stream.pipe(stringify()).pipe(
        mapSync((s: string) => {
          if (!s.includes("{")) return {};
          s = s.substring(s.indexOf("{")).replace(/"|"/g, '"');
          if (s.endsWith(",")) {
            s = s.substring(0, s.length - 1);
          }
          const data = JSON.parse(s);
          let improvementStr: string;
          if (improvement < 0) {
            improvementStr = `${improvement * data.e_quantity * 1000}`;
          } else if (improvement > 0) {
            improvementStr = `+ ${improvement * data.e_quantity * 1000}`;
          } else {
            improvementStr = "";
          }

          this.insertHistoricalAggregateBatch.push({
            playerId: data.e_playerId,
            gameId: data.e_gameId,
            improvement: improvementStr,
            stockId: stockPriceEntity.stockId,
          });
          return data;
        })
      );
    } else {
      const entities = await query.getMany();
      entities.forEach((e) => {
        let improvementStr: string;
        if (improvement < 0) {
          improvementStr = `${improvement * e.quantity * 1000}`;
        } else if (improvement > 0) {
          improvementStr = `+ ${improvement * e.quantity * 1000}`;
        } else {
          improvementStr = "";
        }
        this.insertHistoricalAggregateBatch.push({
          playerId: e.playerId,
          gameId: e.gameId,
          improvement: improvementStr,
          stockId: stockPriceEntity.stockId,
        });
      });
    }
  }

  insertHistoricalAggregateBatch: {
    playerId: string;
    gameId: string;
    improvement: string;
    stockId: string;
  }[];

  public async batchInsertHistoricalAggregatePosition(conn: Connection) {
    // Potential race conditions galore!!!
    const deleted = this.insertHistoricalAggregateBatch.splice(
      0,
      this.batchSize
    );
    for (const x of deleted) {
      await conn.query(
        `INSERT INTO "HistoricalPosition" (
            "createdAt",
            "playerId",
            "gameId",
            "value",
            "stockId"
        ) (SELECT NOW(), $1, $2, (t."value"${x.improvement}), $3
           FROM "HistoricalPosition" as t
           WHERE t."playerId" = $1 AND t."stockId" = $3 ORDER BY t."id" DESC LIMIT 1)`,
        [x.playerId, x.gameId, x.stockId]
      );
      const value = (
        await conn.query(
          `INSERT INTO "HistoricalAggregatePosition" (
            "createdAt",
            "playerId",
            "gameId",
            "value"
        ) (SELECT NOW(), $1, $2, (t."value"${x.improvement})
           FROM "HistoricalAggregatePosition" as t
           WHERE t."playerId" = $1 ORDER BY t."id" DESC LIMIT 1)
        RETURNING "value"`,
          [x.playerId, x.gameId]
        )
      )[0].value;
      await this.upsertHistoricalAggregatePositionTables(
        conn,
        "HistoricalAggregatePositionMinute",
        x,
        1000 * 60 * 5,
        value
      );
      await this.upsertHistoricalAggregatePositionTables(
        conn,
        "HistoricalAggregatePositionHour",
        x,
        1000 * 60 * 60,
        value
      );
      await this.upsertHistoricalAggregatePositionTables(
        conn,
        "HistoricalAggregatePositionDay",
        x,
        1000 * 60 * 60 * 24,
        value
      );
    }
  }

  private async upsertHistoricalAggregatePositionTables(
    conn: Connection,
    table:
      | "HistoricalAggregatePositionDay"
      | "HistoricalAggregatePositionHour"
      | "HistoricalAggregatePositionMinute",
    x: HistoricalAggBatchT,
    interval: number,
    value: number
  ) {
    const nextInterval = new Date(Math.ceil(Date.now() / interval) * interval);
    const r = await conn.query(
      `SELECT "id", "createdAt", "value" FROM "${table}" WHERE "playerId" = $1 ORDER BY "id" DESC LIMIT 1`,
      [x.playerId]
    );
    if (r.length && r[0].createdAt.getTime() === nextInterval.getTime()) {
      await conn.query(`UPDATE "${table}" SET "value" = $1 WHERE "id" = $2`, [
        value,
        r[0].id,
      ]);
    } else {
      await conn.query(
        `INSERT INTO "${table}" (
            "playerId",
            "gameId",
            "createdAt",
            "value"
        ) VALUES ($1, $2, $3, $4)`,
        [x.playerId, x.gameId, nextInterval, value]
      );
    }
  }
}

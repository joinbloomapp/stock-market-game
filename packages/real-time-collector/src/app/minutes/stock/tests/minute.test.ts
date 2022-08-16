/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app/app.module";
import { AppService } from "src/app/app.service";
import { TransactionalTestContext } from "typeorm-transactional-tests";
import { Connection, getConnection, Not, Repository } from "typeorm";
import {
  CurrentPositionEntity,
  GameEntity,
  HistoricalAggregatePositionDayEntity,
  HistoricalAggregatePositionMinuteEntity,
  HistoricalAggregatePositionEntity,
  HistoricalAggregatePositionHourEntity,
  PlayerEntity,
  StockEntity,
  StockPriceEntity,
  UserEntity,
} from "@bloom-smg/postgresql";
import { StockMinutesService } from "../stock.service";
import stockMinuteBarFactory from "src/testing/factory/external/stock-minute-bar.factory";

describe("Stock minute processing", () => {
  let minuteService: StockMinutesService;
  let app: TestingModule;
  let connection: Connection;
  let transactionalContext: TransactionalTestContext;
  let user: UserEntity;
  let game: GameEntity;
  let player: PlayerEntity;
  let stock: StockEntity;
  let currentPositionRepo: Repository<CurrentPositionEntity>;
  let historicalAggregatePositionRepo: Repository<HistoricalAggregatePositionEntity>;
  let historicalAggregatePositionMinuteRepo: Repository<HistoricalAggregatePositionMinuteEntity>;
  let historicalAggregatePositionHourRepo: Repository<HistoricalAggregatePositionHourEntity>;
  let historicalAggregatePositionDayRepo: Repository<HistoricalAggregatePositionDayEntity>;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AppService],
    }).compile();
  });

  beforeEach(async () => {
    minuteService = app.get<StockMinutesService>(StockMinutesService);
    minuteService.clearCache();
    connection = getConnection();
    transactionalContext = new TransactionalTestContext(connection);
    await transactionalContext.start();

    // @ts-ignore
    user = await connection.getRepository(UserEntity).save({
      email: "test@test.com",
      name: "",
      firstName: "",
      lastName: "",
      password: "",
    });
    game = await connection.getRepository(GameEntity).save({
      name: "",
      startAt: new Date(),
      endAt: new Date(),
      defaultBuyingPower: 100000,
      inviteCode: "",
    });
    player = await connection.getRepository(PlayerEntity).save({
      userId: user.id,
      gameId: game.id,
      isGameAdmin: false,
      buyingPower: 100000,
    });
    stock = await connection.getRepository(StockEntity).save({
      ticker: "AAPL",
      name: "Apple Inc.",
      isActive: true,
      isEtf: true,
      shortable: true,
      description: "",
      image: "",
    });

    currentPositionRepo = connection.getRepository(CurrentPositionEntity);
    historicalAggregatePositionRepo = connection.getRepository(
      HistoricalAggregatePositionEntity
    );
    historicalAggregatePositionMinuteRepo = connection.getRepository(
      HistoricalAggregatePositionMinuteEntity
    );
    historicalAggregatePositionHourRepo = connection.getRepository(
      HistoricalAggregatePositionHourEntity
    );
    historicalAggregatePositionDayRepo = connection.getRepository(
      HistoricalAggregatePositionDayEntity
    );
  });

  afterEach(async () => {
    await transactionalContext.finish();
  });

  afterAll(async () => {
    try {
      await app.close();
    } catch (e) {
      //
    }
  });

  it("Process minute", async () => {
    // Creates a new stock price
    const stock1 = stockMinuteBarFactory({ sym: "AAPL", h: 0.8, l: 0.7 });
    await minuteService.updateCurrentPositions(connection, stock1);
    await minuteService.batchInsertHistoricalAggregatePosition(connection);
    let [stockPrice, count] = await connection
      .getRepository(StockPriceEntity)
      .findAndCount();
    expect(count).toBe(1);
    expect(stockPrice[0].price).toBe(0.75);

    // Actually get positions to check whether they're working properly
    const currentQuantity = 100;
    const currentPosition = await currentPositionRepo.save({
      stockId: stock.id,
      playerId: player.id,
      gameId: game.id,
      quantity: currentQuantity,
    });
    const historicalPosition = await historicalAggregatePositionRepo.save({
      playerId: player.id,
      gameId: game.id,
      value: currentQuantity * stockPrice[0].price,
    });
    await historicalAggregatePositionMinuteRepo.save({
      playerId: player.id,
      gameId: game.id,
      createdAt: new Date(
        Math.ceil(Date.now() / (1000 * 60 * 5)) * 1000 * 60 * 5
      ),
      value: currentQuantity * stockPrice[0].price,
    });
    await historicalAggregatePositionHourRepo.save({
      playerId: player.id,
      gameId: game.id,
      createdAt: new Date(
        Math.ceil(Date.now() / (1000 * 60 * 60)) * 1000 * 60 * 60
      ),
      value: currentQuantity * stockPrice[0].price,
    });
    await historicalAggregatePositionDayRepo.save({
      playerId: player.id,
      gameId: game.id,
      createdAt: new Date(
        Math.ceil(Date.now() / (1000 * 60 * 60 * 24)) * 1000 * 60 * 60 * 24
      ),
      value: currentQuantity * stockPrice[0].price,
    });

    minuteService.clearCache();
    const stock2 = stockMinuteBarFactory({ sym: "AAPL", h: 1.73, l: 0 });
    await minuteService.updateCurrentPositions(connection, stock2);
    await minuteService.batchInsertHistoricalAggregatePosition(connection);
    [stockPrice, count] = await connection
      .getRepository(StockPriceEntity)
      .findAndCount();
    expect(count).toBe(1);
    expect(stockPrice[0].price).toBe(1.73 / 2);
    const currentPosition2 = await currentPositionRepo.findOne(
      currentPosition.id
    );
    // the quantity should stay the same
    expect(currentPosition2.quantity).toBe(currentQuantity);
    // the value should have gone up
    const historicalPosition2 =
      await historicalAggregatePositionRepo.findAndCount({
        where: { id: Not(historicalPosition.id) },
      });
    expect(historicalPosition2[1]).toBe(1);
    expect(historicalPosition2[0][0].value).toBe((currentQuantity * 1.73) / 2);
    expect(await historicalAggregatePositionDayRepo.count()).toBe(1);
    expect(await historicalAggregatePositionMinuteRepo.count()).toBe(1);
    expect(await historicalAggregatePositionHourRepo.count()).toBe(1);
  });

  describe("Process minute with multiple stocks", () => {
    let stockPrice1: StockPriceEntity;
    let stock2: StockEntity;
    let stockPrice2: StockPriceEntity;

    beforeEach(async () => {
      stockPrice1 = await connection.getRepository(StockPriceEntity).save({
        stockId: stock.id,
        price: 10,
        ticker: stock.ticker,
        oldPrice: 0,
        percentChange: 0,
      });
      stock2 = await connection.getRepository(StockEntity).save({
        ticker: "GOOGL",
        name: "Googling deez code snippets",
        isActive: true,
        isEtf: true,
        shortable: true,
        description: "",
        image: "",
      });
      stockPrice2 = await connection.getRepository(StockPriceEntity).save({
        stockId: stock2.id,
        price: 20,
        ticker: stock2.ticker,
        oldPrice: 0,
        percentChange: 0,
      });
    });

    it("Process minute", async () => {
      let currentPosition = await currentPositionRepo.save({
        stockId: stock.id,
        playerId: player.id,
        gameId: game.id,
        quantity: 10.14,
      });
      let oldHistorical = await historicalAggregatePositionRepo.save({
        playerId: player.id,
        gameId: game.id,
        value: currentPosition.quantity * stockPrice1.price,
      });
      await historicalAggregatePositionMinuteRepo.save({
        playerId: player.id,
        gameId: game.id,
        createdAt: new Date(
          Math.ceil(Date.now() / (1000 * 60 * 5)) * 1000 * 60 * 524
        ),
        value: currentPosition.quantity * stockPrice1.price,
      });
      await historicalAggregatePositionHourRepo.save({
        playerId: player.id,
        gameId: game.id,
        createdAt: new Date(
          Math.ceil(Date.now() / (1000 * 60 * 60)) * 1000 * 60 * 60
        ),
        value: currentPosition.quantity * stockPrice1.price,
      });
      await historicalAggregatePositionDayRepo.save({
        playerId: player.id,
        gameId: game.id,
        createdAt: new Date(
          Math.ceil(Date.now() / (1000 * 60 * 60 * 24)) * 1000 * 60 * 60 * 24
        ),
        value: currentPosition.quantity * stockPrice1.price,
      });
      const currentPosition2 = await currentPositionRepo.save({
        stockId: stock2.id,
        playerId: player.id,
        gameId: game.id,
        quantity: 32.13,
      });
      let historicalPosition = await historicalAggregatePositionRepo.save({
        playerId: player.id,
        gameId: game.id,
        value:
          oldHistorical.value + currentPosition2.quantity * stockPrice2.price,
      });
      await historicalAggregatePositionMinuteRepo.save({
        playerId: player.id,
        gameId: game.id,
        createdAt: new Date(
          Math.ceil(Date.now() / (1000 * 60 * 5)) * 1000 * 60 * 5
        ),
        value:
          oldHistorical.value + currentPosition2.quantity * stockPrice2.price,
      });
      await historicalAggregatePositionHourRepo.save({
        playerId: player.id,
        gameId: game.id,
        createdAt: new Date(
          Math.ceil(Date.now() / (1000 * 60 * 60)) * 1000 * 60 * 60
        ),
        value:
          oldHistorical.value + currentPosition2.quantity * stockPrice2.price,
      });
      await historicalAggregatePositionDayRepo.save({
        playerId: player.id,
        gameId: game.id,
        createdAt: new Date(
          Math.ceil(Date.now() / (1000 * 60 * 60 * 24)) * 1000 * 60 * 60 * 24
        ),
        value:
          oldHistorical.value + currentPosition2.quantity * stockPrice2.price,
      });

      let stockMinute = stockMinuteBarFactory({
        sym: stock.ticker,
        h: 4.73,
        l: 0,
      });
      await minuteService.updateCurrentPositions(connection, stockMinute);
      await minuteService.batchInsertHistoricalAggregatePosition(connection);
      const [stockPrice, count] = await connection
        .getRepository(StockPriceEntity)
        .findAndCount({ order: { id: "ASC" } });
      expect(count).toBe(2);
      expect(stockPrice[0].price).toBe(4.73 / 2);
      expect(stockPrice[1].price).toBe(stockPrice2.price);
      currentPosition = await currentPositionRepo.findOne(currentPosition.id);
      expect(currentPosition.quantity).toBe(10.14);
      oldHistorical = historicalPosition;
      historicalPosition = await historicalAggregatePositionRepo.findOne(
        { playerId: player.id, gameId: game.id },
        { order: { id: "DESC" } }
      );
      // 100,000. Dropped 10 -> 4.73/2 = 2.365 * quantity of stock 1
      expect(historicalPosition.value).toBe(
        parseFloat(
          (
            oldHistorical.value +
            10.14 * (4.73 / 2 - stockPrice1.price)
          ).toFixed(3)
        )
      );

      stockMinute = stockMinuteBarFactory({
        sym: stock.ticker,
        h: 14.33,
        l: 0,
      });
      await minuteService.updateCurrentPositions(connection, stockMinute);
      await minuteService.batchInsertHistoricalAggregatePosition(connection);
      oldHistorical = historicalPosition;
      historicalPosition = await historicalAggregatePositionRepo.findOne(
        { playerId: player.id, gameId: game.id },
        { order: { id: "DESC" } }
      );
      expect(historicalPosition.value).toBe(
        oldHistorical.value + 10.14 * (14.33 / 2 - 4.73 / 2)
      );

      stockMinute = stockMinuteBarFactory({
        sym: stock2.ticker,
        h: 144.33,
        l: 0,
      });
      await minuteService.updateCurrentPositions(connection, stockMinute);
      await minuteService.batchInsertHistoricalAggregatePosition(connection);
      oldHistorical = historicalPosition;
      historicalPosition = await historicalAggregatePositionRepo.findOne(
        { playerId: player.id, gameId: game.id },
        { order: { id: "DESC" } }
      );
      expect(historicalPosition.value).toBe(
        parseFloat(
          (
            oldHistorical.value +
            currentPosition2.quantity * (144.33 / 2 - stockPrice2.price)
          ).toFixed(3)
        )
      );
    });
  });
});

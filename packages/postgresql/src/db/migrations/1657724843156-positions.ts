/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class positions1657724843156 implements MigrationInterface {
  name = "positions1657724843156";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "CurrentPosition" ("id" BIGSERIAL NOT NULL, "stockId" bigint NOT NULL, "playerId" bigint NOT NULL, "gameId" bigint NOT NULL, "quantity" double precision NOT NULL, CONSTRAINT "current_position_player_stock_unique" UNIQUE ("playerId", "stockId"), CONSTRAINT "PK_d33fdd67f0ead45c31d80bf236f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f463b88fedec2224789433ced0" ON "CurrentPosition" ("playerId") `
    );
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "HistoricalPosition" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "stockId" bigint NOT NULL, "playerId" bigint NOT NULL, "gameId" bigint NOT NULL, "value" bigint NOT NULL, CONSTRAINT "PK_7353bb53f4d7aebc8074fb5fdb6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd98bc15e476d2f802adbf9167" ON "HistoricalPosition" ("playerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_555e23575dcd719ef76737b903" ON "HistoricalPosition" ("gameId") `
    );
    await queryRunner.query(
      `CREATE TABLE "HistoricalAggregatePosition" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "playerId" bigint NOT NULL, "gameId" bigint NOT NULL, "value" bigint NOT NULL, CONSTRAINT "PK_ce030a87f5b8ee5960d16189a47" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1682e85f53e5beca95a9f3b7e5" ON "HistoricalAggregatePosition" ("playerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e18ac737ea23f192048042b776" ON "HistoricalAggregatePosition" ("gameId") `
    );
    await queryRunner.query(
      `CREATE TABLE "StockPrice" ("id" BIGSERIAL NOT NULL, "stockId" bigint NOT NULL, "ticker" character varying(15) NOT NULL, "price" bigint NOT NULL, CONSTRAINT "PK_a529ac54663a2d74466cea745ea" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be1a8031225ded8f86bfc8bcfb" ON "StockPrice" ("stockId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_edb2ef8fc21607d7241a2b44f0" ON "StockPrice" ("ticker") `
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" ADD CONSTRAINT "FK_2c2d5ac9ee2b3952f85fb9a0935" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" ADD CONSTRAINT "FK_1779cdc5825e31028047b87e177" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" ADD CONSTRAINT "FK_f463b88fedec2224789433ced08" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" ADD CONSTRAINT "FK_18521c85cc5b6b82fcdc9bb2aad" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" ADD CONSTRAINT "FK_555e23575dcd719ef76737b9032" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" ADD CONSTRAINT "FK_dd98bc15e476d2f802adbf91677" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" ADD CONSTRAINT "FK_e18ac737ea23f192048042b776f" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" ADD CONSTRAINT "FK_1682e85f53e5beca95a9f3b7e54" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "StockPrice" ADD CONSTRAINT "FK_be1a8031225ded8f86bfc8bcfb8" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "StockPrice" DROP CONSTRAINT "FK_be1a8031225ded8f86bfc8bcfb8"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" DROP CONSTRAINT "FK_1682e85f53e5beca95a9f3b7e54"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" DROP CONSTRAINT "FK_e18ac737ea23f192048042b776f"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" DROP CONSTRAINT "FK_dd98bc15e476d2f802adbf91677"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" DROP CONSTRAINT "FK_555e23575dcd719ef76737b9032"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" DROP CONSTRAINT "FK_18521c85cc5b6b82fcdc9bb2aad"`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" DROP CONSTRAINT "FK_f463b88fedec2224789433ced08"`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" DROP CONSTRAINT "FK_1779cdc5825e31028047b87e177"`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" DROP CONSTRAINT "FK_2c2d5ac9ee2b3952f85fb9a0935"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_edb2ef8fc21607d7241a2b44f0"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_be1a8031225ded8f86bfc8bcfb"`
    );
    await queryRunner.query(`DROP TABLE "StockPrice"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e18ac737ea23f192048042b776"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1682e85f53e5beca95a9f3b7e5"`
    );
    await queryRunner.query(`DROP TABLE "HistoricalAggregatePosition"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_555e23575dcd719ef76737b903"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd98bc15e476d2f802adbf9167"`
    );
    await queryRunner.query(`DROP TABLE "HistoricalPosition"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f463b88fedec2224789433ced0"`
    );
    await queryRunner.query(`DROP TABLE "CurrentPosition"`);
  }
}

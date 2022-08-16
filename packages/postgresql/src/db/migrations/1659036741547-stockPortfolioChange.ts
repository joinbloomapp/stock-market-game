/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class stockPortfolioChange1659036741547 implements MigrationInterface {
  name = "stockPortfolioChange1659036741547";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "AverageTodayPrice" ("id" BIGSERIAL NOT NULL, "stockId" bigint NOT NULL, "playerId" bigint NOT NULL, "numBuys" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "averagePrice" bigint NOT NULL, CONSTRAINT "PK_724ee369bf656af503aa945a870" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3aa6c8dd54bc29bd7e9580163" ON "AverageTodayPrice" ("playerId") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b8b7a3115960f3d54fce35a263" ON "AverageTodayPrice" ("stockId", "playerId") `
    );
    await queryRunner.query(
      `CREATE TABLE "AverageTotalPrice" ("id" BIGSERIAL NOT NULL, "stockId" bigint NOT NULL, "playerId" bigint NOT NULL, "numBuys" integer NOT NULL, "averagePrice" bigint NOT NULL, CONSTRAINT "PK_5480dcc7524d259da35cccd4d43" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6023f97b8d2d7959d499b9481d" ON "AverageTotalPrice" ("playerId") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_10ffdc88592db9a815cb16d19b" ON "AverageTotalPrice" ("stockId", "playerId") `
    );
    await queryRunner.query(
      `ALTER TABLE "OrderHistory" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now()`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTodayPrice" ADD CONSTRAINT "FK_7825157bec9a41d95e31c065b65" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTodayPrice" ADD CONSTRAINT "FK_a3aa6c8dd54bc29bd7e9580163b" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTotalPrice" ADD CONSTRAINT "FK_755b9537814e296d7fc03e9d035" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTotalPrice" ADD CONSTRAINT "FK_6023f97b8d2d7959d499b9481d0" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "AverageTotalPrice" DROP CONSTRAINT "FK_6023f97b8d2d7959d499b9481d0"`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTotalPrice" DROP CONSTRAINT "FK_755b9537814e296d7fc03e9d035"`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTodayPrice" DROP CONSTRAINT "FK_a3aa6c8dd54bc29bd7e9580163b"`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTodayPrice" DROP CONSTRAINT "FK_7825157bec9a41d95e31c065b65"`
    );
    await queryRunner.query(
      `ALTER TABLE "OrderHistory" DROP COLUMN "createdAt"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_10ffdc88592db9a815cb16d19b"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6023f97b8d2d7959d499b9481d"`
    );
    await queryRunner.query(`DROP TABLE "AverageTotalPrice"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8b7a3115960f3d54fce35a263"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3aa6c8dd54bc29bd7e9580163"`
    );
    await queryRunner.query(`DROP TABLE "AverageTodayPrice"`);
  }
}

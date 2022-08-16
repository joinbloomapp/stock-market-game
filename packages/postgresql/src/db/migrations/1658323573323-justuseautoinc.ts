/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class justuseautoinc1658323573323 implements MigrationInterface {
  name = "justuseautoinc1658323573323";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" DROP CONSTRAINT "PK_7353bb53f4d7aebc8074fb5fdb6"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" DROP COLUMN "id"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" ADD "id" BIGSERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" ADD CONSTRAINT "PK_7353bb53f4d7aebc8074fb5fdb6" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" DROP CONSTRAINT "PK_ce030a87f5b8ee5960d16189a47"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" DROP COLUMN "id"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" ADD "id" BIGSERIAL NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" ADD CONSTRAINT "PK_ce030a87f5b8ee5960d16189a47" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a257d2c9837248d70640b3e36" ON "User" ("email") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a257d2c9837248d70640b3e36"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" DROP CONSTRAINT "PK_ce030a87f5b8ee5960d16189a47"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" DROP COLUMN "id"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePosition" ADD CONSTRAINT "PK_ce030a87f5b8ee5960d16189a47" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" DROP CONSTRAINT "PK_7353bb53f4d7aebc8074fb5fdb6"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" DROP COLUMN "id"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalPosition" ADD CONSTRAINT "PK_7353bb53f4d7aebc8074fb5fdb6" PRIMARY KEY ("id")`
    );
  }
}

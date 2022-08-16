/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class priceChange1658518500917 implements MigrationInterface {
  name = "priceChange1658518500917";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "StockPrice" ADD "oldPrice" bigint NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "StockPrice" ADD "percentChange" bigint NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "StockPrice" ADD "lastUpdated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now()`
    );
    await queryRunner.query(
      `alter table "Stock" alter column search_stock DROP NOT NULL`
    );
    await queryRunner.query(
      `alter table "Stock" alter column search_stock SET DEFAULT null`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "StockPrice" DROP COLUMN "lastUpdated"`
    );
    await queryRunner.query(
      `ALTER TABLE "StockPrice" DROP COLUMN "percentChange"`
    );
    await queryRunner.query(`ALTER TABLE "StockPrice" DROP COLUMN "oldPrice"`);
  }
}

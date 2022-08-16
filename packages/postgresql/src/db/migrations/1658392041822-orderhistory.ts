/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class orderhistory1658392041822 implements MigrationInterface {
  name = "orderhistory1658392041822";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `alter table "Stock" add column search_stock tsvector`
    );
    await queryRunner.query(
      `update "Stock" set search_stock = setweight(to_tsvector(ticker), 'B') || setweight(to_tsvector(name), 'A') || setweight(to_tsvector(description), 'C')`
    );
    await queryRunner.query(
      `CREATE INDEX search_stock_idx on "Stock" using GIN (search_stock)`
    );

    await queryRunner.query(
      `CREATE TYPE "public"."OrderHistory_ordertype_enum" AS ENUM('BUY', 'SELL')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."OrderHistory_orderstatus_enum" AS ENUM('PENDING', 'CANCELLED', 'COMPLETED')`
    );
    await queryRunner.query(
      `CREATE TABLE "OrderHistory" ("id" BIGSERIAL NOT NULL, "stockId" bigint NOT NULL, "playerId" bigint NOT NULL, "gameId" bigint NOT NULL, "quantity" bigint NOT NULL, "value" bigint NOT NULL, "orderType" "public"."OrderHistory_ordertype_enum" NOT NULL, "orderStatus" "public"."OrderHistory_orderstatus_enum" NOT NULL, CONSTRAINT "PK_dc58d84febda7645ac7fa16656e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "OrderHistory" ADD CONSTRAINT "FK_68120f708c829493f59613dbbb1" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "OrderHistory" ADD CONSTRAINT "FK_4d5b6c77bcdafc2569362a374ad" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "OrderHistory" ADD CONSTRAINT "FK_4c369331a34fecad39d7c5dc5b6" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "OrderHistory" DROP CONSTRAINT "FK_4c369331a34fecad39d7c5dc5b6"`
    );
    await queryRunner.query(
      `ALTER TABLE "OrderHistory" DROP CONSTRAINT "FK_4d5b6c77bcdafc2569362a374ad"`
    );
    await queryRunner.query(
      `ALTER TABLE "OrderHistory" DROP CONSTRAINT "FK_68120f708c829493f59613dbbb1"`
    );
    await queryRunner.query(`DROP TABLE "OrderHistory"`);
    await queryRunner.query(
      `DROP TYPE "public"."OrderHistory_orderstatus_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."OrderHistory_ordertype_enum"`);
  }
}

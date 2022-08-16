/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class initial1657291579582 implements MigrationInterface {
  name = "initial1657291579582";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Stock" ("id" BIGSERIAL NOT NULL, "ticker" character varying(15) NOT NULL, "name" character varying(500) NOT NULL, "isActive" boolean NOT NULL, "isEtf" boolean NOT NULL, "shortable" boolean NOT NULL, "description" character varying(15000) NOT NULL, "image" character varying(2048) NOT NULL, "extra_data" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "stock_ticker_unique_constraint" UNIQUE ("ticker"), CONSTRAINT "PK_2725537b7bbe40073a50986598d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb481233614b4354e7533b8ef4" ON "Stock" ("ticker") `
    );
    await queryRunner.query(
      `CREATE TABLE "StockCategoryMapping" ("id" BIGSERIAL NOT NULL, "stockId" bigint NOT NULL, "categoryId" bigint NOT NULL, CONSTRAINT "unique_stock_category_mapping" UNIQUE ("stockId", "categoryId"), CONSTRAINT "PK_9f5644f3c6d98c12f8ef98420e0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "StockCategory" ("id" BIGSERIAL NOT NULL, "name" character varying(50) NOT NULL, "description" character varying(2000) NOT NULL, "snippet" character varying(500) NOT NULL, "image" character varying(2048) NOT NULL, "extra" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_5fa1ada8b592b43969ad65a768b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "User" ("id" BIGSERIAL NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(150) NOT NULL, "name" character varying(255) NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "extra" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "Game" ("id" BIGSERIAL NOT NULL, "name" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "startAt" TIMESTAMP WITH TIME ZONE NOT NULL, "endAt" TIMESTAMP WITH TIME ZONE NOT NULL, "defaultBuyingPower" bigint NOT NULL, "inviteCode" character varying(6) NOT NULL, "extra" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_cce0ee17147c1830d09c19d4d56" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "Player" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" bigint NOT NULL, "gameId" bigint NOT NULL, "isGameAdmin" boolean NOT NULL, "extra" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_c390d9968607986a5f038e3305e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "StockCategoryMapping" ADD CONSTRAINT "FK_26b506b338a27d61b1fd3e87514" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "StockCategoryMapping" ADD CONSTRAINT "FK_67dccee7f022ae80875ec8021f3" FOREIGN KEY ("categoryId") REFERENCES "StockCategory"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "Player" ADD CONSTRAINT "FK_9be207182e9cd0809fe0d8f7302" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "Player" ADD CONSTRAINT "FK_8d382155f20c03f32151b2bb003" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query("CREATE EXTENSION pg_trgm");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Player" DROP CONSTRAINT "FK_8d382155f20c03f32151b2bb003"`
    );
    await queryRunner.query(
      `ALTER TABLE "Player" DROP CONSTRAINT "FK_9be207182e9cd0809fe0d8f7302"`
    );
    await queryRunner.query(
      `ALTER TABLE "StockCategoryMapping" DROP CONSTRAINT "FK_67dccee7f022ae80875ec8021f3"`
    );
    await queryRunner.query(
      `ALTER TABLE "StockCategoryMapping" DROP CONSTRAINT "FK_26b506b338a27d61b1fd3e87514"`
    );
    await queryRunner.query(`DROP TABLE "Player"`);
    await queryRunner.query(`DROP TABLE "Game"`);
    await queryRunner.query(`DROP TABLE "User"`);
    await queryRunner.query(`DROP TABLE "StockCategory"`);
    await queryRunner.query(`DROP TABLE "StockCategoryMapping"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb481233614b4354e7533b8ef4"`
    );
    await queryRunner.query(`DROP TABLE "Stock"`);
  }
}

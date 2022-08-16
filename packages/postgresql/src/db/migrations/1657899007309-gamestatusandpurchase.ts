/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class gamestatusandpurchase1657899007309 implements MigrationInterface {
  name = "gamestatusandpurchase1657899007309";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Player" ADD "buyingPower" bigint NOT NULL DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "Player" ALTER COLUMN "buyingPower" DROP DEFAULT`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Game_status_enum" AS ENUM('NOT_STARTED', 'ACTIVE', 'FINISHED')`
    );
    await queryRunner.query(
      `ALTER TABLE "Game" ADD "status" "public"."Game_status_enum" NOT NULL DEFAULT 'NOT_STARTED'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Game" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."Game_status_enum"`);
    await queryRunner.query(`ALTER TABLE "Player" DROP COLUMN "buyingPower"`);
  }
}

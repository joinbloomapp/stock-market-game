/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class fixquantityPosition1658173270596 implements MigrationInterface {
  name = "fixquantityPosition1658173270596";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" DROP COLUMN "quantity"`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" ADD "quantity" bigint NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" DROP COLUMN "quantity"`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" ADD "quantity" double precision NOT NULL`
    );
  }
}

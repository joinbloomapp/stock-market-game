/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class kickeduser1658391520030 implements MigrationInterface {
  name = "kickeduser1658391520030";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "KickedUser" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" bigint NOT NULL, "gameId" bigint NOT NULL, "extra" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_cc9a726c8af57021bf987db59c8" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "KickedUser" ADD CONSTRAINT "FK_b4a6fa4d42abd8b0569ef21de0c" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "KickedUser" ADD CONSTRAINT "FK_8eef055fc6a73733137ba9fa213" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "KickedUser" DROP CONSTRAINT "FK_8eef055fc6a73733137ba9fa213"`
    );
    await queryRunner.query(
      `ALTER TABLE "KickedUser" DROP CONSTRAINT "FK_b4a6fa4d42abd8b0569ef21de0c"`
    );
    await queryRunner.query(`DROP TABLE "KickedUser"`);
  }
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class oauth1657505252181 implements MigrationInterface {
  name = "oauth1657505252181";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "SocialToken" ("id" BIGSERIAL NOT NULL, "appId" bigint NOT NULL, "accountId" bigint NOT NULL, "token" character varying(10000) NOT NULL, "tokenSecret" character varying(10000) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "extra" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "social_token_app_account" UNIQUE ("appId", "accountId"), CONSTRAINT "PK_36ea66023a45ec03687056324ec" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "SocialApp" ("id" BIGSERIAL NOT NULL, "provider" character varying(30) NOT NULL, "name" character varying(40) NOT NULL, "extra" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "social_app_unique_provider" UNIQUE ("provider"), CONSTRAINT "PK_fa82801d17b41c8d4930b94701b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c41a7acdebf0ccc68698cca7ef" ON "SocialApp" ("provider") `
    );
    await queryRunner.query(
      `CREATE TABLE "SocialAccount" ("id" BIGSERIAL NOT NULL, "userId" bigint NOT NULL, "appId" bigint NOT NULL, "uid" character varying(191) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "extra" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "social_account_app_uid" UNIQUE ("appId", "uid"), CONSTRAINT "PK_b031eaeed1b2622961387f20147" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "social_account_app_uid_index" ON "SocialAccount" ("uid", "appId") `
    );
    await queryRunner.query(
      `ALTER TABLE "SocialToken" ADD CONSTRAINT "FK_eeecabff74e5b1cce0ed814fead" FOREIGN KEY ("accountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "SocialToken" ADD CONSTRAINT "FK_3da867fe703ed31c2d714a26c22" FOREIGN KEY ("appId") REFERENCES "SocialApp"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "SocialAccount" ADD CONSTRAINT "FK_7c0c37bc7c82060e0d79bd2e391" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "SocialAccount" ADD CONSTRAINT "FK_dfe363e9d045d687d680ef4e487" FOREIGN KEY ("appId") REFERENCES "SocialApp"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "SocialAccount" DROP CONSTRAINT "FK_dfe363e9d045d687d680ef4e487"`
    );
    await queryRunner.query(
      `ALTER TABLE "SocialAccount" DROP CONSTRAINT "FK_7c0c37bc7c82060e0d79bd2e391"`
    );
    await queryRunner.query(
      `ALTER TABLE "SocialToken" DROP CONSTRAINT "FK_3da867fe703ed31c2d714a26c22"`
    );
    await queryRunner.query(
      `ALTER TABLE "SocialToken" DROP CONSTRAINT "FK_eeecabff74e5b1cce0ed814fead"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."social_account_app_uid_index"`
    );
    await queryRunner.query(`DROP TABLE "SocialAccount"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c41a7acdebf0ccc68698cca7ef"`
    );
    await queryRunner.query(`DROP TABLE "SocialApp"`);
    await queryRunner.query(`DROP TABLE "SocialToken"`);
  }
}

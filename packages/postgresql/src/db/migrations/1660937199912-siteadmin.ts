import { MigrationInterface, QueryRunner } from "typeorm";

export class siteadmin1660937199912 implements MigrationInterface {
  name = "siteadmin1660937199912";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "User" ADD "isSiteAdmin" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTodayPrice" ALTER COLUMN "numBuys" DROP DEFAULT`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "AverageTodayPrice" ALTER COLUMN "numBuys" SET DEFAULT '0'`
    );
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "isSiteAdmin"`);
  }
}

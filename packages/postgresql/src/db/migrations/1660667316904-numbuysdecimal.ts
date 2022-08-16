import { MigrationInterface, QueryRunner } from "typeorm";

export class numbuysdecimal1660667316904 implements MigrationInterface {
  name = "numbuysdecimal1660667316904";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "AverageTodayPrice" ALTER COLUMN "numBuys" type numeric(40,20)`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTotalPrice" ALTER COLUMN "numBuys" type numeric(40,20)`
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "AverageTotalPrice" ALTER COLUMN "numBuys" type int4`
    );
    await queryRunner.query(
      `ALTER TABLE "AverageTodayPrice" ALTER COLUMN "numBuys" type int4`
    );
  }
}

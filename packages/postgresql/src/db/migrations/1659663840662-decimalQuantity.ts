import { MigrationInterface, QueryRunner } from "typeorm";

export class decimalQuantity1659663840662 implements MigrationInterface {
  name = "decimalQuantity1659663840662";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" ALTER COLUMN "quantity" type numeric(40,20)`
    );
    await queryRunner.query(
      `UPDATE "CurrentPosition" SET "quantity" = "quantity" / 1000`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" DROP COLUMN "quantity"`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" ADD "quantity" bigint NOT NULL`
    );
  }
}

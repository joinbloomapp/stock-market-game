import { MigrationInterface, QueryRunner } from "typeorm";

export class isactiveposition1659722004232 implements MigrationInterface {
  name = "isactiveposition1659722004232";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" ADD "isActive" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `CREATE INDEX "current_position_is_active_position_index" ON "CurrentPosition" ("stockId", "isActive") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."current_position_is_active_position_index"`
    );
    await queryRunner.query(
      `ALTER TABLE "CurrentPosition" DROP COLUMN "isActive"`
    );
  }
}

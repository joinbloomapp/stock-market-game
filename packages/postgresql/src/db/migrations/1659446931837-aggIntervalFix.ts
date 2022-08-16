import { MigrationInterface, QueryRunner } from "typeorm";

export class aggIntervalFix1659446931837 implements MigrationInterface {
  name = "aggIntervalFix1659446931837";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "HistoricalAggregatePositionDay" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "playerId" bigint NOT NULL, "gameId" bigint NOT NULL, "value" bigint NOT NULL, CONSTRAINT "PK_b2323eb1f2611198c20582e0806" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_321522f723d3d21059453d4349" ON "HistoricalAggregatePositionDay" ("playerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bac7ddd87c37d7bc4493bd4eb7" ON "HistoricalAggregatePositionDay" ("gameId") `
    );
    await queryRunner.query(
      `CREATE TABLE "HistoricalAggregatePositionHour" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "playerId" bigint NOT NULL, "gameId" bigint NOT NULL, "value" bigint NOT NULL, CONSTRAINT "PK_48dec7b702fd4d6b6c1bf97dadb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3cebdb3c056d6da7c0fb5e7527" ON "HistoricalAggregatePositionHour" ("playerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_511df45c33b9bf002442054141" ON "HistoricalAggregatePositionHour" ("gameId") `
    );
    await queryRunner.query(
      `CREATE TABLE "HistoricalAggregatePositionMinute" ("id" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "playerId" bigint NOT NULL, "gameId" bigint NOT NULL, "value" bigint NOT NULL, CONSTRAINT "PK_e06d13b99479029610fb637fba6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de4adf7fdce9c1305be8306fa5" ON "HistoricalAggregatePositionMinute" ("playerId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71ee97fd626f8e0d3dc9a3d99a" ON "HistoricalAggregatePositionMinute" ("gameId") `
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionDay" ADD CONSTRAINT "FK_bac7ddd87c37d7bc4493bd4eb7b" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionDay" ADD CONSTRAINT "FK_321522f723d3d21059453d43493" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionHour" ADD CONSTRAINT "FK_511df45c33b9bf002442054141b" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionHour" ADD CONSTRAINT "FK_3cebdb3c056d6da7c0fb5e75273" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionMinute" ADD CONSTRAINT "FK_71ee97fd626f8e0d3dc9a3d99ad" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionMinute" ADD CONSTRAINT "FK_de4adf7fdce9c1305be8306fa54" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionMinute" DROP CONSTRAINT "FK_de4adf7fdce9c1305be8306fa54"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionMinute" DROP CONSTRAINT "FK_71ee97fd626f8e0d3dc9a3d99ad"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionHour" DROP CONSTRAINT "FK_3cebdb3c056d6da7c0fb5e75273"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionHour" DROP CONSTRAINT "FK_511df45c33b9bf002442054141b"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionDay" DROP CONSTRAINT "FK_321522f723d3d21059453d43493"`
    );
    await queryRunner.query(
      `ALTER TABLE "HistoricalAggregatePositionDay" DROP CONSTRAINT "FK_bac7ddd87c37d7bc4493bd4eb7b"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_71ee97fd626f8e0d3dc9a3d99a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de4adf7fdce9c1305be8306fa5"`
    );
    await queryRunner.query(`DROP TABLE "HistoricalAggregatePositionMinute"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_511df45c33b9bf002442054141"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3cebdb3c056d6da7c0fb5e7527"`
    );
    await queryRunner.query(`DROP TABLE "HistoricalAggregatePositionHour"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bac7ddd87c37d7bc4493bd4eb7"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_321522f723d3d21059453d4349"`
    );
    await queryRunner.query(`DROP TABLE "HistoricalAggregatePositionDay"`);
  }
}

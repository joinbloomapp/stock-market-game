/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  AverageTodayPriceEntity,
  AverageTotalPriceEntity,
  CurrentPositionEntity,
  GameEntity,
  HistoricalAggregatePositionDayEntity,
  HistoricalAggregatePositionEntity,
  HistoricalAggregatePositionHourEntity,
  HistoricalAggregatePositionMinuteEntity,
  HistoricalPositionEntity,
  KickedUserEntity,
  OrderHistoryEntity,
  PlayerEntity,
  StockEntity,
  StockPriceEntity,
  UserEntity,
} from "@bloom-smg/postgresql";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourierService } from "src/clients/courier/courier.service";
import { CourierClientClass } from "../../clients/courier";
import { CoreGameController } from "./core-game.controller";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      GameEntity,
      PlayerEntity,
      StockEntity,
      StockPriceEntity,
      CurrentPositionEntity,
      HistoricalPositionEntity,
      HistoricalAggregatePositionEntity,
      HistoricalAggregatePositionMinuteEntity,
      HistoricalAggregatePositionHourEntity,
      HistoricalAggregatePositionDayEntity,
      KickedUserEntity,
      OrderHistoryEntity,
      AverageTodayPriceEntity,
      AverageTotalPriceEntity,
    ]),
  ],
  controllers: [GameController, CoreGameController],
  providers: [GameService, CourierService, CourierClientClass],
  exports: [GameService],
})
export class GameModule {}

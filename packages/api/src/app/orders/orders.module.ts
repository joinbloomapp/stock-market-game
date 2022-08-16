/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  UserEntity,
  GameEntity,
  PlayerEntity,
  StockEntity,
  StockPriceEntity,
  CurrentPositionEntity,
  HistoricalPositionEntity,
  HistoricalAggregatePositionEntity,
  KickedUserEntity,
  OrderHistoryEntity,
  AverageTodayPriceEntity,
  AverageTotalPriceEntity,
  HistoricalAggregatePositionMinuteEntity,
  HistoricalAggregatePositionHourEntity,
  HistoricalAggregatePositionDayEntity,
} from "@bloom-smg/postgresql";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { GameModule } from "../game/game.module";

@Module({
  imports: [
    GameModule,
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
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}

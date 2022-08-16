/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  StockPriceEntity,
  CurrentPositionEntity,
  HistoricalPositionEntity,
  HistoricalAggregatePositionEntity,
  HistoricalAggregatePositionMinuteEntity,
  HistoricalAggregatePositionHourEntity,
  HistoricalAggregatePositionDayEntity,
} from "@bloom-smg/postgresql";
import { StockMinutesService } from "./stock/stock.service";

const providers = [StockMinutesService];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockPriceEntity,
      CurrentPositionEntity,
      HistoricalPositionEntity,
      HistoricalAggregatePositionEntity,
      HistoricalAggregatePositionMinuteEntity,
      HistoricalAggregatePositionHourEntity,
      HistoricalAggregatePositionDayEntity,
    ]),
  ],
  providers: providers,
  exports: providers,
})
export class MinutesModule {}

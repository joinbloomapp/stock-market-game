/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import {
  StockCategoryEntity,
  StockCategoryMappingEntity,
  StockEntity,
  StockPriceEntity,
} from "@bloom-smg/postgresql";
import { PeriodsService } from "./models/Periods";
import { RegenerateStockInfoController } from "./regenerate/regenerate.controller";
import { RegenerateStocksService } from "./regenerate/regenerate.service";
import { MarketService } from "../market/market.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockEntity,
      StockCategoryEntity,
      StockCategoryMappingEntity,
      StockPriceEntity,
    ]),
  ],
  controllers: [AssetsController, RegenerateStockInfoController],
  providers: [
    AssetsService,
    PeriodsService,
    RegenerateStocksService,
    MarketService,
  ],
})
/**
 * This module provides basic information about market conditions such as
 * individual stock information, discovery of new stocks and categories, or
 * other searchable things on the Internet that can be consolidated to here.
 */
export class AssetsModule {}

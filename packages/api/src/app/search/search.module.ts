/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  StockEntity,
  StockCategoryEntity,
  StockPriceEntity,
} from "@bloom-smg/postgresql";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockEntity,
      StockCategoryEntity,
      StockPriceEntity,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

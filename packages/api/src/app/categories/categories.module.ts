/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  StockCategoryEntity,
  StockCategoryMappingEntity,
  StockPriceEntity,
} from "@bloom-smg/postgresql";
import { CategoriesService } from "./categories.service";
import { CategoriesController } from "./categories.controller";

const providers = [CategoriesService];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockCategoryMappingEntity,
      StockCategoryEntity,
      StockPriceEntity,
    ]),
  ],
  controllers: [CategoriesController],
  providers: providers,
  exports: providers,
})
export class CategoriesModule {}

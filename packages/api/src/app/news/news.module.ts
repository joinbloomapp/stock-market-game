/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Module } from "@nestjs/common";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockPriceEntity } from "@bloom-smg/postgresql";

const providers = [NewsService];

@Module({
  imports: [TypeOrmModule.forFeature([StockPriceEntity])],
  controllers: [NewsController],
  providers: providers,
  exports: providers,
})
export class NewsModule {}

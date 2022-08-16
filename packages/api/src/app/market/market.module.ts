/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from "@nestjs/common";
import { MarketController } from "./market.controller";
import { MarketService } from "./market.service";

const providers = [MarketService];

@Module({
  controllers: [MarketController],
  providers: providers,
  exports: providers,
})
export class MarketModule {}

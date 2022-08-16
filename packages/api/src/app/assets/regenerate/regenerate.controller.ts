/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Controller, ForbiddenException, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RegenerateStocksService } from "./regenerate.service";
import { NoAuth } from "../../../utils/auth";

@ApiTags("Assets: Regenerate")
@Controller("regenerate")
export class RegenerateStockInfoController {
  constructor(private readonly regenerateService: RegenerateStocksService) {}

  @Post()
  @NoAuth()
  regenerate(@Query("token") token: string): Promise<void> {
    if (token !== process.env.REGENERATE_TOKEN) {
      throw new ForbiddenException("Token incorrect");
    }
    return this.regenerateService.writeStocks();
  }
}

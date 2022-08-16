/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional } from "class-validator";

export class MarketDataWithLatestQuotesDto {
  @ApiPropertyOptional({
    description: "A comma-delimited array of stock tickers",
  })
  @IsArray()
  @IsOptional()
  stocks: string[] = [];

  @ApiPropertyOptional({
    description: "A comma-delimited array of crypto tickers",
  })
  @IsArray()
  @IsOptional()
  crypto: string[] = [];

  @ApiPropertyOptional({
    description:
      "If set to true, it will append crypto data before stock data. Default false",
  })
  @IsOptional()
  @IsBoolean()
  reverseOrder = false;
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

export class GetQuoteDto {
  @ApiProperty({
    description: "Defines whether ticker is crypto",
  })
  @IsNotEmpty()
  @IsBoolean()
  isCrypto = false;
}

export class TickersDto {
  @ApiProperty({
    description: "Stock tickers",
  })
  @IsNotEmpty()
  @IsArray()
  tickers: string[];
}

export class GetBatchQuoteDto extends TickersDto {
  @ApiPropertyOptional({
    description: "Defines whether ticker is crypto. Default false.",
  })
  @IsBoolean()
  @IsOptional()
  isCrypto = false;
}

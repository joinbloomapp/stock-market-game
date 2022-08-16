/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { IsBigSerialString } from "src/utils/validator";

export class TransactionDto {
  @IsOptional()
  @IsBigSerialString()
  stockId?: string;

  ticker?: string;

  @ApiPropertyOptional({
    description: "Amount of stock to sell",
  })
  quantity?: number;

  @ApiPropertyOptional({
    description: "Amount in dollars to sell",
  })
  notional?: number;
}

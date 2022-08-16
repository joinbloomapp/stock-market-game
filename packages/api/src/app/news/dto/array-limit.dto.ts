/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";
import { LimitDto } from "./limit-query.dto";

export class ArrayLimitDto extends LimitDto {
  @ApiProperty({
    description: "A comma-delimited array of tickers",
  })
  @IsNotEmpty()
  @IsArray()
  tickers: string[];
}

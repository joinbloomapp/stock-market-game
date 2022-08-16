/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class FetchLastMarketDateDto {
  @ApiProperty({
    description: "Number of days from today",
    type: Number,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  numDaysAgo: number;
}

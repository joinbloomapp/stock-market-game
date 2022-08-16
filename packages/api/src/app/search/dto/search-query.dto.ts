/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class SearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: "Limit the number of results",
    default: 30,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Max(50)
  @Min(1)
  limit?: number = 30;

  @ApiProperty({ description: "Search query" })
  @IsNotEmpty()
  q: string;
}

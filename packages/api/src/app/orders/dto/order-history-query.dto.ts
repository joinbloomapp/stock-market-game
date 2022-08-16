/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class OrderHistoryQueryDto {
  @ApiPropertyOptional({
    description: "Pass in cursor in query parameter to get next page",
  })
  @IsOptional()
  after?: string;

  @ApiPropertyOptional({
    description: "Pass in cursor in query parameter to get next page",
  })
  @IsOptional()
  before?: string;

  @ApiPropertyOptional({
    description: "Limit the number of results",
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(80)
  @Min(1)
  limit: number = 30;

  @IsOptional()
  @ApiPropertyOptional({
    description: "Pass in ticker to search order history by",
  })
  ticker?: string;
}

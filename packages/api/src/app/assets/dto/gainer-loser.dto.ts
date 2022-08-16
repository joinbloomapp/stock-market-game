/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class GainerLoserDto {
  @ApiPropertyOptional({ description: "Source to get the data" })
  @IsOptional()
  source: "iex" | "polygon" = "iex";

  @ApiPropertyOptional({
    description: "Max number to return. 20 is the max.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 20;
}

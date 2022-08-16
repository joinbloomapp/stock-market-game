/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class LimitDto {
  @ApiProperty({
    description: "Limit, max 20 and default 3",
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  @IsInt()
  limit = 3;
}

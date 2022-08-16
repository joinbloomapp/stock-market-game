/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class LimitDto {
  @ApiProperty({
    description: "Limit, max and default 50",
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @Max(50)
  @Min(1)
  @IsInt()
  limit: number = 50;
}

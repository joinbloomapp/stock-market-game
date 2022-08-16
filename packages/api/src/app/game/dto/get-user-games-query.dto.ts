/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { GameStatusEnum } from "@bloom-smg/postgresql";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetUserGamesQueryDto {
  @ApiPropertyOptional({ description: "Limit number of games returned" })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(50)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: "Game status type",
    enum: GameStatusEnum,
  })
  @IsOptional()
  @IsEnum(GameStatusEnum)
  status?: GameStatusEnum;
}

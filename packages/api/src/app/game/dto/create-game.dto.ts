/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateGameDto {
  @ApiProperty({ description: "Name of the game" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Game end date and time" })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endAt: Date;

  @ApiProperty({ description: "Default buying power", default: 500 })
  @IsDefined()
  @IsNumber()
  @Min(1)
  @Max(50000)
  defaultBuyingPower: number;
}

export class UpdateGameDto {
  @ApiPropertyOptional({ description: "Name of the game" })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: "Game end date and time" })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endAt?: Date;

  @ApiProperty({ description: "Default buying power" })
  @IsNumber()
  @Min(1)
  @Max(50000)
  @IsOptional()
  defaultBuyingPower?: number;
}

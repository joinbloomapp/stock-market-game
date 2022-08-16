/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PeriodRange } from "../models/Periods";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import * as moment from "moment";
import { Moment } from "moment";

class BaseHistoricalBarsDto {
  @ApiPropertyOptional({
    description: "Whether the stock is crypto",
  })
  @IsOptional()
  @IsBoolean()
  isCrypto = false;
}

export class HistoricalBarsRangeDto extends BaseHistoricalBarsDto {
  @ApiProperty({
    description: "Time range",
  })
  @IsNotEmpty()
  @IsEnum(PeriodRange)
  range: PeriodRange;

  @ApiPropertyOptional({
    description: "Optional limit",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit: number;
}

export class HistoricalBarsDateDto extends BaseHistoricalBarsDto {
  @ApiProperty({
    description: "Date formatted",
    type: String,
    default: new Date().toISOString(),
  })
  @Type(() => Date)
  @Transform(({ value }) => moment(value), { toClassOnly: true })
  @IsNotEmpty()
  date: Moment;
}

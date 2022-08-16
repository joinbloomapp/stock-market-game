/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import * as moment from "moment";
import { Moment } from "moment";
import { IsNotEmpty } from "class-validator";

export class GetTradingDaysDto {
  @ApiProperty({
    description: "Date formatted",
    type: String,
    default: new Date(new Date().getTime() - 100000).toISOString(),
  })
  @IsNotEmpty()
  @Type(() => Date)
  @Transform(({ value }) => moment(value), { toClassOnly: true })
  start: Moment;

  @ApiProperty({
    description: "Date formatted",
    type: String,
    default: new Date().toISOString(),
  })
  @IsNotEmpty()
  @Type(() => Date)
  @Transform(({ value }) => moment(value), { toClassOnly: true })
  end: Moment;
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SellAllBodyDto {
  @ApiProperty({ description: "Stock id" })
  @IsString()
  @IsNotEmpty()
  stockId: string;
}

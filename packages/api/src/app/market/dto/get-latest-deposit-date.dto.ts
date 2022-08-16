/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class GetLatestDepositDateDto {
  @ApiPropertyOptional({ description: "Format", default: "ll" })
  @IsOptional()
  format: string = "ll";
}

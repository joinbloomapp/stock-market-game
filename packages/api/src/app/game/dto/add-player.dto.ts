/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class AddPlayerDto {
  @ApiProperty({ description: "Invite code" })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  inviteCode: string;
}

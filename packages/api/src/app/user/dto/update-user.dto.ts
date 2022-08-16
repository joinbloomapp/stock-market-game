/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ description: "Real first name" })
  @IsOptional()
  firstName: string;

  @ApiPropertyOptional({ description: "Real last name" })
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional({ description: "Email address" })
  @IsOptional()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Old password of the user" })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(150)
  // @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {message: 'Password must contain at least one letter and one number'})
  oldPassword: string;

  @ApiProperty({ description: "New password for the user" })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(150)
  // @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {message: 'Password must contain at least one letter and one number'})
  newPassword: string;
}

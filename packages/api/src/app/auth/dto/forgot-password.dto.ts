/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateForgotPasswordResetTokenDto {
  @ApiProperty({ description: "Email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ValidateForgotPasswordResetTokenDto {
  @ApiProperty({ description: "Password reset token" })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: "New password for the user" })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(150)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/, {
    message: "Password must contain at least one letter and one number",
  })
  newPassword: string;
}

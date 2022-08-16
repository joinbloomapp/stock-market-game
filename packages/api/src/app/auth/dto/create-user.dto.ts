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

export class CreateUserDto {
  @ApiProperty({ description: "Unchangeable email address" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Password" })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(150)
  // @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {message: 'Password must contain at least one letter and one number'})
  password: string;

  @ApiProperty({ description: "Real first name" })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: "Real last name" })
  @IsNotEmpty()
  lastName: string;
}

export class CreateUserRetDto {
  userId: number;
  access: string;

  constructor(userId: number, access: string) {
    this.userId = userId;
    this.access = access;
  }
}

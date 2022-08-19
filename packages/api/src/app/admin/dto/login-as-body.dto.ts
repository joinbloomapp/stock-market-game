/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginAsBodyDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

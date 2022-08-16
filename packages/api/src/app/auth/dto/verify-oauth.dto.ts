/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { IsNotEmpty, IsString } from "class-validator";
import { Providers } from "./providers.dto";

export class VerifyOAuthDto {
  @IsNotEmpty()
  @IsString()
  provider: Providers;

  @IsNotEmpty()
  refreshToken: string;

  data: { [key: string]: any };
}

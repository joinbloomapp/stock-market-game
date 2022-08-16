/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface SignupUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
}

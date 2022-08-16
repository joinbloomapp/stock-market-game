/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

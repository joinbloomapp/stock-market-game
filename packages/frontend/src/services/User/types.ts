/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  isSiteAdmin?: boolean;
}

export interface UpdateUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

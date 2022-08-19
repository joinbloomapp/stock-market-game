/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { UserEntity } from "@bloom-smg/postgresql";

export class FullUserInfoDto {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  hasPassword: boolean;
  isSiteAdmin?: boolean;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.name = user.name;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.hasPassword = user.extra?.hasPassword;
    if (user.isSiteAdmin) {
      this.isSiteAdmin = true;
    }
  }
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Unique,
  Index,
  OneToMany,
} from "typeorm";
import { JSONValue } from "../../utils/types";
import SocialAccount from "./social-account.entity";
import SocialToken from "./social-token.entity";

@Entity({ name: "SocialApp" })
@Unique("social_app_unique_provider", ["provider"])
export class SocialApp {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  // Instead of using an enum type which would require
  // constant migrations of new clients, we use a simple varchar
  @Column({ type: "varchar", length: 30 })
  @Index()
  provider: string;

  @Column({ type: "varchar", length: 40 })
  /** Custom name for this provider (e.g. if you have multiple Google,
   * you would use this name to distinguish them for transparency). This also
   * becomes the .env prefix value for grabbing OAuth credentials
   */
  name: string;

  @Column({ type: "jsonb", default: {} })
  extra: JSONValue;

  @OneToMany(() => SocialAccount, (mapping) => mapping.app)
  socialAccounts: SocialAccount[];

  @OneToMany(() => SocialToken, (mapping) => mapping.app)
  socialTokens: SocialToken[];

  static TABLE_NAME = "SocialApp";
}

export { SocialApp as default };

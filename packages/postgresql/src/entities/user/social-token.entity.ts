/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { JSONValue } from "../../utils/types";
import SocialApp from "./social-app.entity";
import SocialAccount from "./social-account.entity";

@Entity({ name: "SocialToken" })
@Unique("social_token_app_account", ["appId", "accountId"])
export class SocialToken {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({ type: "int8" })
  appId: string;

  @Column({ type: "int8" })
  accountId: string;

  @Column({ type: "varchar", length: 10000 })
  token: string;

  @Column({ type: "varchar", length: 10000 })
  tokenSecret: string;

  @Column({
    type: "timestamptz",
    nullable: true,
  })
  expiresAt: Date;

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @Column({ type: "jsonb", default: {} })
  extra: JSONValue;

  @ManyToOne(() => SocialAccount, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "accountId", referencedColumnName: "id" })
  account: SocialAccount;

  @ManyToOne(() => SocialApp, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "appId", referencedColumnName: "id" })
  app: SocialApp;

  static TABLE_NAME = "SocialToken";
}

export { SocialToken as default };

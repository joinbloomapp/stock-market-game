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
  JoinColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { JSONValue } from "../../utils/types";
import User from "./user.entity";
import SocialApp from "./social-app.entity";

@Entity({ name: "SocialAccount" })
@Unique("social_account_app_uid", ["appId", "uid"])
@Index("social_account_app_uid_index", ["uid", "appId"])
export class SocialAccount {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({ type: "int8" })
  /**
   * Our project's user ID
   */
  userId: string;

  @Column({ type: "int8" })
  appId: string;

  @Column({ type: "varchar", length: 191 })
  /**
   * Social provider user ID
   */
  uid: string;

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @Column({ type: "jsonb", default: {} })
  extra: JSONValue;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  user: User;

  @ManyToOne(() => SocialApp, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "appId", referencedColumnName: "id" })
  app: SocialApp;

  static TABLE_NAME = "SocialAccount";
}

export { SocialAccount as default };

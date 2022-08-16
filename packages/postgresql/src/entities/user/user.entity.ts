import { JSONValue } from "src/utils/types";
/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export interface UserExtraData {
  hasPassword: boolean;
  [key: string]: any;
}

@Entity({ name: "User" })
export class User {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({ type: "varchar", length: 255 })
  @Index()
  email: string;

  @Column({ type: "varchar", length: 150 })
  password: string;

  @Column({ type: "varchar", length: 255 })
  /**
   * User's real name, not a username. Bloom also doesn't have a username.
   */
  name: string;

  @Column({ type: "varchar", length: 255 })
  // Purely metadata
  firstName: string;

  @Column({ type: "varchar", length: 255 })
  // Purely metadata
  lastName: string;

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @Column({ type: "jsonb", default: {} })
  extra: UserExtraData;

  static TABLE_NAME = "User";
}

export { User as default };

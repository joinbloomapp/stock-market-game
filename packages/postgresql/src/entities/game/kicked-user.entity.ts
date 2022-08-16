/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { JSONValue } from "src/utils/types";
import User from "../user/user.entity";
import Game from "./game.entity";

@Entity({ name: "KickedUser" })
export default class KickedUser {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @Column({ type: "int8" })
  userId: string;

  @ManyToOne(() => User, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId", referencedColumnName: "id" })
  user: User;

  @Column({ type: "int8" })
  gameId: string;

  @ManyToOne(() => Game, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "gameId", referencedColumnName: "id" })
  game: Game;

  @Column({ type: "jsonb", default: {} })
  extra: JSONValue;

  static TABLE_NAME = "KickedUser";
}

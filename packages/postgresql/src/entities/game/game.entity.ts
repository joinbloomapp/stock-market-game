/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  Entity,
  OneToMany,
} from "typeorm";
import { JSONValue } from "../../utils/types";
import Player from "./player.entity";
import { ColumnNumberTransformer } from "../../utils/transformers/string-to-number.transformer";

export enum GameStatusEnum {
  NOT_STARTED = "NOT_STARTED",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

@Entity({ name: "Game" })
export class Game {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @Column({ type: "timestamptz" })
  startAt: Date;

  @Column({ type: "timestamptz" })
  endAt: Date;

  @Column({
    type: "enum",
    enum: GameStatusEnum,
    default: GameStatusEnum.NOT_STARTED,
  })
  status: GameStatusEnum;

  @Column({
    type: "int8",
    transformer: new ColumnNumberTransformer({ positive: true, silent: true }),
  })
  public defaultBuyingPower: number;

  @Column({ type: "varchar", length: 6 })
  inviteCode: string;

  @Column({ type: "jsonb", default: {} })
  extra: JSONValue;

  @OneToMany(() => Player, (player) => player.game)
  players: Player[];

  static TABLE_NAME = "Game";
}

export { Game as default };

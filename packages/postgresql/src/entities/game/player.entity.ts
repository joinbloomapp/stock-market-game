/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { JSONValue } from "src/utils/types";
import User from "../user/user.entity";
import Game from "./game.entity";
import CurrentPosition from "./portfolio/current-position.entity";
import HistoricalPosition from "./portfolio/historical-position.entity";
import HistoricalAggregatePosition from "./portfolio/historical-aggregate-position.entity";
import { Int8MultiplierTransformer } from "../../utils/transformers/int8-multiplier.transformer";

@Entity({ name: "Player" })
export default class Player {
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

  @Column({ type: "boolean" })
  isGameAdmin: boolean;

  @Column({
    type: "int8",
    transformer: new Int8MultiplierTransformer(1000, {
      positive: true,
      silent: true,
    }),
  })
  public buyingPower: number;

  @Column({ type: "jsonb", default: {} })
  extra: JSONValue;

  @OneToMany(() => CurrentPosition, (position) => position.player)
  currentPositions: CurrentPosition[];

  @OneToMany(() => HistoricalPosition, (position) => position.player)
  historicalPositions: HistoricalPosition[];

  @OneToMany(() => HistoricalAggregatePosition, (position) => position.player)
  historicalAggregatePositions: HistoricalAggregatePosition[];

  static TABLE_NAME = "Player";
}

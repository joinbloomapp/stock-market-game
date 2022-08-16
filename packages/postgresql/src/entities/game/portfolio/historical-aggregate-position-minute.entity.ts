/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
} from "typeorm";
import Player from "../player.entity";
import Game from "../game.entity";
import { Int8MultiplierTransformer } from "../../../utils/transformers/int8-multiplier.transformer";

@Entity({ name: "HistoricalAggregatePositionMinute" })
export class HistoricalAggregatePositionMinute {
  // FIXME If this becomes too slow, remove gameId

  @PrimaryGeneratedColumn({ type: "int8" })
  id: string;

  @Column({
    type: "timestamptz",
  })
  createdAt: Date;

  @Column({ type: "int8" })
  @Index()
  playerId: string;

  @Column({ type: "int8" })
  // We add an index in the scenario a user wants to collect all data from a game
  @Index()
  gameId: string;

  @Column({
    type: "int8",
    transformer: new Int8MultiplierTransformer(1000, {
      positive: true,
      silent: true,
    }),
    nullable: false,
  })
  public value: number;

  @ManyToOne(() => Game, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "gameId", referencedColumnName: "id" })
  game: Game;

  @ManyToOne(() => Player, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "playerId", referencedColumnName: "id" })
  player: Player;

  static TABLE_NAME = "HistoricalAggregatePositionMinute";
}

export { HistoricalAggregatePositionMinute as default };

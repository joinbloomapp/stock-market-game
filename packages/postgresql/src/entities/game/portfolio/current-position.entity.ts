/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
  Unique,
} from "typeorm";
import Player from "../player.entity";
import Game from "../game.entity";
import Stock from "../../stock/stock.entity";
import { ColumnNumberTransformer } from "../../../utils/transformers/string-to-number.transformer";

@Entity({ name: "CurrentPosition" })
// DO NOT create an index on these two fields for the sake of this unique
// constraint; PG will determine the right index to use, i.e. playerId
@Unique("current_position_player_stock_unique", ["playerId", "stockId"])
@Index("current_position_is_active_position_index", ["stockId", "isActive"])
export class CurrentPosition {
  // FIXME If this becomes too slow, remove gameId

  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({ type: "int8" })
  stockId: string;

  @Column({ type: "int8" })
  @Index()
  playerId: string;

  @Column({ type: "int8" })
  // No index necessary since we don't delete data, so CASCADING has no effect
  gameId: string;

  @Column({
    type: "decimal",
    precision: 40,
    scale: 20,
    transformer: new ColumnNumberTransformer({
      positive: true,
      silent: true,
      parseFloat: true,
    }),
    nullable: false,
  })
  public quantity: number;

  @Column({
    type: "boolean",
    default: true,
  })
  isActive: boolean;

  // We don't save the value since that can be calculated on the frontend
  // @Column({ type: "int8" })
  // value: number;

  @ManyToOne(() => Stock, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "stockId", referencedColumnName: "id" })
  stock: Stock;

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

  static TABLE_NAME = "CurrentPosition";
}

export { CurrentPosition as default };

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Stock from "../../stock/stock.entity";
import Game from "../game.entity";
import Player from "../player.entity";
import { Int8MultiplierTransformer } from "../../../utils/transformers/int8-multiplier.transformer";

export enum OrderTypeEnum {
  BUY = "BUY",
  SELL = "SELL",
}

export enum OrderStatusEnum {
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

@Entity({ name: "OrderHistory" })
export class OrderHistory {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "Now()",
  })
  createdAt: Date;

  @Column({
    type: "int8",
  })
  stockId: string;

  @Column({
    type: "int8",
  })
  playerId: string;

  @Column({
    type: "int8",
  })
  // TODO may need to add an index on this column for popular-assets route
  gameId: string;

  @Column({
    type: "int8",
    transformer: new Int8MultiplierTransformer(1000, {
      positive: true,
      silent: true,
    }),
    nullable: false,
  })
  quantity: number;

  @Column({
    type: "int8",
    transformer: new Int8MultiplierTransformer(1000, {
      positive: true,
      silent: true,
    }),
  })
  value: number;

  @Column({
    type: "enum",
    enum: OrderTypeEnum,
  })
  orderType: OrderTypeEnum;

  @Column({
    type: "enum",
    enum: OrderStatusEnum,
  })
  orderStatus: OrderStatusEnum;

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

  static TABLE_NAME = "OrderHistory";
}

export { OrderHistory as default };

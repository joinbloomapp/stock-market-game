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
  UpdateDateColumn,
} from "typeorm";
import Player from "../player.entity";
import Stock from "../../stock/stock.entity";
import { Int8MultiplierTransformer } from "../../../utils/transformers/int8-multiplier.transformer";
import { ColumnNumberTransformer } from "../../../utils/transformers/string-to-number.transformer";

@Entity({ name: "AverageTodayPrice" })
@Index(["stockId", "playerId"], { unique: true })
export class AverageTodayPrice {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({ type: "int8" })
  stockId: string;

  @Column({ type: "int8" })
  @Index()
  playerId: string;

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
  numBuys: number;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "Now()",
  })
  updatedAt: Date;

  @Column({
    type: "int8",
    transformer: new Int8MultiplierTransformer(1000, {
      positive: true,
      silent: true,
    }),
  })
  public averagePrice: number;

  @ManyToOne(() => Stock, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "stockId", referencedColumnName: "id" })
  stock: Stock;

  @ManyToOne(() => Player, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "playerId", referencedColumnName: "id" })
  player: Player;

  static TABLE_NAME = "AverageTodayPrice";
}

export { AverageTodayPrice as default };

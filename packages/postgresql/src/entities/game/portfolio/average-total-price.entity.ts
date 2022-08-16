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
} from "typeorm";
import Player from "../player.entity";
import Stock from "../../stock/stock.entity";
import { Int8MultiplierTransformer } from "../../../utils/transformers/int8-multiplier.transformer";
import { ColumnNumberTransformer } from "../../../utils/transformers/string-to-number.transformer";

@Entity({ name: "AverageTotalPrice" })
@Index(["stockId", "playerId"], { unique: true })
export class AverageTotalPrice {
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

  static TABLE_NAME = "AverageTotalPrice";
}

export { AverageTotalPrice as default };

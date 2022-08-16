/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import Stock from "./stock.entity";
import { Int8MultiplierTransformer } from "../../utils/transformers/int8-multiplier.transformer";

@Entity({ name: "StockPrice" })
class StockPrice {
  @BeforeInsert()
  setDefaultValues() {
    if (!this.oldPrice) {
      this.oldPrice = 0;
    }
    if (!this.percentChange) {
      this.percentChange = 0;
    }
  }

  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({
    type: "int8",
  })
  @Index()
  stockId: string;

  @ManyToOne(() => Stock, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "stockId", referencedColumnName: "id" })
  stock: Stock;

  @Column({
    type: "varchar",
    length: 15,
  })
  @Index()
  ticker: string;

  @Column({
    type: "int8",
    transformer: new Int8MultiplierTransformer(1000, {
      positive: true,
      silent: true,
      operator: "round",
    }),
  })
  public price: number;

  @Column({
    type: "int8",
    transformer: new Int8MultiplierTransformer(1000, {
      positive: true,
      silent: true,
      operator: "round",
    }),
    default: 0,
  })
  public oldPrice: number;

  @Column({
    type: "int8",
    transformer: new Int8MultiplierTransformer(1000, {
      operator: "round",
    }),
    default: 0,
  })
  public percentChange: number;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "Now()",
  })
  lastUpdated: Date;

  static TABLE_NAME = "StockPrice";
}

export { StockPrice as default };

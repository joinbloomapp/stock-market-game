/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  Column,
  JoinColumn,
  Unique,
} from "typeorm";
import Stock from "./stock.entity";
import StockCategory from "./stock-category.entity";

@Entity({ name: "StockCategoryMapping" })
@Unique("unique_stock_category_mapping", ["stockId", "categoryId"])
class StockCategoryMapping {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({
    type: "int8",
  })
  stockId: string;

  @Column({
    type: "int8",
  })
  categoryId: string;

  @ManyToOne(() => Stock, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "stockId", referencedColumnName: "id" })
  stock: Stock;

  @ManyToOne(() => StockCategory, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "categoryId", referencedColumnName: "id" })
  category: StockCategory;

  static TABLE_NAME = "StockCategoryMapping";
}

export { StockCategoryMapping as default };

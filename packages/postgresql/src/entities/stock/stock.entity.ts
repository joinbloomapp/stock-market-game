/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Index,
  OneToMany,
  Unique,
} from "typeorm";
import StockCategoryMappingEntity from "./stock-category-mapping.entity";

interface _ExtraStockData {
  industry: string;
  sector: string;
  employees: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
}

export type ExtraStockData = Partial<_ExtraStockData>;

@Entity({ name: "Stock" })
@Unique("stock_ticker_unique_constraint", ["ticker"])
class Stock {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({
    type: "varchar",
    length: 15,
  })
  @Index()
  ticker: string;

  @Column({
    type: "varchar",
    length: 500, // the highest is 152...
  })
  name: string;

  // Attributes

  @Column({ type: "boolean" })
  isActive: boolean;

  @Column({
    type: "boolean",
  })
  isEtf: boolean;

  @Column({
    type: "boolean",
  })
  shortable: boolean;

  // Profile

  @Column({
    type: "varchar",
    // the highest is 4987, but you never know...
    // Additionally, anytime you up this number, we need to increase a
    // substring in regenerate.service.ts
    length: 15000,
  })
  description: string;

  @Column({
    type: "varchar",
    length: 2048, // typically image uris have 1000 len for browser purposes
  })
  image: string;

  @Column({
    type: "tsvector",
    default: null,
    nullable: true,
  })
  @Index("search_stock_idx")
  search_stock?: string;

  @Column({
    type: "jsonb",
    default: {},
  })
  extra_data: ExtraStockData;

  @OneToMany(() => StockCategoryMappingEntity, (mapping) => mapping.stock)
  stockCategoryMappings: StockCategoryMappingEntity[];

  static TABLE_NAME = "Stock";
}

export { Stock as default };

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { PrimaryGeneratedColumn, Column, Entity, OneToMany } from "typeorm";
import { JSONValue } from "src/utils/types";
import StockCategoryMappingEntity from "./stock-category-mapping.entity";

@Entity({ name: "StockCategory" })
class StockCategory {
  @PrimaryGeneratedColumn({
    type: "int8",
  })
  id: string;

  @Column({
    type: "varchar",
    length: 50,
  })
  name: string;

  @Column({
    type: "varchar",
    length: 2000,
  })
  description: string;

  @Column({
    type: "varchar",
    length: 500,
  })
  snippet: string;

  @Column({
    type: "varchar",
    length: 2048, // typically image uris have this len for browser purposes
  })
  image: string;

  @Column({
    type: "jsonb",
    default: {},
  })
  extra: JSONValue;

  @OneToMany(() => StockCategoryMappingEntity, (mapping) => mapping.category)
  stockCategoryMappings: StockCategoryMappingEntity[];

  static TABLE_NAME = "StockCategory";
}

export { StockCategory as default };

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { StockCategoryEntity } from "@bloom-smg/postgresql";

export class CategoryDto {
  id: string;
  name: string;
  image: string;
  numAssets: number;
  description: string;

  constructor(category: StockCategoryEntity, count: number) {
    this.id = category.id;
    this.name = category.name;
    this.image = category.image;
    this.numAssets = count;
    this.description = category.description;
  }
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { StockPriceEntity } from "@bloom-smg/postgresql";

export class PopularAssetDto {
  latestPrice: number;
  id: string; // stock id
  ticker: string;
  name: string;
  image: string;

  constructor(stockPrice: StockPriceEntity) {
    this.latestPrice = stockPrice.price;
    this.id = stockPrice.stockId;
    this.ticker = stockPrice.stock.ticker;
    this.name = stockPrice.stock.name;
    this.image = stockPrice.stock.image;
  }
}

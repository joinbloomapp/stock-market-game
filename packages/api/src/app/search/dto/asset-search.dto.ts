/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { StockEntity } from "@bloom-smg/postgresql";

class SearchDto {
  ticker: string;
  name: string;
  description: string;
  image: string;
  latestPrice?: number;

  constructor(stock: StockEntity, prices: { [key: string]: number }) {
    this.ticker = stock.ticker;
    this.name = stock.name;
    this.description = stock.description;
    this.image = stock.image;
    this.latestPrice = prices[stock.id] || null; // possibility it might not exist yet
  }
}

export class SearchPageDto {
  assets: SearchDto[];
  count: number;

  constructor(
    stocks: StockEntity[],
    prices: { [key: string]: number },
    count: number
  ) {
    this.assets = stocks.map((stock) => new SearchDto(stock, prices));
    this.count = count;
  }
}

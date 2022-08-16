/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  HistoricalPositionEntity,
  StockPriceEntity,
} from "@bloom-smg/postgresql";

export class HistoricalPositionDto {
  createdAt: Date;
  value: number;
  stockId: string;
  ticker: string;
  stockPrice: number;
  playerId: string;

  constructor(
    position: HistoricalPositionEntity,
    stockPrices: StockPriceEntity[],
    playerId: string
  ) {
    const stockPrice = stockPrices.find((x) => x.id === position.stockId);
    this.value = position.value / 1000;
    this.createdAt = position.createdAt;
    this.stockPrice = stockPrice.price / 1000;
    this.stockId = position.stockId;
    this.ticker = stockPrice.ticker;
    this.playerId = playerId;
  }
}

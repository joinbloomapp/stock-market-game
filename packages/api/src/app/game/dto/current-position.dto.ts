/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  AverageTodayPriceEntity,
  AverageTotalPriceEntity,
  CurrentPositionEntity,
  HistoricalPositionEntity,
  StockPriceEntity,
} from "@bloom-smg/postgresql";
import { ApiProperty } from "@nestjs/swagger";

export class CurrentPositionDto {
  @ApiProperty({ description: "Full name of the stock" })
  name: string;
  @ApiProperty({ description: "Image url for the stock" })
  image: string;

  @ApiProperty({
    description: "Quantity owned of stock",
  })
  quantity: number;
  @ApiProperty({
    description:
      "Total value of the stock that I own right now (same as available to sell value)",
  })
  totalValue: number;

  @ApiProperty({
    description: "Overall change percent of your stock, not in decimal format",
  })
  totalChangePercent: number;
  @ApiProperty({
    description: "Over change in dollars of your stock",
  })
  totalChange: number;
  @ApiProperty({ description: "Today's change in returns" })
  todayChange: number;
  @ApiProperty({ description: "Today's change percent" })
  todayChangePercent: number;

  assetId: string;
  ticker: string;
  latestPrice: number;

  averageTotalPrice: number;
  averageTodayPrice: number;

  /**
   * Returns the current position of an entity with a shit ton of additional
   * information.
   */
  constructor(
    position: CurrentPositionEntity,
    stockPrice: StockPriceEntity,
    averageTotal: AverageTotalPriceEntity,
    averageToday: AverageTodayPriceEntity,
    historicalPosition?: HistoricalPositionEntity
  ) {
    this.name = stockPrice.stock.name;
    this.image = stockPrice.stock.image;
    this.quantity = Number.parseFloat(position?.quantity?.toFixed(3));
    this.totalValue = position.quantity * stockPrice.price;
    /*
     * totalChange = (latest price - average entry price) * num shares you have at that moment
     * totalChangePercent = ((latest price - average entry price) / average entry price) * 100
     */
    const avgEntryPrice = averageTotal?.averagePrice ?? 0;
    this.totalChange = (stockPrice.price - avgEntryPrice) * position.quantity;
    this.totalChangePercent =
      ((stockPrice.price - avgEntryPrice) / (averageTotal.averagePrice ?? 1)) *
      100;
    /*
    todaysChange = (Lp - yp) * ydayShares + (Lp - avgTodayPrice) * numBoughtToday
    todaysChangePercent = ((todayChange) / (yp * ydayShares)) * 100
     */
    const ydayShares = (historicalPosition?.value ?? 0) / stockPrice.oldPrice;
    this.todayChange = (stockPrice.price - stockPrice.oldPrice) * ydayShares;
    if (
      // check if same day
      !averageToday ||
      Math.floor(averageToday.updatedAt.getTime() / (1000 * 60 * 60 * 24)) ===
        Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24))
    ) {
      this.todayChange +=
        (stockPrice.price - averageToday?.averagePrice || 0) *
        (averageToday?.numBuys || 0);
    }
    this.todayChangePercent =
      (this.todayChange /
        (stockPrice.oldPrice * (ydayShares || position.quantity || 1))) *
      100;

    this.assetId = position.stockId;
    this.ticker = stockPrice.ticker;
    this.latestPrice = stockPrice.price;

    this.averageTotalPrice = averageTotal?.averagePrice || 0;
    this.averageTodayPrice = averageToday?.averagePrice || 0;
  }
}

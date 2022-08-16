/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface TickerPrice {
  ticker: string;
  latestPrice: number;
  changePercent: number;
  change: number;
}

export interface NewsContentDto {
  sourceName: string;
  date: number; // unix time,
  imageSource?: string;
  url?: string;
  snippet: string;
  snippetLineLimit?: number; // line limit
  tickers: TickerPrice[];
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface NewsItem {
  sourceName: string;
  date: number; // unix time,
  imageSource?: string;
  url?: string;
  snippet: string;
  snippetLineLimit?: number; // line limit
  tickers?: string[];
}

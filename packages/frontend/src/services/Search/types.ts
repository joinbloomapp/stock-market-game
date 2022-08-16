/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface AssetSearchResult {
  description: string;
  name: string;
  image: string;
  latestPrice: number;
  ticker: string;
}

export interface AssetSearch {
  assets: AssetSearchResult[];
  count: number;
}

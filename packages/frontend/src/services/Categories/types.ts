/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface Category {
  id: string;
  name: string;
  image: string;
  numAssets: number;
  description: string;
}

export interface CategoryAsset {
  name: string;
  ticker: string;
  image: string;
  latestPrice: number;
}

export interface CategoryAssetsResponse {
  assets: CategoryAsset[];
  count: number; // total count of assets
  cursor: string; // base64 cursor
}

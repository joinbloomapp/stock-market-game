/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CategoryAssetDto } from "./category-asset.dto";

export class CategoryAssetsResponseDto {
  assets: CategoryAssetDto[];
  count: number; // total count of assets
  cursor: string; // base64 cursor

  constructor(assets: CategoryAssetDto[], count: number, cursor: string) {
    this.assets = assets;
    this.count = count;
    this.cursor = cursor;
  }
}

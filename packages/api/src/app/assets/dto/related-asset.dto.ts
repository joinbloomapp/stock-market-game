/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export class RelatedAssetDto {
  ticker: string;
  name: string;
  image: string;
  latestPrice?: number;
  change?: number;
  changePercent?: number;
}

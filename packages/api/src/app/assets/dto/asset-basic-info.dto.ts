/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface AssetBasicInfoDto {
  address?: string;
  city?: string;
  country?: string;
  employees?: number;
  image?: string;
  industry?: string;
  isEtf?: boolean;
  name: string;
  shortable?: boolean;
  state?: string;
  ticker?: string;
  description?: string;
}

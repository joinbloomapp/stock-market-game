/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface CryptoStockStyles {
  primaryColor: string;
}

export interface CryptoStock {
  isEtf?: boolean;
  name: string;
  symbol?: string;
  isCrypto: boolean;
  description?: string;
  exchange?: string;
  styles: Record<string, CryptoStockStyles>;
  industry: string;
  founded: string;
  marketRank: number;
  minimumAmount: number;
  minimumQty: number;
  qtyIncrement: number;
  priceIncrement: number;
}

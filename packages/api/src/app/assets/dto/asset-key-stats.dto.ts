/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface AssetKeyStatsDto {
  companyName: string;
  marketcap: number;
  week52high: number;
  week52low: number;
  week52highSplitAdjustOnly?: null;
  week52lowSplitAdjustOnly?: null;
  week52change: number;
  sharesOutstanding: number;
  float?: null;
  avg10Volume: number;
  avg30Volume: number;
  day200MovingAvg: number;
  day50MovingAvg: number;
  employees: number;
  ttmEPS: number;
  ttmDividendRate: number;
  dividendYield: number;
  nextDividendDate: string;
  exDividendDate: string;
  nextEarningsDate: string;
  peRatio: number;
  maxChangePercent: number;
  year5ChangePercent: number;
  year2ChangePercent: number;
  year1ChangePercent: number;
  ytdChangePercent: number;
  month6ChangePercent: number;
  month3ChangePercent: number;
  month1ChangePercent: number;
  day30ChangePercent: number;
  day5ChangePercent: number;
  beta: number;
  totalCash: number;
  currentDebt: number;
  revenue: number;
  grossProfit: number;
  totalRevenue: number;
  EBITDA: number;
  revenuePerShare: number;
  revenuePerEmployee: number;
  debtToEquity: number;
  profitMargin: number;
  enterpriseValue: number;
  enterpriseValueToRevenue: number;
  priceToSales: number;
  priceToBook: number;
  forwardPERatio: number;
  pegRatio: number;
  peHigh: number;
  peLow: number;
  week52highDate: string;
  week52lowDate: string;
  week52highDateSplitAdjustOnly?: null;
  week52lowDateSplitAdjustOnly?: null;
  putCallRatio: number;
  latestVolume?: number;
  avgTotalVolume?: number;
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface AssetBasicInfo {
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

export interface AssetCompanyInfo {
  ticker: string;
  companyName: string;
  exchange: string;
  industry: string;
  website: string;
  description: string;
  CEO: string;
  securityName: string;
  issueType: string;
  sector: string;
  primarySicCode: number;
  employees: number;
  tags: string[];
  address: string;
  address2: null;
  state: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  iexIndustry: string;
  iexSector: string;
  iexTags: string[];
}

export interface AssetRelated {
  ticker: string;
  name: string;
  image: string;
  latestPrice: number;
  change: number; // in dollar amount
  changePercent: number; // in percent amount
}

export interface AssetKeyStats {
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

export interface AssetCryptoQuote {
  symbol: string;
  sector: string;
  calculationPrice: string;
  latestPrice: string;
  latestSource: string;
  latestUpdate: number;
  latestVolume: string;
  bidPrice: string;
  bidSize: string;
  askPrice: string;
  askSize: string;
  high: string;
  low: string;
  previousClose: string;
}

export interface AssetQuote {
  symbol: string;
  companyName: string;
  primaryExchange: string;
  calculationPrice: string;
  open: number;
  openTime: number;
  openSource: string;
  close: number;
  closeTime: number;
  closeSource: string;
  high: number;
  highTime: number;
  highSource: string;
  low: number;
  lowTime: number;
  lowSource: string;
  latestPrice: number;
  latestSource: string;
  latestTime: string;
  latestUpdate: number;
  latestVolume: number;
  iexRealtimePrice: number;
  iexRealtimeSize: number;
  iexLastUpdated: number;
  delayedPrice: number;
  delayedPriceTime: number;
  oddLotDelayedPrice: number;
  oddLotDelayedPriceTime: number;
  extendedPrice: number;
  extendedChange: number;
  extendedChangePercent: number;
  extendedPriceTime: number;
  previousClose: number;
  previousVolume: number;
  change: number;
  changePercent: number;
  volume: number;
  iexMarketPercent: number;
  iexVolume: number;
  avgTotalVolume: number;
  iexBidPrice: number;
  iexBidSize: number;
  iexAskPrice: number;
  iexAskSize: number;
  iexOpen: number;
  iexOpenTime: number;
  iexClose: number;
  iexCloseTime: number;
  marketCap: number;
  peRatio: number;
  week52High: number;
  week52Low: number;
  ytdChange: number;
  lastTradeTime: number;
  currency: string;
  isUSMarketOpen: boolean;
}

export interface AssetAggBar {
  c: number;
  h: number;
  l: number;
  n: number;
  o: number;
  t: number;
  v: number;
  vw: number;
}

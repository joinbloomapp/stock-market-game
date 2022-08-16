/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface CryptoQuote {
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

export interface Quote {
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

export interface BatchQuoteResponse {
  [key: string]: CryptoQuote | Quote;
}

export interface IEXGainerLoser {
  avgTotalVolume: number;
  calculationPrice: string;
  change: number;
  changePercent: number;
  close: number;
  closeSource: string;
  closeTime: number;
  companyName: string;
  currency: string;
  delayedPrice: number;
  delayedPriceTime: number;
  extendedChange: number;
  extendedChangePercent: number;
  extendedPrice: number;
  extendedPriceTime: number;
  high: number;
  highSource: string;
  highTime: number;
  iexAskPrice: number;
  iexAskSize: number;
  iexBidPrice: number;
  iexBidSize: number;
  iexClose: number;
  iexCloseTime: number;
  iexLastUpdated: number;
  iexMarketPercent: number;
  iexOpen: number;
  iexOpenTime: number;
  iexRealtimePrice: number;
  iexRealtimeSize: number;
  iexVolume: number;
  lastTradeTime: number;
  latestPrice: number;
  latestSource: string;
  latestTime: string;
  latestUpdate: number;
  latestVolume: number;
  low: number;
  lowSource: string;
  lowTime: number;
  marketCap: number;
  oddLotDelayedPrice: number;
  oddLotDelayedPriceTime: number;
  open: number;
  openTime: number;
  openSource: string;
  peRatio: null;
  previousClose: number;
  previousVolume: number;
  primaryExchange: string;
  symbol: string;
  volume: number;
  week52High: number;
  week52Low: number;
  ytdChange: number;
  isUSMarketOpen: false;
}

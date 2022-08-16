/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface YHMarketSummary {
  fullExchangeName: string;
  symbol: string;
  gmtOffSetMilliseconds: number;
  language: "en-US";
  regularMarketTime: {
    raw: number;
    fmt: string;
  };
  regularMarketChangePercent: {
    raw: number;
    fmt: string;
  };
  quoteType: string;
  typeDisp: string;
  tradeable: false;
  regularMarketPreviousClose: {
    raw: number;
    fmt: string;
  };
  exchangeTimezoneName: "America/New_York";
  regularMarketChange: {
    raw: number;
    fmt: string;
  };
  firstTradeDateMilliseconds: number;
  exchangeDataDelayedBy: number;
  exchangeTimezoneShortName: string;
  customPriceAlertConfidence: string;
  regularMarketPrice: {
    raw: number;
    fmt: string;
  };
  marketState: string;
  market: "us_market";
  quoteSourceName: string;
  priceHint: number;
  sourceInterval: number;
  exchange: string;
  region: "US";
  shortName: string;
  triggerable: boolean;
}

export interface YHQuote {
  language: string;
  region: "US";
  quoteType: string;
  typeDisp: string;
  quoteSourceName: string;
  triggerable: boolean;
  customPriceAlertConfidence: string;
  regularMarketDayHigh: number;
  regularMarketDayRange: string;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  ask: number;
  fiftyTwoWeekLowChangePercent: number;
  fiftyTwoWeekRange: string;
  fiftyTwoWeekHighChange: number;
  fiftyTwoWeekHighChangePercent: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  sourceInterval: number;
  exchangeDataDelayedBy: number;
  regularMarketOpen: number;
  averageDailyVolume3Month: number;
  averageDailyVolume10Day: number;
  fiftyTwoWeekLowChange: number;
  priceHint: number;
  firstTradeDateMilliseconds: number;
  currency: "USD";
  tradeable: boolean;
  bidSize: number;
  askSize: number;
  fullExchangeName: string;
  fiftyDayAverage: number;
  fiftyDayAverageChange: number;
  fiftyDayAverageChangePercent: number;
  twoHundredDayAverage: number;
  twoHundredDayAverageChange: number;
  twoHundredDayAverageChangePercent: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
  regularMarketPrice: number;
  bid: number;
  exchange: string;
  shortName: string;
  market: "us_market";
  marketState: string;
  messageBoardId: string;
  exchangeTimezoneName: "America/New_York";
  exchangeTimezoneShortName: string;
  gmtOffSetMilliseconds: number;
  esgPopulated: boolean;
  symbol: string;
}

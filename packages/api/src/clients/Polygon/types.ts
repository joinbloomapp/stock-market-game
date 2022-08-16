/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface AggBar {
  c: number;
  h: number;
  l: number;
  n: number;
  o: number;
  t: number;
  v: number;
  vw: number;
}

export interface DailyPrice {
  afterHours: number;
  close: number;
  from: string;
  high: number;
  low: number;
  open: number;
  preMarket: number;
  status: string;
  symbol: string;
  volume: number;
}

export interface PrevMarketDayPrice {
  T: string;
  c: number;
  h: number;
  l: number;
  o: number;
  t: number;
  v: number;
  vw: number;
}

type Status = "open" | "extended-hours" | "closed";

export interface MarketStatus {
  afterHours: boolean;
  currencies: {
    crypto: Status;
    fx: Status;
  };
  earlyHours: boolean;
  exchanges: {
    nasdaq: Status;
    nyse: Status;
    otc: Status;
  };
  market: Status;
  serverTime: string;
}

export interface PolygonGainerLoser {
  day: {
    c: number;
    h: number;
    l: number;
    o: number;
    v: number;
    vw: number;
  };
  lastQuote: {
    P: number;
    S: number;
    p: number;
    s: number;
    t: number;
  };
  lastTrade: {
    c: number[];
    i: string;
    p: number;
    s: number;
    t: number;
    x: number;
  };
  min: {
    av: number;
    c: number;
    h: number;
    l: number;
    o: number;
    v: number;
    vw: number;
  };
  prevDay: {
    c: number;
    h: number;
    l: number;
    o: number;
    v: number;
    vw: number;
  };
  ticker: string;
  todaysChange: number;
  todaysChangePerc: number;
  updated: number;
}

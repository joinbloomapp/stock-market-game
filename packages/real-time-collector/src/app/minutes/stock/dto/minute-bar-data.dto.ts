/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface MinuteBarData {
  // https://polygon.io/docs/stocks/ws_stocks_am

  ev: "AM";
  // The ticker symbol for the given stock.
  sym: string;
  // The tick volume.
  v: number;
  // Today's accumulated volume.
  av: number;
  // Today's official opening price.
  // Potentially unknown due to 15 minute delay due to our subscription
  op?: number;
  // The tick's volume weighted average price.
  vw: number;
  // The opening tick price for this aggregate window.
  o: number;
  // The closing tick price for this aggregate window.
  c: number;
  // The highest tick price for this aggregate window.
  h: number;
  // The lowest tick price for this aggregate window.
  l: number;
  // Today's volume weighted average price.
  a: number;
  // The average trade size for this aggregate window.
  z: number;
  // The timestamp of the starting tick for this aggregate window in Unix Milliseconds.
  s: number;
  // The timestamp of the ending tick for this aggregate window in Unix Milliseconds.
  e: number;
  // Whether this aggregate is for an OTC ticker. This field will be left off if false.
  otc?: boolean;
}

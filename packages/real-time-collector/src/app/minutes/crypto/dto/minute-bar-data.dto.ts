/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface MinuteBarData {
  // https://polygon.io/docs/crypto/ws_crypto_xa
  ev: "XA";
  // The crypto pair.
  pair: string;
  // The open price for this aggregate window.
  o: number;
  // The close price for this aggregate window.
  c: number;
  // The high price for this aggregate window.
  h: number;
  // The low price for this aggregate window.
  l: number;
  // The volume of trades for this aggregate window.
  v: number;
  // The timestamp of the starting tick for this aggregate window in Unix Milliseconds.
  s: number;
  // The timestamp of the ending tick for this aggregate window in Unix Milliseconds.
  e: number;
  // The volume weighted average price for this aggregate window.
  vw: number;
  // The average trade size for this aggregate window.
  z: number;
}

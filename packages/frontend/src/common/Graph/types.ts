/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum PeriodType {
  _1D = '1D',
  _1W = '1W',
  _1M = '1M',
  _3M = '3M',
  _1A = '1A',
  ALL = '5Y',
}

export interface Period {
  value: PeriodType;
  displayVal: string;
  dayjsTimestampFormat: string;
  tooltipOffset: number;
}

export interface Point {
  x: number;
  y: number;
}

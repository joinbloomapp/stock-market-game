/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MinuteBarData } from "../../../app/minutes/stock/dto/minute-bar-data.dto";

export function stockMinuteBarFactory(
  data?: Partial<MinuteBarData>
): MinuteBarData {
  if (!data) {
    data = {};
  }
  return {
    ev: "AM",
    sym: "AAPL",
    v: Math.random() * 100,
    av: Math.random() * 100,
    vw: Math.random() * 100,
    o: Math.random() * 100,
    c: Math.random() * 100,
    h: Math.random() * 100,
    l: Math.random() * 100,
    a: Math.random() * 100,
    z: Math.random() * 100,
    s: Math.random() * 100,
    e: Math.random() * 100,
    ...data,
  };
}

export { stockMinuteBarFactory as default };

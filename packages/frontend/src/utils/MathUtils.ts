/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

namespace MathUtils {
  /**
   * Rounds a number to whatever number of places you pass in
   *
   * @param value number to round
   * @param places number of places to round to
   * @returns
   */
  export function round(value: number, places: number): number {
    return +(Math.round(Number(String(value) + `e+${places}`)) + `e-${places}`);
  }

  /**
   * Calculates in percent, the change between 2 numbers.
   * e.g from 1000 to 500 = 50%
   *
   * @param oldVal The initial value
   * @param newVal The value that changed
   */
  export function percentChange(oldVal: number, newVal: number): number {
    return ((newVal - oldVal) / oldVal) * 100;
  }
}

export default MathUtils;

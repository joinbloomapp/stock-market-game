/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

namespace ArrayUtils {
  /**
   * Returns an empty array if the given array is falsey
   *
   * @param arr array to check
   * @returns array
   */
  export function orEmptyArray(arr: any[] | undefined): any[] {
    return arr || [];
  }

  /**
   * Sums up all numbers in an array
   *
   * @param arr an array of numbers
   * @returns sum of all numbers in the array
   */
  export function sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
  }
}

export default ArrayUtils;

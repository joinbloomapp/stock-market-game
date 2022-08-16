/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import * as holidays from "./holidays.json";

export default class Holidays {
  public static holidays: Set<string> = new Set(holidays.data);

  /**
   *
   * @param date date formatted as "YYYY-MM-DD"
   */
  public static isHoliday(date: string): boolean {
    return this.holidays.has(date);
  }
}

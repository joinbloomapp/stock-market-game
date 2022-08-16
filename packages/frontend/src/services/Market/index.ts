/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import client from '..';

namespace MarketService {
  /**
   * Returns whether market is open
   *
   * @returns true or false
   */
  export async function isMarketOpen(): Promise<boolean> {
    const res = await client.post('/market/open');
    return res?.data;
  }

  /**
   * Fetches last market date
   *
   * @param numDaysAgo number of days ago to start from
   * @returns last market date (ISO String)
   */
  export async function getLastMarketDate(numDaysAgo: number = 0): Promise<string> {
    const res = await client.get('/market/last-market-date', { params: { numDaysAgo } });
    return res?.data;
  }

  /**
   * Returns whether current day is a holiday
   *
   * @returns true or false
   */
  export async function isHoliday(): Promise<boolean> {
    const res = await client.get('/market/holiday');
    return res?.data;
  }
}

export default MarketService;

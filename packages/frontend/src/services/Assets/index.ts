/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import client from '..';
import { PeriodType } from './../../common/Graph/types';
import {
  AssetAggBar,
  AssetBasicInfo,
  AssetCompanyInfo,
  AssetCryptoQuote,
  AssetKeyStats,
  AssetQuote,
  AssetRelated,
} from './types';

namespace AssetsService {
  /**
   * Fetches basic information about a stock from our database
   *
   * @param ticker the stock ticker
   * @returns basic information
   */
  export async function getBasicInfo(ticker: string): Promise<AssetBasicInfo> {
    const res = await client.get(`/assets/${ticker}`);
    return res?.data;
  }

  /**
   * Fetches company information
   *
   * @param ticker
   * @returns company information
   */
  export async function getCompanyInfo(ticker: string): Promise<AssetCompanyInfo> {
    const res = await client.get(`/assets/${ticker}/company-info`);
    return res?.data;
  }

  /**
   * Fetches related assets
   *
   * @param ticker
   * @returns related assets
   */
  export async function getRelatedAssets(ticker: string): Promise<AssetRelated[]> {
    const res = await client.get(`/assets/${ticker}/related`);
    return res?.data;
  }

  /**
   * Fetches key stats about the stock
   *
   * @param ticker
   * @returns key stats
   */
  export async function getKeyStats(ticker: string): Promise<AssetKeyStats> {
    const res = await client.get(`/assets/${ticker}/key-stats`);
    return res?.data;
  }

  /**
   * Fetches latest quote from IEX
   *
   * @param ticker
   * @returns latest quote
   */
  export async function getQuote(ticker: string): Promise<AssetQuote | AssetCryptoQuote> {
    const res = await client.get(`/assets/${ticker}/quote`);
    return res?.data;
  }

  /**
   * Fetches the aggregate bars for the current day (has 15 min delay)
   *
   * @param ticker ticker symbol for stock
   * @returns aggregate bars
   */
  export async function getIntradayBars(ticker: string): Promise<AssetAggBar[]> {
    const res = await client.get(`/assets/${ticker}/intraday-bars`);
    return res?.data;
  }

  /**
   * Fetches the aggregate bars based on given stock ticker and the specified date
   *
   * @param ticker ticker symbol for stock
   * @param date Date to get the data for (ISO String)
   * @returns aggregate bars
   */
  export async function getHistoricalBarsByDate(
    ticker: string,
    date: string
  ): Promise<AssetAggBar[]> {
    const res = await client.get(`/assets/${ticker}/historical-bars-by-date`, { params: { date } });
    return res?.data;
  }

  /**
   * Fetches the aggregate bars based on given stock ticker and time period
   *
   * @param ticker ticker symbol for stock
   * @param period PeriodType enum to get data for
   * @returns aggregate bars
   */
  export async function getHistoricalBarsByPeriod(
    ticker: string,
    period: PeriodType
  ): Promise<AssetAggBar[]> {
    const res = await client.get(`/assets/${ticker}/historical-bars-by-range`, {
      params: { range: period },
    });
    return res?.data;
  }
}

export default AssetsService;

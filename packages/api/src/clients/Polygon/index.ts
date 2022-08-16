/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import axios from "axios";
import {
  AggBar,
  DailyPrice,
  MarketStatus,
  PolygonGainerLoser,
  PrevMarketDayPrice,
} from "./types";

namespace Polygon {
  const polygonClient = axios.create({
    baseURL: "https://api.polygon.io",
    responseType: "json",
    params: {
      apiKey: process.env.POLYGON_API_KEY,
    },
  });

  /**
   * Fetches the aggregate bars based on given stock ticker and time range
   *
   * @param ticker ticker symbol for stock
   * @param timeframe timeframe
   * @param start unix start time
   * @param end unix end time
   * @param limit {number} Max number of data points returned (5000 by default according to Polygon docs)
   * @returns aggregate bars
   */
  export async function getHistoricalBarsByRange(
    ticker: string,
    timeframe: string,
    start: number,
    end: number,
    limit = 5000
  ): Promise<AggBar[]> {
    const baseURL = `/v2/aggs/ticker/${ticker}/range/${timeframe}/${start}/${end}`;
    const res = await polygonClient.get(baseURL, {
      params: {
        limit,
      },
    });
    return res?.data?.results as AggBar[];
  }

  /**
   * Fetches open price, close price, etc. of the specified date
   *
   * @param ticker ticker symbol for stock
   * @param date Date string formatted as YYYY-MM-DD
   * @returns prices for the day
   */
  export async function getPricesByDate(
    ticker: string,
    date: string
  ): Promise<DailyPrice> {
    const baseURL = `/v1/open-close/${ticker}/${date}?adjusted=true`;
    const res = await polygonClient.get(baseURL);
    return res?.data;
  }

  /**
   * Fetches open price, close price, etc. of the previous market day
   *
   * @param ticker ticker symbol for stock
   * @returns previous market day prices
   */
  export async function getPreviousMarketDayPrices(
    ticker: string
  ): Promise<PrevMarketDayPrice> {
    const baseURL = `/v2/aggs/ticker/${ticker}/prev?adjusted=true`;
    const res = await polygonClient.get(baseURL);
    // eslint-disable-next-line no-unsafe-optional-chaining
    const [data] = res?.data?.results;
    return data;
  }

  /**
   * Fetches the overall market status (open, close, after hours, early hours, etc.)
   *
   * @returns market status
   */
  export async function getMarketStatus(): Promise<MarketStatus> {
    const baseURL = "/v1/marketstatus/now";
    const res = await polygonClient.get(baseURL);
    return res?.data;
  }

  /**
   * Fetches up to top 20 gainers
   *
   * @returns up to top 20 gainers
   */
  export async function getGainers(): Promise<PolygonGainerLoser[]> {
    const baseURL = "/v2/snapshot/locale/us/markets/stocks/gainers";
    const res = await polygonClient.get(baseURL);
    return res?.data?.tickers;
  }

  /**
   * Fetches up to top 20 losers
   *
   * @returns up to top 20 losers
   */
  export async function getLosers(): Promise<PolygonGainerLoser[]> {
    const baseURL = "/v2/snapshot/locale/us/markets/stocks/losers";
    const res = await polygonClient.get(baseURL);
    return res?.data?.tickers;
  }
}

export default Polygon;

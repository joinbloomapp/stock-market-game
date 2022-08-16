/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";
import { chunk, keyBy } from "lodash";
import {
  BatchQuoteResponse,
  CryptoQuote,
  IEXGainerLoser,
  Quote,
} from "./types";

namespace IEX {
  const client = axios.create({
    baseURL: "https://cloud.iexapis.com/v1",
    responseType: "json",
    timeout: 3000,
    params: {
      token: process.env.IEX_API_KEY,
    },
  });

  // @ts-ignore
  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error: AxiosError) =>
      !error.response || error.response.status >= 500,
  });

  client.interceptors.request.use(async (config) => ({ ...config }));

  /**
   * Fetches analyst ratings
   *
   * @param ticker
   * @param limit {number}
   * @returns analyst ratings
   */
  export async function getAnalystRatings(ticker: string, limit = 3) {
    const res = await client.get(`/stock/${ticker}/recommendation-trends`);
    const { data } = res;
    return data;
  }

  /**
   * Fetches related peer stocks
   *
   * @param ticker
   * @returns related stocks
   */
  export async function getRelatedStocks(ticker: string): Promise<string[]> {
    const res = await client.get(`/stock/${ticker}/peers`);
    const { data } = res;
    return data;
  }

  /**
   * Fetches company information
   *
   * @param ticker
   * @returns company information
   */
  export async function getCompanyInfo(ticker: string) {
    const res = await client.get(`/stock/${ticker}/company`);
    const { data } = res;
    return data;
  }

  /**
   * Fetches key stats about the stock
   *
   * @param ticker
   * @returns key stats
   */
  export async function getKeyStats(ticker: string) {
    const res = await client.get(`/stock/${ticker}/advanced-stats`);
    const { data } = res;
    return data;
  }

  /**
   * Fetches latest quote
   *
   * @param ticker
   * @param isCrypto {boolean}
   * @returns latest quote
   */
  export async function getQuote(
    ticker: string,
    isCrypto = false
  ): Promise<CryptoQuote | Quote> {
    let res;

    if (!isCrypto) {
      res = await client.get(`/stock/${ticker}/quote`);
    } else {
      res = await client.get(`/crypto/${ticker}USDT/quote`);
    }
    const { data } = res;
    return isCrypto ? (data as CryptoQuote) : (data as Quote);
  }

  /**
   * Fetches multiple latest quotes
   *
   * @param tickers
   * @param isCrypto {boolean}
   * @returns multiple latest quotes
   */
  export async function getBatchQuote(
    tickers: string[],
    isCrypto = false
  ): Promise<BatchQuoteResponse> {
    if (!tickers?.length) {
      return {};
    }
    try {
      if (!isCrypto) {
        // Chunks into sets of 99 items and gets batch quote for every 99 stocks (otherwise it overwhelms the endpoint)
        const chunks = chunk(tickers, 99);
        const promises = chunks.map((tickerChunks) =>
          client.get(
            `/stock/market/batch?symbols=${tickerChunks.join(",")}&types=quote`
          )
        );
        const res = await Promise.all(promises);
        const allData: BatchQuoteResponse[] = res.map((val) =>
          Object.keys(val?.data || {}).reduce(
            (acc: BatchQuoteResponse, ticker) => {
              if (val?.data) {
                acc[ticker] = val.data[ticker].quote;
              }
              return acc;
            },
            {}
          )
        );
        return Object.assign({}, ...allData) as BatchQuoteResponse;
      }

      // No IEX batch API for crypto at the moment
      const promises = tickers.map((ticker) =>
        client.get(`/crypto/${ticker}USDT/quote`)
      );
      const res = await Promise.all(promises);
      const allData = res.map((q) => q.data as CryptoQuote);
      return keyBy(allData, "symbol") as BatchQuoteResponse;
    } catch (e) {
      console.error(e.response);
      throw e;
    }
  }

  /**
   * Fetches up to top 20 gainers
   *
   * @returns up to top 20 gainers
   */
  export async function getGainers(): Promise<IEXGainerLoser[]> {
    const baseURL = "/stock/market/list/gainers";
    const res = await client.get(baseURL);
    return res?.data;
  }

  /**
   * Fetches up to top 20 losers
   *
   * @returns up to top 20 losers
   */
  export async function getLosers(): Promise<IEXGainerLoser[]> {
    const baseURL = "/stock/market/list/losers";
    const res = await client.get(baseURL);
    return res?.data;
  }
}

export default IEX;

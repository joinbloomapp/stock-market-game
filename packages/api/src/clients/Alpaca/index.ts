/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import axios, { AxiosError } from "axios";
import axiosRetry from "axios-retry";
import { capitalizeAllWords } from "src/utils/strings";
import { CryptoAggBar } from "./types";

/**
 * Get rid of USD at the end of crypto ticker if exists
 *
 * @param ticker {string}
 * @returns
 */
function clean(ticker = ""): string {
  return ticker.endsWith("USD")
    ? ticker.substring(0, ticker.length - 3)
    : ticker;
}

/**
 * Checks if given ticker is a crypto ticker (can be formatted as BTC or BTCUSD)
 *
 * @param ticker {string}
 * @returns
 */
function isCrypto(ticker = ""): boolean {
  const sym = this.clean(ticker);
  return Boolean(this._dataCache[sym]) || Boolean(this.cryptoStocks[sym]);
}

namespace Alpaca {
  const sponsorAuthHeader = `Basic ${Buffer.from(
    `${process.env.SPONSOR_APCA_API_KEY_BROKER}:${process.env.SPONSOR_APCA_API_SECRET_BROKER}`,
    "base64"
  )}`;

  const shouldHitRealAlpacaEnvironment = process.env.NODE_ENV !== "development";

  const marketClient = axios.create({
    baseURL: `https://data.${
      shouldHitRealAlpacaEnvironment ? "" : "sandbox."
    }alpaca.markets`,
    responseType: "json",
    headers: { Authorization: sponsorAuthHeader },
  });

  // @ts-ignore
  axiosRetry(marketClient, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error: AxiosError) =>
      !error.response || error.response.status >= 500,
  });

  /**
   * Fetches news from Alpaca API
   *
   * @param tickers list of stock or crypto tickers
   * @param limit {number} max number of articles
   * @param sort sort by updated date (ASC or DESC)
   */
  export async function getNews(
    tickers: string[],
    limit = 10,
    sort: "ASC" | "DESC" = "DESC"
  ) {
    const baseURL = "/v1beta1/news";

    const allTickers = tickers.map((s) => {
      const _isCrypto = isCrypto(s);
      const sym = clean(s);
      return _isCrypto ? `${sym}USD` : sym;
    });

    const res = await marketClient.get(baseURL, {
      params: {
        tickers: allTickers.join(","),
        limit,
        sort,
      },
    });

    return (res?.data?.news || []).map((n) => ({
      sourceName: capitalizeAllWords(n.source),
      date: n.updated_at,
      imageSource: n.images.length ? n.images[0].url : "",
      imageType: "thumbnail",
      url: n.url,
      snippet: n.summary,
    }));
  }

  /**
   * @todo Need to implement crypto fetching
   * Fetches the aggregate bars based on given stock ticker and time range
   *
   * @param ticker ticker symbol for stock
   * @param timeframe Alpaca timeframe, Values are customizable, frequently used examples: 1Min, 15Min, 1Hour, 1Day, 1Week, and 1Month. Limits: 1Min-59Min, 1Hour-23Hour.
   * @param start Start date RFC-3339 format string
   * @param end End date RFC-3339 format string
   * @param limit Max number of data points returned (1000 by default according to Alpaca docs)
   * @returns aggregate bars
   */
  export async function getCryptoHistoricalBarsByRange(
    ticker: string,
    timeframe: string,
    start: string,
    end: string,
    limit = 1000
  ): Promise<CryptoAggBar[]> {
    const baseURL = `/v1beta1/crypto/${ticker}USD/bars`;

    const res = await marketClient.get(baseURL, {
      params: {
        timeframe,
        start,
        end,
        // @ts-ignore
        exchanges: CryptoStocks.getStockExchange(ticker),
        limit,
      },
    });

    return res?.data?.bars as CryptoAggBar[];
  }

  /**
   * @todo Need to implement crypto fetching
   * Fetches snapshot of crypto
   *
   * @param ticker ticker symbol for stock
   * @returns snapshot of crypto
   */
  export async function getCryptoSnapshot(ticker: string) {
    const baseURL = `/v1beta1/crypto/${ticker}USD/snapshot`;

    const res = await marketClient.get(baseURL, {
      params: {
        // @ts-ignore
        exchange: CryptoStocks.getStockExchange(ticker),
      },
    });

    return res?.data;
  }
}

export default Alpaca;

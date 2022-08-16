/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import axios from "axios";
import { YHMarketSummary, YHQuote } from "./types";

namespace YHFinance {
  const client = axios.create({
    baseURL: "https://yfapi.net",
    responseType: "json",
    headers: {
      "X-API-KEY": process.env.YH_FINANCE_API_KEY,
    },
  });

  /**
   * Fetches live market summary information at the request time
   */
  export async function getMarketSummary(): Promise<YHMarketSummary[]> {
    const res = await client.get("/v6/finance/quote/marketSummary", {
      params: {
        lang: "en",
        region: "US",
      },
    });

    return res?.data?.marketSummaryResponse?.result as YHMarketSummary[];
  }

  /**
   * Fetches multiple quote for stocks, ETFs, mutuals funds, etc…
   *
   * @param tickers List of stock/etf ticker symbols
   */
  export async function getBatchQuote(tickers: string[]): Promise<YHQuote[]> {
    const res = await client.get("/v6/finance/quote", {
      params: {
        lang: "en",
        region: "US",
        symbols: tickers.join(","),
      },
    });

    return res?.data?.quoteResponse?.result as YHQuote[];
  }
}

export default YHFinance;

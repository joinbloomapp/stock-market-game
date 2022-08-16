/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import axios from "axios";
import { StockNewsRecord } from "./types";

export interface NewsContent {
  sourceName: string;
  date: number; // unix time,
  imageSource?: string;
  url?: string;
  snippet: string;
  snippetLineLimit?: number; // line limit
  tickers?: string[];
}

namespace StockNews {
  const client = axios.create({
    baseURL: "https://stocknewsapi.com/api",
    responseType: "json",
    params: {
      token: process.env.STOCK_NEWS_API_KEY,
    },
  });

  /**
   * Fetches news from Stock News API
   *
   * @param tickers list of stock tickers
   * @param limit limit number of articles (defaults to 50)
   * @returns
   */
  export async function getNews(
    tickers: string[],
    limit = 50
  ): Promise<NewsContent[]> {
    const res = await client.get("/v1", {
      params: {
        tickers: tickers.join(","),
        items: limit,
      },
    });

    return (res?.data?.data || []).map((n: StockNewsRecord) => ({
      sourceName: n.source_name,
      snippet: n.title,
      imageSource: n.image_url,
      date: n.date,
      url: n.news_url,
      tickers: n.tickers,
    }));
  }

  /**
   * Fetches the latest general stock news about the market
   *
   * @param limit defaults to 50
   * @returns latest general stock news about the market
   */
  export async function getLatestGeneralNews(
    limit = 50
  ): Promise<NewsContent[]> {
    const res = await client.get("/v1/category", {
      params: {
        items: limit,
        section: "general",
      },
    });

    return (res?.data?.data || []).map((n: StockNewsRecord) => ({
      sourceName: n.source_name,
      snippet: n.title,
      imageSource: n.image_url,
      date: n.date,
      url: n.news_url,
    }));
  }
}

export default StockNews;

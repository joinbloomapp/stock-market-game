/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { StockPriceEntity } from "@bloom-smg/postgresql";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import Alpaca from "../../clients/Alpaca";
import StockNews, { NewsContent } from "../../clients/StockNews";
import { NewsContentDto, TickerPrice } from "./dto/news-content.dto";

export const TRUSTED_SOURCES = [
  "cnbc",
  "forbes",
  "fox business",
  "business insider",
  "bloomberg",
  "financial times",
  "wall street journal",
  "new york times",
  "cnn money",
  "yahoo finance",
  "zacks investment research",
  "benzinga",
];

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(StockPriceEntity)
    private readonly stockPriceRepository: Repository<StockPriceEntity>
  ) {}

  /**
   * Fetches trusted news for this stock or crypto
   *
   * @param tickers list of stock/crypto tickers
   * @param isCrypto
   * @param limit defaults to 50
   * @param sort
   * @returns latest news for given stock/crypto
   */
  async getNews(
    tickers: string[],
    isCrypto = false,
    limit = 50,
    sort: "ASC" | "DESC" = "DESC"
  ): Promise<NewsContentDto[]> {
    let data;

    if (!isCrypto) {
      data = await StockNews.getNews(tickers);
    } else {
      data = await Alpaca.getNews(tickers);
    }

    const filtered: NewsContent[] = data
      .filter((d) => TRUSTED_SOURCES.includes(d.sourceName?.toLowerCase()))
      .slice(0, limit);
    const stockTickersToSearch = new Set();
    filtered.forEach((x) => {
      const tickers = x.tickers.map((s) => s.toUpperCase());
      tickers.forEach((s) => stockTickersToSearch.add(s));
    });
    const stockPrices = await this.stockPriceRepository.find({
      where: {
        ticker: In(Array.from(stockTickersToSearch)),
      },
      select: ["ticker", "oldPrice", "price", "percentChange"],
    });
    const stockPricesMap = stockPrices.length
      ? stockPrices.reduce((acc, x) => {
          acc[x.ticker] = x;
          return acc;
        })
      : {};
    return filtered.map((x) => {
      const tickers = x.tickers.map((s) => s.toUpperCase());
      const tickersMapping: TickerPrice[] = [];
      for (const x of tickers) {
        const stockPrice = stockPricesMap[x];
        if (tickersMapping.length === 3) {
          break;
        }
        if (stockPrice) {
          tickersMapping.push({
            ticker: x,
            latestPrice: stockPrice.price,
            change: stockPrice.price - stockPrice.oldPrice,
            changePercent: stockPrice.percentChange,
          });
        }
      }
      return {
        ...x,
        tickers: tickersMapping,
      };
    });
  }

  /**
   * Fetches the latest general news about the stock market
   *
   * @param limit
   * @returns latest news
   */
  async getLatestGeneralNews(limit = 10): Promise<NewsContent[]> {
    const data = await StockNews.getLatestGeneralNews();
    const filtered = data.filter((d) =>
      TRUSTED_SOURCES.includes(d.sourceName?.toLowerCase())
    );
    return filtered.slice(0, limit);
  }
}

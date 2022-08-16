/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { StockEntity, StockPriceEntity } from "@bloom-smg/postgresql";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import * as moment from "moment";
import { Moment } from "moment";
import { In, Repository } from "typeorm";
import Alpaca from "../../clients/Alpaca";
import { CryptoAggBar } from "../../clients/Alpaca/types";
import IEX from "../../clients/IEX";
import {
  BatchQuoteResponse,
  CryptoQuote,
  IEXGainerLoser,
  Quote,
} from "../../clients/IEX/types";
import Polygon from "../../clients/Polygon";
import {
  AggBar,
  DailyPrice,
  PolygonGainerLoser,
  PrevMarketDayPrice,
} from "../../clients/Polygon/types";
import YHFinance from "../../clients/YHFinance";
import { YHQuote } from "../../clients/YHFinance/types";
import { AssetBasicInfoDto } from "./dto/asset-basic-info.dto";
import { AssetKeyStatsDto } from "./dto/asset-key-stats.dto";
import { CryptoStock } from "./dto/Assets";
import { RelatedAssetDto } from "./dto/related-asset.dto";
import { PeriodRange, PeriodsService } from "./models/Periods";

export interface StockWithLatestQuote extends StockEntity {
  latestQuote: Quote;
}

export interface CryptoWithLatestQuote extends CryptoStock {
  latestQuote: CryptoQuote;
}

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly periodsService: PeriodsService,
    @InjectRepository(StockEntity)
    private readonly stockRepository: Repository<StockEntity>,
    @InjectRepository(StockPriceEntity)
    private readonly stockPriceRepository: Repository<StockPriceEntity>
  ) {}

  /**
   * Fetches basic information about a stock from our database
   *
   * @param ticker the stock ticker
   * @returns basic information
   */
  async getBasicInfo(ticker: string): Promise<AssetBasicInfoDto> {
    const stock = await this.stockRepository.findOne({
      where: { ticker },
    });

    if (!stock) {
      throw new BadRequestException("Stock not found");
    }

    return {
      address: stock.extra_data?.address,
      city: stock.extra_data?.city,
      country: stock.extra_data?.country,
      employees: stock.extra_data?.employees,
      image: stock.image,
      industry: stock.extra_data?.industry,
      isEtf: stock.isEtf,
      name: stock.name,
      shortable: stock.shortable,
      state: stock.extra_data?.state,
      ticker: stock.ticker,
      description: stock.description,
    };
  }

  /**
   * Get top ETF holdings of given stock from Yahoo Finance
   *
   * @param ticker stock ticker
   * @returns top etf holdings
   */
  async getEtfHoldings(ticker: string): Promise<any[]> {
    try {
      const { data } = await axios.get(
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=assetProfile,defaultKeyStatistics,financialData,recommendationTrend,upgradeDowngradeHistory,majorHoldersBreakdown,insiderHolders,netSharePurchaseActivity,earnings,earningsHistory,earningsTrend,industryTrend,indexTrend,sectorTrend`
      );
      return data.quoteSummary.result[0]?.topHoldings?.holdings || [];
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException("Failed to get ETF holding");
    }
  }

  /**
   * Fetches analyst ratings
   *
   * @param ticker
   * @param limit {number}
   * @returns analyst ratings
   */
  async getAnalystRatings(ticker: string, limit = 3) {
    // TODO Apparently enterprise token is required
    // return IEX.getAnalystRatings(ticker, limit);
    return [];
  }

  /**
   * Fetches related stocks
   *
   * @param ticker
   * @returns related stocks
   */
  async getRelatedStocks(ticker: string): Promise<RelatedAssetDto[]> {
    const relatedStocks: string[] = await IEX.getRelatedStocks(ticker);
    const stocks = await this.stockRepository.find({
      where: { ticker: In(relatedStocks) },
      select: ["id", "ticker", "name", "image"],
    });

    if (!stocks.length) {
      throw new BadRequestException("Stock not found");
    }
    const prices = await this.stockPriceRepository.find({
      where: { stockId: In(stocks.map((x) => x.id)) },
      select: ["stockId", "price", "oldPrice", "percentChange"],
    });
    const priceStockMapping = {};
    prices.forEach((x) => {
      priceStockMapping[x.stockId] = x;
    });
    return stocks.map((stock) => {
      const price = priceStockMapping[stock.id];
      return {
        ticker: stock.ticker,
        name: stock.name,
        image: stock.image,
        latestPrice: price?.price,
        change: price?.price ?? 0 - price?.oldPrice ?? 0,
        changePercent: price?.percentChange,
      };
    });
  }

  /**
   * Fetches company information
   *
   * @param ticker
   * @returns company information
   */
  async getCompanyInfo(ticker: string) {
    return await IEX.getCompanyInfo(ticker);
  }

  /**
   * Fetches key stats about the stock
   *
   * @param ticker
   * @returns key stats and latest volume
   */
  async getKeyStats(ticker: string): Promise<AssetKeyStatsDto> {
    const [keyStats, latestQuote] = await Promise.all([
      IEX.getKeyStats(ticker),
      IEX.getQuote(ticker) as Promise<Quote>,
    ]);
    return {
      ...keyStats,
      latestVolume: latestQuote?.latestVolume,
      avgTotalVolume: latestQuote?.avgTotalVolume,
    };
  }

  /**
   * Fetches latest quote from IEX
   *
   * @param ticker
   * @param isCrypto
   * @returns latest quote
   */
  async getQuote(
    ticker: string,
    isCrypto = false
  ): Promise<CryptoQuote | Quote> {
    return IEX.getQuote(ticker, isCrypto);
  }

  /**
   * Fetches multiple latest quotes from IEX
   *
   * @param tickers
   * @param isCrypto
   * @returns multiple latest quotes
   */
  async getBatchQuote(
    tickers: string[],
    isCrypto = false
  ): Promise<BatchQuoteResponse> {
    return IEX.getBatchQuote(tickers, isCrypto);
  }

  /**
   * Fetches multiple latest quotes from Yahoo Finance
   *
   * @param tickers
   * @returns multiple latest quotes from Yahoo Finances
   */
  async getYHFBatchQuote(tickers: string[]): Promise<YHQuote[]> {
    return YHFinance.getBatchQuote(tickers);
  }

  /**
   * Fetches the aggregate bars based on given stock ticker and time range
   *
   * @param ticker ticker symbol for stock
   * @param range PeriodRange enum to get data for
   * @param isCrypto
   * @param limit
   * @returns aggregate bars
   */
  async getHistoricalBarsByRange(
    ticker: string,
    range: PeriodRange,
    isCrypto = false,
    limit?: number
  ): Promise<AggBar[] | CryptoAggBar[]> {
    let start: Moment;
    let timeframe: string;
    const period = this.periodsService.get(range);
    const now = moment().utc();

    if (range === PeriodRange._5Y) {
      start = moment(now).subtract(5, "years");
      timeframe = isCrypto ? "1Week" : "1/week";
    } else {
      start = period.startTime(isCrypto);
      timeframe = isCrypto
        ? period.alpacaTimeframe(isCrypto)
        : period.polygonTimespan(isCrypto);
    }

    // Accounts for the 15 minute delay in the data
    const end = moment(now).subtract(15, "minutes");

    let data;

    if (!isCrypto) {
      data = await Polygon.getHistoricalBarsByRange(
        ticker,
        timeframe,
        start.valueOf(),
        end.valueOf(),
        limit
      );
    } else {
      data = await Alpaca.getCryptoHistoricalBarsByRange(
        ticker,
        timeframe,
        start.format(),
        end.format(),
        limit
      );
    }
    return data;
  }

  /**
   * Fetches the aggregate bars based on given stock ticker and the specified date
   *
   * @param ticker ticker symbol for stock
   * @param date Date to get the data for
   * @param isCrypto
   * @returns aggregate bars
   */
  async getHistoricalBarsByDate(
    ticker: string,
    date: Moment,
    isCrypto = false
  ): Promise<AggBar[] | CryptoAggBar[]> {
    const period = this.periodsService.get(PeriodRange._1D);
    const now = moment().subtract(15, "minutes");

    if (!isCrypto) {
      // UTC 1:30 PM or 9:30 AM NY time = market open
      let start = moment.utc(date).set({
        hour: 13,
        minute: 30,
        second: 0,
        millisecond: 0,
      });
      if (now < start) {
        // If it's before market open, make sure to start from day before
        start = start.subtract(1, "days");
      }
      const end = moment(start).add(10, "hours").add(30, "minutes");
      return Polygon.getHistoricalBarsByRange(
        ticker,
        period.polygonTimespan(isCrypto),
        start.valueOf(),
        end.valueOf()
      );
    }

    let start = moment.utc(date).set({
      hour: 7,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    if (now < start) {
      // If utc end time goes past midnight, make sure to start from day before
      start = start.subtract(1, "days");
    }
    const end = moment(start).add(24, "hours");

    return Alpaca.getCryptoHistoricalBarsByRange(
      ticker,
      period.alpacaTimeframe(isCrypto),
      start.format(),
      end.format()
    );
  }

  /**
   * Fetches the aggregate bars for the current day (has 15 min delay)
   *
   * @param ticker ticker symbol for stock
   * @param isCrypto
   * @returns aggregate bars
   */
  async getIntradayBars(
    ticker: string,
    isCrypto = false
  ): Promise<AggBar[] | CryptoAggBar[]> {
    const period = this.periodsService.get(PeriodRange._1D);
    const start = period.startTime(isCrypto);

    if (!isCrypto) {
      return Polygon.getHistoricalBarsByRange(
        ticker,
        period.polygonTimespan(isCrypto),
        start.valueOf(),
        moment().utc().subtract(15, "minutes").valueOf()
      );
    }

    return Alpaca.getCryptoHistoricalBarsByRange(
      ticker,
      period.alpacaTimeframe(isCrypto),
      start.format(),
      moment().utc().subtract(15, "minutes").format()
    );
  }

  /**
   * Fetches open price, close price, etc. of the specified date
   *
   * @param ticker ticker symbol for stock
   * @param date Date to get the data for
   * @returns prices for the day
   */
  async getPricesByDate(ticker: string, date: Moment): Promise<DailyPrice> {
    return Polygon.getPricesByDate(ticker, date.format("YYYY-MM-DD"));
  }

  /**
   * Fetches open price, close price, etc. of the previous market day
   *
   * @param ticker ticker symbol for stock
   * @returns previous market day prices
   */
  async getPreviousMarketDayPrices(
    ticker: string
  ): Promise<PrevMarketDayPrice> {
    return Polygon.getPreviousMarketDayPrices(ticker);
  }

  /**
   * @private
   * Finds tickers that are in the stock table
   */
  async filterExistingTickers(
    data: any[],
    dataTickerKey: "symbol" | "ticker",
    limit: number
  ): Promise<IEXGainerLoser[] | PolygonGainerLoser[]> {
    const allTickers = (data || []).map((t) => t[dataTickerKey]);
    if (!allTickers.length) return [];

    const foundTickers: string[] = (
      await this.stockRepository.find({
        where: { ticker: In(allTickers) },
        select: ["ticker"],
      })
    ).map((t) => t.ticker);
    return (data || [])
      .filter((t) => foundTickers.includes(t[dataTickerKey]))
      .slice(0, limit);
  }

  /**
   * Fetches up to top 20 gainers, including crypto if requested
   *
   * @param source
   * @param limit max number to return
   * @returns up to top 20 gainers
   */
  async getGainers(
    source: "iex" | "polygon",
    limit = 20
  ): Promise<IEXGainerLoser[] | PolygonGainerLoser[]> {
    const isIex = source === "iex";
    return await this.filterExistingTickers(
      await (isIex ? IEX : Polygon).getGainers(),
      isIex ? "symbol" : "ticker",
      limit
    );
  }

  /**
   * Fetches up to top 20 losers, including crypto if requested
   *
   * @param source
   * @param limit max number to return
   * @returns up to top 20 losers
   */
  async getLosers(
    source: "iex" | "polygon",
    limit = 20
  ): Promise<IEXGainerLoser[] | PolygonGainerLoser[]> {
    const isIex = source === "iex";
    return await this.filterExistingTickers(
      await (isIex ? IEX : Polygon).getLosers(),
      isIex ? "symbol" : "ticker",
      limit
    );
  }

  /**
   * Fetches market data of stocks and crypto with their latest quotes attached to them (primarily used for StockListItem/PortfolioStockListItem components)
   *
   * @param stockTickers array of stock tickers
   * @param cryptoTickers array of crypto tickers
   * @param reverseOrder if set to true will append crypto data before stock data
   * @returns all the requested assets with all their information and latest quote attached
   */
  async getMarketDataWithLatestQuotes(
    stockTickers: string[] = [],
    cryptoTickers: string[] = [],
    reverseOrder = false
  ): Promise<(StockWithLatestQuote | CryptoWithLatestQuote)[]> {
    let stocksWithLatestQuotes = [];
    // eslint-disable-next-line prefer-const
    let cryptoWithLatestQuotes = [];

    if (stockTickers.length > 0) {
      const stocks = await this.stockRepository.find({
        where: { ticker: In(stockTickers) },
      });
      const stockQuotes = await this.getBatchQuote(stockTickers);
      stocksWithLatestQuotes = stocks.map((s) => ({
        ...s,
        latestQuote: stockQuotes[s.ticker] as Quote,
      }));
    }

    // TODO Implement crypto
    // if (cryptoTickers.length > 0) {
    //   const crypto = cryptoTickers.map((ticker) =>
    //     CryptoStocks._useDataCache(ticker)
    //   );
    //   const cryptoQuotes = await this.getBatchQuote(cryptoTickers, true);
    //   cryptoWithLatestQuotes = crypto.map((s) => ({
    //     ...s,
    //     latestQuote: cryptoQuotes[`${s.symbol}USDT`] as CryptoQuote,
    //   }));
    // }

    if (reverseOrder) {
      return [...cryptoWithLatestQuotes, ...stocksWithLatestQuotes];
    }

    return [...stocksWithLatestQuotes, ...cryptoWithLatestQuotes];
  }
}

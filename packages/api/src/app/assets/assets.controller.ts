/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CryptoAggBar } from "../../clients/Alpaca/types";
import {
  BatchQuoteResponse,
  CryptoQuote,
  IEXGainerLoser,
  Quote,
} from "../../clients/IEX/types";
import {
  AggBar,
  DailyPrice,
  PolygonGainerLoser,
  PrevMarketDayPrice,
} from "../../clients/Polygon/types";
import { YHQuote } from "../../clients/YHFinance/types";
import {
  AssetsService,
  CryptoWithLatestQuote,
  StockWithLatestQuote,
} from "./assets.service";
import { AssetBasicInfoDto } from "./dto/asset-basic-info.dto";
import { GainerLoserDto } from "./dto/gainer-loser.dto";
import { LimitDto } from "./dto/get-analyst-ratings.dto";
import { GetPriceByDateDto } from "./dto/get-price-by-date.dto";
import { GetBatchQuoteDto, GetQuoteDto, TickersDto } from "./dto/get-quote.dto";
import {
  HistoricalBarsDateDto,
  HistoricalBarsRangeDto,
} from "./dto/historical-bars.dto";
import { MarketDataWithLatestQuotesDto } from "./dto/market-data-with-latest-quotes.dto";
import { RelatedAssetDto } from "./dto/related-asset.dto";

@ApiTags("Assets")
@Controller()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @ApiOperation({
    description: "Get info about a stock",
  })
  @Get(":ticker")
  getBasicInfo(@Param("ticker") ticker: string): Promise<AssetBasicInfoDto> {
    return this.assetsService.getBasicInfo(ticker);
  }

  @ApiOperation({
    summary: "Get top ETF holdings of given stock",
  })
  @Get(":ticker/etf-holdings")
  getEtfHoldings(@Param("ticker") ticker: string): Promise<any[]> {
    return this.assetsService.getEtfHoldings(ticker);
  }

  @ApiOperation({
    summary: "Fetches analyst ratings",
  })
  @Get(":ticker/analyst-ratings")
  getAnalystRatings(
    @Param("ticker") ticker: string,
    @Query() query: LimitDto
  ): Promise<any> {
    return this.assetsService.getAnalystRatings(ticker, query.limit);
  }

  @ApiOperation({ summary: "Fetches related stocks" })
  @Get(":ticker/related")
  getRelatedStocks(
    @Param("ticker") ticker: string
  ): Promise<RelatedAssetDto[]> {
    return this.assetsService.getRelatedStocks(ticker);
  }

  @ApiOperation({ summary: "Fetches company information" })
  @Get(":ticker/company-info")
  getCompanyInfo(@Param("ticker") ticker: string): Promise<any> {
    return this.assetsService.getCompanyInfo(ticker);
  }

  @ApiOperation({ summary: "Fetches key stats about the stock" })
  @Get(":ticker/key-stats")
  getKeyStats(@Param("ticker") ticker: string): Promise<any> {
    return this.assetsService.getKeyStats(ticker);
  }

  @ApiOperation({ summary: "Fetches latest quote from IEX" })
  @Get(":ticker/quote")
  getQuote(
    @Param("ticker") ticker: string,
    @Query() query: GetQuoteDto
  ): Promise<CryptoQuote | Quote> {
    return this.assetsService.getQuote(ticker, query.isCrypto);
  }

  @ApiOperation({ summary: "Fetches multiple latest quotes from IEX" })
  @Get("quote/batch")
  getBatchQuote(@Query() query: GetBatchQuoteDto): Promise<BatchQuoteResponse> {
    return this.assetsService.getBatchQuote(query.tickers, query.isCrypto);
  }

  @ApiOperation({
    summary: "Fetches multiple latest quotes from Yahoo Finance",
  })
  @Get("yhf-quote/batch")
  getYHFBatchQuote(@Query() query: TickersDto): Promise<YHQuote[]> {
    return this.assetsService.getYHFBatchQuote(query.tickers);
  }

  @ApiOperation({
    summary:
      "Fetches the aggregate bars based on given stock ticker and time range",
  })
  @Get(":ticker/historical-bars-by-range")
  getHistoricalBarsByRange(
    @Param("ticker") ticker: string,
    @Query() query: HistoricalBarsRangeDto
  ): Promise<AggBar[] | CryptoAggBar[]> {
    return this.assetsService.getHistoricalBarsByRange(
      ticker,
      query.range,
      query.isCrypto,
      query.limit
    );
  }

  @ApiOperation({
    summary:
      "Fetches the aggregate bars based on given stock ticker and the specified date",
  })
  @Get(":ticker/historical-bars-by-date")
  getHistoricalBarsByDate(
    @Param("ticker") ticker: string,
    @Query() query: HistoricalBarsDateDto
  ): Promise<AggBar[] | CryptoAggBar[]> {
    return this.assetsService.getHistoricalBarsByDate(
      ticker,
      query.date,
      query.isCrypto
    );
  }

  @ApiOperation({
    summary:
      "Fetches the aggregate bars for the current day (has 15 min delay)",
  })
  @Get(":ticker/intraday-bars")
  getIntradayBars(
    @Param("ticker") ticker: string,
    @Query() query: GetQuoteDto
  ): Promise<AggBar[] | CryptoAggBar[]> {
    return this.assetsService.getIntradayBars(ticker, query.isCrypto);
  }

  @ApiOperation({
    summary: "Fetches open price, close price, etc. of the specified date",
  })
  @Get(":ticker/prices-by-date")
  getPricesByDate(
    @Param("ticker") ticker: string,
    @Query() query: GetPriceByDateDto
  ): Promise<DailyPrice> {
    return this.assetsService.getPricesByDate(ticker, query.date);
  }

  @ApiOperation({
    summary: "Fetches open price, close price, etc. of the previous market day",
  })
  @Get(":ticker/prev-market-day-prices")
  getPreviousMarketDayPrices(
    @Param("ticker") ticker: string
  ): Promise<PrevMarketDayPrice> {
    return this.assetsService.getPreviousMarketDayPrices(ticker);
  }

  @ApiOperation({
    summary: "Fetches up to top 20 gainers, including crypto if requested",
  })
  @Get("gainers")
  getGainers(
    @Query() query: GainerLoserDto
  ): Promise<IEXGainerLoser[] | PolygonGainerLoser[]> {
    return this.assetsService.getGainers(query.source, query.limit);
  }

  @ApiOperation({
    summary: "Fetches up to top 20 losers, including crypto if requested",
  })
  @Get("losers")
  getLosers(
    @Query() query: GainerLoserDto
  ): Promise<IEXGainerLoser[] | PolygonGainerLoser[]> {
    return this.assetsService.getLosers(query.source, query.limit);
  }

  @ApiOperation({
    summary:
      "Fetches market data of stocks and crypto with their latest quotes attached to them",
  })
  @Get("market-data-with-quotes")
  getMarketDataWithLatestQuotes(
    @Query() query: MarketDataWithLatestQuotesDto
  ): Promise<(StockWithLatestQuote | CryptoWithLatestQuote)[]> {
    return this.assetsService.getMarketDataWithLatestQuotes(
      query.stocks,
      query.crypto,
      query.reverseOrder
    );
  }
}

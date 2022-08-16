/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MarketService } from "./market.service";
import { Moment } from "moment";
import { MarketStatus } from "../../clients/Polygon/types";
import { YHMarketSummary } from "../../clients/YHFinance/types";
import { GetTradingDaysDto } from "./dto/get-trading-days.dto";
import { AlpacaTradingDay } from "./dto/alpaca-trading-day.dto";
import { FetchLastMarketDateDto } from "./dto/fetch-last-market-date.dto";
import { GetLatestDepositDateDto } from "./dto/get-latest-deposit-date.dto";

@ApiTags("Market")
@Controller()
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @ApiOperation({
    summary: "Get all trading days between two dates (inclusive)",
  })
  @Get("trading-days")
  async getTradingDays(
    @Query() query: GetTradingDaysDto
  ): Promise<AlpacaTradingDay[]> {
    return this.marketService.getTradingDays(query.start, query.end);
  }

  @ApiOperation({
    summary:
      "Get the latest deposit date (3 trading days from now), and in the event of failure, 3 standard business days later",
  })
  @Get("latest-deposit-date")
  async getLatestDepositDate(
    @Query() query: GetLatestDepositDateDto
  ): Promise<string> {
    return this.marketService.getLatestDepositDate(query.format);
  }

  @ApiOperation({ summary: "Fetches current overall market status" })
  @Get("status")
  async getMarketStatus(): Promise<MarketStatus> {
    return this.marketService.getMarketStatus();
  }

  @ApiOperation({
    summary:
      "Checks whether today is a holiday at the current time in New York",
  })
  @Get("holiday")
  isHoliday(): boolean {
    return this.marketService.isHoliday();
  }

  @ApiOperation({
    summary: "Checks whether market is open at the current time in New York",
  })
  @Post("open")
  isMarketOpen(): boolean {
    return this.marketService.isMarketOpen();
  }

  @ApiOperation({ summary: "Fetches last market date" })
  @Get("last-market-date")
  fetchLastMarketDate(@Query() query: FetchLastMarketDateDto): Moment {
    return this.marketService.fetchLastMarketDate(query.numDaysAgo);
  }

  @ApiOperation({
    summary:
      "Fetches live market summary information at the request time from Yahoo Finance",
  })
  @Get("summary")
  getMarketSummary(): Promise<YHMarketSummary[]> {
    return this.marketService.getMarketSummary();
  }
}

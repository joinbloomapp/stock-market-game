/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import * as momentTz from "moment-timezone";
import * as moment from "moment";
import { Moment } from "moment";
import Holidays from "../../models/Holidays";
import Polygon from "../../clients/Polygon";
import { MarketStatus } from "../../clients/Polygon/types";
import YHFinance from "../../clients/YHFinance";
import { YHMarketSummary } from "../../clients/YHFinance/types";
import TimeServices from "../../clients/TimeServices";
import { Injectable, Logger } from "@nestjs/common";
import AlpacaClientClass from "../../clients/alpaca.service";
import { AxiosInstance } from "axios";
import { AlpacaTradingDay } from "./dto/alpaca-trading-day.dto";

@Injectable()
export class MarketService {
  private alpacaClient: AxiosInstance;
  private readonly logger = new Logger(MarketService.name);

  constructor() {
    this.alpacaClient = new AlpacaClientClass().client;
  }

  /**
   * Get all trading days between two dates (inclusive)
   * @param start date as Moment or Date type
   * @param end date as Moment or Date type
   * @returns all trading days
   */
  async getTradingDays(
    start: Date | Moment,
    end: Date | Moment
  ): Promise<AlpacaTradingDay[]> {
    const startDate = moment(start).format("YYYY-MM-DD");
    const endDate = moment(end).format("YYYY-MM-DD");

    try {
      const res = await this.alpacaClient.get("/v1/calendar", {
        params: {
          startDate,
          endDate,
        },
      });

      return (res.data as AlpacaTradingDay[]) || [];
    } catch (e) {
      this.logger.error(
        `Failed to retrieve trading days from ${start} to ${end}: `,
        e
      );
      return [];
    }
  }

  /**
   * Get latest deposit date (3 trading days from now), and in the event of failure, 3 standard business days later
   * @param format Moment date format string
   * @returns date string
   */
  async getLatestDepositDate(format = "ll"): Promise<string> {
    // Assuming the market is never closed for more than 6 days (safe arbitrary number because stock market never goes down for more than 3 days)
    const days = await this.getTradingDays(moment(), moment().add(6, "days"));

    if (days.length > 3) {
      // Skip first day (today)
      return moment(days[3].date, "YYYY-MM-DD").format(format);
    }

    // Failsafe
    return TimeServices.addBusinessDays(moment(), 3).format(format);
  }

  /**
   * Fetches current overall market status
   *
   * @returns Polygon Market status
   */
  async getMarketStatus(): Promise<MarketStatus> {
    try {
      return await Polygon.getMarketStatus();
    } catch (e) {
      this.logger.error("Failed to check market status", e);
    }
  }

  /**
   * Checks whether today is a holiday at the current time in New York
   *
   * @returns true or false
   */
  isHoliday(): boolean {
    const curNyTime = momentTz.tz("America/New_York");
    const curDate = curNyTime.format("YYYY-MM-DD");
    return Holidays.isHoliday(curDate);
  }

  /**
   * Checks whether market is open at the current time in New York
   *
   * @returns true or false
   */
  isMarketOpen(): boolean {
    if (this.isHoliday()) {
      return false;
    }
    const curNyTime = momentTz.tz("America/New_York");
    const openTime = moment(curNyTime).set({
      hour: 9,
      minute: 30,
      second: 0,
      millisecond: 0,
    });
    const endTime = moment(curNyTime).set({
      hour: 16,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    // Check that current time is within market hours 9:30 AM EST - 4:00 PM EST
    // @ts-ignore
    return curNyTime.isBetween(openTime, endTime, "milliseconds", "[]");
  }

  /**
   * Fetches last market date
   *
   * @returns moment date
   */
  fetchLastMarketDate(numDaysAgo = 0): Moment {
    // @ts-ignore
    let curNyTime = momentTz.tz("America/New_York");
    // set the time to midnight EST
    curNyTime = curNyTime.subtract(numDaysAgo, "days").set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    while (Holidays.isHoliday(curNyTime.format("YYYY-MM-DD"))) {
      curNyTime = curNyTime.subtract(1, "days");
    }
    return moment(curNyTime);
  }

  /**
   * Fetches live market summary information at the request time from Yahoo Finance
   */
  async getMarketSummary(): Promise<YHMarketSummary[]> {
    return YHFinance.getMarketSummary();
  }
}

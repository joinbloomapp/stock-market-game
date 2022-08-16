/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { GetPortfolioHistory } from "@master-chief/alpaca";
import * as moment from "moment";
import { Moment } from "moment";
import { MarketService } from "../../market/market.service";
import { Injectable } from "@nestjs/common";

export enum PeriodRange {
  _1D = "1D",
  _1W = "1W",
  _1M = "1M",
  _3M = "3M",
  _1A = "1A",
  _2A = "2A",
  _5Y = "5Y",
}

export interface IPeriod extends Partial<GetPortfolioHistory> {
  period?: PeriodRange;
  label: string;
  displayPeriod?: string;
  formatter: (unix: number) => string;
  startTime: (isCrypto) => Moment;
  polygonTimespan: (isCrypto) => string;
  alpacaTimeframe: (isCrypto) => string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

@Injectable()
export class PeriodsService {
  constructor(private readonly marketService: MarketService) {}

  static toTime(unix) {
    if (unix === "" || !unix) {
      return "";
    }

    const date = new Date(Number(unix));

    let res = "";

    const h = date.getHours() % 12;
    if (h === 0) {
      res += "12:";
    } else {
      res += `${h}:`;
    }

    const m = date.getMinutes();
    if (m < 10) {
      res += "0";
    }
    res += `${m} `;

    if (date.getHours() < 12) {
      res += "AM";
    } else {
      res += "PM";
    }

    return res;
  }

  // MMM DD, ddd
  static toDateAndTime(unix) {
    if (unix === "" || !unix) {
      return "";
    }

    const date = new Date(Number(unix));

    let res = `${MONTHS[date.getMonth()]} `;

    const d = date.getDate();
    res += `${d}, `;

    const h = date.getHours() % 12;
    if (h === 0) {
      res += "12:";
    } else {
      res += `${h}:`;
    }

    const m = date.getMinutes();
    if (m < 10) {
      res += "0";
    }
    res += `${m} `;

    if (date.getHours() < 12) {
      res += "AM";
    } else {
      res += "PM";
    }

    return res;
  }

  // MMM DD, YYYY
  static toDateAndYear(unix) {
    if (unix === "" || !unix) {
      return "";
    }

    const date = new Date(Number(unix));

    let res = `${MONTHS[date.getMonth()]} `;

    const d = date.getDate();
    if (d < 10) {
      res += "0";
    }
    res += d;

    const y = date.getFullYear();
    res += `, ${y}`;

    return res;
  }

  /**
   * Sets UTC start time based on whether it's crypto or not. If crypto, then sets to 3:00 AM EST, otherwise 9:30 AM EST
   *
   * @param startTime UTC start date
   * @param isCrypto
   * @param isCurrentDay
   * @returns
   */
  static getStartTime(
    startTime: Moment,
    isCrypto = false,
    isCurrentDay = false
  ) {
    if (!isCrypto) {
      // If not crypto, start at 9:30 AM EST
      return moment(startTime).set({
        hour: 13,
        minute: 30,
        second: 0,
        millisecond: 0,
      });
    }

    if (isCurrentDay) {
      // If current day, start at 3:00 AM EST
      return moment(startTime).set({
        hour: 7,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    }

    // If not current day and is crypto, start the time at the same hour as the current hour
    return moment(startTime).set({
      hour: moment.utc().hour(),
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  }

  /**
   * Gets start time for current day
   *
   * @param isCrypto
   * @returns
   */
  static getTodayStartTime(isCrypto = false) {
    const now = moment().utc();
    let startTime = PeriodsService.getStartTime(now, isCrypto, true);
    const endTime = moment(now).subtract(15, "minutes");
    if (endTime < startTime) {
      // If utc end time goes past midnight, make sure to start from day before
      startTime = startTime.subtract(1, "days");
    }
    return startTime;
  }

  values: IPeriod[] = [
    {
      period: PeriodRange._1D,
      label: "Today",
      formatter: PeriodsService.toTime,
      startTime: (isCrypto = false) => {
        if (!isCrypto) {
          // If not crypto, set start time based on whether current day is market day
          if (!this.marketService.isHoliday()) {
            // If today is a market day, then set start time to today
            return PeriodsService.getTodayStartTime(isCrypto);
          }

          // If today is a holiday, then set start time to last market date
          return PeriodsService.getStartTime(
            this.marketService.fetchLastMarketDate(),
            isCrypto
          );
        }

        // If crypto, set start time to today
        return PeriodsService.getTodayStartTime(isCrypto);
      },
      polygonTimespan: (isCrypto = false) => "5/minute",
      alpacaTimeframe: (isCrypto = false) => "5Min",
    },
    {
      period: PeriodRange._1W,
      displayPeriod: "1W",
      label: "Past Week",
      formatter: PeriodsService.toDateAndTime,
      startTime: (isCrypto = false) => {
        let startTime: Moment;
        if (!isCrypto) {
          startTime = this.marketService.fetchLastMarketDate(6);
        } else {
          startTime = moment.utc().subtract(1, "weeks");
        }
        return PeriodsService.getStartTime(startTime, isCrypto);
      },
      polygonTimespan: (isCrypto = false) =>
        isCrypto ? "1/hour" : "10/minute",
      alpacaTimeframe: (isCrypto = false) => (isCrypto ? "1Hour" : "10Min"),
    },
    {
      period: PeriodRange._1M,
      label: "Past Month",
      formatter: PeriodsService.toDateAndYear,
      startTime: (isCrypto = false) => {
        let startTime = moment.utc().subtract(1, "months");
        if (!isCrypto) {
          const numDaysAgo = moment.utc().diff(startTime, "days");
          startTime = this.marketService.fetchLastMarketDate(numDaysAgo);
        }
        return PeriodsService.getStartTime(startTime, isCrypto);
      },
      polygonTimespan: (isCrypto = false) => "1/day",
      alpacaTimeframe: (isCrypto = false) => "1Day",
    },
    {
      period: PeriodRange._3M,
      label: "Past 3 Months",
      formatter: PeriodsService.toDateAndYear,
      startTime: (isCrypto = false) => {
        let startTime = moment.utc().subtract(3, "months");
        if (!isCrypto) {
          const numDaysAgo = moment.utc().diff(startTime, "days");
          startTime = this.marketService.fetchLastMarketDate(numDaysAgo);
        }
        return PeriodsService.getStartTime(startTime, isCrypto);
      },
      polygonTimespan: (isCrypto = false) => "1/day",
      alpacaTimeframe: (isCrypto = false) => "1Day",
    },
    {
      period: PeriodRange._1A,
      displayPeriod: "1Y",
      label: "Past Year",
      formatter: PeriodsService.toDateAndYear,
      startTime: (isCrypto = false) => {
        let startTime = moment.utc().subtract(1, "years");
        if (!isCrypto) {
          const numDaysAgo = moment.utc().diff(startTime, "days");
          startTime = this.marketService.fetchLastMarketDate(numDaysAgo);
        }
        return PeriodsService.getStartTime(startTime, isCrypto);
      },
      polygonTimespan: (isCrypto = false) => "1/day",
      alpacaTimeframe: (isCrypto = false) => "1Day",
    },
    {
      period: PeriodRange._2A,
      displayPeriod: "ALL",
      label: "All Time",
      formatter: PeriodsService.toDateAndYear,
      startTime: (isCrypto = false) => {
        let startTime = moment.utc().subtract(5, "years");
        if (!isCrypto) {
          const numDaysAgo = moment.utc().diff(startTime, "days");
          startTime = this.marketService.fetchLastMarketDate(numDaysAgo);
        }
        return PeriodsService.getStartTime(startTime, isCrypto);
      },
      polygonTimespan: (isCrypto = false) => "1/week",
      alpacaTimeframe: (isCrypto = false) => "1Week",
    },
  ];

  get(range: PeriodRange): IPeriod {
    return this.values.find(({ period }) => period === range);
  }
}

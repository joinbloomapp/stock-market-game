/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import dayjs from 'dayjs';
import { Period, PeriodType, Point } from '../../../../common/Graph/types';
import AssetsService from '../../../../services/Assets';
import { AssetAggBar, AssetQuote } from '../../../../services/Assets/types';
import MarketService from '../../../../services/Market';
import ArrayUtils from '../../../../utils/ArrayUtils';

namespace IndividualStockGraphUtils {
  export const GRAPH_WIDTH = 760;
  export const GRAPH_HEIGHT = 228;
  export const PERIODS: Period[] = [
    {
      value: PeriodType._1D,
      displayVal: '1D',
      dayjsTimestampFormat: 'h:mm A',
      tooltipOffset: -25,
    },
    {
      value: PeriodType._1W,
      displayVal: '1W',
      dayjsTimestampFormat: 'MMM D, h:mm A',
      tooltipOffset: -45,
    },
    {
      value: PeriodType._1M,
      displayVal: '1M',
      dayjsTimestampFormat: 'MMM D, YYYY',
      tooltipOffset: -45,
    },
    {
      value: PeriodType._3M,
      displayVal: '3M',
      dayjsTimestampFormat: 'MMM D, YYYY',
      tooltipOffset: -45,
    },
    {
      value: PeriodType._1A,
      displayVal: '1Y',
      dayjsTimestampFormat: 'MMM D, YYYY',
      tooltipOffset: -45,
    },
    {
      value: PeriodType.ALL,
      displayVal: 'ALL',
      dayjsTimestampFormat: 'MMM D, YYYY',
      tooltipOffset: -45,
    },
  ];

  async function getLatestPoint(ticker: string): Promise<Point | undefined> {
    const latestQuote = (await AssetsService.getQuote(ticker)) as AssetQuote; // fetch latest data regardless of day of the week and market status
    if (!latestQuote) {
      return undefined;
    }

    return {
      x: dayjs(latestQuote.latestUpdate).local().valueOf(),
      y: latestQuote.latestPrice,
    };
  }

  function convertBarsToPoints(bars: AssetAggBar[]): Point[] {
    return ArrayUtils.orEmptyArray(bars)
      .map((bar, i) => ({
        x: dayjs(bar.t).local().valueOf(),
        y: bar.c,
      }))
      .sort((a, b) => a.x - b.x);
  }

  export async function getAggregatePoints(ticker: string, activePeriod: Period): Promise<Point[]> {
    let promise: Promise<AssetAggBar[]>;

    const marketOpen = await MarketService.isMarketOpen();

    try {
      if (activePeriod.value === PeriodType._1D) {
        if (marketOpen) {
          promise = AssetsService.getIntradayBars(ticker) as Promise<AssetAggBar[]>;
        } else {
          const lastMarketDay = await MarketService.getLastMarketDate();
          promise = AssetsService.getHistoricalBarsByDate(
            ticker,
            dayjs(lastMarketDay).toISOString()
          ) as Promise<AssetAggBar[]>;
        }
      } else {
        promise = AssetsService.getHistoricalBarsByPeriod(ticker, activePeriod.value) as Promise<
          AssetAggBar[]
        >;
      }
      const bars = await promise;
      const points = convertBarsToPoints(bars);
      if (marketOpen && points.length) {
        const latestPoint = await getLatestPoint(ticker);
        if (latestPoint) {
          points.push(latestPoint);
        }
      }

      return points;
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}

export default IndividualStockGraphUtils;

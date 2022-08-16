/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import dayjs from 'dayjs';
import { Period, PeriodType, Point } from '../../../../common/Graph/types';
import GameService from '../../../../services/Game';
import {
  HistoricalAggregatePosition,
  HistoricalAggregatePositionsLatest,
} from '../../../../services/Game/types';
import ArrayUtils from '../../../../utils/ArrayUtils';

namespace PortfolioGraphUtils {
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
  const periodTypeToQueryParam: { [key: string]: HistoricalAggregatePositionsLatest } = {
    [PeriodType._1D]: HistoricalAggregatePositionsLatest.ONE_DAY,
    [PeriodType._1W]: HistoricalAggregatePositionsLatest.ONE_WEEK,
    [PeriodType._1M]: HistoricalAggregatePositionsLatest.ONE_MONTH,
    [PeriodType._3M]: HistoricalAggregatePositionsLatest.THREE_MONTHS,
    [PeriodType._1A]: HistoricalAggregatePositionsLatest.ONE_YEAR,
    [PeriodType.ALL]: HistoricalAggregatePositionsLatest.ALL,
  };

  function convertAggregatePositionsToPoints(aggPositions: HistoricalAggregatePosition[]): Point[] {
    return ArrayUtils.orEmptyArray(aggPositions)
      .map((p, i) => ({
        x: dayjs(p.createdAt).local().valueOf(),
        y: p.value,
      }))
      .sort((a, b) => a.x - b.x);
  }

  export async function getAggregatePoints(
    gameId: string,
    activePeriod: Period,
    playerId?: string
  ): Promise<Point[]> {
    try {
      const historicalAggregatePositions = await GameService.getHistoricalAggregatePositions(
        gameId,
        { latest: periodTypeToQueryParam[activePeriod.value] },
        playerId
      );
      return convertAggregatePositionsToPoints(historicalAggregatePositions);
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}

export default PortfolioGraphUtils;

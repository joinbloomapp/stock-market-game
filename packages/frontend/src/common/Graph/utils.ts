/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import dayjs from 'dayjs';
import MarketService from '../../services/Market';
import { Period, PeriodType } from './types';

export function formatCursorTimestamp(activePeriod: Period, unix: number): string {
  return dayjs(unix).format(activePeriod.dayjsTimestampFormat);
}

export async function getGraphWidth(
  activePeriod: Period,
  totalWidth: number,
  isPortfolioGraph: boolean = false
): Promise<number> {
  if (activePeriod.value === PeriodType._1D && !(await MarketService.isHoliday())) {
    const now = dayjs().utc();
    let start = dayjs(now)
      .utc()
      .set('hour', 13)
      .set('minute', 30)
      .set('second', 0)
      .set('millisecond', 0);

    if (now.valueOf() < start.valueOf()) {
      // Now is past midnight UTC
      start = start.subtract(1, 'days');
    }

    let end;

    if (isPortfolioGraph) {
      end = dayjs(start).utc().add(6, 'hours').add(30, 'minutes');
    } else {
      end = dayjs(start).utc().add(10, 'hours').add(30, 'minutes');
    }

    // Show only partial graph if day is not complete
    const width =
      totalWidth *
      Math.min(
        1,
        (now.local().valueOf() - start.local().valueOf()) /
          (end.local().valueOf() - start.local().valueOf())
      );

    return width;
  }

  return totalWidth;
}

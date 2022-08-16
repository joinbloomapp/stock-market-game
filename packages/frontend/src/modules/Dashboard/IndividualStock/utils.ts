/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-nocheck

import { StatsBarItem } from '../../../common/StatsBar';
import { TableColumn } from '../../../components/DictTable';
import { CurrentPosition } from '../../../services/Game/types';
import LocationUtils from '../../../utils/LocationUtils';
import MathUtils from '../../../utils/MathUtils';
import StringUtils from '../../../utils/StringUtils';
import { AssetBasicInfo, AssetKeyStats } from './../../../services/Assets/types';

export function getStatsBarsData(position: CurrentPosition): StatsBarItem[] {
  return [
    {
      title: 'Total holdings',
      formattedDollar: StringUtils.USD(position?.totalValue as number),
    },
    {
      title: "Today's return",
      formattedDollar: StringUtils.USD(position?.todayChange as number),
      percent: position.todayChangePercent,
    },
    {
      title: 'Total return',
      formattedDollar: StringUtils.USD(position?.totalChange as number),
      percent: position.totalChangePercent,
    },
  ];
}

export function getAboutTableData({
  employees,
  city,
  state,
  industry,
}: AssetBasicInfo): TableColumn[] {
  return [
    [
      {
        key: 'Industry',
        value: industry || '--',
      },
      {
        key: 'Headquarters',
        value: city && state ? `${city}, ${LocationUtils.abbrRegion(String(state), 'abbr')}` : '--',
      },
    ],
    [
      {
        key: 'Employees',
        value: employees || '--',
      },
    ],
  ];
}

export function getKeyStatsTableData(stats: AssetKeyStats, isEtf: boolean): TableColumn[] {
  if (isEtf) {
    return [
      [
        {
          key: 'Market Cap',
          value: stats?.marketcap ? `$${StringUtils.truncate(stats.marketcap as number)}` : '--',
          info: {
            title: 'Market Cap',
            text: "The total value of all\n of a company's shares",
          },
        },
        {
          key: "Today's Volume",
          value: stats?.latestVolume ? StringUtils.truncate(stats.latestVolume as number) : '--',
          info: {
            title: 'Today’s Volume',
            text: 'Total stocks bought\n and sold today',
          },
        },
        {
          key: '52 Week High',
          value: stats?.week52high ? StringUtils.USD(stats.week52high) : '--',
          info: {
            title: '52 Week High',
            text: 'The highest price of a\n stock for the last 52 weeks',
          },
        },
        {
          key: '52 Week Low',
          value: stats?.week52low ? StringUtils.USD(stats.week52low) : '--',
          info: {
            title: '52 Week Low',
            text: 'The lowest price of a stock\n for the last 52 weeks',
          },
        },
        {
          key: 'Dividend Yield',
          value: stats?.dividendYield
            ? `${MathUtils.round((stats.dividendYield as number) * 100, 2)}%`
            : '--',
          info: {
            title: 'Dividend Yield',
            text: 'Amount of money a company pays\n investors for owning its stock yearly,\n divided by the company\'s current stock price.\n With dividends, investors can gain money\n without having to sell the stocks. Not all\n companies offer a "dividend"',
          },
        },
      ],
    ];
  }

  return [
    [
      {
        key: 'Market Cap',
        value: stats?.marketcap ? `$${StringUtils.truncate(stats.marketcap as number)}` : '--',
        info: {
          title: 'Market Cap',
          text: "The total value of all\n of a company's shares",
        },
      },
      {
        key: 'Revenue (12 Mos)',
        value: stats?.revenue ? `$${StringUtils.truncate(stats.revenue as number)}` : '--',
        info: {
          title: 'Revenue (12 Months)',
          text: "Company's revenue from\n the past 12 months",
        },
      },
      {
        key: 'Gross Profit (12 Mos)',
        value: stats?.grossProfit ? `$${StringUtils.truncate(stats.grossProfit as number)}` : '--',
        info: {
          title: 'Gross Profit',
          text: "Company's profit before\n taxes and government expenses",
        },
      },
      {
        key: 'Price/Earnings Ratio',
        value: stats?.peRatio ? MathUtils.round(stats.peRatio as number, 2) : '--',
        info: {
          title: 'Price/Earnings Ratio',
          text: "The cost of a stock divided\n by an individual share's profit",
        },
      },
      {
        key: 'Price/Sales Ratio',
        value: stats?.priceToSales ? MathUtils.round(stats.priceToSales as number, 2) : '--',
        info: {
          title: 'Price/Sales Ratio',
          text: "Market cap divided by the\n company's revenue in\n the past 12 months",
        },
      },
    ],
    [
      {
        key: "Today's Volume",
        value: stats?.latestVolume ? StringUtils.truncate(stats.latestVolume as number) : '--',
        info: {
          title: 'Today’s Volume',
          text: 'Total stocks bought\n and sold today',
        },
      },
      {
        key: 'Avg Daily Volume',
        value: stats?.avgTotalVolume ? StringUtils.truncate(stats.avgTotalVolume as number) : '--',
        info: {
          title: 'Average Daily Volume',
          text: 'Average amount of stocks\n bought and sold daily',
        },
      },
      {
        key: '52 Week High',
        value: stats?.week52high ? StringUtils.USD(stats.week52high) : '--',
        info: {
          title: '52 Week High',
          text: 'The highest price of a\n stock for the last 52 weeks',
        },
      },
      {
        key: '52 Week Low',
        value: stats?.week52low ? StringUtils.USD(stats.week52low) : '--',
        info: {
          title: '52 Week Low',
          text: 'The lowest price of a stock\n for the last 52 weeks',
        },
      },
      {
        key: 'Dividend Yield',
        value: stats?.dividendYield
          ? `${MathUtils.round((stats.dividendYield as number) * 100, 2)}%`
          : '--',
        info: {
          title: 'Dividend Yield',
          text: 'Amount of money a company pays\n investors for owning its stock yearly,\n divided by the company\'s current stock price.\n With dividends, investors can gain money\n without having to sell the stocks. Not all\n companies offer a "dividend"',
        },
      },
    ],
  ];
}

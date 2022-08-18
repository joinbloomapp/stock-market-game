/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-nocheck

import cls from 'classnames';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart';
import Loader from '../../components/Loader';
import Analytics from '../../system/Analytics';
import { IndividualAssetEvents } from '../../system/Analytics/events/IndividualAssetEvents';
import { PortfolioEvents } from '../../system/Analytics/events/PortfolioEvents';
import MathUtils from '../../utils/MathUtils';
import StringUtils from '../../utils/StringUtils';
import StyleUtils from '../../utils/StyleUtils';
import PeriodTabs from './PeriodTabs';
import { Period, PeriodType, Point } from './types';
import { formatCursorTimestamp, getGraphWidth } from './utils';

interface IGraphProps {
  ticker?: string;
  periods: Period[];
  totalWidth: number;
  totalHeight: number;
  fetchData: (activePeriod: Period) => Promise<Point[]>;
  setLatestPrice?: (latestPrice: number) => void;
  emptyState?: ReactNode | string;
  isPortfolioGraph?: boolean;
}

export default function Graph({
  ticker,
  periods,
  totalWidth,
  totalHeight,
  fetchData,
  setLatestPrice,
  emptyState,
  isPortfolioGraph = false,
}: IGraphProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePoint, setActivePoint] = useState<Point>();
  const [graphDataError, setGraphDataError] = useState<string>();
  const [width, setWidth] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activePeriod, setActivePeriod] = useState<Period>(
    periods.find((p) => p.displayVal === searchParams.get('period')) || periods[0]
  );

  const fetchPoints = async () => {
    setLoading(true);
    const points = await fetchData(activePeriod);
    if (points.length) {
      setPoints(points);
      setActivePoint(points[points.length - 1]);
      if (setLatestPrice) {
        setLatestPrice(points[points.length - 1].y);
      }
    } else {
      setGraphDataError('No data found. Try again later.');
    }
    setLoading(false);
  };

  const calculateGraphWidth = async () => {
    const width = await getGraphWidth(activePeriod, totalWidth, isPortfolioGraph);
    setWidth(width);
  };

  const getFormattedChange = () => {
    const firstY = points.length && points[0].y;
    const activeY = activePoint?.y as number;
    const dollarChange = activeY - firstY;
    const percentChange = activeY > 0 ? MathUtils.percentChange(firstY, activeY) : 0;
    return (
      <div
        className={cls(
          'text-lg font-semibold flex items-center space-x-1',
          StyleUtils.getChangeStyle(percentChange)
        )}
      >
        {StyleUtils.getChangePrefix(percentChange as number)}
        <p>
          {' '}
          {StringUtils.USD(dollarChange)} (
          {StringUtils.signNumber(MathUtils.round(percentChange, 2) / 100, 'percent')})
        </p>
      </div>
    );
  };

  useEffect(() => {
    fetchPoints();
    calculateGraphWidth();
    searchParams.set('period', activePeriod.displayVal);
    setSearchParams(searchParams, { replace: true });
  }, [ticker, activePeriod]);

  const onMouseMove: CategoricalChartFunc = ({
    isTooltipActive,
    activeTooltipIndex,
    chartX,
    chartY,
    activePayload,
    ...rest
  }) => {
    if (
      isTooltipActive &&
      activeTooltipIndex !== undefined &&
      !_.isEqual(activePayload?.[0].payload, activePoint)
    ) {
      // When active tool tip index changes, set new active point
      setActivePoint(activePayload?.[0].payload);
    }
  };

  const onMouseLeave: CategoricalChartFunc = (props) => {
    // When the user takes mouse off graph, reset the active text to the most recent point
    setActivePoint(points[points.length - 1]);
  };

  const CustomizedDot = (props) => {
    const { cx, cy, stroke, payload, value } = props;

    if (
      activePeriod.value === PeriodType._1D &&
      width < totalWidth &&
      payload.x === points[points.length - 1].x
    ) {
      return <circle cx={cx - 2.5} cy={cy - 2.5} fill="#FF4F83" r="5" />;
    }

    return null;
  };

  const CustomTooltip = ({ active, payload, label, ...rest }) => {
    if (active && payload && payload.length) {
      return (
        <div className="focus:none">
          <p className="text-md">{formatCursorTimestamp(activePeriod, payload[0].payload?.x)}</p>
        </div>
      );
    }

    return null;
  };

  const onChangePeriod = (period: Period) => {
    Analytics.track(
      ticker ? IndividualAssetEvents.SWITCH_GRAPH_PERIOD : PortfolioEvents.SWITCH_GRAPH_PERIOD,
      period
    );
    setActivePeriod(period);
  };

  return (
    <div>
      <div className="mt-6">
        <h2 className="font-semibold">{StringUtils.USD(activePoint?.y as number)}</h2>
        <div className="flex justify-between mt-4 pr-2">
          {getFormattedChange()}
          <PeriodTabs periods={periods} activePeriod={activePeriod} onChange={onChangePeriod} />
        </div>
      </div>
      <div className="h-[228px] w-full bg-b-3 light-pink-gradient mt-12 mb-4">
        {!loading && !graphDataError ? (
          <ResponsiveContainer width="100%" height={totalHeight}>
            <LineChart
              width={`${(width / totalWidth) * 100}%`}
              height={totalHeight}
              data={points}
              margin={{
                top: 10,
                right: 32,
                bottom: 10,
                left: -58,
              }}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
            >
              <Tooltip
                isAnimationActive={false}
                position={{ y: -20 }}
                content={<CustomTooltip />}
                offset={activePeriod.tooltipOffset}
              />
              <YAxis
                domain={[Math.min(...points.map((p) => p.y)), Math.max(...points.map((p) => p.y))]}
                display="none"
              />
              <Line
                type="monotone"
                dataKey="y"
                dot={<CustomizedDot />}
                strokeWidth={3}
                stroke="#FF4F83"
                activeDot={{ stroke: 'white', strokeWidth: 2.75, r: 8, strokeDasharray: '' }}
                tooltipType="none"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-full">
            {graphDataError ? emptyState || graphDataError : <Loader className="mx-auto" />}
          </div>
        )}
      </div>
    </div>
  );
}

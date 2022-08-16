/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Graph from '../../../../common/Graph';
import { Period, Point } from '../../../../common/Graph/types';
import IndividualStockGraphUtils from './utils';

interface IIndividualStockGraphProps {
  ticker: string;
  setLatestPrice: (latestPrice: number) => void;
}

export default function IndividualStockGraph({
  ticker,
  setLatestPrice,
}: IIndividualStockGraphProps) {
  const { GRAPH_WIDTH, GRAPH_HEIGHT, PERIODS } = IndividualStockGraphUtils;

  const fetchData = async (activePeriod: Period): Promise<Point[]> => {
    return IndividualStockGraphUtils.getAggregatePoints(ticker, activePeriod);
  };

  return (
    <Graph
      ticker={ticker}
      fetchData={fetchData}
      setLatestPrice={setLatestPrice}
      totalWidth={GRAPH_WIDTH}
      totalHeight={GRAPH_HEIGHT}
      periods={PERIODS}
    />
  );
}

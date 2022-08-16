/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import cls from 'classnames';
import Loader from '../../components/Loader';
import MathUtils from '../../utils/MathUtils';
import StyleUtils from '../../utils/StyleUtils';

export interface StatsBarItem {
  title: string;
  formattedDollar: string;
  formattedPercent?: string;
  percent?: number;
}

interface IStatsBarProps {
  stats: StatsBarItem[];
}

export default function StatsBar({ stats = [] }: IStatsBarProps) {
  return (
    <div className="flex justify-around rounded-2xl bg-b-2 text-t-1 mt-6 py-6 divide-x-1 divide-line-1">
      {stats ? (
        stats.map((s) => {
          return (
            <div key={s.title} className="w-full h-full px-7">
              <p className="text-t-2 text-lg">{s.title}</p>
              <div className="flex items-center space-x-4">
                <h6 className="font-semibold">{s.formattedDollar}</h6>
                {s.percent !== undefined && (
                  <>
                    <p className="text-i-1">—</p>
                    <div
                      className={cls(
                        'flex space-x-1 text-sm font-medium',
                        StyleUtils.getChangeStyle(s.percent || 0)
                      )}
                    >
                      {s.formattedPercent ?? (
                        <>
                          {StyleUtils.getChangePrefix(s.percent as number, false)}
                          {MathUtils.round(s.percent as number, 2).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                          })}
                          %
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <Loader className="mx-auto" />
      )}
    </div>
  );
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import cls from 'classnames';
import { twMerge } from 'tailwind-merge';
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
  className?: string;
}

export default function StatsBar({ stats = [], className }: IStatsBarProps) {
  return (
    <div
      className={twMerge(
        'flex flex-wrap justify-between rounded-2xl md:bg-b-3 text-t-1',
        className
      )}
    >
      {stats ? (
        stats.map((s, i) => {
          return (
            <div
              key={s.title}
              className={cls(
                'bg-b-3 rounded-2xl py-4 md:bg-transparent md:mt-0 pl-7 md:w-auto md:flex-grow',
                {
                  'w-full': i == 0,
                  'w-[49%] mt-2': i !== 0,
                }
              )}
            >
              <div className={cls({ 'md:border-r-1 md:border-line-1': i < stats.length - 1 })}>
                <p className="text-t-2 text-lg">{s.title}</p>
                <div className="flex flex-wrap items-center md:space-x-4">
                  <h6 className="font-semibold w-full md:w-auto">{s.formattedDollar}</h6>
                  {s.percent !== undefined && (
                    <>
                      <p className="text-i-1 hidden md:block">—</p>
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
            </div>
          );
        })
      ) : (
        <Loader className="mx-auto" />
      )}
    </div>
  );
}

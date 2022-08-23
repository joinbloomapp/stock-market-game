/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import cls from 'classnames';
import { twMerge } from 'tailwind-merge';
import Button, { ButtonType } from '../../../components/Button';
import { Period } from '../types';

interface IPeriodTabsProps {
  className?: string;
  periods: Period[];
  activePeriod: Period;
  onChange: (period: Period) => void;
}

export default function PeriodTabs({
  className,
  onChange,
  activePeriod,
  periods,
}: IPeriodTabsProps) {
  return (
    <div className={twMerge('flex justify-center items-center space-x-1', className)}>
      {periods.map((p) => (
        <Button
          key={p.value}
          className={cls({
            'bg-transparent text-t-2': activePeriod.value !== p.value,
            'pink-shadow-small': activePeriod.value === p.value,
          })}
          type={ButtonType.Tab}
          onClick={() => onChange(p)}
        >
          {p.displayVal}
        </Button>
      ))}
    </div>
  );
}

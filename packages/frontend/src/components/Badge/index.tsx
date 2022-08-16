/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import cls from 'classnames';
import { twMerge } from 'tailwind-merge';

interface IBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className }: IBadgeProps) {
  return (
    <div
      className={twMerge(
        'rounded-full h-10 bg-b-3 mx-auto font-semibold flex items-center justify-center px-4',
        className
      )}
    >
      {children}
    </div>
  );
}

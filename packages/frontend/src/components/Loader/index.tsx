/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { twMerge } from 'tailwind-merge';

interface ILoaderProps {
  className?: string;
  color?: string; // tailwind color, i.e. text-t-1
}

export default function Loader({ className, color }: ILoaderProps) {
  return (
    <svg className={twMerge('animate-spin h-5 w-5', className)} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className={color || 'text-t-1'}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import cls from 'classnames';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const CHAR_LEN = 52;

interface IDollarInputProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  className?: string;
  initialAmount?: number;
  onChangeAmount?: (value: string) => void;
}

export default function DollarInput({
  className,
  onChangeAmount,
  initialAmount,
  ...rest
}: IDollarInputProps) {
  const [amount, setAmount] = useState(
    initialAmount
      ? initialAmount.toLocaleString('en-US', {
          maximumFractionDigits: 2,
        })
      : ''
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replaceAll(',', '');
    if (value.startsWith('.') || value.startsWith('0')) {
      // Value can't be less than 1
      return;
    }
    if (value && isNaN(+value)) {
      return;
    }
    const parts = value.split('.');

    if (parts.length > 2 || (parts.length > 1 && parts[1].length > 2)) {
      // Don't allow more than 2 decimal points or 2 decimal places
      return;
    }
    if (value.length > 8) {
      // Don't allow more than 8 digits
      return;
    }

    // TODO: Will revisit the long overly complex logic later
    setAmount(
      value
        ? `${parseFloat(value).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })}${value.endsWith('.') ? '.' : ''}${value.endsWith('.0') ? '.0' : ''}${
            parts.length > 1 && parts[1].length > 1 && value.endsWith('0') && !value.endsWith('00')
              ? '0'
              : ''
          }${parts.length > 1 && value.endsWith('00') ? '.00' : ''}`
        : ''
    );
    onChangeAmount!(value);
  };

  const length = amount
    ? amount.replace(/\D/g, '').length *
      (amount.charAt(amount.length - 1) === '.' ? CHAR_LEN + 8 : CHAR_LEN)
    : CHAR_LEN;

  return (
    <div className={twMerge('flex w-full justify-center mx-auto', className)}>
      <span className="text-t-3 text-4xl mr-2 font-semibold z-40">$</span>
      <input
        onChange={onChange}
        value={amount}
        {...rest}
        type="text"
        pattern="[0-9]+([\.,][0-9]+)?"
        style={{ width: length, padding: 0 }}
        placeholder="0"
        className={cls(
          'z-30 focus:outline-none text-7xl font-bold text-center bg-transparent placeholder:text-t-3 leading-tight caret-t-1',
          { 'text-t-1': parseFloat(amount) > 0, 'text-t-3': parseFloat(amount) <= 0 }
        )}
      />
    </div>
  );
}

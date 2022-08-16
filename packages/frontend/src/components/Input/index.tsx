/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import cls from 'classnames';
import { twMerge } from 'tailwind-merge';

export enum InputStyle {
  Primary = 'Primary',
}

export enum InputHeight {
  Large = 'Large',
  Medium = 'Medium',
  Small = 'Small',
}

interface ITextInputProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  className?: string;
  inputHeight?: InputHeight;
  inputStyle: InputStyle;
  label?: string;
  iconLeft?: any;
}

export default function Input({
  className,
  inputStyle,
  inputHeight,
  label,
  iconLeft,
  ...props
}: ITextInputProps) {
  const classes = twMerge(
    cls(
      'bg-b-3 placeholder-t-3 text-t-1 focus:outline-none focus:ring-b-2 focus:ring-2 px-4 w-full leading-tight',
      {
        'py-6 text-xl': inputHeight === InputHeight.Large,
        'py-5 text-lg': inputHeight === InputHeight.Medium,
        'py-1 text-md': inputHeight === InputHeight.Small,
        'rounded-2xl': inputStyle === InputStyle.Primary,
        'pt-8 pb-2': !!label && inputHeight === InputHeight.Medium,
        'pl-16': !!iconLeft,
      }
    ),
    className
  );

  return (
    <div className="relative">
      {iconLeft && <div className="absolute text-t-3 flex items-center pl-6">{iconLeft}</div>}
      {label && <p className="absolute text-t-3 text-xs pt-3 pl-4 uppercase">{label}</p>}
      <input {...props} className={classes} />
    </div>
  );
}

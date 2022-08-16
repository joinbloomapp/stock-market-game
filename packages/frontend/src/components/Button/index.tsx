/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import cls from 'classnames';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Loader from '../Loader';

export enum ButtonType {
  Primary = 'Primary',
  Secondary = 'Secondary',
  IconButton = 'IconButton',
  Tab = 'Tab',
  Link = 'Link',
}

interface IButtonProps {
  className?: string;
  children: any;
  type: ButtonType;
  shadow?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onSubmit?: React.FormEventHandler<HTMLButtonElement> | undefined;
  iconImage?: any;
  iconRight?: any;
  style?: React.CSSProperties | undefined;
  disabled?: boolean;
  buttonType?: 'submit' | 'button' | 'reset' | undefined;
  loading?: boolean;
  dataTip?: string | undefined | boolean;
  dataFor?: string;
  setShowTooltip?: (showTooltip: boolean) => void;
}

export default function Button({
  children,
  className,
  type,
  shadow = false,
  onClick,
  onSubmit,
  iconImage,
  iconRight,
  style,
  disabled = false,
  buttonType = 'submit',
  loading,
  dataTip,
  dataFor,
  setShowTooltip,
}: IButtonProps): React.ReactElement {
  if (disabled) {
    type = ButtonType.Secondary;
  }

  const classes = twMerge(
    cls('flex justify-center items-center px-6 h-16', {
      'bg-a-1 text-t-1 font-semibold rounded-full': type === ButtonType.Primary,
      'bg-b-2 text-t-1 font-semibold rounded-full disabled:text-t-3': type === ButtonType.Secondary,
      'bg-a-1 text-t-1 font-medium rounded-xl h-8 w-11': type === ButtonType.Tab,
      'rounded-full w-16 flex justify-center items-center': type === ButtonType.IconButton,
      'bg-transparent text-a-1 font-semibold px-0 h-4': type === ButtonType.Link,
      'pink-shadow': shadow && type === ButtonType.Primary,
      'purple-shadow': shadow && type === ButtonType.Secondary,
    }),
    className
  );

  let mouseActions = {};

  if (setShowTooltip) {
    mouseActions = {
      onMouseEnter: () => setShowTooltip!(true),
      onMouseLeave: () => {
        setShowTooltip!(false);
        setTimeout(() => setShowTooltip!(true), 50);
      },
    };
  }

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      onSubmit={onSubmit}
      style={style}
      type={buttonType}
      data-tip={dataTip}
      data-for={dataFor}
      {...mouseActions}
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          {' '}
          {iconImage && <img alt="icon" src={iconImage} className="mr-3" />}
          {children}
          {iconRight && <div className="ml-3">{iconRight}</div>}
        </>
      )}
    </button>
  );
}

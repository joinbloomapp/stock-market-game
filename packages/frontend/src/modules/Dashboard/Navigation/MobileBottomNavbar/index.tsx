/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import cls from 'classnames';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { DashboardContext } from '../..';
import useDashboardNavigate from '../../../../hooks/useDashboardNavigate';

export interface IMobileBottomNavbarProps {
  className?: string;
}

export default function MobileBottomNavbar({ className }: IMobileBottomNavbarProps) {
  const { game } = useContext(DashboardContext);
  const [active, setActive, items] = useDashboardNavigate();

  return (
    <ul
      className={twMerge(
        'fixed bottom-0 w-full flex justify-around z-40 bg-b-3 py-3 px-2',
        className
      )}
    >
      {items.map((item, i) => {
        return (
          <Link
            key={item.title}
            to={item.to || '#'}
            onClick={(e) => {
              if (item.onClick) {
                item.onClick(e);
              }
              setActive(i);
            }}
          >
            <li
              className="text-white flex flex-col justify-center items-center space-y-1"
              key={item.title}
            >
              <div
                className={cls('w-9 h-9 flex items-center justify-center', {
                  'bg-a-1 rounded-xl text-t-1 pink-shadow-small': i === active,
                  'text-t-3': i !== active,
                })}
              >
                {item.icon}
              </div>
              <p className="text-xs">{item.title}</p>
            </li>
          </Link>
        );
      })}
    </ul>
  );
}

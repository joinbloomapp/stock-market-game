/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Menu, Transition } from '@headlessui/react';
import cls from 'classnames';
import { Fragment, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface DropdownItem {
  content: ReactNode | string;
  onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

interface IDropdownProps {
  menuBtn?: ReactNode | string;
  anchorSide?: 'left' | 'right';
  classNames?: {
    menuBtn?: string;
  };
  items: DropdownItem[];
}

export default function Dropdown({
  menuBtn = 'Options',
  classNames,
  anchorSide = 'left',
  items = [],
}: IDropdownProps) {
  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button
            className={twMerge(
              'flex justify-center items-center w-12 h-12 rounded-full text-t-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75',
              classNames?.menuBtn
            )}
          >
            {({ open }) => {
              return (
                <div
                  className={cls(
                    'hover:bg-b-1 flex justify-center items-center w-12 h-12 rounded-full',
                    { 'bg-b-1': open }
                  )}
                >
                  {menuBtn}
                </div>
              );
            }}
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={cls(
              'absolute mt-2 w-56 origin-top-right divide-y-0.5 divide-line-1 rounded-md p-1 bg-b-3 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-40',
              { 'right-0': anchorSide === 'right', 'left-0': anchorSide === 'left' }
            )}
          >
            {items.map((item, i) => {
              return (
                <Menu.Item key={i}>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-b-2' : ''
                      } text-t-1 group flex w-full items-center m-0 rounded-md px-2 py-2`}
                      onClick={item.onClick}
                    >
                      {item.content}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

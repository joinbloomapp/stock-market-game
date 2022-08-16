/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { RadioGroup } from '@headlessui/react';
import { Icon16CheckOutline } from '@vkontakte/icons';
import { twMerge } from 'tailwind-merge';

export interface IRadioListItem {
  title: string;
  subtitle?: string;
}

interface IRadioListGroupProps {
  items: IRadioListItem[];
  selectedIdx: number;
  onChange: (idx: number) => void;
  label?: string;
  className?: string;
}

export default function RadioListGroup({
  label,
  items = [],
  selectedIdx = 0,
  onChange,
  className,
}: IRadioListGroupProps) {
  return (
    <div className={twMerge('w-full', className)}>
      <div className="mx-auto w-full max-w-md">
        <RadioGroup value={selectedIdx} onChange={onChange}>
          {label && <RadioGroup.Label className="sr-only">{label}</RadioGroup.Label>}
          <div className="space-y-2">
            {items.map((item, i) => (
              <RadioGroup.Option
                key={i}
                value={i}
                className={({ active, checked }) =>
                  'text-t-1 bg-b-3 p-4 rounded-xl focus:outline-none cursor-pointer'
                }
              >
                {({ active, checked }) => (
                  <>
                    <div tabIndex={0} className="flex w-full items-center justify-between text-t-1">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <RadioGroup.Label
                            as="p"
                            className="overflow-hidden truncate w-72 font-semibold"
                          >
                            {item.title}
                          </RadioGroup.Label>
                          {item?.subtitle && (
                            <RadioGroup.Description as="p" className={`text-t-3 text-sm`}>
                              {item.subtitle}
                            </RadioGroup.Description>
                          )}
                        </div>
                      </div>
                      {checked ? (
                        <div className="rounded-full w-6 h-6 bg-a-1 flex justify-center items-center">
                          <Icon16CheckOutline className="w-8 h-8" />
                        </div>
                      ) : (
                        <div className="rounded-full w-6 h-6 bg-transparent border-2 border-i-1 flex justify-center items-center"></div>
                      )}
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

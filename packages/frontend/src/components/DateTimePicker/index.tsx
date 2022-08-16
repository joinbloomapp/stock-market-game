/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Icon24CalendarOutline, Icon24CancelOutline } from '@vkontakte/icons';
import cls from 'classnames';
// @ts-ignore
import DateTimePicker from 'react-datetime-picker/dist/entry.nostyle';
import './index.css';

interface ICustomDateTimePickerProps {
  value: Date;
  onChange: (value: Date) => void;
  minDate?: Date;
  label?: string;
  required?: boolean;
}

export default function CustomDateTimePicker({
  onChange,
  value,
  minDate,
  label,
  required = false,
}: ICustomDateTimePickerProps) {
  return (
    <div className="relative flex flex-col justify-start w-full">
      {label && <p className="absolute text-t-3 text-xs pt-3 pl-4 uppercase z-40">{label}</p>}
      <DateTimePicker
        className={cls('bg-b-3 py-5 border-0 rounded-2xl text-left px-4 text-lg cursor-pointer', {
          'pt-8 pb-2': !!label,
        })}
        calendarClassName={cls('rounded-b-xl border-0 text-center bg-b-3 p-6 shadow-2xl', {
          '-mt-4': !label,
          '-mt-2': !!label,
        })}
        disableClock
        calendarIcon={<Icon24CalendarOutline className={cls('text-i-1', { '-mt-5': !!label })} />}
        clearIcon={<Icon24CancelOutline className={cls('text-i-1', { '-mt-5': !!label })} />}
        onChange={onChange}
        value={value}
        minDate={minDate}
        required={required}
      />
    </div>
  );
}

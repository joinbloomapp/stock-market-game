/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon16InfoCirle } from '@vkontakte/icons';
import cls from 'classnames';
import { useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { twMerge } from 'tailwind-merge';
import Button, { ButtonType } from '../Button';

export interface TableValue {
  key: any;
  value: any;
  info?: any;
}

export type TableColumn = TableValue[];

interface ITableProps {
  columns: TableColumn[]; // Each TableColumn represents the key value pairs in one column (pass columns in left to right order)
  classNames?: {
    container?: string;
    row?: string;
    key?: string;
    value?: string;
  };
}

export default function DictTable({ columns = [], classNames }: ITableProps) {
  const maxRows = columns.length ? Math.max(...columns.map((col) => col.length)) : 0;
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  return (
    <div className={twMerge('w-full divide-y-1 divide-line-1 rounded-2xl', classNames?.container)}>
      {Array(maxRows)
        .fill(0)
        .map((_, i) => {
          const row = columns.map((col) => col[i]);
          return (
            <div key={i} className="flex w-full divide-x-1 divide-line-1 space-x-4">
              {row.map((cell: TableValue, j) => {
                return (
                  <div
                    key={j}
                    className={twMerge(
                      cls('flex w-full justify-between items-center py-4', {
                        'pl-6': j > 0,
                      }),
                      classNames?.row
                    )}
                  >
                    {cell && (
                      <>
                        <div className={twMerge('text-t-2', classNames?.key)}>{cell.key}</div>
                        <div className={twMerge('text-t-1 flex items-center', classNames?.value)}>
                          {cell.value}
                          {cell.info && (
                            <>
                              <Button
                                dataTip
                                dataFor={cell.info.title}
                                setShowTooltip={setShowTooltip}
                                type={ButtonType.IconButton}
                                className="w-4 h-4 text-t-2 p-0 ml-4"
                              >
                                <Icon16InfoCirle width={14} height={14} />
                              </Button>
                              {showTooltip && (
                                <ReactTooltip
                                  id={cell.info.title}
                                  type="dark"
                                  multiline
                                  effect="solid"
                                  backgroundColor="#000"
                                  className="!bg-b-3 !opacity-100 !rounded-xl !shadow-md !text-md text-center"
                                  arrowColor="#1B1A27"
                                >
                                  <div style={{ whiteSpace: 'pre-line' }}>{cell.info.text}</div>
                                </ReactTooltip>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
}

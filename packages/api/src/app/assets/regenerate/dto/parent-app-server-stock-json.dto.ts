/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

interface _ParentAppServerStockJsonDto {
  name: string;
  image: string;
}

export type ParentAppServerStockJsonDto = {
  [key: string]: _ParentAppServerStockJsonDto;
};

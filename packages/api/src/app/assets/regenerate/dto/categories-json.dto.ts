/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface CategoriesJsonDto {
  id: string;
  name: string;
  stocks: string[];
  description: string;
  image: string;
  snippet: string;
}

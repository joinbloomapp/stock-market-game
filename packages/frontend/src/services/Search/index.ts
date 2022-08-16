/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import client from '..';
import { AssetSearch } from './types';

namespace SearchService {
  /**
   * Performs a back-end search based on asset names, tickers, and descriptions based on a query string
   *
   * @param query
   * @returns asset search results
   */
  export async function searchAssets(query: string): Promise<AssetSearch> {
    const res = await client.get('/search', {
      params: {
        q: query,
      },
    });

    return res?.data;
  }
}

export default SearchService;

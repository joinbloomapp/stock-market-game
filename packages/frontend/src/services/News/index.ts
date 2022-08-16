/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import client from '..';
import { NewsItem } from './types';

namespace NewsService {
  /**
   * Gets general news articles that are not necessarily specific to one asset
   *
   * @param limit limit the number of news items to return
   * @returns list of news items
   */
  export async function getGeneralNews(limit: number = 10): Promise<NewsItem[]> {
    const res = await client.get('/news/general', { params: { limit } });
    return res?.data;
  }

  /**
   * Gets news articles that are specific to a list of assets
   *
   * @param limit limit the number of news items to return
   * @param tickers list of tickers to get news for
   * @returns list of news items
   */
  export async function getNewsByTickers(
    limit: number = 10,
    tickers: string[] = []
  ): Promise<NewsItem[]> {
    const res = await client.get('/news', { params: { tickers, limit } });
    return res?.data;
  }
}

export default NewsService;

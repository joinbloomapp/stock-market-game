/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import client from '..';
import { Category, CategoryAssetsResponse } from './types';

namespace CategoriesService {
  /**
   * Gets all categories
   *
   * @returns categories
   */
  export async function getCategories(): Promise<Category[]> {
    const res = await client.get('/categories');
    return res?.data;
  }

  /**
   * Gets a single category by id
   *
   * @param id get category by id
   * @returns category
   */
  export async function getCategory(id: string): Promise<Category | undefined> {
    const res = await client.get(`/categories/${id}`);
    return res?.data;
  }

  /**
   * Get all assets in a category
   *
   * @param id category id
   * @returns
   */
  export async function getCategoryAssets(id: string): Promise<CategoryAssetsResponse> {
    const res = await client.get(`/categories/${id}/assets`);
    return res?.data;
  }
}

export default CategoriesService;

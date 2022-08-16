/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Icon16Chevron, Icon24SearchOutline } from '@vkontakte/icons';
import cls from 'classnames';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardContext } from '..';
import Input, { InputHeight, InputStyle } from '../../../components/Input';
import CategoriesService from '../../../services/Categories';
import { Category } from '../../../services/Categories/types';
import SearchService from '../../../services/Search';
import { AssetSearch, AssetSearchResult } from '../../../services/Search/types';
import Analytics from '../../../system/Analytics';
import { BrowseEvents } from '../../../system/Analytics/events/BrowseEvents';
import ArrayUtils from '../../../utils/ArrayUtils';
import StringUtils from '../../../utils/StringUtils';
import CategoryList from './CategoryList';
import IndividualCategory from './IndividualCategory';

export default function Browse() {
  const navigate = useNavigate();
  const { game } = useContext(DashboardContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssetSearch>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryResults, setCategoryResults] = useState<Category[]>([]);
  const categoryId = searchParams.get('categoryId');
  const timeoutRef = useRef<NodeJS.Timeout>();

  const searchAssets = async (q: string) => {
    if (q) {
      const data = await SearchService.searchAssets(q);
      Analytics.track(BrowseEvents.BROWSE_QUERY, { query: q });
      setResult(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!categoryId) {
      searchAssets(query);
      fetchCategories();
    }
  }, []);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(true);
    timeoutRef.current = setTimeout(() => searchAssets(e.target.value), 200);
    setQuery(e.target.value);
    setCategoryResults(
      categories.filter((cat) =>
        cat.name.toLowerCase().trim().includes(e.target.value.toLowerCase().trim())
      )
    );
    if (e.target.value) {
      searchParams.set('q', e.target.value);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams, { replace: true });
  };

  const fetchCategories = async () => {
    setLoading(true);
    const categories = await CategoriesService.getCategories();
    setCategories(categories);
    setLoading(false);
  };

  const renderSkeletonLoaders = () => {
    return (
      <div className="divide-y divide-line-1">
        {[1, 2, 3].map((num) => (
          <div key={num} className="w-full py-4">
            <div className="animate-pulse flex space-x-8">
              <div className="rounded-full bg-line-1 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="space-y-3">
                  <div className="h-2 w-1/6 bg-line-1 rounded col-span-2"></div>
                  <div className="h-2 w-1/5 bg-line-1 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const clickAsset = (ticker: string) => {
    Analytics.track(BrowseEvents.NAVIGATE_TO_ASSET, { ticker });
    navigate(`/dashboard/g/${game?.inviteCode}/stock/${ticker}`);
  };

  const renderListItem = (asset: AssetSearchResult) => {
    return (
      <button
        onClick={() => clickAsset(asset.ticker)}
        key={asset.ticker}
        className="flex justify-between items-center text-t-1 py-4 text-left hover:bg-b-3 hover:rounded-2xl px-4"
      >
        <div className="flex space-x-4">
          <img
            src={asset.image}
            alt={asset.ticker}
            className="rounded-full w-11 h-11 bg-white object-cover object-center"
          />
          <div>
            <p>{asset.name}</p>
            <p className="text-t-3 text-sm">
              {asset.ticker} · {StringUtils.USD(asset.latestPrice)}
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center text-t-3">
          <Icon16Chevron />
        </div>
      </button>
    );
  };

  return (
    <div>
      {categoryId ? (
        <IndividualCategory />
      ) : (
        <>
          <Input
            type="text"
            inputStyle={InputStyle.Primary}
            inputHeight={InputHeight.Medium}
            className="border-a-1/[0.1] border border-opacity-1 bg-b-2"
            iconLeft={<Icon24SearchOutline className="mt-5" />}
            value={query}
            onChange={onChange}
            autoFocus
            placeholder="Search for stocks..."
            required
          />
          {query.length === 0 && (
            <div className="bg-b-2 flex flex-col rounded-2xl p-7 mt-4">
              <p className="font-medium mb-2">Categories</p>
              <CategoryList categories={categories} />
            </div>
          )}

          {query.length > 0 && (
            <div className="bg-b-2 flex flex-col text-t-3 rounded-2xl min-h-[295px] mt-4 transition-[display] px-7 py-6">
              {categoryResults.length > 0 && (
                <p className={cls('text-t-1 font-medium mb-2', { 'text-t-3': !query })}>
                  {loading
                    ? 'Searching...'
                    : `${categoryResults.length} ${
                        categoryResults.length == 1 ? 'category' : 'categories'
                      } found`}
                </p>
              )}
              <CategoryList categories={categoryResults} />
              <p className={cls('text-t-1 font-medium mb-2', { 'text-t-3': !query })}>
                {loading
                  ? 'Searching...'
                  : `${result?.assets?.length || 'No'} ${
                      result?.assets?.length === 1 ? 'stock' : 'stocks'
                    } found`}
              </p>
              {loading ? (
                renderSkeletonLoaders()
              ) : (
                <div className="flex flex-col">
                  {ArrayUtils.orEmptyArray(result?.assets).map(renderListItem)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

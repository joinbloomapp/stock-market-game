/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon16Chevron } from '@vkontakte/icons';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardContext } from '../../..';
import Loader from '../../../../../components/Loader';
import CategoriesService from '../../../../../services/Categories';
import { CategoryAsset } from '../../../../../services/Categories/types';
import Analytics from '../../../../../system/Analytics';
import { BrowseEvents } from '../../../../../system/Analytics/events/BrowseEvents';
import StringUtils from '../../../../../utils/StringUtils';

export default function AssetsList() {
  const [assets, setAssets] = useState<CategoryAsset[]>([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') as string;
  const [loading, setLoading] = useState(false);
  const { game } = useContext(DashboardContext);

  const fetchAssets = async () => {
    setLoading(true);
    const res = await CategoriesService.getCategoryAssets(categoryId);
    setAssets(res.assets);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const clickAsset = (ticker: string) => {
    Analytics.track(BrowseEvents.NAVIGATE_TO_ASSET, { ticker });
    navigate(`/dashboard/g/${game?.inviteCode}/stock/${ticker}`);
  };

  const renderListItem = (asset: CategoryAsset) => {
    return (
      <button
        onClick={() => clickAsset(asset.ticker)}
        key={asset.ticker}
        className="flex justify-between items-center text-t-1 py-4 text-left hover:bg-b-3 hover:rounded-2xl md:px-4"
      >
        <div className="flex space-x-4">
          <img
            alt={asset.ticker}
            src={asset.image}
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

  if (loading) {
    return <Loader className="mx-auto" />;
  }

  return <div className="flex flex-col">{assets.map(renderListItem)}</div>;
}

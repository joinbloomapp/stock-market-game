/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loader from '../../../../components/Loader';
import CategoriesService from '../../../../services/Categories';
import { Category } from '../../../../services/Categories/types';
import AssetsList from './AssetsList';
import _ from 'lodash';
import Button, { ButtonType } from '../../../../components/Button';
import { Icon28ArrowLeftOutline } from '@vkontakte/icons';

export default function IndividualCategory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<Category>();
  const [loading, setLoading] = useState(false);
  const categoryId = searchParams.get('categoryId') as string;

  const getCategory = async () => {
    setLoading(true);
    const category = await CategoriesService.getCategory(categoryId);
    setCategory(category);
    setLoading(false);
  };

  useEffect(() => {
    getCategory();
  }, []);

  if (!category) {
    return <Loader />;
  }

  return (
    <div>
      <div className="flex space-x-4 items-center">
        <Button
          type={ButtonType.IconButton}
          onClick={() => navigate(-1)}
          className="-ml-16 bg-b-3 w-12 h-12"
        >
          <Icon28ArrowLeftOutline />
        </Button>
        <img src={category.image} alt={category.name} className="rounded-2xl w-16 h-16" />
        <div>
          <h5 className="font-semibold">{category.name}</h5>
          <p className="text-t-3">{category.numAssets || 0} stocks</p>
        </div>
      </div>
      <div className="bg-b-2 px-7 py-5 mt-6 rounded-2xl">
        <p className="font-medium mb-2">Stocks</p>
        <AssetsList />
      </div>
    </div>
  );
}

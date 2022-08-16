/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon16Chevron } from '@vkontakte/icons';
import { useSearchParams } from 'react-router-dom';
import { Category } from '../../../../services/Categories/types';
import Analytics from '../../../../system/Analytics';
import { BrowseEvents } from '../../../../system/Analytics/events/BrowseEvents';

interface ICategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: ICategoryListProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const clickCategory = (category: Category) => {
    Analytics.track(BrowseEvents.NAVIGATE_TO_CATEGORY, {
      categoryId: category.id,
      name: category.name,
    });
    searchParams.set('categoryId', category.id);
    setSearchParams(searchParams);
  };

  const renderListItem = (category: Category) => {
    return (
      <button
        onClick={() => clickCategory(category)}
        key={category.id}
        className="flex justify-between items-center text-t-1 py-4 text-left hover:bg-b-3 hover:rounded-2xl px-4"
      >
        <div className="flex space-x-4">
          <img
            alt={category.name}
            src={category.image}
            className="rounded-2xl w-11 h-11 object-cover object-center"
          />
          <div>
            <p>{category.name}</p>
            <p className="text-t-3 text-sm">{category.numAssets || 25} stocks</p>
          </div>
        </div>
        <div className="flex justify-center items-center text-t-3">
          <Icon16Chevron />
        </div>
      </button>
    );
  };

  return <div className="flex flex-col">{categories.map(renderListItem)}</div>;
}

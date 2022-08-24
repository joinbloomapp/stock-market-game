/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useContext } from 'react';
import { NavigationItem } from '../modules/Dashboard/Navigation/utils';
import { useEffect, useState } from 'react';
import { DashboardContext } from '../modules/Dashboard';
import { getNavigationItems } from '../modules/Dashboard/Navigation/utils';

export default function useDashboardNavigate(): [number, (val: number) => void, NavigationItem[]] {
  const { game } = useContext(DashboardContext);
  const [active, setActive] = useState<number>(0);
  const items = getNavigationItems(game?.isGameAdmin as boolean);

  useEffect(() => {
    let navPath = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
    const idx = items.findIndex((item) => {
      return item.to === navPath;
    });
    setActive(idx);
  }, [location.pathname]);

  return [active, setActive, items];
}

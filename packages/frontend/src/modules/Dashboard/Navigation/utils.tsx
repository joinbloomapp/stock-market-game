/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Icon24ClockOutline,
  Icon24CupOutline,
  Icon24SearchOutline,
  Icon28SettingsOutline,
  Icon28StatisticsOutline,
} from '@vkontakte/icons';

export interface NavigationItem {
  title: string;
  icon: any;
  to?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function getNavigationItems(isGameAdmin: boolean): NavigationItem[] {
  const items: NavigationItem[] = [
    {
      title: 'My portfolio',
      icon: <Icon28StatisticsOutline />,
      to: 'portfolio',
    },
    {
      title: 'Leaderboard',
      icon: <Icon24CupOutline />,
      to: 'leaderboard',
    },
    {
      title: 'Browse stocks',
      icon: <Icon24SearchOutline />,
      to: 'browse',
    },
    {
      title: 'Order history',
      icon: <Icon24ClockOutline />,
      to: 'history',
    },
  ];

  if (isGameAdmin) {
    items.push({
      title: 'Game settings',
      icon: <Icon28SettingsOutline />,
      to: `settings`,
    });
  }

  return items;
}

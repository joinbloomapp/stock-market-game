/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Icon24ClockOutline,
  Icon24CupOutline,
  Icon24SearchOutline,
  Icon28DoorArrowRightOutline,
  Icon28Profile,
  Icon28SettingsOutline,
  Icon28StatisticsOutline,
} from '@vkontakte/icons';
import cls from 'classnames';
import dayjs from 'dayjs';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardContext } from '..';
import { UserContext } from '../../../App';
import Logo from '../../../assets/images/bloom.png';
import Button, { ButtonType } from '../../../components/Button';
import Loader from '../../../components/Loader';
import { GameStatus } from '../../../services/Game/types';
import Analytics from '../../../system/Analytics';
import { GameEvents } from '../../../system/Analytics/events/GameEvents';
import { OnboardingEvents } from '../../../system/Analytics/events/OnboardingEvents';
import { ProfileEvents } from '../../../system/Analytics/events/ProfileEvents';
import DateTimeUtils from '../../../utils/DateTimeUtils';
import GamesModal from './GamesModal';
import ProfileModal from './ProfileModal';
import SiteAdminModal from './SiteAdminModal';

interface SidebarItem {
  title: string;
  icon: ReactNode;
  to?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Sidebar() {
  const { game, loading } = useContext(DashboardContext);
  const location = useLocation();
  const [active, setActive] = useState(0);
  const [openGamesModal, setOpenGamesModal] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openSiteAdminModal, setOpenSiteAdminModal] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const topItems: SidebarItem[] = [
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

  if (game?.isGameAdmin) {
    topItems.push({
      title: 'Game settings',
      icon: <Icon28SettingsOutline />,
      to: `settings`,
    });
  }

  topItems.push({
    title: 'My profile',
    icon: <Icon28Profile />,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      Analytics.track(ProfileEvents.CLICKED_MY_PROFILE);
      setOpenProfileModal(true);
    },
  });

  if (!user?.isSiteAdmin) {
    topItems.push({
      title: 'Support panel',
      icon: <Icon28Profile />,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        setOpenSiteAdminModal(true);
      },
    });
  }

  topItems.push({
    title: 'Log out',
    icon: <Icon28DoorArrowRightOutline className="text-u-negative" />,
    to: '/login',
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      localStorage.removeItem('authToken');
      Analytics.track(OnboardingEvents.CLICKED_LOGOUT);
      setUser(undefined);
    },
  });

  useEffect(() => {
    let navPath = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
    const idx = topItems.findIndex((item) => {
      return item.to === navPath;
    });
    setActive(idx);
  }, [location.pathname]);

  const getGameStatus = () => {
    switch (game?.status) {
      case GameStatus.ACTIVE:
        return 'CURRENT GAME';
      case GameStatus.NOT_STARTED:
        return 'NOT STARTED YET';
      default:
        return 'FINISHED';
    }
  };

  const clickManageGames = () => {
    Analytics.track(GameEvents.CLICKED_MANAGE_GAMES);
    setOpenGamesModal(true);
  };

  return (
    <div className="fixed text-t-1 z-20 space-y-2 top-0 bottom-0 w-[280px]">
      <div className=" bg-b-3 h-full overflow-y-auto">
        <div className="px-5">
          <Link to="portfolio">
            <img alt="Bloom logo" className="py-6" src={Logo} width={142} height={32} />
          </Link>
          <p className="mb-4 font-bold text-ellipsis overflow-hidden line-clamp">
            {DateTimeUtils.getCurrentTimeOfDayMessage()}, {user?.firstName}!
          </p>
        </div>
        <hr />
        {!loading && game ? (
          <div className="px-5 py-4">
            <p className="text-t-3 uppercase text-xs">{getGameStatus()}</p>
            <Link
              to={game?.isGameAdmin ? 'settings' : ''}
              onClick={() => Analytics.track(GameEvents.CLICKED_GAME)}
            >
              <p className="font-semibold">{game?.name}</p>
              <p className="text-t-3 text-sm">
                {game.isGameAdmin && 'Admin · '}
                {game.status === GameStatus.FINISHED ? 'Ended' : 'Ends'}{' '}
                {dayjs(game.endAt).fromNow()}
              </p>
            </Link>
            <Button
              shadow
              type={ButtonType.Secondary}
              className="w-full bg-b-2 h-10 mt-4 pt-1"
              onClick={clickManageGames}
            >
              Manage games
            </Button>
          </div>
        ) : (
          <div className="flex justify-center items-center pt-[50px]">
            <Loader />
          </div>
        )}
        <ul className="mt-2 px-2">
          {topItems.map((item, i) => (
            <React.Fragment key={item.title}>
              <Link
                key={item.title}
                to={item.to || '#'}
                onClick={(e) => {
                  if (item.onClick) {
                    item.onClick(e);
                  }
                  if (!['My profile', 'Support panel'].includes(item.title)) {
                    setActive(i);
                  }
                }}
              >
                <li
                  className={cls('flex items-center my-2 py-3 hover:bg-b-2 rounded-2xl px-4', {
                    'bg-b-2': i === active,
                  })}
                >
                  <div
                    className={cls('w-9 h-9 flex items-center justify-center', {
                      'bg-a-1 rounded-xl text-t-1 pink-shadow-small': i === active,
                      'text-t-3': i !== active,
                    })}
                  >
                    {item.icon}
                  </div>
                  <p className="pl-5">{item.title}</p>
                </li>
              </Link>
              {i === topItems.length - 3 && <hr />}
            </React.Fragment>
          ))}
        </ul>
      </div>
      {/* <div className=" bg-b-3 w-[280px] rounded-2xl pb-2 min-h-[100px]"></div> */}
      <GamesModal open={openGamesModal} setOpen={setOpenGamesModal} />
      <ProfileModal open={openProfileModal} setOpen={setOpenProfileModal} />
      {!user?.isSiteAdmin && (
        <SiteAdminModal open={openSiteAdminModal} setOpen={setOpenSiteAdminModal} />
      )}
    </div>
  );
}

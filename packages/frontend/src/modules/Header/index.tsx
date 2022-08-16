/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { useContext, useEffect, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { UserContext } from '../../App';
import Logo from '../../assets/images/bloom.png';
import Button, { ButtonType } from '../../components/Button';
import GameService from '../../services/Game';
import { Game } from '../../services/Game/types';
import Analytics from '../../system/Analytics';
import { OnboardingEvents } from '../../system/Analytics/events/OnboardingEvents';

export default function Header() {
  const { user, setUser } = useContext(UserContext);
  const [game, setGame] = useState<Game>();
  const createGame = useMatch('/game/create');
  const lobby = useMatch('/game/:inviteCode');
  const joinGame = useMatch('/game/join');
  const signup = useMatch('/start');
  const login = useMatch('/login');

  const navigate = useNavigate();

  const fetchGame = async () => {
    const data = await GameService.getLatestGame();
    setGame(data);
  };

  useEffect(() => {
    if (!game && user) {
      fetchGame();
    }
  }, []);

  const clickLogin = () => {
    Analytics.track(OnboardingEvents.CLICKED_LOGIN);
    navigate('/login');
  };

  const clickLogout = () => {
    Analytics.track(OnboardingEvents.CLICKED_LOGOUT);
    localStorage.removeItem('authToken');
    setUser(undefined);
  };

  const renderBtn = () => {
    if (user) {
      if (game || (lobby && !createGame && !joinGame)) {
        return (
          <Button
            type={ButtonType.Secondary}
            className="h-12"
            onClick={() => navigate('/dashboard/g')}
          >
            Go to dashboard
          </Button>
        );
      }

      return (
        <div className="flex items-center space-x-4">
          <h6 className="text-t-1 font-bold">Welcome, {user.firstName}</h6>
          <Button type={ButtonType.Secondary} className="h-12" onClick={clickLogout}>
            Log out
          </Button>
        </div>
      );
    }

    if (joinGame || (!createGame && !signup && !login && !lobby)) {
      return (
        <Button type={ButtonType.Secondary} className="h-10" onClick={clickLogin}>
          Login
        </Button>
      );
    }

    return <div className="w-12" />;
  };

  return (
    <div className="relative w-full h-16 md:px-10 py-8">
      <img
        alt="Bloom logo"
        width="170"
        height="48"
        src={Logo}
        className="absolute left-4 md:left-0 right-0 md:mr-auto md:ml-auto"
      />
      <div className="absolute right-4">{renderBtn()}</div>
    </div>
  );
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-nocheck

import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useMatch, useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../App';
import LoadingScreen from '../../common/LoadingScreen';
import GameService from '../../services/Game';
import { Game } from '../../services/Game/types';
import Browse from './Browse';
import GameSettings from './GameSettings';
import IndividualStock from './IndividualStock';
import Leaderboard from './Leaderboard';
import MobileHeader from './MobileHeader';
import Navigation from './Navigation';
import OrderHistory from './OrderHistory';
import Portfolio from './Portfolio';
import SiteAdminHeader from './SiteAdminHeader';

interface IDashboardContext {
  game?: Partial<Game> | undefined;
  setGame: React.Dispatch<React.SetStateAction<Partial<Game> | undefined>>;
  viewingOtherUser: boolean;
  setViewingOtherUser: (value: boolean) => void;
  loading: boolean;
}

export const DashboardContext = createContext<IDashboardContext>({
  game: undefined,
  setGame: () => {},
  viewingOtherUser: false,
  setViewingOtherUser: () => {},
  loading: false,
});

export default function Dashboard() {
  let { inviteCode } = useParams();
  const navigate = useNavigate();
  const empty = useMatch('/dashboard/g/:inviteCode');
  const [game, setGame] = useState<Game>();
  const [viewingOtherUser, setViewingOtherUser] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  const fetchGame = async () => {
    setLoading(true);
    try {
      let data;

      if (!inviteCode) {
        data = await GameService.getLatestGame();
        if (!data) {
          navigate('/game/join');
          return;
        }
      } else {
        data = await GameService.getGameByInviteCode(inviteCode!);
        if (!data.userInGame) {
          navigate(`/game/${data.inviteCode}`);
          return;
        }
      }

      setGame(data);
    } catch (e) {
      navigate('/404');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!game) {
      fetchGame();
    }
    setViewingOtherUser(!!localStorage.getItem('userAuthToken'));
  }, []);

  if (!game) {
    return <LoadingScreen />;
  }

  if (!inviteCode) {
    return <Navigate to={game?.inviteCode} replace />;
  }

  if (empty) {
    return <Navigate to={`/dashboard/g/${inviteCode}/portfolio`} replace />;
  }

  return (
    <DashboardContext.Provider
      value={{ game, setGame, viewingOtherUser, setViewingOtherUser, loading }}
    >
      {viewingOtherUser && <SiteAdminHeader />}
      <div className="flex h-full min-h-screen text-t-1 z-10 bg-purple-polka bg-fixed bg-center bg-repeat">
        <div className="block md:hidden">
          <MobileHeader />
        </div>
        <Navigation />
        <div className="z-10 w-full flex justify-center pb-36 pt-20 md:pt-10 md:pb-10 px-4 md:px-0">
          <div className="w-full md:w-[90%] max-w-3xl">
            <Routes>
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/history" element={<OrderHistory />} />
              <Route path="/stock/:ticker" element={<IndividualStock />} />
              <Route path="/players/:playerId" element={<Portfolio />} />
              {game.isGameAdmin && <Route path="/settings" element={<GameSettings />} />}
              <Route path="*" element={<Navigate replace to="/404" />} />
            </Routes>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

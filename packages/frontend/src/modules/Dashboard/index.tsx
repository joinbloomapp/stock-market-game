/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

// @ts-nocheck

import { createContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useMatch, useNavigate, useParams } from 'react-router-dom';
import LoadingScreen from '../../common/LoadingScreen';
import GameService from '../../services/Game';
import { Game } from '../../services/Game/types';
import Browse from './Browse';
import GameSettings from './GameSettings';
import IndividualStock from './IndividualStock';
import Leaderboard from './Leaderboard';
import OrderHistory from './OrderHistory';
import Portfolio from './Portfolio';
import Sidebar from './Sidebar';

interface IDashboardContext {
  game?: Partial<Game> | undefined;
  setGame: React.Dispatch<React.SetStateAction<Partial<Game> | undefined>>;
  loading: boolean;
}

export const DashboardContext = createContext<IDashboardContext>({
  game: undefined,
  setGame: () => {},
  loading: false,
});

export default function Dashboard() {
  let { inviteCode } = useParams();
  const navigate = useNavigate();
  const empty = useMatch('/dashboard/g/:inviteCode');
  const [game, setGame] = useState<Game>();
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen text-t-1 z-10 bg-purple-polka bg-cover bg-center bg-repeat pt-10 pb-4">
      <DashboardContext.Provider value={{ game, setGame, loading }}>
        <Sidebar />
        <div className="z-10 w-[760px] ml-[30vw]">
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
      </DashboardContext.Provider>
    </div>
  );
}

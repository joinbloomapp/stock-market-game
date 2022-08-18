/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useContext, useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { UserContext } from '../../../App';
import Loader from '../../../components/Loader';
import GameService from '../../../services/Game';
import { Game, GameStatus, PlayerPartial } from '../../../services/Game/types';
import Analytics from '../../../system/Analytics';
import { GameEvents } from '../../../system/Analytics/events/GameEvents';
import ArrayUtils from '../../../utils/ArrayUtils';
import AdminLobby from './AdminLobby';
import PlayerLobby from './PlayerLobby';

export default function Lobbies() {
  const [game, setGame] = useState<Game>();
  const [error, setError] = useState<string>('');
  const [players, setPlayers] = useState<PlayerPartial[]>([]);
  const intervalRef = useRef<NodeJS.Timer>();

  const { user } = useContext(UserContext);
  const { inviteCode } = useParams();

  const fetchPlayers = async (gameId?: string) => {
    const players = await GameService.getPlayerNames((gameId as string) || (game?.id as string));
    setPlayers(ArrayUtils.orEmptyArray(players));
  };

  const fetchData = async () => {
    try {
      const game = await GameService.getGameByInviteCode(inviteCode!);
      setGame(game);
      if (user && game?.userInGame) {
        await fetchPlayers(game?.id);
        // Poll for players every 10 seconds
        intervalRef.current = setInterval(async () => {
          if (user && game?.userInGame) {
            await fetchPlayers(game?.id);
          }
        }, 10000);
      }
    } catch (err) {
      setError('Game not found');
    }
  };

  useEffect(() => {
    fetchData();
    return () => clearInterval(intervalRef.current);
  }, []);

  const removePlayer = async (playerId: string) => {
    await GameService.removePlayer(game?.id as string, playerId);
    Analytics.track(GameEvents.KICK_PLAYER, { gameId: game?.id, inviteCode, playerId });
    await fetchData();
  };

  const joinGame = async () => {
    await GameService.addPlayerToGame(game?.id as string, inviteCode!);
    Analytics.track(GameEvents.JOIN_GAME_SUCCESS, { gameId: game?.id, inviteCode });
    await fetchData();
  };

  if (error && !game) {
    return <Navigate to="/404" replace />;
  }

  if (!game) {
    return <Loader />;
  }
  if (user && game?.userInGame) {
    if (game?.isGameAdmin) {
      // If user is admin of the game and they already started the game, push them to settings page
      if (game?.status !== GameStatus.NOT_STARTED) {
        return <Navigate to={`/dashboard/g/${inviteCode}/settings`} replace />;
      }
    } else {
      return <Navigate to={`/dashboard/g/${inviteCode}/portfolio`} replace />;
    }
  }

  return game.isGameAdmin ? (
    <AdminLobby game={game} players={players} removePlayer={removePlayer} />
  ) : (
    <PlayerLobby game={game} joinGame={joinGame} />
  );
}

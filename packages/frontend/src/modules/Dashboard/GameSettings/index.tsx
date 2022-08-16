/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '..';
import GameEditInfoCard from '../../../common/GameEditInfoCard';
import GameInfoCard from '../../../common/GameInfoCard';
import InvitePlayersCard from '../../../common/InvitePlayersCard';
import LeaderboardTable from '../../../common/LeaderboardTable';
import GameService from '../../../services/Game';
import { Game, GameStatus, Player } from '../../../services/Game/types';

export default function GameSettings() {
  const { game, setGame } = useContext(DashboardContext);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const fetchData = async () => {
    setLoading(true);

    const [newGame, players] = await Promise.allSettled([
      GameService.getGame(game?.id as string),
      GameService.getPlayers(game?.id as string),
    ]);
    // @ts-ignore
    setGame(newGame?.value);
    // @ts-ignore
    setPlayers(players?.value);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {game?.status !== GameStatus.FINISHED && (
        <InvitePlayersCard inviteCode={game?.inviteCode as string} />
      )}
      <div className="my-4">
        {game?.status !== GameStatus.NOT_STARTED ? (
          <GameInfoCard />
        ) : (
          <GameEditInfoCard game={game as Game} players={players} />
        )}
      </div>
      <LeaderboardTable players={players} loading={loading} />
    </div>
  );
}

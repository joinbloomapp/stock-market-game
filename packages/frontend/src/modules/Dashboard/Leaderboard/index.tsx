/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import cls from 'classnames';
import React, { LegacyRef, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DashboardContext } from '..';
import LeaderboardImage from '../../../assets/images/leaderboard.png';
import LeaderboardTable from '../../../common/LeaderboardTable';
import GameService from '../../../services/Game';
import { GameStatus, Player } from '../../../services/Game/types';
import StringUtils from '../../../utils/StringUtils';
import { setLeaderboardGraphicPositions } from './utils';

export default function Leaderboard() {
  const { game } = useContext(DashboardContext);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const leaderboardRef = useRef<HTMLDivElement>();
  const playerRefs = [useRef<HTMLDivElement>(), useRef<HTMLDivElement>(), useRef<HTMLDivElement>()];

  const fetchPlayers = async () => {
    setLoading(true);
    const [players] = await Promise.allSettled([GameService.getPlayers(game?.id as string)]);
    // @ts-ignore
    setPlayers(players?.value);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useLayoutEffect(() => {
    if (leaderboardRef.current) {
      setLeaderboardGraphicPositions(leaderboardRef, playerRefs);
    }
  }, [leaderboardRef.current, playerRefs]);

  const styles = [
    {
      container: 'items-center max-w-[200px] text-center',
      text: 'max-w-[200px]',
      dollar: 'max-w-[150px]',
    },
    {
      container: 'items-center max-w-[150px] text-center',
      text: 'max-w-[150px]',
      dollar: 'max-w-[100px]',
    },
    {
      container: 'items-start max-w-[150px] text-right',
      text: 'max-w-[150px]',
      dollar: 'max-w-[100px] ml-1',
    },
  ];

  return (
    <div>
      <div className="relative" ref={leaderboardRef as LegacyRef<HTMLDivElement> | undefined}>
        {game?.status !== GameStatus.NOT_STARTED &&
          players.slice(0, 3).map((p, i) => {
            return (
              <React.Fragment key={p.playerId}>
                <div
                  ref={playerRefs[i] as LegacyRef<HTMLDivElement> | undefined}
                  className={cls('flex flex-col absolute', styles[i].container)}
                >
                  <p
                    className={cls(
                      'text-2xl font-bold mb-8 -mt-4 text-ellipsis overflow-hidden whitespace-nowrap',
                      styles[i].text
                    )}
                  >
                    {p.name}
                  </p>
                  <div
                    key={p.playerId}
                    className={cls(
                      'flex items-center justify-center bg-a-1 text-t-1 py-1 px-2 pink-shadow-small rounded-lg font-medium text-ellipsis overflow-hidden whitespace-nowrap',
                      styles[i].dollar
                    )}
                  >
                    {StringUtils.USD(p.totalValue)}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        <img
          src={LeaderboardImage}
          alt="leaderboard graphic"
          width="800"
          height="570"
          className="mx-auto"
        />
      </div>
      <LeaderboardTable players={players} loading={loading} className="mt-0" />
    </div>
  );
}

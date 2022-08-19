/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Icon16DeleteOutline,
  Icon16MoreVertical,
  Icon24SearchOutline,
  Icon56UserAddOutline,
} from '@vkontakte/icons';
import cls from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { UserContext } from '../../App';
import Button, { ButtonType } from '../../components/Button';
import Dropdown from '../../components/Dropdown';
import Input, { InputHeight, InputStyle } from '../../components/Input';
import Loader from '../../components/Loader';
import { DashboardContext } from '../../modules/Dashboard';
import GameService from '../../services/Game';
import { Player } from '../../services/Game/types';
import Analytics from '../../system/Analytics';
import { GameEvents } from '../../system/Analytics/events/GameEvents';
import StringUtils from '../../utils/StringUtils';
import StyleUtils from '../../utils/StyleUtils';

interface ILeaderboardProps {
  className?: string;
  loading: boolean;
  players: Player[];
}

export default function LeaderboardTable({
  className,
  players = [],
  loading = false,
}: ILeaderboardProps) {
  const navigate = useNavigate();
  const { game } = useContext(DashboardContext);
  const [playerResults, setPlayerResults] = useState<Player[]>(players);
  const [query, setQuery] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    setPlayerResults(players);
  }, [players.length]);

  const removePlayer = async (playerId: string, leavingGame: boolean) => {
    await GameService.removePlayer(game?.id as string, playerId);
    Analytics.track(leavingGame ? GameEvents.LEAVE_GAME : GameEvents.KICK_PLAYER, {
      gameId: game?.id,
      inviteCode: game?.inviteCode,
      playerId,
    });
    navigate(`/game/${game?.inviteCode}`);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPlayerResults(
      players.filter((p) =>
        p.name.toLowerCase().trim().includes(e.target.value.toLowerCase().trim())
      )
    );
  };

  const renderDropdown = (p: Player) => {
    return (
      game?.isGameAdmin &&
      p?.userId !== user?.id && (
        <Dropdown
          menuBtn={<Icon16MoreVertical />}
          items={[
            {
              content: (
                <div className="flex items-center space-x-2">
                  <Icon16DeleteOutline className="-mt-1 text-u-negative" />
                  <p className="text-md">{game?.isGameAdmin ? 'Kick player' : 'Leave game'}</p>
                </div>
              ),
              onClick: (e) => removePlayer(p.playerId, p?.userId === user?.id),
            },
          ]}
        />
      )
    );
  };

  const viewPortfolio = (p: Player) => {
    Analytics.track(GameEvents.CLICKED_VIEW_PLAYER_PORTFOLIO, {
      gameId: game?.id,
      inviteCode: game?.inviteCode,
      isGameAdmin: game?.isGameAdmin,
      playerId: p?.playerId,
    });
    navigate(
      p.userId !== user?.id
        ? `/dashboard/g/${game?.inviteCode}/players/${p?.playerId}`
        : `/dashboard/g/${game?.inviteCode}/portfolio`
    );
  };

  return (
    <div className={twMerge('rounded-2xl bg-b-2 text-t-1 my-4 py-5 px-7', className)}>
      {!loading ? (
        <div>
          <div className="flex text-t-2">
            <div className="flex basis-64 text-t-1">
              <p>
                {playerResults.length || 'No'} player{playerResults.length !== 1 ? 's' : ''}{' '}
                {!players.length && 'yet'}
              </p>
            </div>
            <div className="flex basis-36 justify-center">
              <p className="text-md">Current value</p>
            </div>
            <div className="flex basis-48 justify-center">
              <p className="text-md">% Gain / Loss</p>
            </div>
            <div className="flex basis-64 space-x-2 justify-center">
              <Input
                name="player"
                type="text"
                inputStyle={InputStyle.Primary}
                inputHeight={InputHeight.Small}
                iconLeft={<Icon24SearchOutline className="mt-0.5" />}
                className="placeholder-t-2"
                value={query}
                onChange={onChange}
                autoComplete="off"
                placeholder="Search for a player..."
              />
            </div>
          </div>
          {players.length > 0 ? (
            <div className="flex flex-col space-y-2 mt-4 divide-y-0.5 divide-line-1">
              {playerResults.map((p, i) => (
                <div
                  key={p.name}
                  className="flex space-x-3 items-center w-full pb-4 pt-2 text-left"
                >
                  <div className="flex basis-64 items-center space-x-4">
                    <div className="flex justify-center items-center rounded-full w-11 h-11 bg-b-1">
                      #{p.rank}
                    </div>
                    <p className="font-medium">
                      {p.userId === user?.id ? user.name : p.name}
                      {p.userId === user?.id ? ' (you)' : ''}
                      {p.isGameAdmin && <span className="ml-2">&#128081;</span>}
                    </p>
                  </div>
                  <div className="flex basis-36 items-center rounded-xl p-3">
                    {StringUtils.USD(p.totalValue)}
                  </div>
                  <div
                    className={cls(
                      'flex basis-36 justify-center',
                      StyleUtils.getChangeStyle(p?.totalChangePercent || 0)
                    )}
                  >
                    {StringUtils.signNumber((p?.totalChangePercent || 0) / 100, 'percent')}
                  </div>
                  <div className="flex justify-between items-center basis-64 space-x-4">
                    <Button
                      shadow
                      type={ButtonType.Secondary}
                      className="h-10"
                      onClick={() => viewPortfolio(p)}
                    >
                      View portfolio
                    </Button>
                    {renderDropdown(p)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col h-full justify-center items-center text-t-3 min-h-[360px]">
              <Icon56UserAddOutline className="mx-auto" />
              <p>Your joined players will show up here</p>
            </div>
          )}
        </div>
      ) : (
        <Loader className="mx-auto" />
      )}
    </div>
  );
}

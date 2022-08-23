/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Icon16Chevron,
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

  const renderListItem = (p: Player, index: number) => {
    const viewPortfolio = () => {
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
      <button
        onClick={viewPortfolio}
        key={p?.playerId}
        className="flex justify-between items-center text-t-1 py-4 text-left hover:bg-b-3 hover:rounded-2xl md:px-4"
      >
        <div className="flex space-x-4 w-full">
          <div className="flex flex-shrink-0 justify-center items-center rounded-full w-11 h-11 bg-b-1">
            #{p.rank}
          </div>
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-md md:text-lg">
                {p.userId === user?.id ? user.name : p.name}
                {p.userId === user?.id ? ' (you)' : ''}
                {p.rank === 1 && <span className="ml-2">&#128081;</span>}
              </p>
              {p.isGameAdmin && <p className="text-t-2 text-sm">Game admin</p>}
            </div>
            <div className="text-right">
              <p className={cls(StyleUtils.getChangeStyle(p?.totalChangePercent || 0))}>
                {StringUtils.signNumber((p?.totalChangePercent || 0) / 100, 'percent')}
              </p>
              <p className="text-sm text-t-2">{StringUtils.USD(p.totalValue)}</p>
            </div>
          </div>
          <div className="flex justify-center items-center text-t-3">
            <Icon16Chevron />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="rounded-2xl bg-b-2 text-t-1 my-4 py-5 px-4 md:px-7">
      <div className="flex justify-between">
        <p className="text-t-1 text-lg mb-2">
          {playerResults.length || 'No'} player{playerResults.length !== 1 ? 's' : ''}{' '}
          {!players.length && 'yet'}
        </p>
        <Input
          name="player"
          type="text"
          inputStyle={InputStyle.Primary}
          inputHeight={InputHeight.Small}
          iconLeft={<Icon24SearchOutline className="mt-0.5" />}
          className=" placeholder-t-2"
          value={query}
          onChange={onChange}
          autoComplete="off"
          placeholder="Search a player..."
        />
      </div>

      <div>
        {!loading ? (
          <div className="flex flex-col">{playerResults.map(renderListItem)}</div>
        ) : (
          <Loader className="mx-auto" />
        )}
      </div>
    </div>
  );
}

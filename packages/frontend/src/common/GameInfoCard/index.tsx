/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import dayjs from 'dayjs';
import { useContext, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import Button, { ButtonType } from '../../components/Button';
import CountdownTimer from '../../components/CountdownTimer';
import { DashboardContext } from '../../modules/Dashboard';
import GameService from '../../services/Game';
import { GameStatus } from '../../services/Game/types';
import Analytics from '../../system/Analytics';
import { GameEvents } from '../../system/Analytics/events/GameEvents';
import StringUtils from '../../utils/StringUtils';
import ConfirmModal from '../ConfirmModal';

export default function GameInfoCard() {
  const navigate = useNavigate();
  const { game, setGame } = useContext(DashboardContext);
  const [open, setOpen] = useState(false);

  const fetchGame = async () => {
    const newGame = await GameService.getGame(game?.id as string);
    setGame(newGame);
  };

  const endGame = async () => {
    await GameService.endGame(game?.id as string);
    Analytics.track(GameEvents.END_GAME, {
      gameId: game?.id,
      inviteCode: game?.inviteCode,
    });
    fetchGame();
  };

  const leaveGame = async () => {
    await GameService.removePlayer(game?.id as string, game?.playerId as string);
    Analytics.track(GameEvents.LEAVE_GAME, {
      gameId: game?.id,
      inviteCode: game?.inviteCode,
      playerId: game?.playerId,
    });
    navigate(`/game/${game?.inviteCode}`);
  };

  const showEndGameButton =
    (game?.isGameAdmin && game?.status === GameStatus.ACTIVE) || !game?.isGameAdmin;

  return (
    <div className="rounded-2xl bg-b-2 text-t-1 py-5 px-4 md:px-7">
      <div className="flex justify-between">
        <p>Game information</p>
        {showEndGameButton && (
          <Button
            shadow
            type={ButtonType.Secondary}
            className="w-42 h-8 text-u-negative"
            onClick={() => setOpen(true)}
          >
            {game?.isGameAdmin ? 'End game' : 'Leave game'}
          </Button>
        )}
      </div>
      <div className="divide-y-0.5 divide-line-1">
        <div className="flex py-4 space-x-16">
          <div>
            <p className="text-t-2 text-md md:text-lg">Name</p>
            <h6 className="font-semibold text-md md:text-lg">{game?.name}</h6>
          </div>
        </div>
        <div className="py-4">
          <p className="text-t-2 text-md md:text-lg">Starting buying power</p>
          <h6 className="font-semibold text-md md:text-lg">
            {StringUtils.USD(game?.defaultBuyingPower || 0)}
          </h6>
        </div>
        <div className="py-4 flex flex-wrap items-center md:space-x-4 divide-y-0.5 md:divide-y-0 divide-line-1">
          <div className="w-full md:w-auto pb-4 md:pb-0">
            <p className="text-t-2 text-md md:text-lg">Start date</p>
            <h6 className="font-semibold text-md md:text-lg">
              {game?.status === GameStatus.NOT_STARTED
                ? 'Game not started yet'
                : dayjs(game?.startAt).local().format('MMM D, YYYY, h:mm A')}
            </h6>
          </div>
          <div className="w-1/6 h-[1px] bg-line-1 hidden md:block" />
          <div className="w-full md:w-auto pt-4 md:pt-0">
            <p className="text-t-2 text-md md:text-lg">End date</p>
            <h6 className="font-semibold text-md md:text-lg">
              {dayjs(game?.endAt).local().format('MMM D, YYYY, h:mm A')}
            </h6>
          </div>
        </div>
        {game?.status === GameStatus.ACTIVE && (
          <div className="py-4">
            <p className="text-t-2 text-md md:text-lg">Ends in</p>
            <h6 className="font-semibold text-md md:text-lg">
              <CountdownTimer targetDate={new Date(game?.endAt as string)} onExpire={fetchGame} />
            </h6>
          </div>
        )}
      </div>
      {showEndGameButton && (
        <ConfirmModal
          text={`Are you sure you want to ${game?.isGameAdmin ? 'end' : 'leave'} the game?`}
          onConfirm={game?.isGameAdmin ? endGame : leaveGame}
          open={open}
          setOpen={setOpen}
        />
      )}
    </div>
  );
}

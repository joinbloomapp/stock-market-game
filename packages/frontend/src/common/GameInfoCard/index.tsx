/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import dayjs from 'dayjs';
import { useContext, useState } from 'react';
import { useMatch } from 'react-router-dom';
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
  const portfolio = useMatch('/dashboard/g/:inviteCode/portfolio');
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

  const showEndGameButton = game?.isGameAdmin && game?.status === GameStatus.ACTIVE;

  return (
    <div className="rounded-2xl bg-b-2 text-t-1 py-5 px-7">
      <div className="flex justify-between">
        <p>Game information</p>
        {showEndGameButton && (
          <Button
            shadow
            type={ButtonType.Secondary}
            className="w-42 h-8 text-u-negative"
            onClick={() => setOpen(true)}
          >
            End game
          </Button>
        )}
      </div>
      <div className="divide-y-0.5 divide-line-1">
        <div className="flex py-4 space-x-16">
          <div>
            <p className="text-t-2">Name</p>
            <h6 className="font-semibold">{game?.name}</h6>
          </div>
        </div>
        <div className="py-4">
          <p className="text-t-2">Starting buying power</p>
          <h6 className="font-semibold">{StringUtils.USD(game?.defaultBuyingPower || 0)}</h6>
        </div>
        <div className="py-4 flex items-center space-x-4">
          <div>
            <p className="text-t-2">Start date</p>
            <h6 className="font-semibold">
              {game?.status === GameStatus.NOT_STARTED
                ? 'Game not started yet'
                : dayjs(game?.startAt).local().format('MMM D, YYYY, h:mm A')}
            </h6>
          </div>
          <div className="w-1/6 h-[1px] bg-line-1"></div>
          <div>
            <p className="text-t-2">End date</p>
            <h6 className="font-semibold">
              {dayjs(game?.endAt).local().format('MMM D, YYYY, h:mm A')}
            </h6>
          </div>
        </div>
        {game?.status === GameStatus.ACTIVE && (
          <div className="py-4">
            <p className="text-t-2">Ends in</p>
            <h6 className="font-semibold">
              <CountdownTimer targetDate={new Date(game?.endAt as string)} onExpire={fetchGame} />
            </h6>
          </div>
        )}
      </div>
      {showEndGameButton && (
        <ConfirmModal
          text="Are you sure you want to end the game?"
          onConfirm={endGame}
          open={open}
          setOpen={setOpen}
        />
      )}
    </div>
  );
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import cls from 'classnames';
import { useContext, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button, { ButtonType } from '../../components/Button';
import DateTimePicker from '../../components/DateTimePicker';
import Input, { InputHeight, InputStyle } from '../../components/Input';
import Loader from '../../components/Loader';
import { DashboardContext } from '../../modules/Dashboard';
import GameService from '../../services/Game';
import { Game, Player } from '../../services/Game/types';
import Analytics from '../../system/Analytics';
import { GameEvents } from '../../system/Analytics/events/GameEvents';

interface IGameEditInfoCardProps {
  game: Game;
  players: Player[];
}

interface IEditDataProps {
  newDefaultBuyingPower?: number;
  newName?: string;
  newEndAt?: Date;
}

export default function GameEditInfoCard({ game, players = [] }: IGameEditInfoCardProps) {
  const dashboardContext = useContext(DashboardContext);
  const navigate = useNavigate();
  const [name, setName] = useState(game.name);
  const [endAt, setEndAt] = useState(new Date(game.endAt));
  const [defaultBuyingPower, setDefaultBuyingPower] = useState(game.defaultBuyingPower);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const saveData = async ({
    newDefaultBuyingPower = defaultBuyingPower,
    newName = name,
    newEndAt = endAt,
  }: IEditDataProps) => {
    if (newDefaultBuyingPower > 50000) {
      setSaved(false);
      setError('Default buying power must be less than or equal to $50,000');
      setLoading(false);
      return;
    }

    if (newDefaultBuyingPower <= 0) {
      setSaved(false);
      setError('Default buying power must be greater than $0');
      setLoading(false);
      return;
    }

    try {
      await GameService.updateGame(game?.id, {
        name: newName,
        endAt: newEndAt?.toISOString(),
        defaultBuyingPower: newDefaultBuyingPower,
      });

      Analytics.track(GameEvents.UPDATE_GAME_SUCCESS, {
        gameId: game?.id,
        inviteCode: game?.inviteCode,
        defaultBuyingPower: newDefaultBuyingPower,
        name: newName,
        endAt: newEndAt,
      });

      setSaved(true);
    } catch (error) {
      Analytics.track(GameEvents.UPDATE_GAME_ERROR, {
        // @ts-ignore
        error: error?.response?.data?.message || error?.message,
      });
      setError('Unable to save!');
    }

    setLoading(false);
  };

  const startGame = async () => {
    if (!error) {
      await GameService.startGame(game?.id as string);
      Analytics.track(GameEvents.START_GAME, {
        gameId: game?.id,
        inviteCode: game?.inviteCode,
      });
      if (dashboardContext?.game) {
        // Refresh game with new updated game once game is started from game settings page
        const newGame = await GameService.getGame(game?.id as string);
        dashboardContext.setGame(newGame);
      }
      navigate(`/dashboard/g/${game?.inviteCode}/portfolio`);
    }
  };

  return (
    <>
      <div className="bg-b-2 w-full rounded-xl rounded-t-xl p-8">
        <div className="flex">
          <p>Game information</p>
          <p
            className={cls('text-sm ml-10 mt-1', {
              'text-u-negative': error,
              'text-gray-400': !error,
            })}
          >
            {saved && 'Saved!'}
            {error}
            {loading && <Loader />}
          </p>
        </div>
        <div className="flex flex-col space-y-3 my-6">
          <Input
            name="name"
            type="text"
            label="GAME NAME"
            inputStyle={InputStyle.Primary}
            inputHeight={InputHeight.Medium}
            value={name}
            onChange={(e) => {
              setSaved(false);
              setError('');
              setLoading(true);
              setName(e.target.value);
              Analytics.track(GameEvents.EDIT_GAME_DETAILS, {
                gameId: game?.id,
                inviteCode: game?.inviteCode,
                name,
              });
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = setTimeout(() => saveData({ newName: e.target.value }), 500);
            }}
            required
          />
          <DateTimePicker
            value={endAt}
            onChange={async (value) => {
              setSaved(false);
              setError('');
              setEndAt(value);
              Analytics.track(GameEvents.EDIT_GAME_DETAILS, {
                gameId: game?.id,
                inviteCode: game?.inviteCode,
                endAt,
              });
              setLoading(true);
              await saveData({ newEndAt: value });
            }}
            minDate={new Date(new Date().getTime() + 1)}
            label="END DATE AND TIME"
            required
          />
          <Input
            name="defaultBuyingPower"
            type="number"
            label="STARTING BUYING POWER"
            inputStyle={InputStyle.Primary}
            inputHeight={InputHeight.Medium}
            value={defaultBuyingPower}
            onChange={(e) => {
              setSaved(false);
              setError('');
              setLoading(true);
              setDefaultBuyingPower(Number(e.target.value));
              Analytics.track(GameEvents.EDIT_GAME_DETAILS, {
                gameId: game?.id,
                inviteCode: game?.inviteCode,
                defaultBuyingPower,
              });
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = setTimeout(
                () => saveData({ newDefaultBuyingPower: Number(e.target.value) }),
                500
              );
            }}
            required
          />
        </div>
        <Button
          shadow
          type={ButtonType.Primary}
          disabled={players.length === 0 || defaultBuyingPower <= 0 || defaultBuyingPower > 50000}
          onClick={startGame}
          className="w-full"
        >
          {players.length > 0 ? 'Start the game' : 'Invite players to start the game'}
        </Button>
        {!dashboardContext?.game && (
          <p className="mt-8 text-t-2 text-center text-md">
            Waiting for players to join? Check out the{' '}
            <Link
              to={`/dashboard/g/${game?.inviteCode}/portfolio`}
              className="text-t-1 underline underline-offset-4"
            >
              dashboard
            </Link>{' '}
            meanwhile
          </p>
        )}
      </div>
    </>
  );
}

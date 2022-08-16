/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button, { ButtonType } from '../../../components/Button';
import DateTimePicker from '../../../components/DateTimePicker';
import Input, { InputHeight, InputStyle } from '../../../components/Input';
import Loader from '../../../components/Loader';
import GameService from '../../../services/Game';
import Analytics from '../../../system/Analytics';
import { GameEvents } from '../../../system/Analytics/events/GameEvents';

export default function CreateGame() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [defaultBuyingPower, setDefaultBuyingPower] = useState(500);
  const [endAt, setEndAt] = useState(
    dayjs().add(3, 'days').set('hours', 23).set('minutes', 59).toDate()
  );
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (endAt <= new Date()) {
      setError('End date must be in the future');
      return;
    }

    const body = {
      name,
      endAt: endAt.toISOString(),
      defaultBuyingPower,
    };

    try {
      const game = await GameService.createGame(body);
      Analytics.track(GameEvents.CREATE_GAME_SUCCESS, game);
      navigate(`/game/${game.inviteCode}`);
    } catch (error) {
      Analytics.track(GameEvents.CREATE_GAME_ERROR, {
        ...body,
        // @ts-ignore
        error: error?.response?.data?.message || error?.message,
      });
      setError('Game could not be created');
    }

    setLoading(false);
  };

  return (
    <div className="bg-b-2 w-[482px] rounded-xl text-center p-12 my-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Create a game?</h1>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-3">
            <Input
              name="name"
              type="text"
              label="GAME NAME"
              inputStyle={InputStyle.Primary}
              inputHeight={InputHeight.Medium}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
            <DateTimePicker
              value={endAt}
              onChange={setEndAt}
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
                if (Number(e.target.value) > 50000) {
                  setError('Default buying power must be less than or equal to $50,000');
                } else if (Number(e.target.value) <= 0) {
                  setError('Default buying power must be greater than $0');
                } else {
                  setError('');
                }

                setDefaultBuyingPower(Number(e.target.value));
              }}
              required
            />
          </div>
          {error && <p className="text-u-negative text-left mt-4 text-md">{error}</p>}
          <Button
            shadow
            loading={loading}
            type={ButtonType.Primary}
            className="w-full mt-4"
            disabled={loading || defaultBuyingPower <= 0 || defaultBuyingPower > 50000}
          >
            Create the game
          </Button>
        </form>
      </div>
    </div>
  );
}

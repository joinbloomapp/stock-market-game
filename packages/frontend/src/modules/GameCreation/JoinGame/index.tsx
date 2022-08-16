/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button, { ButtonType } from '../../../components/Button';
import Input, { InputHeight, InputStyle } from '../../../components/Input';
import Loader from '../../../components/Loader';
import GameService from '../../../services/Game';
import Analytics from '../../../system/Analytics';
import { OnboardingEvents } from '../../../system/Analytics/events/OnboardingEvents';

const INVITE_CODE_LENGTH = 6;

export default function JoinGame() {
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!inviteCode) {
      setError('Enter invite code');
      setLoading(false);
      return;
    }

    try {
      await GameService.getGameByInviteCode(inviteCode!);
      Analytics.track(OnboardingEvents.ENTERED_INVITE_CODE, { inviteCode });
      navigate(`/game/${inviteCode}`);
    } catch (error) {
      setError("This code doesn't exist");
    }

    setLoading(false);
  };

  const disabled = (inviteCode.length > 0 && inviteCode.length < INVITE_CODE_LENGTH) || loading;

  return (
    <>
      <div className="absolute bottom-8 text-center w-[482px] text-t-1">
        <Link
          to="/game/create"
          className="text-t-1 underline underline-offset-2"
          onClick={() => Analytics.track(OnboardingEvents.CLICKED_CREATE_GAME)}
        >
          Create a game
        </Link>
      </div>
      <div className="bg-b-2 w-[482px] h-min rounded-xl text-center p-12 absolute-vertical-center">
        <div className="flex flex-col space-y-8 h-full">
          <h1 className="text-2xl font-bold">Join a game</h1>
          <form className="space-y-10" onSubmit={onSubmit}>
            <Input
              name="inviteCode"
              type="text"
              inputStyle={InputStyle.Primary}
              value={inviteCode}
              onFocus={() => setError('')}
              onChange={(e) => {
                if (e.target.value?.length <= INVITE_CODE_LENGTH) {
                  setInviteCode(e.target.value);
                }
              }}
              inputHeight={InputHeight.Large}
              className="text-center uppercase placeholder:normal-case"
              placeholder="Enter your invite code..."
            />
            <Button
              loading={loading}
              disabled={disabled}
              shadow
              type={ButtonType.Primary}
              className="w-full"
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
      {error && <p className="absolute bottom-48 text-u-negative text-center text-md">{error}</p>}
    </>
  );
}

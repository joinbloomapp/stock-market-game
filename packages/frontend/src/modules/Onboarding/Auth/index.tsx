/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon24ArrowLeftOutline } from '@vkontakte/icons';
import React, { useContext, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../../App';
import Badge from '../../../components/Badge';
import Button, { ButtonType } from '../../../components/Button';
import Input, { InputHeight, InputStyle } from '../../../components/Input';
import Loader from '../../../components/Loader';
import AuthService from '../../../services/Auth';
import GameService from '../../../services/Game';
import UserService from '../../../services/User';
import Analytics from '../../../system/Analytics';
import { GameEvents } from '../../../system/Analytics/events/GameEvents';
import { OnboardingEvents } from '../../../system/Analytics/events/OnboardingEvents';
import { useOnboardingStore } from '../store';

const NUM_STEPS = 2;

export default function Auth() {
  const onboarding = useOnboardingStore((state) => state.onboarding);
  const updateOnboarding = useOnboardingStore((state) => state.updateOnboarding);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { setUser } = useContext(UserContext);
  let { step } = useParams();
  const navigate = useNavigate();

  if (!['1', '2'].includes(step as string)) {
    return <Navigate to="/404" />;
  }

  const stepInt = Number(step);

  if (stepInt === 2 && (!onboarding.email || !onboarding.password)) {
    return <Navigate to="/login" replace />;
  }

  const inviteCode = searchParams.get('inviteCode');

  /**
   * @returns whether user account exists
   */
  const attemptLogin = async (): Promise<boolean | undefined> => {
    let ok;
    let code;

    const body = {
      email: onboarding.email,
      password: onboarding.password,
    };

    const incorrectPassMessage = 'Incorrect password';

    try {
      // Try to login first
      ok = await AuthService.login(body);
      code = 200;
    } catch (error) {
      // @ts-ignore
      code = error.response.status;
      if (code !== 406) {
        // Only if email does exist in the db, log an error
        Analytics.track(OnboardingEvents.LOGIN_ERROR, {
          error:
            (code === 403 && incorrectPassMessage) ||
            // @ts-ignore
            error?.response?.data?.message ||
            // @ts-ignore
            error?.message,
          code,
        });
      }
    }

    if (ok) {
      // If user has already signed up and just logged in
      Analytics.track(OnboardingEvents.LOGIN_SUCCESS, body);
      const curUser = await UserService.getUser();
      Analytics.identify(curUser?.id, curUser);
      if (!inviteCode) {
        navigate('/dashboard/g', { replace: true });
        setUser(curUser);
        return;
      }
      await joinGame();
      setUser(curUser);
    } else if (code === 403) {
      // Email exists, but incorrect password
      setError(incorrectPassMessage);
    }

    return code === 403 || !!ok;
  };

  const joinGame = async () => {
    let ok;

    try {
      const game = await GameService.getGameByInviteCode(inviteCode as string);
      await GameService.addPlayerToGame(game?.id as string, inviteCode as string);
      Analytics.track(GameEvents.JOIN_GAME_SUCCESS, game);
      ok = true;
    } catch (error) {
      setError('Could not join game');
    }

    if (ok) {
      navigate(`/dashboard/g/${inviteCode}/portfolio`, { replace: true });
    }
  };

  const signup = async () => {
    let ok;

    try {
      await AuthService.signup(onboarding);
      ok = true;
    } catch (error) {
      Analytics.track(OnboardingEvents.SIGNUP_ERROR, {
        inviteCode,
        ...onboarding,
        // @ts-ignore
        error: error?.response?.data?.message || error?.message,
      });
      setError('Unable to sign up');
    }

    if (ok) {
      Analytics.track(OnboardingEvents.SIGNUP_SUCCESS, { inviteCode, ...onboarding });
      const curUser = await UserService.getUser();
      Analytics.identify(curUser.id, curUser);
      if (!inviteCode) {
        // If the user wants to create a game, then they are pushed to the create game screen
        navigate('/game/create', { replace: true });
        setUser(curUser);
        return;
      }
      await joinGame();
      setUser(curUser);
    }
  };

  const goToNextStep = () => {
    // Go to next step
    const search = inviteCode ? `?inviteCode=${inviteCode}` : '';
    Analytics.track(OnboardingEvents.SIGNUP_STEP_TO, { stepTo: stepInt + 1 });
    navigate(`/start/${stepInt + 1}${search}`);
  };

  const goBack = () => {
    // Go back a step
    const search = inviteCode ? `?inviteCode=${inviteCode}` : '';
    Analytics.track(OnboardingEvents.SIGNUP_STEP_TO, { stepTo: stepInt - 1 });
    navigate(`/start/${stepInt - 1}${search}`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (stepInt === 1) {
      // Try logging in on first step
      const userExists = await attemptLogin();
      if (userExists) {
        setLoading(false);
        return;
      }
    }

    if (stepInt < NUM_STEPS) {
      goToNextStep();
      setLoading(false);
      return;
    }

    await signup();
    setLoading(false);
  };

  const onChangeOnboarding = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }
    // if (e.target.name === 'password') {
    //   if (!StringUtils.isValidPassword(e.target.value)) {
    //     setError('Password too weak');
    //   }
    // }
    updateOnboarding({ [e.target.name]: e.target.value });
  };

  const Step1 = () => {
    return (
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Sign up/Log in {inviteCode && 'to join'}</h1>
        {inviteCode && <Badge className="w-48">Game {inviteCode}</Badge>}
        <div className="flex flex-col space-y-3">
          <Input
            name="email"
            type="email"
            inputStyle={InputStyle.Primary}
            inputHeight={InputHeight.Medium}
            value={onboarding.email}
            onChange={onChangeOnboarding}
            autoFocus
            placeholder="What's your email?"
            required
          />
          <Input
            name="password"
            type="password"
            inputStyle={InputStyle.Primary}
            inputHeight={InputHeight.Medium}
            onChange={onChangeOnboarding}
            value={onboarding.password}
            placeholder="Enter password"
            required
          />
          <p className="text-u-negative text-left text-md">{error}</p>
        </div>
        <Button
          type={ButtonType.Link}
          className="text-t-2 mr-auto"
          buttonType="button"
          onClick={() => {
            Analytics.track(OnboardingEvents.CLICKED_FORGOT_PASSWORD);
            navigate('/password/forgot');
          }}
        >
          Forgot password?
        </Button>
        <div className="flex flex-col">
          <Button
            shadow
            loading={loading}
            type={ButtonType.Primary}
            className="w-full"
            disabled={!!error || loading}
          >
            Continue
          </Button>
          {/* <div className="flex">
            <div className="flex-1 h-0.5 bg-b-2 mr-3 mt-3"></div>
            <div className="flex-0 text-t-3">OR</div>
            <div className="flex-1 h-0.5 bg-b-2 ml-3 mt-3"></div>
          </div>
          <Button shadow type={ButtonType.Secondary} iconImage={GoogleIcon} onClick={handleSubmit}>
            Continue with Google
          </Button> */}
        </div>
      </div>
    );
  };

  const Step2 = () => {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <Button
            type={ButtonType.IconButton}
            className="w-6 h-6 text-t-3"
            onClick={goBack}
            buttonType="button"
          >
            <Icon24ArrowLeftOutline />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">What's your name?</h1>
            {inviteCode && <Badge className="w-48 mt-2">Game {inviteCode}</Badge>}
          </div>
          <div className="w-12"></div>
        </div>
        <div className="flex flex-col space-y-3">
          <Input
            name="firstName"
            type="text"
            inputStyle={InputStyle.Primary}
            inputHeight={InputHeight.Medium}
            value={onboarding.firstName}
            onChange={onChangeOnboarding}
            autoFocus
            placeholder="First name"
            required
          />
          <Input
            name="lastName"
            type="text"
            inputStyle={InputStyle.Primary}
            inputHeight={InputHeight.Medium}
            value={onboarding.lastName}
            onChange={onChangeOnboarding}
            placeholder="Last name"
            required
          />
          <p className="text-u-negative text-left text-md">{error}</p>
        </div>
        <Button
          shadow
          loading={loading}
          type={ButtonType.Primary}
          className="w-full"
          disabled={!!error || loading}
        >
          {inviteCode ? 'Join game' : 'Sign up'}
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="absolute bottom-12 text-center w-[482px] text-t-1">
        <Link
          to={inviteCode ? '/game/create' : '/game/join'}
          className="text-t-1 underline underline-offset-2"
          onClick={() =>
            inviteCode
              ? Analytics.track(OnboardingEvents.CLICKED_CREATE_GAME)
              : Analytics.track(OnboardingEvents.CLICKED_JOIN_GAME)
          }
        >
          {inviteCode ? 'Create a game' : 'Join a game'}
        </Link>
      </div>
      <div className="bg-b-2 w-[482px] h-min rounded-xl text-center p-12 absolute-vertical-center">
        <div className="flex flex-col justify-between h-full space-y-10">
          <form onSubmit={onSubmit} className="w-full flex flex-col space-y-4">
            {stepInt === 1 && Step1()}
            {stepInt === 2 && Step2()}
          </form>
        </div>
      </div>
    </>
  );
}

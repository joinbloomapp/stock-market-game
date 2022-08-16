/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import _ from 'lodash';
import { useContext, useState } from 'react';
import { Link, useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../App';
import Badge from '../../components/Badge';
import Button, { ButtonType } from '../../components/Button';
import Input, { InputHeight, InputStyle } from '../../components/Input';
import AuthService from '../../services/Auth';
import GameService from '../../services/Game';
import UserService from '../../services/User';
import Analytics from '../../system/Analytics';
import { GameEvents } from '../../system/Analytics/events/GameEvents';
import { OnboardingEvents } from '../../system/Analytics/events/OnboardingEvents';
import Header from '../Header';

export default function Onboarding() {
  const isLogin = useMatch('/login');
  const isSignup = useMatch('/start');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { setUser } = useContext(UserContext);
  const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };
  const [{ firstName, lastName, email, password }, setFormValues] = useState(initialState);
  const navigate = useNavigate();
  const inviteCode = searchParams.get('inviteCode');
  const createGame = searchParams.get('create');

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

  /**
   * @returns whether user account exists
   */
  const login = async (): Promise<boolean | undefined> => {
    let ok;
    let code;

    const body = {
      email,
      password,
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
      let redirect = '/dashboard/g';
      if (createGame) {
        redirect = `/game/create`;
      } else if (inviteCode) {
        await joinGame();
        setUser(curUser);
        return;
      }
      navigate(redirect, { replace: true });
      setUser(curUser);
    } else if (code === 403) {
      // Email exists, but incorrect password
      setError(incorrectPassMessage);
    }
  };

  const signup = async () => {
    let ok;

    const body = {
      firstName,
      lastName,
      email,
      password,
    };

    try {
      await AuthService.signup(body);
      ok = true;
    } catch (error) {
      Analytics.track(OnboardingEvents.SIGNUP_ERROR, {
        inviteCode,
        ..._.omit(body, 'password'),
        // @ts-ignore
        error: error?.response?.data?.message || error?.message,
      });
      setError('Unable to sign up');
    }

    if (ok) {
      Analytics.track(OnboardingEvents.SIGNUP_SUCCESS, { inviteCode, ..._.omit(body, 'password') });
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      await login();
    } else {
      await signup();
    }

    setLoading(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({ ...prevState, [name]: value }));
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-polka bg-center bg-cover h-screen">
      <Header />
      <div className="flex justify-center text-t-1 mt-16 px-2 md:px-16 lg:px-24">
        <div className="absolute bottom-12 text-center w-[482px] text-t-1">
          {isSignup ? 'Already have an account? ' : "Don't have an account yet? "}
          <Link
            to={isSignup ? '/login' : '/start'}
            className="text-t-1 underline underline-offset-4"
            onClick={() =>
              isSignup
                ? Analytics.track(OnboardingEvents.CLICKED_CREATE_GAME)
                : Analytics.track(OnboardingEvents.CLICKED_JOIN_GAME)
            }
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
          {createGame ? ' to create game' : ''}
        </div>
        <div className="bg-b-2 w-[482px] h-min rounded-xl text-center p-12 absolute-vertical-center">
          <div className="flex flex-col justify-between h-full space-y-10">
            <form onSubmit={onSubmit} className="w-full flex flex-col space-y-4">
              <div className="flex flex-col space-y-4">
                <h1 className="text-2xl font-bold">
                  {isLogin ? 'Log in' : 'Create an account'}
                  {inviteCode && ' to join'}
                </h1>
                {inviteCode && <Badge className="w-48">Game {inviteCode}</Badge>}
                <div className="flex flex-col space-y-3">
                  <Input
                    name="email"
                    type="email"
                    inputStyle={InputStyle.Primary}
                    inputHeight={InputHeight.Medium}
                    value={email}
                    onChange={onChange}
                    autoFocus
                    placeholder="What's your email?"
                    required
                  />
                  {isSignup && (
                    <>
                      <Input
                        name="firstName"
                        type="text"
                        inputStyle={InputStyle.Primary}
                        inputHeight={InputHeight.Medium}
                        value={firstName}
                        onChange={onChange}
                        autoFocus
                        placeholder="First name"
                        required
                      />
                      <Input
                        name="lastName"
                        type="text"
                        inputStyle={InputStyle.Primary}
                        inputHeight={InputHeight.Medium}
                        value={lastName}
                        onChange={onChange}
                        placeholder="Last name"
                        required
                      />
                    </>
                  )}
                  <Input
                    name="password"
                    type="password"
                    inputStyle={InputStyle.Primary}
                    inputHeight={InputHeight.Medium}
                    onChange={onChange}
                    value={password}
                    placeholder="Enter password"
                    required
                  />
                  <p className="text-u-negative text-left text-md">{error}</p>
                </div>
                {isLogin && (
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
                )}
                <div className="flex flex-col">
                  <Button
                    shadow
                    loading={loading}
                    type={ButtonType.Primary}
                    className="w-full"
                    disabled={!!error || loading}
                  >
                    {inviteCode ? 'Join game' : isLogin ? 'Log in' : 'Sign up'}
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

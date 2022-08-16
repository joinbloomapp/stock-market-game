/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import dayjs from 'dayjs';
import { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../../../App';
import Button, { ButtonType } from '../../../../components/Button';
import DictTable from '../../../../components/DictTable';
import { Game, GameStatus } from '../../../../services/Game/types';
import Analytics from '../../../../system/Analytics';
import { OnboardingEvents } from '../../../../system/Analytics/events/OnboardingEvents';
import StringUtils from '../../../../utils/StringUtils';

interface IPlayerLobbyProps {
  game: Game;
  joinGame: () => Promise<void>;
}

export default function PlayerLobby({ game, joinGame }: IPlayerLobbyProps) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const { inviteCode } = useParams();

  const join = async () => {
    if (user) {
      await joinGame();
      navigate(`/dashboard/g/${inviteCode}/portfolio`);
    } else {
      Analytics.track(OnboardingEvents.CLICKED_SIGNUP_WITH_INVITE_CODE, { inviteCode });
      navigate(`/start?inviteCode=${inviteCode}`);
    }
  };

  const tableColumns = [
    [
      {
        key: game?.status === GameStatus.FINISHED ? 'Ended on' : 'End date',
        value: dayjs(game.endAt).local().format('MMM D, YYYY, h:mm A'),
      },
      {
        key: 'Default buying power',
        value: StringUtils.USD(game.defaultBuyingPower),
      },
    ],
  ];

  if (game?.status === GameStatus.ACTIVE) {
    tableColumns[0].unshift({
      key: 'Started on',
      value: dayjs(game?.startAt).local().format('MMM D, YYYY, h:mm A'),
    });
  }

  return (
    <div className="bg-b-2 w-[482px] rounded-xl text-center p-12 my-8">
      <h5 className="font-bold">{game.name}</h5>
      <p className="text-t-3 my-4">Created by {game.admins[0].name}</p>
      <DictTable columns={tableColumns} classNames={{ container: 'bg-b-3 px-3' }} />
      <Button
        shadow
        type={ButtonType.Primary}
        onClick={join}
        className="w-full mt-4"
        disabled={game?.status === GameStatus.FINISHED}
      >
        {game?.status === GameStatus.FINISHED
          ? 'Game over'
          : user
          ? `Join the game as ${user.firstName}`
          : 'Sign up/Log in to join the game'}
      </Button>
    </div>
  );
}

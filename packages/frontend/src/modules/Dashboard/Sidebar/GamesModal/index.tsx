/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Dialog } from '@headlessui/react';
import { Icon24Cancel } from '@vkontakte/icons';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../..';
import Button, { ButtonType } from '../../../../components/Button';
import Loader from '../../../../components/Loader';
import Modal, { IModalProps } from '../../../../components/Modal';
import RadioListGroup, { IRadioListItem } from '../../../../components/RadioListGroup';
import GameService from '../../../../services/Game';
import { Game, GameStatus } from '../../../../services/Game/types';
import Analytics from '../../../../system/Analytics';
import { GameEvents } from '../../../../system/Analytics/events/GameEvents';

export interface IGamesModalProps extends IModalProps {}

export default function GamesModal({ open, setOpen }: IGamesModalProps) {
  const navigate = useNavigate();
  const { game, setGame } = useContext(DashboardContext);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const radioItems: IRadioListItem[] = games.map((g) => {
    return {
      title: g?.name,
      subtitle: `${g?.isGameAdmin ? 'Admin · ' : ''}${
        g.status === GameStatus.FINISHED ? 'Ended' : 'Ends'
      } ${dayjs(g?.endAt).fromNow()}${
        g.status === GameStatus?.NOT_STARTED ? ' · Not started yet' : ''
      }`,
    };
  });

  const fetchGames = async () => {
    setLoading(true);
    const data = await GameService.getGames();
    // Sort by createdAt and put latest games at the top
    data.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());
    setGames(data);
    setSelectedIdx(data.findIndex((g) => g.id === game?.id));
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchGames();
    }
  }, [open]);

  const onSelectGame = async (idx: number) => {
    const game = await GameService.getGame(games[idx].id);
    Analytics.track(GameEvents.SWITCH_GAME, game);
    setSelectedIdx(idx);
    setOpen(false);
    setGame(game);
    navigate(`/dashboard/g/${games[idx].inviteCode}`);
  };

  const joinGame = () => {
    Analytics.track(GameEvents.CLICKED_JOIN_NEW_GAME);
    navigate('/game/join');
  };

  const createGame = () => {
    Analytics.track(GameEvents.CLICKED_CREATE_GAME);
    navigate('/game/create');
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl min-h-[450px] bg-b-2 p-9 text-left align-middle shadow-xl transition-all flex flex-col justify-between">
        <div>
          <Dialog.Title as="h5" className="font-semibold text-center text-t-1">
            Your games
          </Dialog.Title>
          <Button
            type={ButtonType.IconButton}
            className="absolute w-6 h-6 top-11 right-9 text-t-3 bg-transparent"
            onClick={() => setOpen(false)}
          >
            <Icon24Cancel />
          </Button>
          <div className="my-7 flex justify-center max-h-[400px] overflow-scroll">
            {!loading ? (
              <RadioListGroup
                items={radioItems}
                selectedIdx={selectedIdx}
                onChange={onSelectGame}
              />
            ) : (
              <Loader />
            )}
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          <Button shadow type={ButtonType.Primary} className="w-full h-14" onClick={joinGame}>
            Join new game
          </Button>
          <Button
            shadow
            type={ButtonType.Secondary}
            className="w-full bg-b-2 h-14"
            onClick={createGame}
          >
            Create game
          </Button>
        </div>
      </Dialog.Panel>
    </Modal>
  );
}

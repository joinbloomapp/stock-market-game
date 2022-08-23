/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Dialog } from '@headlessui/react';
import { Icon24Cancel, Icon28DoorArrowRightOutline, Icon28Profile } from '@vkontakte/icons';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../App';
import Button, { ButtonType } from '../../components/Button';
import Loader from '../../components/Loader';
import Modal, { IModalProps } from '../../components/Modal';
import RadioListGroup, { IRadioListItem } from '../../components/RadioListGroup';
import { DashboardContext } from '../../modules/Dashboard';
import ProfileModal from '../ProfileModal';
import GameService from '../../services/Game';
import { Game, GameStatus } from '../../services/Game/types';
import UserService from '../../services/User';
import Analytics from '../../system/Analytics';
import { GameEvents } from '../../system/Analytics/events/GameEvents';
import { OnboardingEvents } from '../../system/Analytics/events/OnboardingEvents';
import { ProfileEvents } from '../../system/Analytics/events/ProfileEvents';

export interface IGamesModalProps extends IModalProps {}

export default function GamesModal({ open, setOpen }: IGamesModalProps) {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { game, setGame, viewingOtherUser } = useContext(DashboardContext);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [openProfileModal, setOpenProfileModal] = useState<boolean>(false);

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
    <>
      <Modal open={open} setOpen={setOpen}>
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl min-h-[450px] bg-b-2 pt-9 pb-0 px-4 md:px-9 text-left align-middle shadow-xl transition-all flex flex-col justify-between">
          <div>
            <Dialog.Title as="h5" className="font-semibold text-center text-t-1">
              Your games
            </Dialog.Title>
            <Button
              type={ButtonType.IconButton}
              className="absolute w-6 h-6 top-10 right-9 text-t-3 bg-transparent"
              onClick={() => setOpen(false)}
            >
              <Icon24Cancel />
            </Button>
            <div className="my-7 flex justify-center max-h-[250px] md:max-h-[400px] overflow-scroll">
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
          <div className="flex space-x-3 mb-8">
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
          <div className="flex justify-around items-center py-4 space-x-3 border-t border-line-1 text-t-1 md:hidden">
            <Link
              to="#"
              onClick={() => {
                Analytics.track(ProfileEvents.CLICKED_MY_PROFILE);
                setOpen(false);
                setOpenProfileModal(true);
              }}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-9 h-9 flex items-center justify-center text-i-1">
                  <Icon28Profile />
                </div>
                <p>My profile</p>
              </div>
            </Link>
            <Link
              to="/login"
              onClick={async (e) => {
                if (viewingOtherUser) {
                  // Log out of other user's dashboard and return admin back to their own dashboard
                  localStorage.removeItem('userAuthToken');
                  const curUser = await UserService.getUser();
                  navigate('/');
                  setUser(curUser);
                } else {
                  localStorage.removeItem('authToken');
                  Analytics.track(OnboardingEvents.CLICKED_LOGOUT);
                  setUser(undefined);
                }
              }}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-9 h-9 flex items-center justify-center text-i-1">
                  <Icon28DoorArrowRightOutline className="text-u-negative" />
                </div>
                <p>Log out</p>
              </div>
            </Link>
          </div>
        </Dialog.Panel>
      </Modal>
      <ProfileModal open={openProfileModal} setOpen={setOpenProfileModal} />
    </>
  );
}

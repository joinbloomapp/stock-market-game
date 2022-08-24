/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon28CopyOutline, Icon28MailOutline } from '@vkontakte/icons';
import cls from 'classnames';
import { useContext, useRef } from 'react';
import { useMatch } from 'react-router-dom';
import { Id, toast, ToastContainer } from 'react-toastify';
import { UserContext } from '../../App';
import Button, { ButtonType } from '../../components/Button';
import Analytics from '../../system/Analytics';
import { GameEvents } from '../../system/Analytics/events/GameEvents';
import ClipboardUtils from '../../utils/ClipboardUtils';

interface IInvitePlayersCardProps {
  inviteCode: string;
}

export default function InvitePlayersCard({ inviteCode }: IInvitePlayersCardProps) {
  const { user } = useContext(UserContext);
  const dashboard = useMatch('/dashboard/g/:inviteCode/settings');
  const lobby = useMatch('/game/:inviteCode');
  const inviteLink = `https://game.joinbloom.co/game/${inviteCode}`;
  const from = lobby ? 'lobby' : 'dashboard';
  const copyCodeToastId = useRef<Id | null>(null);
  const copyLinkToastId = useRef<Id | null>(null);

  const inviteViaEmail = () => {
    // Make invite email call
    Analytics.track(GameEvents.INVITE_VIA_EMAIL, { inviteLink, from });
    window.open(
      `mailto:?subject=Join the Bloom Stock Market Game&body=${user?.name} invites you to join the Bloom stock market game at ${inviteLink}.`,
      '_blank'
    );
  };

  const copyInviteCode = () => {
    ClipboardUtils.copyToClipboard({ value: inviteCode });
    Analytics.track(GameEvents.COPY_INVITE_CODE, {
      inviteCode,
      from,
    });
    if (!toast.isActive(copyCodeToastId.current as Id)) {
      copyCodeToastId.current = toast.success('Copied invite code!', {
        icon: <Icon28CopyOutline className="text-a-1" />,
      });
    }
  };

  const copyInviteLink = () => {
    ClipboardUtils.copyToClipboard({ value: inviteLink });
    Analytics.track(GameEvents.COPY_INVITE_LINK, {
      inviteLink,
      from,
    });
    if (!toast.isActive(copyLinkToastId.current as Id)) {
      copyLinkToastId.current = toast.success('Copied invite link!', {
        icon: <Icon28CopyOutline className="text-a-1" />,
      });
    }
  };

  return (
    <>
      <div className="bg-b-2 w-full rounded-xl rounded-t-xl py-2">
        <div className="w-full rounded-t-xl light-pink-gradient p-8">
          <p className="text-center md:text-left">Invite players</p>
          <div
            className={cls('flex flex-wrap justify-center w-full h-full items-center', {
              'flex-col': lobby,
              'md:justify-between': dashboard,
            })}
          >
            <div className="flex items-center mt-4">
              <h1
                className={cls(
                  'tracking-[8px] md:tracking-[21.5px] font-semibold text-a-1 text-5xl'
                )}
                style={{ textShadow: '0px 0px 0px #912054' }}
              >
                {inviteCode}
              </h1>
              <Button
                type={ButtonType.IconButton}
                className="icon-button bg-a-1 text-a-1"
                onClick={copyInviteCode}
              >
                <Icon28CopyOutline />
              </Button>
            </div>
            <Button
              shadow
              type={ButtonType.Primary}
              onClick={inviteViaEmail}
              className={cls('w-[205px] h-14', { 'mt-6': lobby })}
              iconRight={<Icon28MailOutline />}
            >
              Invite via mail
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center bg-b-3 text-t-1 h-16 text-lg rounded-2xl px-4 my-4 mx-4 relative">
          <div className="flex flex-col">
            <p className="text-t-3 text-xs uppercase">INVITE LINK</p>
            <p className="text-sm md:text-lg">{inviteLink.substring(8)}</p>
          </div>
          <Button
            type={ButtonType.Secondary}
            className="bg-line-1 w-1/8 text-md rounded-r-2xl rounded-l-none absolute right-0 active:bg-[#232134]"
            onClick={copyInviteLink}
          >
            <Icon28CopyOutline />
          </Button>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="bg-b-3 rounded-2xl cursor-pointer p-3"
        bodyClassName="text-t-1 text-md flex items-center pl-3"
      />
    </>
  );
}

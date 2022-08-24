/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon28ChevronDownOutline, Icon28ChevronUpOutline } from '@vkontakte/icons';
import { useContext, useState } from 'react';
import Button, { ButtonType } from '../../components/Button';
import { DashboardContext } from '../../modules/Dashboard';
import GamesModal from '../GamesModal';

export default function MobileGamesToggle() {
  const { game } = useContext(DashboardContext);
  const [openGamesModal, setOpenGamesModal] = useState(false);

  const ArrowIcon = openGamesModal ? Icon28ChevronUpOutline : Icon28ChevronDownOutline;

  return (
    <>
      <Button
        onClick={() => setOpenGamesModal(!openGamesModal)}
        className="text-base bg-b-1 w-auto py-2 px-3 h-10"
        type={ButtonType.Secondary}
        iconRight={<ArrowIcon className="text-i-1" width={24} height={24} />}
      >
        {game?.name || ''}
      </Button>
      <GamesModal open={openGamesModal} setOpen={setOpenGamesModal} />
    </>
  );
}

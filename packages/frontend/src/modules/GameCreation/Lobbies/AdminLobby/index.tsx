/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon56UserAddOutline } from '@vkontakte/icons';
import { useParams } from 'react-router-dom';
import GameEditInfoCard from '../../../../common/GameEditInfoCard';
import InvitePlayersCard from '../../../../common/InvitePlayersCard';
import Button, { ButtonType } from '../../../../components/Button';
import { Game, PlayerPartial } from '../../../../services/Game/types';

interface IAdminLobbyProps {
  game: Game;
  players: PlayerPartial[];
  removePlayer: (playerId: string) => void;
}

export default function AdminLobby({ game, players = [], removePlayer }: IAdminLobbyProps) {
  const { inviteCode } = useParams();

  const renderPlayersCard = () => {
    return (
      <div className="bg-b-2 w-full overflow-y-scroll rounded-xl px-8 pt-8 pb-16 min-h-[280px]">
        {players.length > 0 ? (
          <div className="flex flex-col">
            <p>{players.length} players</p>
            <div className="flex flex-col space-y-2 mt-4">
              {players.map((p, i) => (
                <div
                  key={p.playerId}
                  className="flex justify-between w-full pb-4 pt-2 text-left border-b-0.5 border-line-1"
                >
                  <p className="font-medium">
                    {p.name}
                    {p.isGameAdmin ? ' (Admin)' : ''}
                  </p>
                  {!p.isGameAdmin && (
                    <Button
                      shadow
                      type={ButtonType.Secondary}
                      className="h-10 text-u-negative"
                      onClick={() => removePlayer(p.playerId)}
                    >
                      Kick out
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center text-t-3 min-h-[280px]">
            <Icon56UserAddOutline className="mx-auto" />
            <p>Your joined players will show up here</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-x-7 md:space-y-0 w-full h-[680px]">
      <div className="flex flex-col space-y-4 w-full">
        <InvitePlayersCard inviteCode={inviteCode as string} />
        {renderPlayersCard()}
      </div>
      <div className="w-full">
        <GameEditInfoCard game={game} players={players} />
      </div>
    </div>
  );
}

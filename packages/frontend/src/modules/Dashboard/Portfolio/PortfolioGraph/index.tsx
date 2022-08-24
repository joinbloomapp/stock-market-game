/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { DashboardContext } from '../..';
import Graph from '../../../../common/Graph';
import { Period, Point } from '../../../../common/Graph/types';
import Button, { ButtonType } from '../../../../components/Button';
import useMobile from '../../../../hooks/useMobile';
import GameService from '../../../../services/Game';
import { CurrentPosition, GameStatus, Player } from '../../../../services/Game/types';
import Analytics from '../../../../system/Analytics';
import { GameEvents } from '../../../../system/Analytics/events/GameEvents';
import { PortfolioEvents } from '../../../../system/Analytics/events/PortfolioEvents';
import PortfolioGraphUtils from './utils';

interface IPortfolioGraphProps {
  positions: CurrentPosition[];
  isPlayerPortfolio?: boolean;
  player: Player;
}

export default function PortfolioGraph({
  positions,
  isPlayerPortfolio = false,
  player,
}: IPortfolioGraphProps) {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { GRAPH_WIDTH, GRAPH_HEIGHT, PERIODS } = PortfolioGraphUtils;
  const { game, setGame } = useContext(DashboardContext);

  const startGame = async () => {
    await GameService.startGame(game?.id as string);
    Analytics.track(GameEvents.START_GAME, {
      gameId: game?.id,
      inviteCode: game?.inviteCode,
    });
    const newGame = await GameService.getGame(game?.id as string);
    toast.success('And the game begins!');
    setGame(newGame);
  };

  const buyFirstStock = () => {
    Analytics.track(PortfolioEvents.CLICKED_BUY_FIRST_ASSET, {
      gameId: game?.id,
      inviteCode: game?.inviteCode,
    });
    navigate(`/dashboard/g/${game?.inviteCode}/browse`);
  };

  const getEmptyState = () => {
    if (game?.status === GameStatus.NOT_STARTED) {
      if (game?.isGameAdmin) {
        if (isPlayerPortfolio) {
          return (
            <p className="text-center">{player.name} is waiting for you to start the game...</p>
          );
        }

        return (
          <Button
            shadow
            type={ButtonType.Primary}
            className="w-1/2 md:w-1/3 h-14"
            onClick={startGame}
          >
            Start the game
          </Button>
        );
      }

      const admin = game?.admins?.length && game.admins[0];
      return (
        <p className="text-center">
          {admin
            ? `Waiting for ${admin?.name} to start the game...`
            : 'You have not bought any stocks'}
        </p>
      );
    }

    if (!positions.length) {
      if (game?.status === GameStatus.FINISHED) {
        return (
          <p className="text-center">
            {isPlayerPortfolio ? player?.name : 'You'} did not buy any stocks &#128533;
          </p>
        );
      }

      if (isPlayerPortfolio) {
        return <p className="text-center">{player.name} has not bought any stocks</p>;
      }

      return (
        <Button
          shadow
          type={ButtonType.Primary}
          className="w-1/2 md:w-1/3 h-14"
          onClick={buyFirstStock}
        >
          Buy my first stock
        </Button>
      );
    }

    return null;
  };

  const fetchData = async (activePeriod: Period): Promise<Point[]> => {
    let points: Point[] = [];

    if (game?.status !== GameStatus.NOT_STARTED) {
      points = await PortfolioGraphUtils.getAggregatePoints(
        game?.id as string,
        activePeriod,
        isPlayerPortfolio ? player.playerId : undefined
      );
      // points.unshift({ x: 0, y: points[0].y });
    }

    return points;
  };

  return (
    <>
      <Graph
        fetchData={fetchData}
        totalWidth={GRAPH_WIDTH}
        totalHeight={GRAPH_HEIGHT}
        periods={PERIODS}
        emptyState={getEmptyState()}
        isPortfolioGraph
      />
      <ToastContainer
        position={isMobile ? 'top-center' : 'top-right'}
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="top-16 px-4 md:top-5"
        toastClassName="bg-b-3 rounded-2xl cursor-pointer p-3"
        bodyClassName="text-t-1 text-md flex items-center pl-3"
      />
    </>
  );
}

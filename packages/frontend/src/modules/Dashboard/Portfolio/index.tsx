/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon16Chevron } from '@vkontakte/icons';
import cls from 'classnames';
import dayjs from 'dayjs';
import React, { LegacyRef, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { DashboardContext } from '..';
import { UserContext } from '../../../App';
import LeaderboardImage from '../../../assets/images/leaderboard.png';
import GameInfoCard from '../../../common/GameInfoCard';
import LeaderboardTable from '../../../common/LeaderboardTable';
import StatsBar, { StatsBarItem } from '../../../common/StatsBar';
import Button, { ButtonType } from '../../../components/Button';
import Loader from '../../../components/Loader';
import GameService from '../../../services/Game';
import {
  CurrentPosition,
  GameStatus,
  HoldingsChange,
  HoldingsValue,
  Player,
  PopularAsset,
} from '../../../services/Game/types';
import Analytics from '../../../system/Analytics';
import { PortfolioEvents } from '../../../system/Analytics/events/PortfolioEvents';
import ArrayUtils from '../../../utils/ArrayUtils';
import StringUtils from '../../../utils/StringUtils';
import StyleUtils from '../../../utils/StyleUtils';
import PortfolioGraph from './PortfolioGraph';
import { setLeaderboardGraphicPositions } from './utils';

export default function Portfolio() {
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<CurrentPosition[]>([]);
  const [popularAssets, setPopularAssets] = useState<PopularAsset[]>([]);
  const [holdingsValue, setHoldingsValue] = useState<HoldingsValue>();
  const [holdingsChange, setHoldingsChange] = useState<HoldingsChange>();
  const [players, setPlayers] = useState<Player[]>([]);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { game } = useContext(DashboardContext);
  const isPlayerPortfolio = useMatch('/dashboard/g/:inviteCode/players/:playerId');
  const leaderboardRef = useRef<HTMLDivElement>();
  const playerRefs = [useRef<HTMLDivElement>(), useRef<HTMLDivElement>(), useRef<HTMLDivElement>()];
  const { playerId } = useParams();

  const player = isPlayerPortfolio
    ? players.find((p) => p.playerId === playerId)
    : players.find((p) => p.userId === user?.id);

  const fetchData = async () => {
    setLoading(true);

    if (game?.status !== GameStatus.NOT_STARTED) {
      // if game started, fetch necessary data for the game
      const [holdingsValue, holdingsChange, currentPositions] = await Promise.allSettled([
        GameService.getHoldingsValue(game?.id as string, playerId),
        GameService.getHoldingsChange(game?.id as string, playerId),
        GameService.getCurrentPositions(game?.id as string, playerId),
      ]);
      // @ts-ignore
      setHoldingsValue(holdingsValue?.value);
      // @ts-ignore
      setHoldingsChange(holdingsChange?.value);
      // @ts-ignore
      setPositions(ArrayUtils.orEmptyArray(currentPositions.value));

      if (!isPlayerPortfolio) {
        const [popularAssets] = await Promise.allSettled([
          GameService.getPopularAssets(game?.id as string),
        ]);
        // @ts-ignore
        setPopularAssets(ArrayUtils.orEmptyArray(popularAssets?.value).slice(0, 5));
      }
    }

    const players = await GameService.getPlayers(game?.id as string);
    setPlayers(ArrayUtils.orEmptyArray(players));

    setLoading(false);
  };

  const statsBars: StatsBarItem[] = [
    {
      title: 'Buying power',
      formattedDollar: StringUtils.USD(
        (holdingsValue?.currentBuyingPower as number) ?? (game?.defaultBuyingPower as number)
      ),
    },
    {
      title: "Today's return",
      formattedDollar: StringUtils.USD(holdingsChange?.todayChange as number),
      percent: holdingsChange?.todayChangePercent as number,
    },
    {
      title: 'Total return',
      formattedDollar: StringUtils.USD(holdingsChange?.totalChange as number),
      percent: holdingsChange?.totalChangePercent as number,
    },
  ];

  useEffect(() => {
    fetchData();
  }, [playerId]);

  const renderFinalRank = () => {
    // Only renders when game status is FINISHED

    if (!player) {
      return null;
    }

    return (
      <div className="rounded-2xl bg-polka bg-center bg-cover text-t-1 my-4 py-10 px-7 flex flex-col items-center justify-center space-y-6">
        {game?.isGameAdmin && !isPlayerPortfolio && (
          <h3 className="font-semibold">Congrats on hosting the game!</h3>
        )}
        <h3 className="font-semibold">
          {isPlayerPortfolio ? `${player?.name} finished in` : 'You finished in'}
        </h3>
        <h1
          className="text-a-1 mt-2 font-black"
          style={{ textShadow: '0px 0px 0px #912054', fontSize: 96 }}
        >
          #{player?.rank}
        </h1>
        {!isPlayerPortfolio && (
          <div className="flex space-x-4">
            <Button
              shadow
              type={ButtonType.Primary}
              className="h-14"
              onClick={() => {
                Analytics.track(PortfolioEvents.CLICKED_JOIN_NEW_GAME);
                navigate('/game/join');
              }}
            >
              Join new game
            </Button>
            <Button
              shadow
              type={ButtonType.Secondary}
              className="h-14"
              onClick={() => {
                Analytics.track(PortfolioEvents.CLICKED_CREATE_NEW_GAME);
                navigate('/game/create');
              }}
            >
              Create new game
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderPositions = () => {
    if (
      game?.status === GameStatus.NOT_STARTED ||
      (game?.status === GameStatus.ACTIVE && positions.length === 0)
    ) {
      return null;
    }

    const renderListItem = (position: CurrentPosition, index: number) => {
      const clickAsset = (ticker: string) => {
        Analytics.track(PortfolioEvents.CLICKED_POSITION, {
          gameId: game?.id,
          inviteCode: game?.inviteCode,
          position,
        });
        navigate(`/dashboard/g/${game?.inviteCode}/stock/${ticker}`);
      };

      return (
        <button
          onClick={() => clickAsset(position.ticker)}
          key={position.ticker}
          className="flex justify-between items-center text-t-1 py-4 text-left hover:bg-b-3 hover:rounded-2xl px-4"
        >
          <div className="flex space-x-4 w-full">
            <img
              alt={position.ticker}
              src={position.image}
              className="rounded-full w-11 h-11 bg-white object-cover object-center"
            />
            <div className="flex flex-row justify-between w-full">
              <div>
                <p>{position.name}</p>
                <p className="text-t-3 text-sm">
                  {position.ticker} · {position.quantity} shares
                </p>
              </div>
              <div className="text-right">
                <p className={cls(StyleUtils.getChangeStyle(position.todayChangePercent))}>
                  {StringUtils.signNumber(position.todayChangePercent / 100, 'percent')}
                </p>
                <p className="text-sm text-t-2">{StringUtils.USD(position.totalValue)}</p>
              </div>
            </div>
            <div className="flex justify-center items-center text-t-3">
              <Icon16Chevron />
            </div>
          </div>
        </button>
      );
    };

    return (
      <div className="rounded-2xl bg-b-2 text-t-1 my-4 py-5 px-7">
        <p className="text-t-1 text-lg mb-2">
          {isPlayerPortfolio ? `${player?.name}'s` : 'My'} stocks
        </p>
        <div>
          {!loading ? (
            <div className="flex flex-col">{positions.map(renderListItem)}</div>
          ) : (
            <Loader className="mx-auto" />
          )}
          {game?.status === GameStatus.FINISHED && !positions.length && (
            <p>{isPlayerPortfolio ? player?.name : 'You'} did not buy any stocks &#128533;</p>
          )}
        </div>
      </div>
    );
  };

  const renderPopularAssets = () => {
    if (!popularAssets.length) {
      return null;
    }

    const renderListItem = (asset: PopularAsset, index: number) => {
      const clickAsset = (ticker: string) => {
        Analytics.track(PortfolioEvents.CLICKED_POPULAR_ASSET, {
          gameId: game?.id,
          inviteCode: game?.inviteCode,
          asset,
        });
        navigate(`/dashboard/g/${game?.inviteCode}/stock/${ticker}`);
      };

      return (
        <button
          onClick={() => clickAsset(asset.ticker)}
          key={asset.ticker}
          className="flex justify-between items-center text-t-1 py-4 text-left hover:bg-b-3 hover:rounded-2xl px-4"
        >
          <div className="flex space-x-4 w-full">
            <img
              alt={asset.ticker}
              src={asset.image}
              className="rounded-full w-11 h-11 bg-white object-cover object-center"
            />
            <div>
              <div>
                <p>{asset.name}</p>
                <p className="text-t-3 text-sm">
                  {asset.ticker} · {StringUtils.USD(asset.latestPrice)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center text-t-3">
            <Icon16Chevron />
          </div>
        </button>
      );
    };

    return (
      <div className="rounded-2xl bg-b-2 text-t-1 my-4 py-5 px-7">
        <p className="text-t-1 text-lg mb-2">Popular stocks</p>
        <div>
          {!loading ? (
            <div className="flex flex-col">{popularAssets.map(renderListItem)}</div>
          ) : (
            <Loader className="mx-auto" />
          )}
        </div>
      </div>
    );
  };

  useLayoutEffect(() => {
    if (leaderboardRef.current) {
      setLeaderboardGraphicPositions(leaderboardRef, playerRefs);
    }
  }, [leaderboardRef.current, playerRefs]);

  const renderLeaderboard = () => {
    if (game?.status === GameStatus.NOT_STARTED) {
      return <LeaderboardTable players={players} loading={loading} />;
    }

    if (!player) {
      return null;
    }

    const styles = [
      {
        container: 'items-center max-w-[200px] text-center',
        text: 'max-w-[200px]',
        dollar: 'max-w-[150px]',
      },
      {
        container: 'items-center max-w-[150px] text-center',
        text: 'max-w-[150px]',
        dollar: 'max-w-[100px]',
      },
      {
        container: 'items-start max-w-[150px] text-right',
        text: 'max-w-[150px]',
        dollar: 'max-w-[100px] ml-1',
      },
    ];

    return (
      <div className="rounded-2xl bg-b-2 text-t-1 my-4 pt-5">
        <div className="flex justify-between text-t-1 -mb-12 mx-7">
          <p>Leaderboard</p>
          <Button
            type={ButtonType.Link}
            className="text-t-1 font-normal z-20"
            onClick={() => {
              Analytics.track(PortfolioEvents.CLICKED_LEADERBOARD_SHOW_ALL, {
                gameId: game?.id,
                inviteCode: game?.inviteCode,
              });
              navigate(`/dashboard/g/${game?.inviteCode}/leaderboard`);
            }}
          >
            Show all
            <Icon16Chevron className="ml-1 text-i-1" />
          </Button>
        </div>
        <div className="relative" ref={leaderboardRef as LegacyRef<HTMLDivElement> | undefined}>
          {players.slice(0, 3).map((p, i) => {
            return (
              <React.Fragment key={p.playerId}>
                <div
                  ref={playerRefs[i] as LegacyRef<HTMLDivElement> | undefined}
                  className={cls('flex flex-col absolute', styles[i].container)}
                >
                  <p
                    className={cls(
                      'text-lg font-bold mb-4 text-ellipsis overflow-hidden whitespace-nowrap',
                      styles[i].text
                    )}
                  >
                    {p.name}
                  </p>
                  <div
                    key={p.playerId}
                    className={cls(
                      'flex items-center justify-center bg-a-1 text-t-1 py-1 px-2 pink-shadow-small rounded-lg font-medium text-ellipsis overflow-hidden whitespace-nowrap',
                      styles[i].dollar
                    )}
                  >
                    {StringUtils.USD(p.totalValue)}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <img
            src={LeaderboardImage}
            alt="leaderboard graphic"
            width="600"
            height="330"
            className="mx-auto"
          />
        </div>
        <div className="flex items-center space-x-4 bg-b-3 bottom-0 w-full h-20 rounded-b-2xl px-7">
          <div className="flex justify-center items-center rounded-full w-11 h-11 bg-b-1">
            #{player?.rank}
          </div>
          <div className="flex flex-row justify-between items-center w-full text-right">
            <div>
              <p>
                {user?.name} (you) {game?.isGameAdmin && <span className="ml-2">&#128081;</span>}
              </p>
            </div>
            <div>
              <div className={cls(StyleUtils.getChangeStyle(player?.totalChangePercent || 0))}>
                {StringUtils.signNumber((player?.totalChangePercent || 0) / 100, 'percent')}
              </div>
              <p className="text-sm text-t-2">{StringUtils.USD(player?.totalValue as number)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isPlayerPortfolio && !player) {
    return <Loader />;
  }

  return (
    <div>
      {isPlayerPortfolio ? (
        <div className="flex space-x-4 items-center">
          <div className="flex justify-center items-center rounded-full w-11 h-11 bg-b-1">
            #{player?.rank}
          </div>
          <div>
            <h5 className="font-semibold">
              {player?.name}'s portfolio{' '}
              {player?.isGameAdmin && <span className="ml-2">&#128081;</span>}
            </h5>
            <p className="text-t-2">Joined on {dayjs(player?.createdAt).format('MMM D, YYYY')}</p>
          </div>
        </div>
      ) : (
        <p className="text-t-2">Your portfolio</p>
      )}
      <PortfolioGraph
        positions={positions}
        isPlayerPortfolio={!!isPlayerPortfolio}
        player={player as Player}
      />
      <StatsBar stats={statsBars} />
      {!isPlayerPortfolio && game?.status === GameStatus.ACTIVE && positions.length >= 1 && (
        <Button
          shadow
          type={ButtonType.Primary}
          className="w-full h-14 my-4"
          onClick={() => navigate(`/dashboard/g/${game?.inviteCode}/browse`)}
        >
          Buy a stock
        </Button>
      )}
      {game?.status === GameStatus.FINISHED && (
        <>
          {renderFinalRank()}
          {renderLeaderboard()}
        </>
      )}
      {!isPlayerPortfolio
        ? renderPositions()
        : game?.isGameAdmin && positions.length > 0 && renderPositions()}
      {!isPlayerPortfolio && (
        <>
          <div className="my-4">
            <GameInfoCard />
          </div>
          {game?.status !== GameStatus.FINISHED && renderLeaderboard()}
          {renderPopularAssets()}
        </>
      )}
    </div>
  );
}

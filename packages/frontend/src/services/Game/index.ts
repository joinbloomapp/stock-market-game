/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  GetHistoricalAggregatePositionsQueryParams,
  HistoricalAggregatePosition,
  HoldingsChange,
  PopularAsset,
} from './types';

import client from '..';
import {
  CreateGame,
  CurrentPosition,
  Game,
  GetGamesQueryParams,
  HoldingsValue,
  Player,
  UpdateGame,
} from './types';

namespace GameService {
  /**
   * Creates a game
   *
   * @param body Create game body
   * @returns created game
   */
  export async function createGame(body: CreateGame): Promise<Game> {
    const res = await client.post('/games', body);
    return res?.data;
  }

  /**
   * Get game by id
   *
   * @param gameId game id
   * @returns game
   */
  export async function getGame(gameId: string): Promise<Game> {
    const res = await client.get(`/games/${gameId}`);
    return res?.data;
  }

  /**
   * Gets all games for current user
   *
   * @param params Get games query params
   * @returns list of games
   */
  export async function getGames(params?: GetGamesQueryParams): Promise<Game[]> {
    const res = await client.get(`/games`, {
      params,
    });
    return res?.data;
  }

  /**
   * Gets game by invite code (doesn't require authentication)
   *
   * @param inviteCode invite code
   * @returns game
   */
  export async function getGameByInviteCode(inviteCode: string): Promise<Game> {
    const res = await client.get(`/games/invite/${inviteCode}`);
    return res?.data;
  }

  /**
   * Gets latest game of the current user
   *
   * @returns latest game
   */
  export async function getLatestGame(): Promise<Game | undefined> {
    const games = await getGames({ limit: 1 });
    return games.length > 0 ? games[0] : undefined;
  }

  /**
   * Updates game information (only admin of the game can update)
   *
   * @param gameId game id
   * @param body game update body
   */
  export async function updateGame(gameId: string, body: UpdateGame): Promise<void> {
    await client.patch(`/games/${gameId}`, body);
  }

  /**
   * Adds player to a game (a.k.a. join game)
   *
   * @param gameId game id
   * @param inviteCode invite code for joining
   */
  export async function addPlayerToGame(gameId: string, inviteCode: string): Promise<void> {
    await client.post(`/games/${gameId}/players`, { inviteCode });
  }

  /**
   * Removes a player from a game (only admin of the game can remove a player from the game or player can leave their game)
   * Admin can't leave their own game
   *
   * @param gameId game id
   * @param playerId player id to remove (not userId, needs playerId)
   */
  export async function removePlayer(gameId: string, playerId: string): Promise<void> {
    await client.delete(`/games/${gameId}/players/${playerId}`);
  }

  /**
   * Gets a list of players and their rankings for a game
   *
   * @param gameId game id
   * @returns list of players and their rankings
   */
  export async function getPlayers(gameId: string): Promise<Player[]> {
    const res = await client.get(`/games/${gameId}/players`);
    return res?.data;
  }

  /**
   * Starts a game and sets its status to GameStatus.ACTIVE (Only admin of the game can start the game)
   *
   * @param gameId game id
   */
  export async function startGame(gameId: string): Promise<void> {
    await client.patch(`/games/${gameId}/start`);
  }

  /**
   * Ends a game and sets its status to GameStatus.FINISHED (Only admin of the game can end the game)
   *
   * @param gameId game id
   */
  export async function endGame(gameId: string): Promise<void> {
    await client.patch(`/games/${gameId}/end`);
  }

  /**
   * Gets current list of positions of the player, but playerId param can only be used by admin
   *
   * @param gameId game id
   * @param playerId Only admin, fetches current list of positions for a player
   * @returns current list of positions
   */
  export async function getCurrentPositions(
    gameId: string,
    playerId?: string
  ): Promise<CurrentPosition[]> {
    const res = await client.get(
      `/games/${gameId}${playerId ? `/players/${playerId}` : ''}/current-positions`
    );
    return res?.data;
  }

  /**
   * Gets current position snapshot, but playerId param can only be used by admin
   *
   * @param gameId game id
   * @param ticker ticker for the position to fetch
   * @param playerId Only admin, fetches current position snapshot for a player
   * @returns current position snapshot
   */
  export async function getCurrentPositionByTicker(
    gameId: string,
    ticker: string,
    playerId?: string
  ): Promise<CurrentPosition> {
    const res = await client.get(
      `/games/${gameId}${playerId ? `/players/${playerId}` : ''}/current-positions/${ticker}`
    );
    return res?.data;
  }

  /**
   * Fetches current portfolio value and current buying power for the current user in the game or of a player in the game
   *
   * @param gameId game id
   * @param playerId fetches current portfolio value and current buying power for a player
   * @returns current portfolio value and current buying power
   */
  export async function getHoldingsValue(
    gameId: string,
    playerId?: string
  ): Promise<HoldingsValue> {
    const res = await client.get(
      `/games/${gameId}${playerId ? `/players/${playerId}` : ''}/holdings-value`
    );
    return res?.data;
  }

  /**
   * Fetches current portfolio value changes and current buying power changes for the current user in the game or of a player in the game
   *
   * @param gameId game id
   * @param playerId Fetches current portfolio value changes and current buying power changes of a player
   * @returns
   */
  export async function getHoldingsChange(
    gameId: string,
    playerId?: string
  ): Promise<HoldingsChange> {
    const res = await client.get(
      `/games/${gameId}${playerId ? `/players/${playerId}` : ''}/holdings-change`
    );
    return res?.data;
  }

  /**
   * Fetches popular assets that were bought in a game (Most bought to least bought)
   *
   * @param gameId game id
   * @returns list of popular assets bought in the game
   */
  export async function getPopularAssets(gameId: string): Promise<PopularAsset[]> {
    const res = await client.get(`/games/${gameId}/popular-assets`);
    return res?.data;
  }

  /**
   * Fetches portfolio graph data for the current user in the game or of a player in the game
   *
   * @param gameId game id
   * @param playerId Fetches portfolio graph data for a player in the game
   * @returns list of points for the portfolio graph
   */
  export async function getHistoricalAggregatePositions(
    gameId: string,
    params: GetHistoricalAggregatePositionsQueryParams,
    playerId?: string
  ): Promise<HistoricalAggregatePosition[]> {
    const res = await client.get(
      `/games/${gameId}${playerId ? `/players/${playerId}` : ''}/historical-aggregate-positions`,
      { params }
    );
    return res?.data;
  }
}

export default GameService;

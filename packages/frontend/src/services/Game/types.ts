/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { User } from '../User/types';

export enum GameStatus {
  NOT_STARTED = 'NOT_STARTED',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export interface Game {
  id: string;
  name: string;
  createdAt: string;
  startAt?: string;
  endAt: string;
  defaultBuyingPower: number;
  inviteCode: string;
  extra?: Record<string, any>;
  isGameAdmin: boolean;
  admins: Pick<User, 'name' | 'email'>[];
  status: GameStatus;
  userInGame: boolean;
  playerId: string;
}

export interface CreateGame {
  name: string;
  endAt: string; // ISO String
  defaultBuyingPower: number;
}

export class UpdateGame {
  name?: string;
  startAt?: string; // ISO String
  endAt?: string; // ISO String
  defaultBuyingPower?: number;
}

export interface Player {
  playerId: string;
  userId: string;
  name: string;
  isGameAdmin: boolean;
  createdAt: string;
  buyingPower: number;
  portfolioValue: number;
  totalValue: number;
  rank: number;
  totalChangePercent: number;
  totalChange: number;
}

export type PlayerPartial = Pick<Player, 'playerId' | 'userId' | 'isGameAdmin' | 'name'>;

export interface GetGamesQueryParams {
  status?: GameStatus;
  limit?: number;
  inviteCode?: string;
}

export interface CurrentPosition {
  name: string;
  image: string;
  quantity: number;
  totalValue: number;
  totalChangePercent: number;
  totalChange: number;
  todayChange: number;
  todayChangePercent: number;
  assetId: string;
  ticker: string;
  latestPrice: number;
}

export interface HoldingsValue {
  currentPortfolioValue: number;
  currentBuyingPower: number;
}

export interface HoldingsChange {
  totalChange: number;
  totalChangePercent: number;
  todayChange: number;
  todayChangePercent: number;
}

export interface PopularAsset {
  latestPrice: number;
  id: string;
  ticker: string;
  name: string;
  image: string;
}

export enum HistoricalAggregatePositionsLatest {
  ONE_DAY = 'ONE_DAY',
  ONE_WEEK = 'ONE_WEEK',
  ONE_MONTH = 'ONE_MONTH',
  THREE_MONTHS = 'THREE_MONTHS',
  ONE_YEAR = 'ONE_YEAR',
  ALL = 'ALL',
}

export interface GetHistoricalAggregatePositionsQueryParams {
  latest: HistoricalAggregatePositionsLatest;
}

export interface HistoricalAggregatePosition {
  value: number;
  createdAt: string;
  playerId: string;
}

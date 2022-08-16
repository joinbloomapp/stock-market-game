/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export interface CreateOrder {
  quantity?: number;
  notional?: number;
  stockId?: string; // Just need to pass in one or the other (either stockId or ticker, if stockId is passed in it will be prioritized)
  ticker?: string;
}

export interface Order {
  name: string;
  ticker: string;
  image: string;
  quantity: number;
  boughtAt: number;
  currentBuyingPower: number;
  id: string;
  createdAt: string;
  type: OrderType;
  status: string;
  notional: number;
}

export interface OrderHistory {
  cursor: string;
  data: Order[];
}

export interface GetOrdersQueryParams {
  ticker?: string;
  limit?: number; // defaults to 30
}

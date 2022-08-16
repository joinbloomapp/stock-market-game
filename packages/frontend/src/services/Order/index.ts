import { GetOrdersQueryParams, OrderHistory } from './types';
/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import client from '..';
import { CreateOrder, Order } from './types';

namespace OrderService {
  /**
   * Executes a buy order
   *
   * @param gameId game id
   * @param body Create order body
   * @returns executed order
   */
  export async function buy(gameId: string, body: CreateOrder): Promise<Order> {
    const res = await client.post(`/games/${gameId}/orders/buy`, body);
    return res?.data;
  }

  /**
   * Executes a sell order
   *
   * @param gameId game id
   * @param body Create order body
   * @returns executed order
   */
  export async function sell(gameId: string, body: CreateOrder): Promise<Order> {
    const res = await client.post(`/games/${gameId}/orders/sell`, body);
    return res?.data;
  }

  /**
   * Gets order history of the current user or of a player in the game, but playerId can only be used by admin
   *
   * @param gameId game id
   * @param playerId Only admin can use this to see a player's order history
   * @param params query parameters
   * @returns order history with list of orders
   */
  export async function getOrders(
    gameId: string,
    playerId?: string,
    params?: GetOrdersQueryParams
  ): Promise<OrderHistory> {
    const res = await client.get(
      `/games/${gameId}${playerId ? `/players/${playerId}` : ''}/orders`,
      { params }
    );
    return res?.data;
  }

  /**
   * Gets a specific order of the current user or of a player in the game given the order id
   *
   * @param gameId game id
   * @param orderId order id
   * @param playerId Only admin can use this see a player's order
   * @returns order
   */
  export async function getOrder(
    gameId: string,
    orderId: string,
    playerId?: string
  ): Promise<Order[]> {
    const res = await client.get(
      `/games/${gameId}${playerId ? `/players/${playerId}` : ''}orders/${orderId}`
    );
    return res?.data;
  }
}

export default OrderService;

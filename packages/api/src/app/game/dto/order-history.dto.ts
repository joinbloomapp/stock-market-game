/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import {
  OrderTypeEnum,
  OrderStatusEnum,
  OrderHistoryEntity,
} from "@bloom-smg/postgresql";

class StockDto {
  id: string;
  ticker: string;
  name: string;
  image: string;
}

class OrderHistoryDto {
  orderId: string;
  orderType: OrderTypeEnum;
  orderStatus: OrderStatusEnum;
  quantity: number;
  value: number;
  playerId: string;
  gameId: string;
  boughtAt: number;

  stock: StockDto;

  constructor(orderHistory: OrderHistoryEntity) {
    this.orderId = orderHistory.id;
    this.orderType = orderHistory.orderType;
    this.orderStatus = orderHistory.orderStatus;
    this.quantity = orderHistory.quantity;
    this.value = orderHistory.value;
    this.boughtAt = orderHistory.value / orderHistory.quantity;
    this.stock = {
      id: orderHistory.stock.id,
      ticker: orderHistory.stock.ticker,
      name: orderHistory.stock.name,
      image: orderHistory.stock.image,
    };
    this.playerId = orderHistory.playerId;
    this.gameId = orderHistory.gameId;
  }
}

export class OrderHistoryPageDto {
  @ApiProperty({
    description:
      "Pass in `next` or `before` in query parameter to get next or previous page",
  })
  cursor: string;

  data: OrderHistoryDto[];

  constructor(data: OrderHistoryEntity[], cursor: string) {
    this.data = data.map((x) => new OrderHistoryDto(x));
    this.cursor = cursor;
  }
}

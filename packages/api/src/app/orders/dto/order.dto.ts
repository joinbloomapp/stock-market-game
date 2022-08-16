/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  OrderHistoryEntity,
  StockEntity,
  OrderTypeEnum,
  OrderStatusEnum,
} from "@bloom-smg/postgresql";
import { ApiProperty } from "@nestjs/swagger";

export class OrderDto {
  id: string;
  createdAt: Date;
  type: OrderTypeEnum;
  status: OrderStatusEnum;

  @ApiProperty({ description: "Stock name" })
  name: string;
  @ApiProperty({ description: "Stock ticker" })
  ticker: string;
  @ApiProperty({ description: "Stock image url" })
  image: string;

  notional: number;
  @ApiProperty({ description: "Total quantity of shares bought/sold" })
  quantity: number;
  @ApiProperty({ description: "Price asset was bought at" })
  boughtAt: number;

  @ApiProperty({ description: "Available cash user can use" })
  currentBuyingPower: number;

  static Init(
    order: OrderHistoryEntity,
    stock: StockEntity,
    stockPrice: number,
    notional: number,
    currentBuyingPower: number
  ): OrderDto {
    const res = new OrderDto();

    res.id = order.id;
    res.createdAt = new Date();
    res.type = order.orderType;
    res.status = order.orderStatus;
    res.name = stock.name;
    res.ticker = stock.ticker;
    res.image = stock.image;
    res.boughtAt = stockPrice;
    res.notional = notional ?? order.quantity * res.boughtAt;
    res.quantity = order.quantity;
    res.currentBuyingPower = currentBuyingPower;

    return res;
  }
}

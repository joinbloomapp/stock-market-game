/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiProperty } from "@nestjs/swagger";
import { OrderHistoryEntity } from "@bloom-smg/postgresql";
import { OrderDto } from "./order.dto";
import { StockPriceEntity } from "@bloom-smg/postgresql";

export class OrderHistoryPageDto {
  @ApiProperty({
    description:
      "Pass in `next` or `before` in query parameter to get next or previous page",
  })
  cursor: string;

  data: OrderDto[];

  constructor(
    data: OrderHistoryEntity[],
    cursor: string,
    stockPrices: StockPriceEntity[]
  ) {
    this.data = data.map((x) => {
      const stockPrice = stockPrices.find(
        (price) => price.stockId === x.stockId
      );
      return OrderDto.Init(x, x.stock, stockPrice.price, x.value, 0);
    });
    this.cursor = cursor;
  }
}

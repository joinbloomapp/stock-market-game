/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrderDto } from "./dto/order.dto";
import { TransactionDto } from "./dto/transaction.dto";
import { OrdersService } from "./orders.service";
import { OrderHistoryQueryDto } from "./dto/order-history-query.dto";
import { OrderHistoryPageDto } from "./dto/order-history.dto";
import { SellAllBodyDto } from "./dto/sell-all-body.dto";
import { ValidateBigSerialPipe } from "src/utils/validator";

@ApiTags("Orders")
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("orders/buy")
  buy(
    @Req() req: Request,
    @Param("gameId", ParseIntPipe) gameId: string,
    @Body() data: TransactionDto
  ): Promise<OrderDto> {
    return this.ordersService.buy(req, gameId, data);
  }

  @Post("orders/sell")
  sell(
    @Req() req: Request,
    @Param("gameId", ParseIntPipe) gameId: string,
    @Body() data: TransactionDto
  ): Promise<OrderDto> {
    return this.ordersService.sell(req, gameId, data);
  }

  @Post("orders/sell-all")
  sellAllStock(
    @Req() req: Request,
    @Param("gameId", ParseIntPipe) gameId: string,
    @Body() data: SellAllBodyDto
  ): Promise<OrderDto> {
    return this.ordersService.sellAll(req, gameId, data);
  }

  @Get("/orders")
  getOrderHistory(
    @Req() req: Request,
    @Param("gameId") gameId: string,
    @Query() query: OrderHistoryQueryDto
  ): Promise<OrderHistoryPageDto> {
    if (query.before && query.after) {
      throw new BadRequestException("Can only pass in before or after");
    }
    return this.ordersService.getOrderHistory(
      req,
      gameId,
      query.limit,
      query.before,
      query.after,
      query.ticker
    );
  }

  @ApiOperation({
    summary: "(ADMIN only) Lists order history of user",
  })
  @Get("players/:playerId/orders")
  getOrderHistoryOfPlayer(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("playerId", ValidateBigSerialPipe) playerId: string,
    @Query() query: OrderHistoryQueryDto
  ): Promise<OrderHistoryPageDto> {
    if (query.before && query.after) {
      throw new BadRequestException("Can only pass in before or after");
    }
    return this.ordersService.getOrderHistoryOfPlayer(
      req,
      gameId,
      playerId,
      query.limit,
      query.before,
      query.after,
      query.ticker
    );
  }

  @Get("orders/:orderId")
  async getOrder(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("orderId", ValidateBigSerialPipe) orderId: string
  ): Promise<OrderDto> {
    return this.ordersService.getOrder(req, gameId, orderId);
  }
}

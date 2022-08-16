/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import {
  CurrentPositionEntity,
  HistoricalAggregatePositionEntity,
  HistoricalAggregatePositionMinuteEntity,
  HistoricalAggregatePositionHourEntity,
  HistoricalAggregatePositionDayEntity,
  HistoricalPositionEntity,
  PlayerEntity,
  StockEntity,
  StockPriceEntity,
  OrderHistoryEntity,
  OrderTypeEnum,
  OrderStatusEnum,
  AverageTodayPriceEntity,
  AverageTotalPriceEntity,
} from "@bloom-smg/postgresql";
import { EntityManager, In, Repository } from "typeorm";
import { OrderDto } from "./dto/order.dto";
import { TransactionDto } from "./dto/transaction.dto";
import { Request } from "express";
import { GameService } from "../game/game.service";
import { OrderHistoryPageDto } from "./dto/order-history.dto";
import { buildPaginator } from "typeorm-cursor-pagination";
import Holidays from "../../models/Holidays";

@Injectable()
export class OrdersService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    @InjectRepository(StockPriceEntity)
    private readonly stockPriceRepository: Repository<StockPriceEntity>,
    @InjectRepository(CurrentPositionEntity)
    private readonly currentPositionRepository: Repository<CurrentPositionEntity>,
    @InjectRepository(HistoricalAggregatePositionEntity)
    private readonly historicalAggregatePositionRepository: Repository<HistoricalAggregatePositionEntity>,
    @InjectRepository(HistoricalAggregatePositionMinuteEntity)
    private readonly historicalAggregatePositionMinuteRepository: Repository<HistoricalAggregatePositionMinuteEntity>,
    @InjectRepository(HistoricalAggregatePositionHourEntity)
    private readonly historicalAggregatePositionHourRepository: Repository<HistoricalAggregatePositionHourEntity>,
    @InjectRepository(HistoricalAggregatePositionDayEntity)
    private readonly historicalAggregatePositionDayRepository: Repository<HistoricalAggregatePositionDayEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepository: Repository<StockEntity>,
    @InjectRepository(OrderHistoryEntity)
    private readonly orderHistoryRepository: Repository<OrderHistoryEntity>,
    private readonly gameServices: GameService,
    @InjectRepository(HistoricalPositionEntity)
    private readonly historicalPositionRepository: Repository<HistoricalPositionEntity>,
    @InjectRepository(AverageTodayPriceEntity)
    private readonly averageTodayPriceRepository: Repository<AverageTodayPriceEntity>,
    @InjectRepository(AverageTotalPriceEntity)
    private readonly averageTotalPriceRepository: Repository<AverageTotalPriceEntity>
  ) {}

  private async avgPriceRecalculation(
    m: EntityManager,
    data: TransactionDto,
    player: PlayerEntity,
    stock: StockPriceEntity,
    newQuantity: number
  ) {
    // We need to recalculate average price anytime we buy a stock
    const avgToday = await this.averageTodayPriceRepository.findOne(
      { stockId: data.stockId, playerId: player.id },
      { select: ["id", "averagePrice", "numBuys", "updatedAt"] }
    );
    if (avgToday) {
      if (
        Math.floor(avgToday.updatedAt.getTime() / (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60 * 24) !==
        Math.floor(Date.now() / (1000 * 60 * 60 * 24)) / (1000 * 60 * 60 * 24)
      ) {
        await m.getRepository(AverageTodayPriceEntity).update(avgToday.id, {
          averagePrice: stock.price,
          numBuys: newQuantity,
        });
      } else {
        const newAvg =
          (avgToday.averagePrice * avgToday.numBuys + stock.price) /
          (avgToday.numBuys + 1);
        await m.getRepository(AverageTodayPriceEntity).update(avgToday.id, {
          averagePrice: newAvg,
          numBuys: avgToday.numBuys + newQuantity,
        });
      }
    } else {
      await m.getRepository(AverageTodayPriceEntity).save({
        stockId: data.stockId,
        playerId: player.id,
        averagePrice: stock.price,
        numBuys: newQuantity,
      });
    }

    const avgTotal = await this.averageTotalPriceRepository.findOne(
      { stockId: data.stockId, playerId: player.id },
      { select: ["id", "averagePrice", "numBuys"] }
    );
    if (avgTotal) {
      const newAvg =
        (avgTotal.averagePrice * avgTotal.numBuys + stock.price) /
        (avgTotal.numBuys + newQuantity);
      await m.getRepository(AverageTotalPriceEntity).update(avgToday.id, {
        averagePrice: newAvg,
        numBuys: avgTotal.numBuys + newQuantity,
      });
    } else {
      await m.getRepository(AverageTotalPriceEntity).save({
        stockId: data.stockId,
        playerId: player.id,
        averagePrice: stock.price,
        numBuys: newQuantity,
      });
    }
  }

  private async saveAggregateHandler(
    player: PlayerEntity,
    currentValueOfPortfolio: number
  ) {
    const historicDay =
      await this.historicalAggregatePositionDayRepository.findOne(
        { playerId: player.id },
        {
          select: ["id"],
        }
      );
    if (historicDay) {
      return;
    }

    const dayLength = 24 * 60 * 60 * 1000;
    const nextDay = new Date(Math.ceil(Date.now() / dayLength) * dayLength);
    while (
      Holidays.isHoliday(nextDay.toISOString().split("T")[0]) ||
      nextDay.getDay() === 6 ||
      nextDay.getDay() === 0
    ) {
      nextDay.setTime(nextDay.getTime() + dayLength);
    }
    await this.historicalAggregatePositionDayRepository.save({
      playerId: player.id,
      gameId: player.gameId,
      value: currentValueOfPortfolio,
      createdAt: nextDay,
    });

    const hourLength = 1000 * 60 * 60;
    const nextHour = new Date(Math.ceil(Date.now() / hourLength) * hourLength);
    while (
      Holidays.isHoliday(nextHour.toISOString().split("T")[0]) ||
      nextHour.getDay() === 6 ||
      nextHour.getDay() === 0
    ) {
      nextHour.setTime(nextHour.getTime() + dayLength);
    }

    await this.historicalAggregatePositionHourRepository.save({
      playerId: player.id,
      gameId: player.gameId,
      value: currentValueOfPortfolio,
      createdAt: nextHour,
    });

    const minuteLength = 1000 * 60 * 5;
    const nextMinute = new Date(
      Math.ceil(Date.now() / minuteLength) * minuteLength
    );
    while (
      Holidays.isHoliday(nextMinute.toISOString().split("T")[0]) ||
      nextMinute.getDay() === 6 ||
      nextMinute.getDay() === 0
    ) {
      nextMinute.setTime(nextMinute.getTime() + dayLength);
    }
    await this.historicalAggregatePositionMinuteRepository.save({
      playerId: player.id,
      gameId: player.gameId,
      value: currentValueOfPortfolio,
      createdAt: nextMinute,
    });

    await this.historicalAggregatePositionRepository.save({
      playerId: player.id,
      value: currentValueOfPortfolio,
      gameId: player.gameId,
    });
  }

  async buy(
    req: Request,
    gameId: string,
    data: TransactionDto
  ): Promise<OrderDto> {
    return await this.entityManager.transaction((m) => {
      return this._buy(m, req, gameId, data);
    });
  }

  private async _buy(
    m: EntityManager,
    req: Request,
    gameId: string,
    data: TransactionDto
  ): Promise<OrderDto> {
    if (!data.stockId && !data.ticker) {
      throw new BadRequestException("Must pass in stockId or ticker");
    }

    if (!(await this.gameServices.hasGameStarted(gameId))) {
      throw new ForbiddenException("Game is not active");
    }

    const player = await this.playerRepository.findOne(
      // @ts-ignore
      { userId: req.user.id, gameId: gameId },
      { select: ["id", "gameId", "buyingPower"] }
    );
    await this.saveAggregateHandler(player, player.buyingPower);
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }

    // TODO We can grab the current stock price from Polygon and insert here
    //  in case we're missing it
    let stock: StockPriceEntity;
    if (data.stockId) {
      stock = await this.stockPriceRepository.findOne(
        { stockId: data.stockId },
        {
          select: ["price"],
        }
      );
    } else {
      stock = await this.stockPriceRepository.findOne({
        where: { ticker: data.ticker },
        select: ["stockId", "price"],
      });
      data.stockId = stock.stockId;
    }
    if (!stock) {
      throw new NotFoundException("Stock not found");
    }

    let newQuantity = 0;
    if (data.notional && data.quantity) {
      throw new BadRequestException(
        "Cannot specify both notional and quantity"
      );
    }
    if (data.notional) {
      if (data.notional <= 0) {
        throw new BadRequestException("Notional must be positive");
      }
      newQuantity = data.notional / stock.price;
    } else {
      if (data.quantity <= 0) {
        throw new BadRequestException("Quantity must be positive");
      }
      newQuantity = data.quantity;
    }
    if (newQuantity * stock.price > player.buyingPower) {
      throw new BadRequestException("Not enough buying power");
    }

    const position = await this.currentPositionRepository.findOne({
      where: { playerId: player.id, stockId: data.stockId },
      select: ["id", "quantity"],
    });
    const valueOfTransaction = newQuantity * stock.price;
    if (!position) {
      await m.getRepository(CurrentPositionEntity).save({
        playerId: player.id,
        stockId: data.stockId,
        quantity: newQuantity,
        gameId: player.gameId,
      });
      const historicIndividual =
        await this.historicalPositionRepository.findOne(
          { playerId: player.id, gameId: player.gameId, stockId: data.stockId },
          {
            order: { id: "DESC" },
            select: ["value"],
          }
        );
      const historic = await this.historicalAggregatePositionRepository.findOne(
        { playerId: player.id, gameId: player.gameId },
        {
          order: { id: "DESC" },
          select: ["value"],
        }
      );
      let newBuyingPower = player.buyingPower - valueOfTransaction;
      if (newBuyingPower < 0) {
        newBuyingPower = 0;
      }
      await m.getRepository(PlayerEntity).update(player.id, {
        buyingPower: newBuyingPower,
      });
      const ohEntry = await m.getRepository(OrderHistoryEntity).save({
        stockId: data.stockId,
        playerId: player.id,
        gameId: player.gameId,
        quantity: newQuantity,
        value: valueOfTransaction,
        orderType: OrderTypeEnum.BUY,
        orderStatus: OrderStatusEnum.COMPLETED,
      });
      const currentValueOfPortfolioStock = !historicIndividual
        ? valueOfTransaction
        : historicIndividual.value + valueOfTransaction;
      const ind = await m.getRepository(HistoricalPositionEntity).save({
        playerId: player.id,
        gameId: player.gameId,
        stockId: data.stockId,
        value: currentValueOfPortfolioStock,
      });
      await this.avgPriceRecalculation(m, data, player, stock, newQuantity);
      return OrderDto.Init(
        ohEntry,
        await this.stockRepository.findOne(data.stockId, {
          select: ["name", "ticker", "image"],
        }),
        stock.price,
        data.notional,
        newBuyingPower
      );
    } else {
      const qty = position.quantity + newQuantity;
      await m.getRepository(CurrentPositionEntity).update(position.id, {
        quantity: qty,
      });
      const historicIndividual =
        await this.historicalPositionRepository.findOne(
          { playerId: player.id, gameId: player.gameId, stockId: data.stockId },
          {
            order: { id: "DESC" },
            select: ["value"],
          }
        );
      const historic = await this.historicalAggregatePositionRepository.findOne(
        { playerId: player.id, gameId: player.gameId },
        {
          order: { id: "DESC" },
          select: ["value"],
        }
      );
      let newBuyingPower = player.buyingPower - valueOfTransaction;
      if (newBuyingPower < 0) {
        newBuyingPower = 0;
      }
      await m.getRepository(PlayerEntity).update(player.id, {
        buyingPower: newBuyingPower,
      });
      const ohEntry = await m.getRepository(OrderHistoryEntity).save({
        stockId: data.stockId,
        playerId: player.id,
        gameId: player.gameId,
        quantity: newQuantity,
        value: valueOfTransaction,
        orderType: OrderTypeEnum.BUY,
        orderStatus: OrderStatusEnum.COMPLETED,
      });
      const currentValueOfPortfolioStock = !historicIndividual
        ? valueOfTransaction
        : historicIndividual.value + valueOfTransaction;
      const ind = await m.getRepository(HistoricalPositionEntity).save({
        playerId: player.id,
        gameId: player.gameId,
        stockId: data.stockId,
        value: currentValueOfPortfolioStock,
      });
      await this.avgPriceRecalculation(m, data, player, stock, newQuantity);
      /*
      return {
        stockId: data.stockId,
        currentQuantity: qty,
        price: stock.price,
        valueOfTransaction: valueOfTransaction,
        currentValueOfPortfolio: currentValueOfPortfolio,
        currentBuyingPower: newBuyingPower,
      };
      */
      return OrderDto.Init(
        ohEntry,
        await this.stockRepository.findOne(data.stockId, {
          select: ["name", "ticker", "image"],
        }),
        stock.price,
        data.notional,
        newBuyingPower
      );
    }
  }

  private async sellStockHelper(
    m: EntityManager,
    quantity: number,
    position: CurrentPositionEntity,
    stock: StockPriceEntity,
    player: PlayerEntity,
    data: TransactionDto
  ): Promise<OrderDto> {
    const valueOfTransaction = quantity * stock.price;
    const newBuyingPower = player.buyingPower + valueOfTransaction;
    await m.getRepository(PlayerEntity).update(player.id, {
      buyingPower: newBuyingPower,
    });
    const historicIndividual = await this.historicalPositionRepository.findOne(
      { playerId: player.id, gameId: player.gameId, stockId: data.stockId },
      {
        order: { id: "DESC" },
        select: ["value"],
      }
    );
    let currentValueOfPortfolioStock =
      historicIndividual.value + valueOfTransaction;
    if (currentValueOfPortfolioStock < 0) {
      currentValueOfPortfolioStock = 0;
    }
    if (currentValueOfPortfolioStock === 0) {
      await m.getRepository(AverageTotalPriceEntity).delete({
        playerId: player.id,
        stockId: stock.stockId,
      });
      await m.getRepository(AverageTotalPriceEntity).delete({
        playerId: player.id,
        stockId: stock.stockId,
      });
    }
    const ind = await m.getRepository(HistoricalPositionEntity).save({
      playerId: player.id,
      gameId: player.gameId,
      stockId: data.stockId,
      value: currentValueOfPortfolioStock,
    });
    const ohEntry = await m.getRepository(OrderHistoryEntity).save({
      stockId: data.stockId,
      playerId: player.id,
      gameId: player.gameId,
      quantity: quantity,
      value: valueOfTransaction,
      orderType: OrderTypeEnum.SELL,
      orderStatus: OrderStatusEnum.COMPLETED,
    });
    /*
    return {
      stockId: data.stockId,
      currentQuantity: position.quantity - quantity,
      price: stock.price,
      valueOfTransaction: valueOfTransaction,
      currentValueOfPortfolio: agg.value,
      currentBuyingPower: newBuyingPower,
    };
    */
    return OrderDto.Init(
      ohEntry,
      await this.stockRepository.findOne(data.stockId, {
        select: ["name", "ticker", "image"],
      }),
      stock.price,
      data.notional,
      newBuyingPower
    );
  }

  async sell(
    req: Request,
    gameId: string,
    data: TransactionDto
  ): Promise<OrderDto> {
    return this.entityManager.transaction(async (m) => {
      return this._sell(m, req, gameId, data);
    });
  }

  private async _sell(
    m: EntityManager,
    req: Request,
    gameId: string,
    data: TransactionDto
  ): Promise<OrderDto> {
    if (!data.stockId && !data.ticker) {
      throw new BadRequestException("Must pass in stockId or ticker");
    }
    if (!(await this.gameServices.hasGameStarted(gameId))) {
      throw new ForbiddenException("Game is not active");
    }
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id", "gameId", "buyingPower"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    let stock: StockPriceEntity;
    if (data.stockId) {
      stock = await this.stockPriceRepository.findOne(
        { stockId: data.stockId },
        {
          select: ["price"],
        }
      );
    } else {
      stock = await this.stockPriceRepository.findOne({
        where: { ticker: data.ticker },
        select: ["stockId", "price"],
      });
      data.stockId = stock.stockId;
    }
    if (!stock) {
      throw new NotFoundException("Stock not found");
    }
    const position = await this.currentPositionRepository.findOne({
      where: { playerId: player.id, stockId: data.stockId },
      select: ["id", "quantity"],
    });
    if (!position) {
      throw new NotFoundException("Position not found");
    }
    let currentQuantity: number;
    if (data.notional && data.quantity) {
      throw new BadRequestException(
        "Cannot specify both notional and quantity"
      );
    }
    if (data.notional) {
      if (data.notional === 0) {
        throw new BadRequestException("Notional cannot be 0");
      }
      if (position.quantity * stock.price < data.notional) {
        throw new BadRequestException("Not enough stock");
      }
      data.quantity = data.notional / stock.price;
      currentQuantity = position.quantity - data.quantity;
      if (currentQuantity * stock.price < 0.01) {
        // It's super awkward to have a small notional value below a cent
        // so we just sell all under the hood
        data.quantity = position.quantity;
        currentQuantity = 0;
      }
    } else {
      if (data.quantity === 0) {
        throw new BadRequestException("Quantity cannot be 0");
      }
      if (position.quantity < data.quantity) {
        throw new BadRequestException("Not enough stock");
      }
      currentQuantity = position.quantity - data.quantity;
    }
    if (currentQuantity <= 0) {
      await m.getRepository(CurrentPositionEntity).delete(position.id);
    } else {
      await m.getRepository(CurrentPositionEntity).update(position.id, {
        quantity: currentQuantity,
      });
    }
    return this.sellStockHelper(
      m,
      data.quantity,
      position,
      stock,
      player,
      data
    );
  }

  async sellAll(
    req: Request,
    gameId: string,
    data: TransactionDto
  ): Promise<OrderDto> {
    return this.entityManager.transaction(async (m) => {
      return this._sellAll(m, req, gameId, data);
    });
  }

  async _sellAll(
    m: EntityManager,
    req: Request,
    gameId: string,
    data: TransactionDto
  ): Promise<OrderDto> {
    if (!data.stockId && !data.ticker) {
      throw new BadRequestException("Must pass in stockId or ticker");
    }
    if (!(await this.gameServices.hasGameStarted(gameId))) {
      throw new ForbiddenException("Game is not active");
    }
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id", "gameId", "buyingPower"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const position = await this.currentPositionRepository.findOne(
      { stockId: data.stockId },
      { select: ["id", "quantity"] }
    );
    if (!position) {
      throw new NotFoundException("Position not found");
    }
    let stock: StockPriceEntity;
    if (data.stockId) {
      stock = await this.stockPriceRepository.findOne(
        { stockId: data.stockId },
        {
          select: ["price"],
        }
      );
    } else {
      const stock = await this.stockPriceRepository.findOne({
        where: { ticker: data.ticker },
        select: ["stockId", "price"],
      });
      data.stockId = stock.id;
    }
    if (!stock) {
      throw new NotFoundException("Stock not found");
    }
    await m.getRepository(CurrentPositionEntity).delete({
      id: position.id,
    });
    return this.sellStockHelper(
      m,
      position.quantity,
      position,
      stock,
      player,
      data
    );
  }

  private async _getOrderHistory(
    player: PlayerEntity,
    limit: number,
    beforeCursor?: string,
    afterCursor?: string,
    ticker?: string
  ) {
    const paginator = buildPaginator({
      entity: OrderHistoryEntity,
      paginationKeys: ["id"],
      alias: "o",
      query: {
        limit: limit,
        order: "DESC",
        beforeCursor: beforeCursor,
        afterCursor: afterCursor,
      },
    });
    let stock: StockEntity;
    if (ticker) {
      stock = await this.stockRepository.findOne({
        where: { ticker },
        select: ["id"],
      });

      if (!stock) {
        throw new BadRequestException("Stock not found");
      }
    }
    let query = this.orderHistoryRepository
      .createQueryBuilder("o")
      .where(`o.playerId = :id`, { id: player.id });
    if (ticker) {
      query.andWhere(`o.stockId = :stockId`, { stockId: stock.id });
    }
    query = query.leftJoinAndSelect(`o.stock`, "stock");
    const { data, cursor } = await paginator.paginate(query);
    const stockIds = data.map((x) => x.stockId);
    if (!stockIds.length) {
      return { cursor: null, data: [] };
    }
    const stockPrices = await this.stockPriceRepository.find({
      where: { stockId: In(stockIds) },
      select: ["price", "stockId"],
    });
    return new OrderHistoryPageDto(data, cursor.afterCursor, stockPrices);
  }

  async getOrderHistory(
    req: Request,
    gameId: string,
    limit: number,
    beforeCursor?: string,
    afterCursor?: string,
    ticker?: string
  ): Promise<OrderHistoryPageDto> {
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id", "gameId", "buyingPower"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    return this._getOrderHistory(
      player,
      limit,
      beforeCursor,
      afterCursor,
      ticker
    );
  }

  async getOrderHistoryOfPlayer(
    req: Request,
    gameId: string,
    playerId: string,
    limit: number,
    beforeCursor?: string,
    afterCursor?: string,
    ticker?: string
  ): Promise<OrderHistoryPageDto> {
    if (!(await this.gameServices.isInGame(req, gameId, true))) {
      throw new ForbiddenException("You are not an admin in this game");
    }
    const player = await this.playerRepository.findOne(
      { id: playerId, gameId: gameId },
      { select: ["id", "gameId", "buyingPower"] }
    );
    if (!player) {
      throw new ForbiddenException("Player not found");
    }
    return this._getOrderHistory(
      player,
      limit,
      beforeCursor,
      afterCursor,
      ticker
    );
  }

  async getOrder(
    req: Request,
    gameId: string,
    orderId: string
  ): Promise<OrderDto> {
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id", "gameId", "buyingPower"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }

    const orderHistory = await this.orderHistoryRepository
      .createQueryBuilder("o")
      .where(`o.playerId = :id`, { id: player.id })
      .andWhere(`o.id = :id`, { id: orderId })
      .leftJoinAndSelect(`o.stock`, "stock")
      .getOne();

    return OrderDto.Init(
      orderHistory,
      orderHistory.stock,
      orderHistory.value / orderHistory.quantity,
      orderHistory.value,
      player.buyingPower
    );
  }
}

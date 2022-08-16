/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  AverageTodayPriceEntity,
  AverageTotalPriceEntity,
  CurrentPositionEntity,
  GameEntity,
  GameStatusEnum,
  HistoricalAggregatePositionDayEntity,
  HistoricalAggregatePositionEntity,
  HistoricalAggregatePositionHourEntity,
  HistoricalAggregatePositionMinuteEntity,
  HistoricalPositionEntity,
  KickedUserEntity,
  OrderHistoryEntity,
  PlayerEntity,
  StockEntity,
  StockPriceEntity,
  UserEntity,
} from "@bloom-smg/postgresql";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import * as momentTz from "moment-timezone";
import { CourierService } from "src/clients/courier/courier.service";
import Holidays from "src/models/Holidays";
import { In, LessThan, MoreThanOrEqual, Not, Repository } from "typeorm";
import { CourierClientClass } from "../../clients/courier";
import * as profaneWords from "./data/profanity.json";
import { AddPlayerDto } from "./dto/add-player.dto";
import { CreateGameDto, UpdateGameDto } from "./dto/create-game.dto";
import { CurrentPositionDto } from "./dto/current-position.dto";
import { GameDto } from "./dto/game.dto";
import { HistoricalAggPositionDto } from "./dto/historical-agg-position.dto";
import { HistoricalPositionDto } from "./dto/historical-position.dto";
import { PlayerHoldingsChangeDto } from "./dto/holdings-change.dto";
import { PlayerHoldingsValueDto } from "./dto/holdings-value.dto";
import { LatestEnum } from "./dto/latest.enum";
import { PlayerDto } from "./dto/player.dto";
import { PopularAssetDto } from "./dto/popular-asset.dto";

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
    @InjectRepository(StockPriceEntity)
    private readonly stockPriceRepository: Repository<StockPriceEntity>,
    @InjectRepository(StockEntity)
    private readonly stockRepository: Repository<StockPriceEntity>,
    @InjectRepository(CurrentPositionEntity)
    private readonly currentPositionRepository: Repository<CurrentPositionEntity>,
    @InjectRepository(HistoricalPositionEntity)
    private readonly historicalPositionRepository: Repository<HistoricalPositionEntity>,
    @InjectRepository(HistoricalAggregatePositionEntity)
    private readonly historicalAggregatePositionRepository: Repository<HistoricalAggregatePositionEntity>,
    @InjectRepository(HistoricalAggregatePositionMinuteEntity)
    private readonly historicalAggregatePositionMinuteRepository: Repository<HistoricalAggregatePositionMinuteEntity>,
    @InjectRepository(HistoricalAggregatePositionHourEntity)
    private readonly historicalAggregatePositionHourRepository: Repository<HistoricalAggregatePositionHourEntity>,
    @InjectRepository(HistoricalAggregatePositionDayEntity)
    private readonly historicalAggregatePositionDayRepository: Repository<HistoricalAggregatePositionDayEntity>,
    @InjectRepository(KickedUserEntity)
    private readonly kickedUserRepository: Repository<KickedUserEntity>,
    @InjectRepository(OrderHistoryEntity)
    private readonly orderHistoryRepository: Repository<OrderHistoryEntity>,
    @InjectRepository(AverageTodayPriceEntity)
    private readonly averageTodayPriceRepository: Repository<AverageTodayPriceEntity>,
    @InjectRepository(AverageTotalPriceEntity)
    private readonly averageTotalPriceRepository: Repository<AverageTotalPriceEntity>,
    private readonly courierClient: CourierClientClass,
    private readonly courierService: CourierService
  ) {}

  async getUserGames(
    req: Request,
    limit?: number,
    gameStatus?: GameStatusEnum
  ): Promise<GameDto[]> {
    const playerRecs = await this.playerRepository.find({
      // @ts-ignore
      where: { userId: req.user.id },
      select: ["gameId"],
    });
    if (!playerRecs.length) return [];
    const gameAdmins: Record<string, PlayerEntity[]> = {};
    const gameIds = playerRecs.map((x) => x.gameId);
    const admins = await this.playerRepository.find({
      where: { gameId: In(gameIds), isGameAdmin: true },
      select: ["id", "gameId", "userId"],
      join: { alias: "player", innerJoinAndSelect: { user: "player.user" } },
    });
    for (const x of admins) {
      x.isGameAdmin = true;
      if (!gameAdmins[x.gameId]) {
        gameAdmins[x.gameId] = [x];
      } else {
        gameAdmins[x.gameId].push(x);
      }
    }
    const gameOptions = {
      // @ts-ignore
      where: { id: In(gameIds) },
      order: { createdAt: "DESC" },
      take: limit,
    };
    if (gameStatus) {
      gameOptions.where["status"] = gameStatus;
    }
    // @ts-ignore
    const games = await this.gameRepository.find(gameOptions);
    return games.map(
      (x) =>
        new GameDto(x, {
          req: req,
          playerRecs: gameAdmins[x.id],
          userInGame: true,
          requestingUserPlayerId: playerRecs.find((y) => y.gameId === x.id)?.id,
        })
    );
  }

  private generateCode(): string {
    const code = Math.random().toString(36).slice(2, 8).toLowerCase();
    if (profaneWords.some((substring) => substring.includes(code))) {
      return this.generateCode();
    }
    return code.toUpperCase();
  }

  /**
   * Creates a new game and automatically adds current user as admin of game
   * @returns {number} game ID
   */
  async createGame(req: Request, data: CreateGameDto): Promise<GameDto> {
    const inviteCode = this.generateCode();
    const rec = await this.gameRepository.save({
      name: data.name,
      startAt: new Date(8640000000000000),
      endAt: data.endAt,
      defaultBuyingPower: data.defaultBuyingPower,
      inviteCode: inviteCode,
    });
    const admin = await this.playerRepository.save({
      userId: req.user.id,
      gameId: rec.id,
      buyingPower: data.defaultBuyingPower,
      isGameAdmin: true,
    });
    admin.user = await this.userRepository.findOne(req.user.id, {
      select: ["email", "firstName"],
    });
    await this.courierService.createGame(req.user.id, admin.user.email, {
      name: admin.user.firstName,
      gameName: data.name,
      inviteCode: inviteCode,
    });
    return new GameDto(rec, {
      req: req,
      playerRecs: [admin],
      userInGame: true,
      requestingUserPlayerId: admin.id,
    });
  }

  private async _setGameFinished(
    game: GameEntity,
    endAt: Date
  ): Promise<GameEntity> {
    await this.gameRepository.update(game.id, {
      endAt,
      status: GameStatusEnum.FINISHED,
    });

    game.status = GameStatusEnum.FINISHED;

    // Cleanup database
    await this.currentPositionRepository.update(
      {
        gameId: game.id,
      },
      {
        isActive: false,
      }
    );

    const players = await this.playerRepository.find({
      // @ts-ignore
      where: { gameId: game.id },
      select: ["id", "userId", "buyingPower"],
      join: { alias: "player", innerJoinAndSelect: { user: "player.user" } },
    });

    const playerPositions = await this.historicalAggregatePositionRepository
      .createQueryBuilder("s")
      .select(["s.playerId", "s.value"])
      .distinctOn(["s.playerId"])
      .orderBy("s.playerId", "ASC")
      .addOrderBy("s.id", "DESC")
      .where("s.gameId = :gameId", { gameId: game.id })
      .getMany();

    const playerValuePositions = {};
    playerPositions.forEach((x) => {
      const player = players.find((p) => p.id === x.playerId);
      playerValuePositions[x.playerId] = x.value + player.buyingPower ?? 0;
    });

    players.sort((a, b) => {
      const aValue = playerValuePositions[a.id] ?? 0;
      const bValue = playerValuePositions[b.id] ?? 0;
      return bValue - aValue;
    });

    // Send end game emails to all players in the game
    await Promise.allSettled(
      players.map((player, i) =>
        (async () => {
          const rank = String(i + 1);
          const lastNumInRank = rank.charAt(rank.length - 1);
          await this.courierService.endGame(player.userId, player.user.email, {
            name: player.user.firstName,
            gameName: game.name,
            inviteCode: game.inviteCode,
            rank: `${rank}${
              lastNumInRank === "1"
                ? "st"
                : lastNumInRank === "2"
                ? "nd"
                : lastNumInRank === "3"
                ? "rd"
                : "th"
            }`,
            numPlayers: players.length,
          });
        })()
      )
    );

    return game;
  }

  private async _getGameInfo(req: Request, game: GameEntity): Promise<GameDto> {
    if (!game) {
      throw new BadRequestException("Game not found");
    }

    // check if in game
    let isInGame = false;
    let requestingUserPlayerId = null;
    if (req.user.id) {
      const player = await this.playerRepository.findOne(
        { userId: req.user.id, gameId: game.id },
        { select: ["id"] }
      );
      if (player) {
        isInGame = true;
        requestingUserPlayerId = player.id;
      }
    }

    if (game?.status !== GameStatusEnum.FINISHED && game.endAt <= new Date()) {
      game = await this._setGameFinished(game, game.endAt);
    }

    const playerRecs = await this.playerRepository.find({
      where: {
        gameId: game.id,
        isGameAdmin: true,
      },
      select: ["userId", "gameId", "isGameAdmin"],
      join: { alias: "player", innerJoinAndSelect: { user: "player.user" } },
    });
    // @ts-ignore
    return new GameDto(game, {
      req: req,
      playerRecs: playerRecs,
      userInGame: !!isInGame,
      requestingUserPlayerId: requestingUserPlayerId,
    });
  }

  async getGameInfo(req: Request, gameId: string): Promise<GameDto> {
    return this._getGameInfo(req, await this.gameRepository.findOne(gameId));
  }

  async getGameInfoByInviteCode(
    req: Request,
    gameId: string
  ): Promise<GameDto> {
    return this._getGameInfo(
      req,
      await this.gameRepository.findOne({ inviteCode: gameId })
    );
  }

  async isInGame(
    req: Request,
    gameId: string,
    checkAdmin: boolean
  ): Promise<boolean> {
    if (!req.user.id) return false;
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["isGameAdmin"] }
    );
    if (!player) return false;
    return !(checkAdmin && !player.isGameAdmin);
  }

  async updateGame(
    req: Request,
    gameId: string,
    data: UpdateGameDto
  ): Promise<void> {
    if (!(await this.isInGame(req, gameId, true))) {
      throw new ForbiddenException("You are not an admin of this game");
    }

    const updated = {};
    const properties = ["endAt", "name", "defaultBuyingPower"];
    for (const x of properties) {
      if (data[x]) {
        updated[x] = data[x];
      }
    }
    await this.gameRepository.update({ id: gameId }, updated);
  }

  async deleteGame(req: Request, gameId: string): Promise<void> {
    if (!(await this.isInGame(req, gameId, true))) {
      throw new ForbiddenException("You are not an admin of this game");
    }
    await this.gameRepository.delete({ id: gameId });
  }

  async startGame(req: Request, gameId: string): Promise<void> {
    if (!(await this.isInGame(req, gameId, true))) {
      throw new ForbiddenException("You are not an admin of this game");
    }
    const game = await this.gameRepository.findOne(gameId, {
      select: ["startAt", "name", "inviteCode"],
    });
    if (!game) {
      throw new BadRequestException("Game not found");
    }
    if (game.status === GameStatusEnum.ACTIVE) {
      throw new BadRequestException("Game already started");
    }
    if (game.status === GameStatusEnum.FINISHED) {
      throw new BadRequestException("Game already finished");
    }
    await this.gameRepository.update(
      { id: gameId },
      { startAt: new Date(), status: GameStatusEnum.ACTIVE }
    );
    const players = await this.playerRepository.find({
      where: { gameId: gameId },
      select: ["id", "gameId", "userId"],
      join: { alias: "player", innerJoinAndSelect: { user: "player.user" } },
    });
    for (const player of players) {
      await this.courierService.startGame(player.userId, player.user.email, {
        name: player.user.firstName,
        gameName: game.name,
        inviteCode: game.inviteCode,
      });
    }
  }

  async endGame(req: Request, gameId: string): Promise<void> {
    if (!(await this.isInGame(req, gameId, true))) {
      throw new ForbiddenException("You are not an admin of this game");
    }
    const game = await this.gameRepository.findOne(gameId, {
      select: ["id", "endAt", "name", "inviteCode", "defaultBuyingPower"],
    });
    if (!game) {
      throw new BadRequestException("Game not found");
    }
    if (game.status === GameStatusEnum.NOT_STARTED) {
      throw new BadRequestException("Game not started");
    }
    if (game.status === GameStatusEnum.FINISHED) {
      throw new BadRequestException("Game already finished");
    }
    await this._setGameFinished(game, new Date());
  }

  async addPlayer(
    req: Request,
    gameId: string,
    data: AddPlayerDto
  ): Promise<void> {
    const game = await this.gameRepository.findOne(
      { id: gameId },
      { select: ["inviteCode", "defaultBuyingPower", "startAt", "status"] }
    );
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    if (game?.status === GameStatusEnum.FINISHED) {
      throw new ForbiddenException("Cannot join finished game");
    }
    const perhapsKicked = await this.kickedUserRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id"] }
    );
    if (perhapsKicked) {
      throw new BadRequestException("You have been kicked from this game");
    }
    if (game.inviteCode !== data.inviteCode) {
      throw new ForbiddenException("Incorrect invite code");
    }
    const doesUserExist = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id"] }
    );
    if (doesUserExist) {
      throw new ForbiddenException("You are already a part of the game!");
    }
    await this.playerRepository.save({
      userId: req.user.id,
      gameId: gameId,
      buyingPower: game.defaultBuyingPower,
      isGameAdmin: false,
    });
  }

  async removePlayer(
    req: Request,
    gameId: string,
    playerId: string
  ): Promise<void> {
    const player = await this.playerRepository.findOne(
      { id: playerId, gameId: gameId },
      { select: ["userId", "isGameAdmin"] }
    );
    if (!player) {
      throw new NotFoundException("Player not found");
    }
    if (player.userId !== req.user.id) {
      const requestingPlayer = await this.playerRepository.findOne(
        { userId: req.user.id, gameId: gameId },
        { select: ["isGameAdmin"] }
      );
      if (!requestingPlayer || !requestingPlayer.isGameAdmin) {
        throw new ForbiddenException("You are not an admin of this game");
      }
      await this.kickedUserRepository.delete({
        gameId: player.gameId,
        userId: player.userId,
      });
    } else if (player.isGameAdmin) {
      // has to be of yourself and be admin
      const allAdmins = await this.playerRepository.find({
        where: { gameId: gameId, isGameAdmin: true },
        select: ["id"],
      });
      if (allAdmins.length === 1) {
        throw new ForbiddenException("You are the only admin of this game");
      }
    }
    await this.playerRepository.delete(playerId);
  }

  async addAdmin(
    req: Request,
    gameId: string,
    playerId: string
  ): Promise<void> {
    const player = await this.playerRepository.findOne(
      { id: playerId, gameId: gameId },
      { select: ["userId", "isGameAdmin"] }
    );
    if (!player) {
      throw new NotFoundException("Player not found");
    }
    if (player.userId === req.user.id) {
      throw new ForbiddenException("You cannot promote yourself to admin");
    }
    if (player.isGameAdmin) {
      throw new ForbiddenException("Player is already an admin of this game");
    }
    const requestingPlayer = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["isGameAdmin"] }
    );
    if (!requestingPlayer || !requestingPlayer.isGameAdmin) {
      throw new ForbiddenException("You are not an admin of this game");
    }
    await this.playerRepository.update(playerId, { isGameAdmin: true });
  }

  async _getAllCurrentPositions(playerId: string, stockId?: string) {
    const whereClause = { playerId: playerId };
    if (stockId) {
      whereClause["stockId"] = stockId;
    }
    const positions = await this.currentPositionRepository.find({
      where: whereClause,
      select: ["stockId", "quantity"],
      join: {
        alias: "position",
        innerJoinAndSelect: { stock: "position.stock" },
      },
    });
    if (!positions.length) return [];

    const stockIds = Array.from(new Set(positions.map((x) => x.stockId)));
    const stockPrices = await this.stockPriceRepository
      .createQueryBuilder("p")
      .select(["p.stockId", "p.price", "p.ticker", "p.oldPrice"])
      .where("p.stockId IN (:...ids)", { ids: stockIds })
      .leftJoin("p.stock", "s")
      .addSelect(["s.name", "s.image"])
      .getMany();

    // In order to get today and total change, we need to get today's starting
    // historical position, and we also need to get the last historical position
    // for each stock ticker
    /*
    SELECT DISTINCT ON ("stockId") "stockId", "value"
    FROM "HistoricalPosition"
    WHERE "playerId" = 7
    ORDER BY "stockId", "createdAt" DESC
     */
    const historicalPositions = await this.historicalPositionRepository
      .createQueryBuilder("s")
      .distinctOn(["s.stockId"])
      .select(["s.stockId", "s.value"])
      .where("s.stockId IN (:...ids)", { ids: stockIds })
      .andWhere("s.playerId = :playerId", { playerId: playerId })
      .andWhere("s.createdAt <= :yesterday", {
        yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })
      .getMany();

    const avgTotals = await this.averageTotalPriceRepository.find({
      where: { playerId: playerId, stockId: In(stockIds) },
      select: ["stockId", "averagePrice", "numBuys"],
    });
    const avgTodays = await this.averageTodayPriceRepository.find({
      where: { playerId: playerId, stockId: In(stockIds) },
      select: ["stockId", "averagePrice", "numBuys", "updatedAt"],
    });
    await this.orderHistoryRepository.find({
      where: { playerId: playerId, stockId: In(stockIds) },
    });
    return positions.map((position) => {
      const stockPrice = stockPrices.find(
        (x) => x.stockId === position.stockId
      );
      const historicalPosition: HistoricalPositionEntity | null =
        historicalPositions.find((x) => x.stockId === position.stockId);
      const avgTotal = avgTotals.find((x) => x.stockId === position.stockId);
      const avgToday = avgTodays.find((x) => x.stockId === position.stockId);
      return new CurrentPositionDto(
        position,
        stockPrice,
        avgTotal,
        avgToday,
        historicalPosition
      );
    });
  }

  async getCurrentPositions(
    req: Request,
    gameId: string
  ): Promise<CurrentPositionDto[]> {
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }

    return this._getAllCurrentPositions(player.id);
  }

  /**
   * (ADMIN only) Get current positions for requesting player
   */
  async getCurrentPositionsOfPlayer(
    req: Request,
    gameId: string,
    playerId: string
  ): Promise<CurrentPositionDto[]> {
    if (!(await this.isInGame(req, gameId, true))) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const player = await this.playerRepository.findOne(
      { id: playerId, gameId: gameId },
      { select: ["id"] }
    );
    if (!player) {
      throw new ForbiddenException("Player not found in given game");
    }
    return this._getAllCurrentPositions(playerId);
  }

  /**
   * Get current position of a certain stock for requesting player
   */
  async getCurrentPositionOfTicker(
    req: Request,
    gameId: string,
    ticker: string
  ): Promise<CurrentPositionDto> {
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const stock = await this.stockRepository.findOne(
      { ticker },
      { select: ["id"] }
    );
    const resp = await this._getAllCurrentPositions(player.id, stock.id);
    if (!resp.length) {
      throw new NotFoundException("Position not found");
    }
    return resp[0];
  }

  /**
   * (ADMIN only) Get current position of certain stock of requested player
   */
  async getCurrentPositionTickerOfPlayer(
    req: Request,
    gameId: string,
    playerId: string,
    ticker: string
  ): Promise<CurrentPositionDto> {
    if (await this.isInGame(req, gameId, true)) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const player = await this.playerRepository.findOne(
      { id: playerId, gameId: gameId },
      { select: ["id"] }
    );
    if (!player) {
      throw new ForbiddenException("Player not found in given game");
    }
    const resp = await this._getAllCurrentPositions(player.id, ticker);
    if (!resp.length) {
      throw new NotFoundException("Position not found");
    }
    return resp[0];
  }

  static isBeforeMarketOpen(date: Date = null): boolean {
    if (date === null) {
      date = new Date();
    }
    const now = momentTz.tz(date, "America/New_York");
    return now.hour() < 9 || (now.hour() === 9 && now.minute() < 30);
  }

  static isAfterMarketClose(date: Date = null, checkWholeHours = true) {
    if (date === null) {
      date = new Date();
    }
    const now = momentTz.tz(date, "America/New_York");
    // We use a delayed websocket of 15 minutes, so we have to account for that here
    if (checkWholeHours) {
      return now.hour() > 17;
    }
    return now.hour() > 16 || (now.hour() === 16 && now.minute() > 45);
  }

  static getLatestTimeCondition(latest: LatestEnum) {
    const now = new Date();
    const curNyHour = momentTz.tz("America/New_York");
    const est9 = now.getHours() - (curNyHour.hour() - 9);
    now.setHours(0, 0, 0, 0);
    let intervals = null;
    let minuteIntervals = 60 * 24; // default interval is a day in minutes
    switch (latest) {
      case LatestEnum.ONE_DAY:
        if (this.isBeforeMarketOpen()) {
          now.setDate(now.getDate() - 1);
        }
        if (curNyHour.weekday() === 0) {
          now.setDate(now.getDate() - 2);
        } else if (curNyHour.weekday() === 6) {
          now.setDate(now.getDate() - 1);
        }
        now.setHours(est9, 0, 0, 0);
        intervals = 1140; // used to be 82, now 60 / 5 * 24 = 288 since real-time-collector is slow
        minuteIntervals = 5;
        break;
      case LatestEnum.ONE_WEEK:
        now.setDate(now.getDate() - (this.isBeforeMarketOpen() ? 8 : 7));
        intervals = 168; // 24 * 7 = 168
        minuteIntervals = 60;
        break;
      case LatestEnum.ONE_MONTH:
        now.setDate(now.getDate() - (this.isBeforeMarketOpen() ? 31 : 30));
        intervals = 30;
        break;
      case LatestEnum.THREE_MONTHS:
        now.setDate(now.getDate() - (this.isBeforeMarketOpen() ? 91 : 90));
        intervals = 90;
        break;
      case LatestEnum.ONE_YEAR:
        now.setDate(now.getDate() - (this.isBeforeMarketOpen() ? 365 : 364));
        intervals = 360;
        break;
      default:
        break;
    }
    return [now, intervals, minuteIntervals * 60000];
  }

  async getHistoricalPositions(
    req: Request,
    gameId: string,
    latest: LatestEnum,
    stockId?: number
  ): Promise<HistoricalPositionDto[]> {
    // @ts-ignore
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const playerId = player.id;
    const conditions = { playerId: playerId };
    if (latest !== LatestEnum.ALL) {
      conditions["createdAt"] = GameService.getLatestTimeCondition(latest);
    }
    if (stockId) {
      conditions["stockId"] = stockId;
    }
    const positions = await this.historicalPositionRepository.find({
      where: conditions,
      select: ["stockId", "value", "createdAt"],
    });
    const stockIds = new Set(positions.map((x) => x.stockId));
    const stockPrices = await this.stockPriceRepository
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.stock", "stock")
      .where("p.stockId IN (:...ids)", { ids: Array.from(stockIds) })
      .getMany();
    return positions.map(
      (x) => new HistoricalPositionDto(x, stockPrices, playerId)
    );
  }

  static addMinutes(date, ms) {
    return new Date(date.getTime() + ms);
  }

  static createIntervals(
    latest: LatestEnum,
    time,
    numIntervals,
    minuteIntervals
  ) {
    const intervals = [];
    let lastDate = time;

    /**
     * @returns whether a date was added
     */
    function appendInterval(): boolean {
      lastDate = GameService.addMinutes(lastDate, minuteIntervals);
      const moment = momentTz.tz(lastDate, "America/New_York");
      const dayOrWeek =
        latest === LatestEnum.ONE_DAY || latest === LatestEnum.ONE_WEEK;
      if (moment.day() === 0 || (dayOrWeek && moment.weekday() === 6)) {
        return false;
      }
      if (
        Holidays.isHoliday(moment.toISOString(true).split("T")[0]) ||
        moment.day() === 6
      ) {
        return false;
      }
      // The reason we'll always show all times is that our real time collector
      // takes a really long time to process all calls, so it can go into the night.
      // if (
      //   dayOrWeek &&
      //   (GameService.isBeforeMarketOpen(lastDate) ||
      //     GameService.isAfterMarketClose(
      //       lastDate,
      //       latest === LatestEnum.ONE_WEEK
      //     ))
      // ) {
      //   return false;
      // }
      intervals.push(lastDate);
      return true;
    }

    if (numIntervals) {
      for (
        let i = 0;
        i < numIntervals && lastDate.getTime() < Date.now();
        i++
      ) {
        if (!appendInterval()) {
          i--;
        }
      }
    } else {
      const now = Date.now();
      while (lastDate.getTime() < now) {
        appendInterval();
      }
    }
    return intervals;
  }

  private async getHistoricalAggregatePositionsForTime(
    gameStart: Date,
    playerId: string,
    latest: LatestEnum,
    defaultBuyingPower: number
  ): Promise<HistoricalAggPositionDto[]> {
    const [time, numIntervals, minuteIntervals] =
      GameService.getLatestTimeCondition(latest);
    let newTime = null;
    if (!numIntervals) {
      newTime = gameStart;
      newTime.setHours(0, 0, 0, 0);
    }
    const baseTime = numIntervals ? time : newTime;
    const rawIntervals = GameService.createIntervals(
      latest,
      baseTime,
      numIntervals,
      minuteIntervals
    );
    // filter out intervals from before game creation;
    const intervals = rawIntervals.filter(
      (x) => new Date(x).getTime() >= gameStart.getTime()
    );
    if (gameStart.toDateString() === new Date().toDateString()) {
      intervals.unshift(gameStart);
    }
    let repository;

    switch (latest) {
      case LatestEnum.ONE_DAY: {
        repository = this.historicalAggregatePositionMinuteRepository;
        break;
      }
      case LatestEnum.ONE_WEEK: {
        repository = this.historicalAggregatePositionHourRepository;
        break;
      }
      case LatestEnum.ONE_MONTH: // 30 intervals
      case LatestEnum.THREE_MONTHS: // 90 intervals
      case LatestEnum.ONE_YEAR: // 30 * 12 = 360 intervals
      case LatestEnum.ALL: {
        repository = this.historicalAggregatePositionDayRepository;
        break;
      }
    }
    const resp = await repository.find({
      where: { createdAt: MoreThanOrEqual(baseTime), playerId },
      select: ["value", "createdAt"],
    });
    if (!resp.length) {
      return [];
    }
    let first = resp[0]; // optional
    if (resp[0].createdAt.getTime() > baseTime.getTime()) {
      first = await repository.findOne(
        { playerId, createdAt: LessThan(baseTime) },
        {
          select: ["value", "createdAt"],
          order: { id: "DESC" },
        }
      );
    }
    const values = [];
    for (const interval of intervals) {
      const entity = resp.find(
        (x) => x.createdAt.getTime() === interval.getTime()
      );
      if (entity) {
        values.push({ value: entity.value, createdAt: interval, playerId });
        first = entity;
      } else {
        values.push({
          value: first?.value ?? defaultBuyingPower,
          createdAt: interval,
          playerId,
        });
      }
    }
    const nowMoment = momentTz("America/New_York");
    if (
      values.length &&
      (nowMoment.hour() < 4 ||
        (nowMoment.hour() === 4 && nowMoment.minute() < 15))
    ) {
      values[values.length - 1].createdAt = new Date();
    }
    return values;
  }

  async getHistoricalAggregatePositions(
    req: Request,
    gameId: string,
    latest: LatestEnum
  ): Promise<HistoricalAggPositionDto[]> {
    // @ts-ignore
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["id"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const game = await this.gameRepository.findOne(gameId, {
      select: ["startAt", "defaultBuyingPower"],
    });
    if (game.startAt.getTime() > Date.now()) {
      return [];
    }
    const playerId = player.id;
    return this.getHistoricalAggregatePositionsForTime(
      game.startAt,
      playerId,
      latest,
      game.defaultBuyingPower
    );
  }

  async getHistoricalAggregatePositionsOfPlayer(
    req,
    gameId,
    playerId,
    latest
  ): Promise<HistoricalAggPositionDto[]> {
    const player = await this.playerRepository.findOne(
      { userId: req.user.id, gameId: gameId },
      { select: ["isGameAdmin"] }
    );
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const game = await this.gameRepository.findOne(gameId, {
      select: ["startAt", "defaultBuyingPower"],
    });
    if (game.startAt.getTime() > Date.now()) {
      return [];
    }
    return this.getHistoricalAggregatePositionsForTime(
      game.startAt,
      playerId,
      latest,
      game.defaultBuyingPower
    );
  }

  async getPlayers(req: Request, gameId: string): Promise<PlayerDto[]> {
    if (!(await this.isInGame(req, gameId, false))) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      select: ["defaultBuyingPower"],
    });
    const players = await this.playerRepository.find({
      where: { gameId: gameId },
      join: { alias: "player", innerJoinAndSelect: { user: "player.user" } },
    });
    const playerPositions = await this.historicalAggregatePositionRepository
      .createQueryBuilder("s")
      .select(["s.playerId", "s.value"])
      .distinctOn(["s.playerId"])
      .orderBy("s.playerId", "ASC")
      .addOrderBy("s.id", "DESC")
      .where("s.gameId = :gameId", { gameId: gameId })
      .getMany();
    const playerValuePositions = {};
    playerPositions.forEach((x) => {
      playerValuePositions[x.playerId] = x.value;
    });
    players.sort((a, b) => {
      const aValue = playerValuePositions[a.id] ?? 0;
      const bValue = playerValuePositions[b.id] ?? 0;
      return bValue - aValue;
    });
    return players.map((x, i) => {
      const totalValue = playerValuePositions[x.id] || x.buyingPower;
      const portfolioValue = totalValue - x.buyingPower;
      const totalChange = totalValue - game.defaultBuyingPower;
      const totalChangePercent = (totalChange / game.defaultBuyingPower) * 100;
      return new PlayerDto(
        x,
        i + 1,
        totalValue,
        totalChange,
        totalChangePercent,
        portfolioValue
      );
    });
  }

  async hasGameStarted(gameId: string): Promise<boolean> {
    const game = await this.gameRepository.findOne({
      select: ["status"],
      where: { id: gameId },
    });
    return game && game.status === GameStatusEnum.ACTIVE;
  }

  async getPopularStocks(gameId: string): Promise<PopularAssetDto[]> {
    const query = await this.orderHistoryRepository.query(
      `SELECT "s"."stockId" AS "s_stockId", count("s"."stockId") as c FROM "OrderHistory" "s" WHERE "gameId" = $1 GROUP BY "s"."stockId" ORDER BY c DESC LIMIT 10`,
      [gameId]
    );
    if (!query.length) {
      return [];
    }
    const stockIds: string[] = query.map((q) => q.s_stockId);
    const stocks = await this.stockPriceRepository
      .createQueryBuilder("s")
      .where(`s.stockId IN (:...stockIds)`, { stockIds: stockIds })
      .select(["s.price"])
      .addSelect(["stock.name", "stock.ticker", "stock.image"])
      .leftJoinAndSelect("s.stock", "stock")
      .getMany();
    return stocks.map((s) => new PopularAssetDto(s));
  }

  private async _getHoldingsValue(gameId: string, player: PlayerEntity) {
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    if (String(player.gameId) !== gameId) {
      throw new ForbiddenException("Player is not a part of this game");
    }
    const position = await this.historicalAggregatePositionRepository.findOne({
      where: { playerId: player.id },
      select: ["value"],
      order: { id: "DESC" },
    });
    return {
      currentBuyingPower: player.buyingPower,
      currentPortfolioValue: position?.value,
    };
  }

  async getHoldingsValue(
    req: Request,
    gameId: string
  ): Promise<PlayerHoldingsValueDto> {
    if (!(await this.isInGame(req, gameId, false))) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const player = await this.playerRepository.findOne({
      where: { userId: req.user.id, gameId },
      select: ["id", "buyingPower", "gameId"],
    });
    return this._getHoldingsValue(gameId, player);
  }

  async getPlayerHoldingsValue(
    req: Request,
    gameId: string,
    playerId: string
  ): Promise<PlayerHoldingsValueDto> {
    if (!(await this.isInGame(req, gameId, false))) {
      throw new ForbiddenException("You are not a part of this game");
    }
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
      select: ["id", "buyingPower", "gameId"],
    });
    return this._getHoldingsValue(gameId, player);
  }

  private async _getHoldingsChange(
    game: GameEntity,
    player: PlayerEntity
  ): Promise<PlayerHoldingsChangeDto> {
    /*
    To get today's change, there are three scenarios:
    1. Just started a game, so no historical aggregate positions
    2. Started game today with some positions, but none from yesterday
    3. History in past day, so we can get the change from yesterday
     */

    const latestPosition =
      await this.historicalAggregatePositionDayRepository.findOne({
        where: { playerId: player.id },
        select: ["id", "value", "createdAt"],
        order: { id: "DESC" },
      });

    const totalChange =
      (latestPosition?.value || game.defaultBuyingPower) -
      game.defaultBuyingPower;
    const totalChangePercent = (totalChange / game.defaultBuyingPower) * 100;

    const now = new Date();
    if (
      !latestPosition ||
      latestPosition.createdAt.getTime() < now.setDate(now.getDate() - 1)
    ) {
      return {
        todayChange: 0,
        todayChangePercent: 0,
        totalChange: totalChange,
        totalChangePercent: totalChangePercent,
      };
    }

    const position =
      await this.historicalAggregatePositionDayRepository.findOne({
        where: {
          playerId: player.id,
          id: Not(latestPosition.id),
          createdAt: LessThan(new Date(now.setDate(now.getDate() - 1))),
        },
        select: ["id", "value"],
        order: { id: "DESC" },
      });
    const todayChange = position
      ? latestPosition.value - position.value
      : totalChange;

    return {
      todayChange: todayChange,
      todayChangePercent: position
        ? (todayChange / position.value) * 100
        : totalChangePercent,
      totalChange: totalChange,
      totalChangePercent: totalChangePercent,
    };
  }

  async getHoldingsChange(
    req: Request,
    gameId: string
  ): Promise<PlayerHoldingsChangeDto> {
    const game = await this.gameRepository.findOne({
      // @ts-ignore
      where: { id: gameId },
      select: ["defaultBuyingPower"],
    });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    const player = await this.playerRepository.findOne({
      // @ts-ignore
      where: { userId: req.user.id, gameId },
      select: ["id", "buyingPower", "gameId"],
    });
    if (!player) {
      throw new ForbiddenException("You are not a part of this game");
    }
    if (String(player.gameId) !== gameId) {
      throw new ForbiddenException("Player is not a part of this game");
    }
    return this._getHoldingsChange(game, player);
  }

  async getPlayerHoldingsChange(
    req: Request,
    gameId: string,
    playerId: string
  ): Promise<PlayerHoldingsChangeDto> {
    const game = await this.gameRepository.findOne({
      where: { id: gameId },
      select: ["defaultBuyingPower"],
    });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
      select: ["id", "buyingPower", "gameId"],
    });
    if (!player) {
      throw new NotFoundException("Player not found in this game");
    }
    if (String(player.gameId) !== gameId) {
      throw new ForbiddenException("Player is not a part of this game");
    }
    return this._getHoldingsChange(game, player);
  }
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { NoAuth } from "src/utils/auth";
import { AddPlayerDto } from "./dto/add-player.dto";
import { CreateGameDto } from "./dto/create-game.dto";
import { CurrentPositionDto } from "./dto/current-position.dto";
import { GameDto } from "./dto/game.dto";
import { GetUserGamesQueryDto } from "./dto/get-user-games-query.dto";
import { HistoricalAggPositionDto } from "./dto/historical-agg-position.dto";
import { HistoricalPositionDto } from "./dto/historical-position.dto";
import { PlayerHoldingsChangeDto } from "./dto/holdings-change.dto";
import { PlayerHoldingsValueDto } from "./dto/holdings-value.dto";
import { LatestEnum } from "./dto/latest.enum";
import { PlayerDto } from "./dto/player.dto";
import { PopularAssetDto } from "./dto/popular-asset.dto";
import { GameService } from "./game.service";
import { ValidateBigSerialPipe } from "src/utils/validator";
import { PlayerNamesDto } from "./dto/player-names.dto";

@ApiTags("Game")
@Controller()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  getUserGames(
    @Req() req: Request,
    @Query() query: GetUserGamesQueryDto
  ): Promise<GameDto[]> {
    return this.gameService.getUserGames(req, query.limit, query.status);
  }

  @Post()
  createNewGame(
    @Req() req: Request,
    @Body() createGameDto: CreateGameDto
  ): Promise<GameDto> {
    return this.gameService.createGame(req, createGameDto);
  }

  @Get("invite/:inviteCode")
  @NoAuth()
  gameInfoByInviteCode(
    @Req() req: Request,
    @Param("inviteCode") inviteCode: string
  ): Promise<GameDto> {
    return this.gameService.getGameInfoByInviteCode(req, inviteCode);
  }

  @ApiOperation({
    description: "(ADMIN ONLY) Starts the game",
  })
  @Patch(":gameId/start")
  startGame(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string
  ): Promise<void> {
    return this.gameService.startGame(req, gameId);
  }

  @ApiOperation({
    description: "(ADMIN ONLY) Ends the game",
  })
  @Patch(":gameId/end")
  endGame(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string
  ): Promise<void> {
    return this.gameService.endGame(req, gameId);
  }

  @Post(":gameId/players")
  addPlayer(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Body() data: AddPlayerDto
  ): Promise<void> {
    return this.gameService.addPlayer(req, gameId, data);
  }

  @Get(":gameId/players")
  getPlayers(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string
  ): Promise<PlayerDto[]> {
    return this.gameService.getPlayers(req, gameId);
  }

  @Get(":gameId/players/names")
  getPlayerNames(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string
  ): Promise<PlayerNamesDto[]> {
    return this.gameService.getPlayerNames(req, gameId);
  }

  @Delete(":gameId/players/:playerId")
  removePlayer(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("playerId", ValidateBigSerialPipe) playerId: string
  ): Promise<void> {
    return this.gameService.removePlayer(req, gameId, playerId);
  }

  @Post(":gameId/admins")
  @ApiOperation({
    description: "(ADMIN only) Promote existing player to admin",
  })
  addAdmin(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("playerId", ValidateBigSerialPipe) playerId: string
  ) {
    return this.gameService.addAdmin(req, gameId, playerId);
  }

  // MARK - Portfolio Positions

  @ApiOperation({
    description: "Get current positions of requesting player",
  })
  @Get(":gameId/current-positions")
  getCurrentPositions(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string
  ): Promise<CurrentPositionDto[]> {
    return this.gameService.getCurrentPositions(req, gameId);
  }

  @ApiOperation({
    description: "(ADMIN ONLY) Get current positions of player",
  })
  @Get(":gameId/players/:playerId/current-positions")
  getCurrentPositionOfPlayer(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("playerId", ValidateBigSerialPipe) playerId: string
  ): Promise<CurrentPositionDto[]> {
    return this.gameService.getCurrentPositionsOfPlayer(req, gameId, playerId);
  }

  @ApiOperation({
    description: "Get current position for certain ticker",
  })
  @Get(":gameId/current-positions/:ticker")
  getCurrentPositionOfTicker(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("ticker") ticker: string
  ): Promise<CurrentPositionDto> {
    return this.gameService.getCurrentPositionOfTicker(req, gameId, ticker);
  }

  @ApiOperation({
    description:
      "(ADMIN ONLY) Get current position for certain ticker of specified user",
  })
  @Get(":gameId/players/:playerId/current-positions/:ticker")
  getCurrentPositionTickerOfPlayer(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("playerId", ValidateBigSerialPipe) playerId: string,
    @Param("ticker") ticker: string
  ): Promise<CurrentPositionDto> {
    return this.gameService.getCurrentPositionTickerOfPlayer(
      req,
      gameId,
      playerId,
      ticker
    );
  }

  @Get(":gameId/historical-positions")
  @ApiQuery({ name: "latest", enum: LatestEnum, required: true })
  getHistoricalPositions(
    @Req() req: Request,
    @Param("gameId", ParseIntPipe) gameId: string,
    @Query("latest") latest: LatestEnum,
    @Query("stockId") stockId?: number
  ): Promise<HistoricalPositionDto[]> {
    return this.gameService.getHistoricalPositions(
      req,
      gameId,
      latest,
      stockId
    );
  }

  @Get(":gameId/historical-aggregate-positions")
  @ApiQuery({ name: "latest", enum: LatestEnum, required: true })
  getHistoricalAggregatePositions(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Query("latest") latest: LatestEnum
  ): Promise<HistoricalAggPositionDto[]> {
    return this.gameService.getHistoricalAggregatePositions(
      req,
      gameId,
      latest
    );
  }

  @Get(":gameId/players/:playerId/historical-aggregate-positions")
  @ApiQuery({ name: "latest", enum: LatestEnum, required: true })
  getHistoricalAggregatePositionsOfPlayer(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("playerId", ValidateBigSerialPipe) playerId: string,
    @Query("latest") latest: LatestEnum
  ): Promise<HistoricalAggPositionDto[]> {
    return this.gameService.getHistoricalAggregatePositionsOfPlayer(
      req,
      gameId,
      playerId,
      latest
    );
  }

  @Get(":gameId/popular-assets")
  getPopularStocks(
    @Param("gameId", ValidateBigSerialPipe) gameId: string
  ): Promise<PopularAssetDto[]> {
    return this.gameService.getPopularStocks(gameId);
  }

  @Get(":gameId/holdings-value")
  getHoldingsValue(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string
  ): Promise<PlayerHoldingsValueDto> {
    return this.gameService.getHoldingsValue(req, gameId);
  }

  @Get(":gameId/players/:playerId/holdings-value")
  getHoldingsValueOfPlayer(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("playerId", ValidateBigSerialPipe) playerId: string
  ): Promise<PlayerHoldingsValueDto> {
    return this.gameService.getPlayerHoldingsValue(req, gameId, playerId);
  }

  @Get(":gameId/holdings-change")
  getHoldingsChange(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string
  ): Promise<PlayerHoldingsChangeDto> {
    return this.gameService.getHoldingsChange(req, gameId);
  }

  @Get(":gameId/players/:playerId/holdings-change")
  getHoldingsChangeOfPlayer(
    @Req() req: Request,
    @Param("gameId", ValidateBigSerialPipe) gameId: string,
    @Param("playerId", ValidateBigSerialPipe) playerId: string
  ): Promise<PlayerHoldingsChangeDto> {
    return this.gameService.getPlayerHoldingsChange(req, gameId, playerId);
  }
}

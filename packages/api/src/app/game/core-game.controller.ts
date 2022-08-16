/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { GameService } from "./game.service";
import { UpdateGameDto } from "./dto/create-game.dto";
import { GameDto } from "./dto/game.dto";

@ApiTags("Game")
@Controller()
/**
 * The purpose of this controller is in the scenario that game.controller.ts
 * has to have an url path with a single string component, then it could
 * interfere with these routes.
 */
export class CoreGameController {
  constructor(private readonly gameService: GameService) {}

  @Get(":gameId")
  gameInfo(@Req() req: Request, @Param("gameId") id: string): Promise<GameDto> {
    return this.gameService.getGameInfo(req, id);
  }

  @Patch(":gameId")
  updateGame(
    @Req() req: Request,
    @Param("gameId") id: string,
    @Body() updateGameDto: UpdateGameDto
  ): Promise<void> {
    return this.gameService.updateGame(req, id, updateGameDto);
  }

  @Delete(":gameId")
  deleteGame(@Req() req: Request, @Param("gameId") id: string): Promise<void> {
    return this.gameService.deleteGame(req, id);
  }
}

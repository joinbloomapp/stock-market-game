/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  GameEntity,
  PlayerEntity,
  GameStatusEnum,
} from "@bloom-smg/postgresql";
import { JSONValue } from "src/utils/types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Request } from "express";

class ShortGameAdminDto {
  name: string;

  @ApiPropertyOptional({ description: "Email (only if user is in game)" })
  email: string;
}

export class GameDto {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: Date;
  startAt: Date;
  endAt: Date;
  defaultBuyingPower: number;
  extra: JSONValue;

  @ApiPropertyOptional({ description: "Whether requesting user is an admin" })
  isGameAdmin?: boolean;

  admins?: ShortGameAdminDto[];

  status: GameStatusEnum;
  userInGame: boolean;

  playerId: string;

  constructor(
    game: GameEntity,
    opts: {
      playerRecs?: PlayerEntity[];
      userInGame: boolean;
      req: Request;
      playerId?: string;
    }
  ) {
    this.id = String(game.id);
    this.name = game.name;
    this.inviteCode = game.inviteCode;
    this.createdAt = game.createdAt;
    this.startAt = game.startAt;
    this.endAt = game.endAt;
    this.defaultBuyingPower = game.defaultBuyingPower;
    this.extra = game.extra;
    this.status = game.status;
    this.userInGame = opts.userInGame;
    this.playerId = opts.playerId;

    if (opts.playerRecs) {
      if (opts.userInGame) {
        try {
          this.isGameAdmin = opts.playerRecs.filter(
            (x) => x.gameId === game.id && opts.req.user.id === x.userId
          )[0].isGameAdmin;
        } catch {
          this.isGameAdmin = false;
        }
      } else {
        this.isGameAdmin = false;
      }
      for (const player of opts.playerRecs) {
        this.admins = this.admins || [];
        const dto: ShortGameAdminDto = { name: player.user.name, email: null };
        if (opts.userInGame) {
          dto.email = player.user.email;
        }
        this.admins.push(dto);
      }
    }
  }
}

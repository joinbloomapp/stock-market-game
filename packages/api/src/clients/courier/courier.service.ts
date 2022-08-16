import { PasswordResetDto } from "./dto/password-reset.dto";
/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from "@nestjs/common";
import { CourierClientClass } from "src/clients/courier";
import { CreateGameDto } from "./dto/create-game.dto";
import { SignupDto } from "./dto/signup.dto";
import { EndGameDto } from "./dto/end-game.dto";
import { StartGameDto } from "./dto/start-game.dto";

@Injectable()
export class CourierService {
  constructor(private readonly courierClient: CourierClientClass) {}

  async signup(
    userId: string,
    email: string,
    { name }: SignupDto
  ): Promise<void> {
    await this.courierClient.sendNotifications(
      "N3PXM42AD0MN5YM37Z0T776NESEK",
      userId,
      {
        email: email,
      },
      {
        data: { name },
      }
    );
  }

  async createGame(
    userId: string,
    email: string,
    { name, gameName, inviteCode }: CreateGameDto
  ): Promise<void> {
    await this.courierClient.sendNotifications(
      "C5M0KJEBA64DHWHF3YGR7QHM52AP",
      userId,
      {
        email: email,
      },
      {
        data: {
          name,
          gameName,
          inviteLink: `https://game.joinbloom.co/game/${inviteCode}`,
        },
      }
    );
  }

  async startGame(
    userId: string,
    email: string,
    { name, gameName, inviteCode }: StartGameDto
  ) {
    await this.courierClient.sendNotifications(
      "D6EDX516REMJHPP2P6Z9Y6N34FBP",
      userId,
      {
        email: email,
      },
      {
        data: {
          name,
          gameName,
          inviteCode,
        },
      }
    );
  }

  async endGame(
    userId: string,
    email: string,
    { name, gameName, rank, inviteCode, numPlayers }: EndGameDto
  ): Promise<void> {
    await this.courierClient.sendNotifications(
      "B4N973FQNA41X2NXT54Z0ZQQRZXJ",
      userId,
      {
        email: email,
      },
      {
        data: {
          name,
          gameName,
          rank,
          inviteCode,
          numPlayers,
        },
      }
    );
  }

  async sendPasswordResetLink(
    userId: string,
    email: string,
    { name, passwordResetLink }: PasswordResetDto
  ): Promise<void> {
    await this.courierClient.sendNotifications(
      "XCCB3PQMH346JZG2EB8EM7HGSWF6",
      userId,
      {
        email: email,
      },
      {
        data: {
          name,
          passwordResetLink,
        },
      }
    );
  }
}

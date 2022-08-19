/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ForbiddenException, Injectable } from "@nestjs/common";
import { UserEntity } from "@bloom-smg/postgresql";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { Request } from "express";

@Injectable()
export class AdminService {
  constructor(
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService
  ) {}

  async loginAs(req: Request, email: string) {
    // @ts-ignore
    const requestingUser = await this.userRepository.findOne(req.user.id, {
      select: ["isSiteAdmin"],
    });
    if (!requestingUser || !requestingUser.isSiteAdmin) {
      throw new ForbiddenException(
        "You do not have permission to login as another user"
      );
    }
    const user = await this.userRepository.findOne(
      { email: email },
      { select: ["id"] }
    );
    if (!user) {
      throw new ForbiddenException("Incorrect email or password");
    }
    return {
      access: await this.authService.generateAccessToken({ userId: user.id }),
    };
  }
}

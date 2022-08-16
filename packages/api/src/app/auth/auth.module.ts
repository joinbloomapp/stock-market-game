/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  GameEntity,
  PlayerEntity,
  UserEntity,
  SocialAppEntity,
  SocialAccountEntity,
  SocialTokenEntity,
} from "@bloom-smg/postgresql";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { CourierClientClass } from "../../clients/courier";
import { CourierService } from "../../clients/courier/courier.service";

const providers = [AuthService, JwtService, CourierService, CourierClientClass];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PlayerEntity,
      GameEntity,
      SocialAppEntity,
      SocialAccountEntity,
      SocialTokenEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: providers,
  exports: providers,
})
export class AuthModule {}

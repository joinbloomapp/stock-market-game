/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { UserEntity } from "@bloom-smg/postgresql";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as argon2 from "argon2";
import { Request } from "express";
import { Repository } from "typeorm";
import { AuthService } from "../auth/auth.service";
import { FullUserInfoDto } from "./dto/full-user-info.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService
  ) {}

  async updateUser(req: Request, data: UpdateUserDto) {
    const user = await this.userRepository.findOne(req.user.id);

    if (data.email && data.email !== user.email) {
      if (
        await this.userRepository.findOne(
          // @ts-ignore
          { email: data.email },
          { select: ["id"] }
        )
      ) {
        throw new ForbiddenException("User with that email already exists");
      }
    }

    await this.userRepository.update(req.user.id, data);
  }

  async resetPassword(req: Request, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne(req.user.id);

    let verified: boolean;
    try {
      verified = await argon2.verify(user.password, oldPassword);
    } catch (e) {
      throw new BadRequestException("Old password is incorrect");
    }

    if (!verified) {
      throw new BadRequestException("Old password is incorrect");
    }

    const newPasswordHash = await this.authService.hashPassword(
      newPassword,
      "New password too long. Try again."
    );

    await this.userRepository.update(req.user.id, {
      password: newPasswordHash,
    });
  }

  async getCurrentUserInfo(req: Request): Promise<FullUserInfoDto> {
    return new FullUserInfoDto(
      await this.userRepository.findOne(req.user.id, {
        select: ["id", "name", "firstName", "lastName", "email"],
      })
    );
  }

  async delCurrentUser(req: Request): Promise<void> {
    await this.userRepository.delete(req.user.id);
  }
}

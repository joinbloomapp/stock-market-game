/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Body, Controller, Delete, Get, Patch, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { FullUserInfoDto } from "./dto/full-user-info.dto";
import { ResetPasswordDto, UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

@ApiTags("User")
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch()
  async updateUser(
    @Req() req: Request,
    @Body() data: UpdateUserDto
  ): Promise<void> {
    return this.userService.updateUser(req, data);
  }

  @Patch("reset-password")
  resetPassword(
    @Req() req: Request,
    @Body() data: ResetPasswordDto
  ): Promise<void> {
    return this.userService.resetPassword(
      req,
      data.oldPassword,
      data.newPassword
    );
  }

  @Get("me")
  getCurrentUserInfo(@Req() req: Request): Promise<FullUserInfoDto> {
    return this.userService.getCurrentUserInfo(req);
  }

  @Delete()
  delCurrentUser(@Req() req: Request): Promise<void> {
    return this.userService.delCurrentUser(req);
  }
}

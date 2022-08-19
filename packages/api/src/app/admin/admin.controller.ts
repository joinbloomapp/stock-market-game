/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Controller, Post, Body, Request } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { LoginAsBodyDto } from "./dto/login-as-body.dto";
import { LoginAsDto } from "./dto/login-as.dto";

@ApiTags("Admin")
@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("login-as")
  getBasicInfo(
    @Request() req,
    @Body() body: LoginAsBodyDto
  ): Promise<LoginAsDto> {
    return this.adminService.loginAs(req, body.email);
  }
}

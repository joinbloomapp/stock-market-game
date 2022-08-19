/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Controller, Post, Body } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { LoginAsBodyDto } from "./dto/login-as-body.dto";
import { LoginAsDto } from "./dto/login-as.dto";

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("login-as")
  getBasicInfo(@Body() body: LoginAsBodyDto): Promise<LoginAsDto> {
    return this.adminService.loginAs(body.email);
  }
}

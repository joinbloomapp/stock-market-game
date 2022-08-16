/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  /**
   * For health checks, we need a root path. This will not interfere
   * with Swagger Docs
   */
  async root(): Promise<string> {
    return "We are improving the financial future of the next generation!";
  }
}

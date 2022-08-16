/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ArrayLimitDto } from "./dto/array-limit.dto";
import { LimitDto } from "./dto/limit-query.dto";
import { NewsService } from "./news.service";

@ApiTags("News")
@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ApiOperation({
    summary: "Fetches the latest general stock news about the market",
  })
  @Get("general")
  getLatestGeneralNews(@Query() query: LimitDto) {
    let limit = query.limit || 50;
    if (limit < 1 || limit > 50) {
      limit = 50;
    }
    return this.newsService.getLatestGeneralNews(limit);
  }

  @ApiOperation({
    summary: "Fetches news from Stock News API",
  })
  @Get()
  getNews(@Query() query: ArrayLimitDto) {
    let limit = query.limit || 50;
    if (limit < 1 || limit > 50) {
      limit = 50;
    }
    return this.newsService.getNews(query.tickers, false, limit);
  }
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { SearchPageDto } from "./dto/asset-search.dto";
import { SearchQueryDto } from "./dto/search-query.dto";

@ApiTags("Search")
@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({
    summary: "Looks up the query string in stock and category records",
  })
  @Get()
  search(@Query() query: SearchQueryDto): Promise<SearchPageDto> {
    return this.searchService.search(query.q, query.offset, query.limit);
  }
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Body, Controller, Get, Param, Req } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { CategoryDto } from "./dto/category.dto";
import { CategoryAssetsResponseDto } from "./dto/category-assets.dto";
import { ValidateBigSerialPipe } from "../../utils/validator";

@ApiTags("Categories")
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: "Get all categories" })
  @Get()
  getCategories(): Promise<CategoryDto[]> {
    return this.categoriesService.getCategories();
  }

  @ApiOperation({ summary: "Get category info" })
  @Get(":id")
  getCategoryInfo(
    @Param("id", ValidateBigSerialPipe) categoryId: string
  ): Promise<CategoryDto> {
    return this.categoriesService.getCategory(categoryId);
  }

  @ApiOperation({ summary: "Get category assets" })
  @Get(":id/assets")
  getCategoryAssets(
    @Param("id", ValidateBigSerialPipe) categoryId: string
  ): Promise<CategoryAssetsResponseDto> {
    return this.categoriesService.getCategoryAssets(categoryId);
  }
}

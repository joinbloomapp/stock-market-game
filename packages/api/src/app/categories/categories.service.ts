/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { InjectRepository } from "@nestjs/typeorm";
import {
  StockCategoryEntity,
  StockCategoryMappingEntity,
  StockPriceEntity,
} from "@bloom-smg/postgresql";
import { In, Repository } from "typeorm";
import { CategoryDto } from "./dto/category.dto";
import { NotFoundException } from "@nestjs/common";
import { CategoryAssetsResponseDto } from "./dto/category-assets.dto";
import { buildPaginator } from "typeorm-cursor-pagination";
import { CategoryAssetDto } from "./dto/category-asset.dto";

export class CategoriesService {
  constructor(
    @InjectRepository(StockCategoryEntity)
    private readonly stockCategoryRepository: Repository<StockCategoryEntity>,
    @InjectRepository(StockCategoryMappingEntity)
    private readonly stockCategoryMappingRepository: Repository<StockCategoryMappingEntity>,
    @InjectRepository(StockPriceEntity)
    private readonly stockPriceRepository: Repository<StockPriceEntity>
  ) {}

  async getCategories(): Promise<CategoryDto[]> {
    const categories = await this.stockCategoryRepository.find({
      select: ["id", "name", "image", "description"],
      order: {
        id: "ASC",
      },
    });
    const categoriesCount = await this.stockCategoryMappingRepository.query(
      `SELECT "categoryId", count(*) as "numAssets" FROM "StockCategoryMapping" GROUP BY "categoryId"`
    );
    const categoriesCountMapping = {};
    categoriesCount.forEach((category) => {
      categoriesCountMapping[category.categoryId] = parseInt(
        category.numAssets
      );
    });
    return categories.map(
      (category) =>
        new CategoryDto(category, categoriesCountMapping[category.id])
    );
  }

  async getCategory(categoryId: string): Promise<CategoryDto> {
    const category = await this.stockCategoryRepository.findOne(categoryId, {
      select: ["id", "name", "image", "description"],
    });
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    const count = await this.stockCategoryMappingRepository.count({
      categoryId: categoryId,
    });
    return new CategoryDto(category, count);
  }

  async getCategoryAssets(
    categoryId: string,
    limit?: number,
    beforeCursor?: string,
    afterCursor?: string
  ): Promise<CategoryAssetsResponseDto> {
    const paginator = buildPaginator({
      entity: StockCategoryMappingEntity,
      paginationKeys: ["id"],
      alias: "s",
      query: {
        limit: limit,
        order: "DESC",
        beforeCursor: beforeCursor,
        afterCursor: afterCursor,
      },
    });
    const query = this.stockCategoryMappingRepository
      .createQueryBuilder("s")
      .where("s.categoryId = :categoryId", { categoryId })
      .select()
      .addSelect(["stock.id", "stock.name", "stock.image", "stock.ticker"])
      .leftJoinAndSelect("s.stock", "stock");
    const { data, cursor } = await paginator.paginate(query);
    const stockIds = data.map((mapping) => mapping.stockId);
    const stocks = await this.stockPriceRepository.find({
      where: { stockId: In(stockIds) },
      select: ["stockId", "price"],
    });
    const stockIdPriceMapping = [];
    stocks.forEach((stock) => {
      stockIdPriceMapping[stock.stockId] = stock.price;
    });
    const categoryAssets: CategoryAssetDto[] = data.map((mapping) => ({
      name: mapping.stock.name,
      ticker: mapping.stock.ticker,
      image: mapping.stock.image,
      latestPrice: stockIdPriceMapping[mapping.stockId],
    }));
    const count = await this.stockCategoryMappingRepository.count({
      categoryId: categoryId,
    });
    return new CategoryAssetsResponseDto(
      categoryAssets,
      count,
      cursor.afterCursor
    );
  }
}

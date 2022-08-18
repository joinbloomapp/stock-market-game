/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { InjectRepository } from "@nestjs/typeorm";
import {
  StockCategoryEntity,
  StockCategoryMappingEntity,
  StockEntity,
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
    @InjectRepository(StockEntity)
    private readonly stockRepository: Repository<StockEntity>,
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

  private getTopCategoryAssetsTickers(name: string): string[] {
    const top = {
      "Energy & Utilities": [
        "TSLA",
        "BP",
        "XOM",
        "SHEL",
        "GE",
        "AEP",
        "PTR",
        "COP",
        "OXY",
        "EOG",
        "PXD",
        "MPC",
        "SLB",
        "SRE",
        "POR",
        "NGG",
        "VLO",
        "CEG",
        "NFG",
      ],
      ETFs: [
        "SPY",
        "VOO",
        "IVV",
        "QQQ",
        "VTI",
        "VTV",
        "VEA",
        "IEFA",
        "AGG",
        "BND",
        "VUG",
        "VWO",
        "IJR",
        "IEMG",
        "IWF",
        "VIG",
        "IJH",
        "GLD",
        "IWD",
        "IWM",
        "VO",
        "VXUS",
        "EFA",
        "VYM",
        "BNDX",
        "VGT",
        "ITOT",
        "XLK",
        "VCIT",
        "VB",
        "VCSH",
        "XLV",
        "BSV",
        "SCHD",
        "XLE",
        "LQD",
        "VEU",
        "RSP",
        "IVW",
        "TIP",
        "SCHX",
        "XLF",
        "MUB",
        "USMV",
        "IWB",
        "IAU",
        "DIA",
        "IWR",
        "IXUS",
      ],
      "Finance & Banking": [
        "SCHW",
        "JPM",
        "MA",
        "C",
        "V",
        "BAC",
        "TD",
        "SQ",
        "PYPL",
        "GS",
        "WFC",
        "PNC",
        "AXP",
        "COIN",
        "HOOD",
        "GDOT",
        "SOFI",
        "MORN",
        "BCS",
        "HSBC",
        "NDAQ",
        "BNS",
        "NRDS",
        "JEF",
        "DB",
        "FRC",
        "USB",
        "AON",
        "IFS",
        "WTW",
        "ALLY",
        "MCO",
        "AXS",
        "BFH",
        "UPST",
        "BRK-B",
        "BSAC",
        "BLK",
        "LMND",
      ],
      Technology: [
        "AAPL",
        "MSFT",
        "TSLA",
        "GOOG",
        "AMZN",
        "META",
        "DIS",
        "RBLX",
        "NFLX",
        "TWTR",
        "EA",
        "NDAQ",
        "PLTR",
        "SHOP",
        "ADBE",
        "CRM",
        "Z",
        "CSCO",
        "QCOM",
        "ORCL",
        "VMW",
        "ADSK",
        "WDAY",
        "MSI",
        "NET",
        "TWLO",
        "OKTA",
        "PINS",
        "DOCU",
        "CTXS",
        "U",
        "GDDY",
        "ZEN",
      ],
      Transportation: [
        "TSLA",
        "DMLRY",
        "DAL",
        "SAVE",
        "AAL",
        "FDX",
        "ALK",
        "VWAGY",
        "TM",
        "GM",
        "BMWYY",
        "NIO",
        "UPS",
        "JBLU",
      ],
      Tourism: ["ABNB", "EXPE", "MAR", "TRIP", "HLT", "RCL", "H", "NCLH"],
      "Food & Drink": ["KO", "PEP", "K", "UTZ", "HSY", "MNST", "BYND", "BGS"],
      Healthcare: [
        "JNJ",
        "CVS",
        "PFE",
        "MRNA",
        "UNH",
        "RHHBY",
        "ABBV",
        "NVO",
        "TMO",
        "MRK",
        "AZN",
        "ABT",
        "GE",
        "CI",
        "BMY",
        "BSX",
      ],
      Industrial: [
        "BA",
        "LMT",
        "MMM",
        "ADP",
        "DD",
        "DOW",
        "AYI",
        "BBY",
        "HD",
        "UPWK",
      ],
      "Media & Telecom": [
        "TMUS",
        "WBD",
        "CMCSA",
        "T",
        "SONY",
        "NTDOY",
        "CRWD",
        "VOD",
        "EA",
        "SIRI",
        "FOXA",
        "GME",
        "HAS",
        "PSO",
        "MU",
      ],
      "Shopping & Retail": [
        "SHOP",
        "LULU",
        "AMZN",
        "TGT",
        "HD",
        "ETSY",
        "WOOF",
        "EBAY",
        "BBY",
        "COST",
        "POSH",
        "JWN",
        "LOW",
        "GME",
        "DDS",
      ],
    };
    return top[name] || [];
  }

  async getCategoryAssets(
    categoryId: string,
    limit?: number,
    beforeCursor?: string,
    afterCursor?: string
  ): Promise<CategoryAssetsResponseDto> {
    const category = await this.stockCategoryRepository.findOne(categoryId, {
      select: ["name"],
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }
    let chosenStocks = [];
    const topAssets = this.getTopCategoryAssetsTickers(category.name);
    if (!beforeCursor && !afterCursor) {
      chosenStocks = await this.stockRepository.find({
        where: {
          ticker: In(topAssets),
        },
        select: ["id", "name", "image", "ticker"],
      });
    }
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
    stockIds.push(...chosenStocks.map((stock) => stock.id));
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
    for (const ticker of topAssets) {
      const index = categoryAssets.findIndex(
        (asset) => asset.ticker === ticker
      );
      if (index > -1) {
        categoryAssets.splice(index, 1);
      }
    }
    for (const stock of topAssets.reverse()) {
      const stockEntity = chosenStocks.find((s) => s.ticker === stock);
      if (stockEntity) {
        categoryAssets.unshift({
          name: stockEntity.name,
          ticker: stockEntity.ticker,
          image: stockEntity.image,
          latestPrice: stockIdPriceMapping[stockEntity.id],
        });
      }
    }
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

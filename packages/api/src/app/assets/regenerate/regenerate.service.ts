/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  StockEntity,
  StockCategoryEntity,
  StockCategoryMappingEntity,
} from "@bloom-smg/postgresql";
import { Repository } from "typeorm";
import fetch from "node-fetch";
import { JSONValue } from "src/utils/types";
import { CategoriesJsonDto } from "./dto/categories-json.dto";
import { ParentAppServerStockJsonDto } from "./dto/parent-app-server-stock-json.dto";

type CustomCategoriesJsonDto = { [key: string]: CategoriesJsonDto };
type StockDescriptionJsonDto = { [key: string]: string };

/**
 * @private
 * A data store for uploading stock related JSON files to S3
 */
class RegenerationJSONStruct {
  public app_stocks: JSONValue;
  public categories: CustomCategoriesJsonDto;
  public empty_categories: CategoriesJsonDto[];
  public parent_app_server_stocks: ParentAppServerStockJsonDto;
  public stock_descriptions: StockDescriptionJsonDto;
  public stocks: JSONValue;

  constructor() {
    this.app_stocks = {};
    this.categories = {};
    this.empty_categories = [];
    this.parent_app_server_stocks = {};
    this.stock_descriptions = {};
    this.stocks = {};
  }
}

@Injectable()
export class RegenerateStocksService {
  private readonly logger = new Logger(RegenerateStocksService.name);

  static SPECIAL_IMAGES = {
    SNAP: "https://seeklogo.com/images/S/snapchat-logo-47531E7AE8-seeklogo.com.png",
    SHOP: "https://png.pngitem.com/pimgs/s/519-5199502_integrate-shopify-shopify-experts-logo-hd-png-download.png",
    DASH: "https://s3-us-west-1.amazonaws.com/companies.comparably.com/14886_logo_doordash.png",
  };

  static SPECIAL_NAMES = { LULU: "Lululemon" };

  static SPECIAL_SYMBOLS = { "BRK-B": "BRK.B" };

  constructor(
    @InjectRepository(StockEntity)
    private readonly stockRepository: Repository<StockEntity>,
    @InjectRepository(StockCategoryEntity)
    private readonly stockCategoryRepository: Repository<StockCategoryEntity>,
    @InjectRepository(StockCategoryMappingEntity)
    private readonly stockCategoryMappingRepository: Repository<StockCategoryMappingEntity>
  ) {}

  getShortName(name: string) {
    let changed = true;
    while (changed) {
      changed = false;
      const lowerName = name.toLowerCase();
      [
        "corp.",
        "inc.",
        "ltd.",
        "plc",
        "inc ",
        "incorporated",
        "technologies",
        "corporation",
        "holdings",
        "s.a.",
        ".com",
        "class a",
        "common stock",
      ].forEach((x) => {
        if (lowerName.endsWith(x)) {
          name = name.slice(0, lowerName.lastIndexOf(x));
          changed = true;
        }
      });
      if (name.startsWith("The ")) {
        name = name.replace("The ", "");
        changed = true;
      }
      if (name !== name.trim()) {
        changed = true;
      }
      name = name.trim();
      if (name[name.length - 1] === ",") {
        name = name.substring(0, name.length - 1);
        changed = true;
      }
    }
    return name;
  }

  async writeStockCategoryMapping(
    stock: StockEntity,
    dataStore: RegenerationJSONStruct
  ): Promise<void> {
    const categoryIds: string[] = [];

    if (stock.isEtf) {
      categoryIds.push(dataStore.categories["ETFs"].id);
      if (stock.isActive) {
        dataStore.categories["ETFs"].stocks.push(stock.ticker);
      }
    }
    const sector = stock.extra_data.sector,
      industry = stock.extra_data.industry;

    const categoryMapped = (
      namedIndustries: string[] | boolean,
      shortIndustry: string,
      comparator: string
    ) => {
      if (
        namedIndustries === true || // the `true` is necessary
        (typeof namedIndustries !== "boolean" &&
          namedIndustries?.includes(comparator))
      ) {
        const catId = dataStore.categories[shortIndustry];
        if (catId) {
          categoryIds.push(catId.id);
          if (stock.isActive) {
            dataStore.categories[shortIndustry].stocks.push(stock.ticker);
          }
          return true;
        }
      }
      return false;
    };

    const top25 = [
      "VOO",
      "TSLA",
      "AAPL",
      "NFLX",
      "COIN",
      "SPY",
      "AMZN",
      "KO",
      "NKE",
      "SNAP",
      "TWTR",
      "QQQ",
      "MSFT",
      "SQ",
      "ABNB",
      "RBLX",
      "META",
      "SBUX",
      "BAC",
      "DIS",
      "F",
      "GOOGL",
      "AMD",
      "HOOD",
      "PLTR",
    ];
    if (top25.includes(stock.ticker)) {
      categoryIds.push(dataStore.categories["Top 25"].id);
      if (stock.isActive) {
        dataStore.categories["Top 25"].stocks.push(stock.ticker);
      }
    }

    if (
      Object.keys(dataStore.categories).includes(sector) &&
      dataStore.categories[sector]
    ) {
      categoryIds.push(dataStore.categories[sector].id);
      if (stock.isActive) {
        dataStore.categories[sector].stocks.push(stock.ticker);
      }
    } else {
      const data: [string[] | boolean, string, string][] = [
        [["Internet Content & Information"], "Technology", industry],
        [
          [
            "Airlines",
            "Auto Manufacturers",
            "Railroads",
            "Integrated Freight & Logistics",
          ],
          "Transportation",
          industry,
        ],
        [["Travel Services", "Lodging"], "Tourism", industry],
        [["Communication Services"], "Media & Telecom", sector],
        [["Financial Services"], "Finance & Banking", sector],
        [
          industry &&
            (industry.includes("Retail") || industry.includes("Store")),
          "Shopping & Retail",
          industry,
        ],
        [["Leisure", "Discount Stores"], "Shopping & Retail", industry],
        [
          industry &&
            (industry.includes("Beverages") || industry.includes("Food")),
          "Food & Drink",
          industry,
        ],
        [["Confectioners"], "Food & Drink", industry],
        [["Financial Services"], "Finance & Banking", sector],
        [["Energy", "Utilities"], "Energy & Utilities", sector],
        [["Industrials", "Basic Materials"], "Industrial", sector],
      ];
      for (const [industries, valueToCheck, comparator] of data) {
        if (categoryMapped(industries, valueToCheck, comparator)) {
          break;
        }
      }
    }

    // Write to database
    if (!stock.ticker || !stock.id) return;
    const map: string[] = (
      await this.stockCategoryMappingRepository
        .createQueryBuilder("map")
        .select(["map.categoryId"])
        .where("map.stockId = :stockId", { stockId: stock.id })
        .getMany()
    ).map((x) => x.categoryId);
    const missingEntities: { stockId: string; categoryId: string }[] =
      categoryIds
        .filter((x) => !map.includes(x))
        .map((x) => {
          return { stockId: stock.id, categoryId: x };
        });
    if (missingEntities.length) {
      try {
        await this.stockCategoryMappingRepository.insert(missingEntities);
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  async handleStock(
    res,
    dataStore: RegenerationJSONStruct
  ): Promise<StockEntity> {
    let symbol: string = res.symbol;
    let data: Array<any>;
    try {
      const resp = await fetch(
        `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${process.env.FINANCIAL_MODELING_PREP_KEY}`
      );
      data = await resp.json();
    } catch {
      return;
    }

    if (data.length === 0) return;
    symbol = RegenerateStocksService.SPECIAL_SYMBOLS[symbol] ?? symbol;
    Object.keys(data[0]).forEach((key) => {
      res[key] = data[0][key];
    });
    if (res.isEtf && (res.mktCap || 1000000000) < 100000000) {
      // skipping tiny etf
      return;
    }

    const stock = {
      id: undefined,
      ticker: symbol.toUpperCase(),
      name:
        RegenerateStocksService.SPECIAL_NAMES[symbol] ??
        this.getShortName(res["name"]),
      isActive: res.status === "active",
      shortable: res.shortable,
      description: res.description
        ? res.description.length > 15000
          ? `${res.description.substring(14997)}...`
          : res.description
        : "",
      image: RegenerateStocksService.SPECIAL_IMAGES[symbol] ?? res.image,
      isEtf: res.isEtf,
      extra_data: {
        industry: res.industry ?? "",
        sector: res.sector ?? "",
        employees: res.employees,
        address: res.address ?? "",
        city: res.city ?? "",
        state: res.state ?? "",
        country: res.country ?? "",
      },
      stockCategoryMappings: null,
      search_stock: null,
    };

    if (stock.ticker !== null) {
      try {
        // @ts-ignore
        await this.stockRepository.upsert(stock, {
          conflictPaths: ["ticker"],
          skipUpdateIfNoValuesChanged: true,
        });
        stock.id = (
          await this.stockRepository.findOne({
            where: { ticker: stock.ticker },
            select: ["id"],
          })
        ).id;
        await this.stockRepository.query(
          `UPDATE "Stock" set search_stock = setweight(to_tsvector(ticker), 'B') || setweight(to_tsvector(name), 'A') || setweight(to_tsvector(description), 'C') WHERE id = $1`,
          [stock.id]
        );
      } catch (e) {
        this.logger.error(e);
      }
    }

    // Prepping data store for upload
    if (stock.isActive) {
      dataStore.parent_app_server_stocks[stock.ticker] = {
        name: stock.name,
        image: stock.image,
      };
      dataStore.stock_descriptions[stock.ticker] = stock.description;
      const stockJson = {
        name: stock.name,
        isActive: stock.isActive,
        shortable: stock.shortable,
        description: stock.description,
        image: stock.image,
        isEtf: stock.isEtf,
        ...stock.extra_data,
      };
      dataStore.stocks[stock.ticker] = stockJson;
      const app_stock = Object.assign({}, stockJson); // copy
      for (const key of ["description", "sector", "country", "shortable"]) {
        delete app_stock[key];
      }
      for (const key of ["employees", "address", "city", "state", "industry"]) {
        if (!app_stock[key]) {
          delete app_stock[key];
        }
      }
      if (
        app_stock.image &&
        app_stock.image.includes("financialmodelingprep.com")
      ) {
        delete app_stock.image;
      }
      dataStore.app_stocks[stock.ticker] = app_stock;
    }
    await this.writeStockCategoryMapping(stock, dataStore);

    return stock;
  }

  /**
   * Collects all stocks for updating/inserting into stock tables.
   * Used in task manager.
   *
   * Also uploads the files to S3 versioned.
   */
  async writeStocks(): Promise<void> {
    const dataStore = new RegenerationJSONStruct();

    const resp = await fetch(
      "https://broker-api.sandbox.alpaca.markets/v1/assets",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPONSOR_APCA_API_KEY_BROKER}:${process.env.SPONSOR_APCA_API_SECRET_BROKER}`
          ).toString("base64")}`,
        },
      }
    );
    const results = (await resp.json()).filter(
      (r) => r.fractionable && r.class === "us_equity"
    );

    for (const x of await this.stockCategoryRepository
      .createQueryBuilder("s")
      .select(["s.id", "s.name", "s.description", "s.image", "s.snippet"])
      .getMany()) {
      const cat: CategoriesJsonDto = {
        id: x.id,
        name: x.name,
        stocks: [],
        description: x.description,
        image: x.image,
        snippet: x.snippet,
      };
      dataStore.empty_categories.push(cat);
      dataStore.categories[x.name] = cat;
    }

    // https://site.financialmodelingprep.com/developer/docs/pricing/

    for (const res of results) {
      // Using await to avoid potential race condition when pushing objects
      // I don't know if that's true, but don't wanna test it in prod...
      try {
        await this.handleStock(res, dataStore);
        // eslint-disable-next-line no-empty
      } catch {}
    }
  }
}

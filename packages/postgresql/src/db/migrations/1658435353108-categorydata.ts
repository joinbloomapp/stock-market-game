/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { MigrationInterface, QueryRunner } from "typeorm";

export class categorydata1658435353108 implements MigrationInterface {
  name = "categorydata1658435353108";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const json = [
      {
        id: null,
        name: "Top 25",
        stocks: [
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
        ],
        description: "Explore companies that other Bloomers are investing in",
        image: "https://cdn.joinbloom.co/category/top25.png",
        snippet: "What's most popular on Bloom",
      },
      // {
      //   id: null,
      //   name: "Crypto",
      //   stocks: ["BTC", "ETH", "BCH", "AVAX", "SOL"],
      //   description:
      //     "Explore cryptocurrencies, a popular type of digital asset class and virtual currency.",
      //   image: "https://cdn.joinbloom.co/category/crypto.png",
      //   snippet: "Cryptocurrencies & tokens",
      // },
      {
        name: "Energy & Utilities",
        stocks: [],
        description:
          "Explore companies that produce, distribute, and manage the most fundamental resources, such as water, electricity, and gas.",
        image: "https://cdn.joinbloom.co/category/energy-utilities.png",
        snippet: "Electricity, fuel, and your everyday services",
      },
      {
        name: "ETFs",
        stocks: [],
        description:
          "Explore exchange-traded funds that are bundled on a specific theme or industry.",
        image: "https://cdn.joinbloom.co/category/etfs.png",
        snippet: "Stock bundles based on market categories",
      },
      {
        name: "Finance & Banking",
        stocks: [],
        description:
          "Explore companies that help manage your money, from checking and savings to loan services.",
        image: "https://cdn.joinbloom.co/category/finance-banking.png",
        snippet: "Businesses that handle your money",
      },
      {
        name: "Food & Drink",
        stocks: [],
        description:
          "Explore companies that produces food and drink, such as fast food chains, groceries, and food distribution centers.",
        image: "https://cdn.joinbloom.co/category/food-drink.png",
        snippet: "Food and beverages from food industries",
      },
      {
        name: "Healthcare",
        stocks: [],
        description:
          "Explore companies that keep your health in check, such as medical drug manufacturers, medical administrations, and research laboratories.",
        image: "https://cdn.joinbloom.co/category/health.png",
        snippet: "Medical, biotechnology, and research services",
      },
      {
        name: "Industrial",
        stocks: [],
        description:
          "Explore companies responsible for creating basic supplies, manufacturing, and constructions.",
        image: "https://cdn.joinbloom.co/category/industrial.png",
        snippet: "Supplies, manufacturing, and construction",
      },
      {
        name: "Media & Telecom",
        stocks: [],
        description:
          "Explore companies that keep you entertained and stay connected via internet, including media companies, internet service providers, and phone service providers.",
        image: "https://cdn.joinbloom.co/category/media-telecom.png",
        snippet: "Film and TV, video games, radio, and more",
      },
      {
        name: "Shopping & Retail",
        stocks: [],
        description:
          "Explore companies that create products for consumers, such as shopping malls and retail stores.",
        image: "https://cdn.joinbloom.co/category/shopping-retail.png",
        snippet: "In-person stores and e-commerce companies",
      },
      {
        name: "Technology",
        stocks: [],
        description:
          "Explore companies responsible for producing technologies, such as electronic hardwares, softwares, and information technology.",
        image: "https://cdn.joinbloom.co/category/technology.png",
        snippet: "Digital powerhouses in software and hardware",
      },
      {
        name: "Transportation",
        stocks: [],
        description:
          "Explore companies that keep you moving from one place to another, such as airlines, railroads, and car services.",
        image: "https://cdn.joinbloom.co/category/transportation.png",
        snippet: "Cars, airlines, railroads, and marine operators",
      },
      {
        name: "Tourism",
        stocks: [],
        description:
          "Explore companies that allow you to travel around the world, such as hotels, travel agencies, and cruise liners.",
        image: "https://cdn.joinbloom.co/category/top25.png",
        snippet: "Hotels, travel agencies, and cruises",
      },
    ];
    for (const x of json) {
      await queryRunner.query(
        `INSERT INTO "StockCategory" ("name", "description", "snippet", "image") VALUES ($1, $2, $3, $4)`,
        [x.name, x.description, x.snippet, x.image]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "StockCategory"`);
  }
}

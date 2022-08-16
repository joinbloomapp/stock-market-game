/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Injectable } from "@nestjs/common";
import {
  StockCategoryEntity,
  StockEntity,
  StockPriceEntity,
} from "@bloom-smg/postgresql";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { SearchPageDto } from "./dto/asset-search.dto";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(StockEntity)
    private readonly stockRepository: Repository<StockEntity>,
    @InjectRepository(StockCategoryEntity)
    private readonly stockCategoryRepository: Repository<StockCategoryEntity>,
    @InjectRepository(StockPriceEntity)
    private readonly stockPriceRepository: Repository<StockPriceEntity>
  ) {}

  /**
   * Used to search all stocks and categories
   */
  async search(
    query: string,
    offset: number,
    limit: number
  ): Promise<SearchPageDto> {
    if (query.length <= 0) {
      return {
        assets: [],
        count: 0,
      };
    }
    let data;
    let count: number;
    if (query.length > 4) {
      [data, count] = await this.stockRepository
        .createQueryBuilder("s")
        .select(["s.id", "s.ticker", "s.name", "s.description", "s.image"])
        .addSelect([
          'ts_rank("s"."search_stock", plainto_tsquery(:query)) as "s_rank"',
        ])
        .where('"s"."search_stock" @@ plainto_tsquery(:query)')
        .setParameter("query", query)
        .addOrderBy("s_rank", "DESC")
        .offset(offset)
        .limit(limit)
        .getManyAndCount();
    } else {
      [data, count] = await this.stockRepository
        .createQueryBuilder("s")
        .where(`s.ticker ILIKE :query OR s.name ILIKE :query`, {
          query: `%${query}%`,
        })
        .select(["s.id", "s.ticker", "s.name", "s.description", "s.image"])
        .orderBy("s.ticker", "ASC")
        .offset(offset)
        .limit(limit)
        .getManyAndCount();
    }

    const prices = await this.stockPriceRepository.find({
      where: { stockId: In(data.map((r) => r.id)) },
      select: ["stockId", "price"],
    });
    const priceMapping = {};
    prices.forEach((p) => {
      priceMapping[p.stockId] = p.price;
    });
    return new SearchPageDto(data, priceMapping, count);
  }
}

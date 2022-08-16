/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import UserEntity, { UserExtraData } from "./entities/user/user.entity";
import SocialAppEntity from "./entities/user/social-app.entity";
import SocialAccountEntity from "./entities/user/social-account.entity";
import SocialTokenEntity from "./entities/user/social-token.entity";
import GameEntity, { GameStatusEnum } from "./entities/game/game.entity";
import PlayerEntity from "./entities/game/player.entity";
import StockEntity from "./entities/stock/stock.entity";
import StockCategoryEntity from "./entities/stock/stock-category.entity";
import StockCategoryMappingEntity from "./entities/stock/stock-category-mapping.entity";
import StockPriceEntity from "./entities/stock/stock-price.entity";
import CurrentPositionEntity from "./entities/game/portfolio/current-position.entity";
import HistoricalPositionEntity from "./entities/game/portfolio/historical-position.entity";
import HistoricalAggregatePositionEntity from "./entities/game/portfolio/historical-aggregate-position.entity";
import HistoricalAggregatePositionMinuteEntity from "./entities/game/portfolio/historical-aggregate-position-minute.entity";
import HistoricalAggregatePositionHourEntity from "./entities/game/portfolio/historical-aggregate-position-hour.entity";
import HistoricalAggregatePositionDayEntity from "./entities/game/portfolio/historical-aggregate-position-day.entity";
import KickedUserEntity from "./entities/game/kicked-user.entity";
import OrderHistoryEntity, {
  OrderTypeEnum,
  OrderStatusEnum,
} from "./entities/game/portfolio/order-history.entity";
import AverageTodayPriceEntity from "./entities/game/portfolio/average-today-price.entity";
import AverageTotalPriceEntity from "./entities/game/portfolio/average-total-price.entity";

// Types
export { GameStatusEnum, OrderTypeEnum, OrderStatusEnum, UserExtraData };

// Entities
export {
  UserEntity,
  KickedUserEntity,
  SocialAppEntity,
  SocialAccountEntity,
  SocialTokenEntity,
  GameEntity,
  PlayerEntity,
  StockEntity,
  StockCategoryEntity,
  StockCategoryMappingEntity,
  StockPriceEntity,
  CurrentPositionEntity,
  HistoricalPositionEntity,
  HistoricalAggregatePositionEntity,
  HistoricalAggregatePositionMinuteEntity,
  HistoricalAggregatePositionHourEntity,
  HistoricalAggregatePositionDayEntity,
  OrderHistoryEntity,
  AverageTodayPriceEntity,
  AverageTotalPriceEntity,
};

const AllEntities = [
  UserEntity,
  KickedUserEntity,
  SocialAppEntity,
  SocialAccountEntity,
  SocialTokenEntity,
  GameEntity,
  PlayerEntity,
  StockEntity,
  StockCategoryEntity,
  StockCategoryMappingEntity,
  StockPriceEntity,
  CurrentPositionEntity,
  HistoricalPositionEntity,
  HistoricalAggregatePositionEntity,
  HistoricalAggregatePositionMinuteEntity,
  HistoricalAggregatePositionHourEntity,
  HistoricalAggregatePositionDayEntity,
  OrderHistoryEntity,
  AverageTodayPriceEntity,
  AverageTotalPriceEntity,
];

export default AllEntities;

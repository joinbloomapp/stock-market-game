import { AdminModule } from "./admin/admin.module";
/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "../system/ConfigurationManager";
import LogsMiddleware from "../system/logger.middleware";
import ormConfig from "../system/OrmConfig";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { APP_GUARD, RouterModule } from "@nestjs/core";
import { GameModule } from "./game/game.module";
import { AssetsModule } from "./assets/assets.module";
import { AuthGuard } from "./auth/auth.guard";
import { SearchModule } from "./search/search.module";
import { NewsModule } from "./news/news.module";
import { MarketModule } from "./market/market.module";
import { CategoriesModule } from "./categories/categories.module";
import { OrdersModule } from "./orders/orders.module";

export const allAppModules = [
  ConfigModule.forRoot({
    load: [configuration], //reminder: To access configuration just do: constructor(private configService: ConfigService) {}
    isGlobal: true, //to not reimport in every module
  }),
  TypeOrmModule.forRoot(ormConfig),
  ScheduleModule.forRoot(),
  AuthModule,
  GameModule,
  AssetsModule,
  UserModule,
  MarketModule,
  SearchModule,
  NewsModule,
  CategoriesModule,
  OrdersModule,
  AdminModule,
];

@Module({
  imports: [
    ...allAppModules,
    RouterModule.register([
      {
        path: "auth",
        module: AuthModule,
      },
    ]),
    RouterModule.register([
      {
        path: "user",
        module: UserModule,
      },
    ]),
    RouterModule.register([
      {
        path: "games",
        module: GameModule,
        children: [
          {
            path: "/:gameId",
            module: OrdersModule,
          },
        ],
      },
    ]),
    RouterModule.register([
      {
        path: "market",
        module: MarketModule,
      },
    ]),
    RouterModule.register([
      {
        path: "search",
        module: SearchModule,
      },
    ]),
    RouterModule.register([
      {
        path: "news",
        module: NewsModule,
      },
    ]),
    RouterModule.register([
      {
        path: "assets",
        module: AssetsModule,
      },
    ]),
    RouterModule.register([
      {
        path: "categories",
        module: CategoriesModule,
      },
    ]),
    RouterModule.register([
      {
        path: "admin",
        module: AdminModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes("*");
  }
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import configuration from "../system/ConfigurationManager";
import LogsMiddleware from "../system/logger.middleware";
import ormConfig from "../system/OrmConfig";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MinutesModule } from "./minutes/minutes.module";

export const allAppModules = [
  ConfigModule.forRoot({
    load: [configuration], //reminder: To access configuration just do: constructor(private configService: ConfigService) {}
    isGlobal: true, //to not reimport in every module
  }),
  TypeOrmModule.forRoot(ormConfig),
  MinutesModule,
];

@Module({
  imports: allAppModules,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes("*");
  }
}

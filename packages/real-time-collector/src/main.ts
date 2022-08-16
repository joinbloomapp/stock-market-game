/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import "src/config";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import Logger from "./system/Logger";
import getConfig from "./system/ConfigurationManager";
import { BloomExceptionFilter } from "./system/exceptions/BloomExceptionFilter";
import { NestExpressApplication } from "@nestjs/platform-express";

async function createApp(): Promise<NestExpressApplication> {
  const serverConfig = getConfig();
  let loggerClass = ConsoleLogger;

  if (serverConfig.storeLogsToLogServer) {
    loggerClass = Logger;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new loggerClass(),
  });

  app.enable("trust proxy");

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useGlobalFilters(new BloomExceptionFilter());

  return app;
}

async function runSocketListener() {
  const app = await createApp();
  await app.init();
}

runSocketListener();

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import "src/config";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
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

async function bootstrapApi() {
  const isInDevelopment = process.env.NODE_ENV === "development";
  const app = await createApp();

  app.enableCors({
    origin: true,
  });

  if (isInDevelopment) {
    const config = new DocumentBuilder()
      .setTitle("Bloom Stock Market Game API")
      .setDescription("Real-time stock market game by Bloom")
      .setVersion("0.0.1")
      .addBearerAuth(
        {
          // I was also testing it without prefix 'Bearer ' before the JWT
          description: `[just text field] Please enter token in following format: Bearer <JWT>`,
          name: "Authorization",
          bearerFormat: "Bearer", // I`ve tested not to use this field, but the result was the same
          scheme: "Bearer",
          type: "http", // I`ve attempted type: 'apiKey' too
          in: "Header",
        },
        "access-token" // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const uiOptions: SwaggerCustomOptions = {
      customSiteTitle: "Bloom Stock Market Game API",
    };

    SwaggerModule.setup("/", app, document, uiOptions);
  }

  await app.listen(isInDevelopment && process.env.IS_AWS !== "1" ? 8000 : 80);
}

bootstrapApi();

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { parse as parseDotenv } from "dotenv";
import * as path from "path";
import { existsSync, readFileSync } from "fs";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

(() => {
  const env = {};
  for (const envFile of [
    path.resolve(process.cwd(), ".config.env"),
    path.resolve(process.cwd(), ".user.env"),
  ]) {
    if (existsSync(envFile)) {
      for (const [key, value] of Object.entries(
        parseDotenv(readFileSync(envFile))
      )) {
        if (!process.env[key]) {
          env[key] = value;
        }
      }
    }
  }
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value.toString();
  }
})();

const config: PostgresConnectionOptions = {
  type: "postgres",
  username: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT),
  synchronize: false,
  entities: ["dist/entities/**/*.entity.js"],
  migrations: ["dist/db/migrations/*.js"],
  cli: {
    migrationsDir: "src/db/migrations",
  },
};

export default config;

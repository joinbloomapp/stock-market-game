/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { parse as parseDotenv } from "dotenv";
import * as path from "path";
import { existsSync, readFileSync } from "fs";

(() => {
  const env = {};
  for (const envFile of [
    path.resolve(process.cwd(), ".env"),
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

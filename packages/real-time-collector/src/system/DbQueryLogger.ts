/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Logger as TypeOrmLogger } from "typeorm";
import { Logger } from "@nestjs/common";

class DbQueryLogger implements TypeOrmLogger {
  private readonly logger = new Logger("SQL");

  logQuery() {
    //commented out, we dont want to log every single query
    /*
    this.logger.log(
      `${query} -- Parameters: ${this.stringifyParameters(parameters)}`,
    );
    */
  }

  logQueryError(error: string, query: string, parameters?: unknown[]) {
    this.logger.error(
      `${query} -- Parameters: ${this.stringifyParameters(
        parameters
      )} -- ${error}`
    );
  }

  logQuerySlow(time: number, query: string, parameters?: unknown[]) {
    this.logger.warn(
      `-- SLOW QUERY Time: ${time} -- Parameters: ${this.stringifyParameters(
        parameters
      )} -- ${query}`
    );
  }

  logMigration(message: string) {
    this.logger.log(message);
  }

  logSchemaBuild(message: string) {
    this.logger.log(message);
  }

  log(level: "log" | "info" | "warn", message: string) {
    if (level === "log") {
      return this.logger.log(message);
    }
    if (level === "info") {
      return this.logger.debug(message);
    }
    if (level === "warn") {
      return this.logger.warn(message);
    }
  }

  private stringifyParameters(parameters?: unknown[]) {
    try {
      return JSON.stringify(parameters);
    } catch {
      return "";
    }
  }
}

export default DbQueryLogger;

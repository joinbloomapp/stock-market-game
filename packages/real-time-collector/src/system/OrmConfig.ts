/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import AllEntities from "@bloom-smg/postgresql";
import DbQueryLogger from "./DbQueryLogger";
import * as path from "path";

const isCI = process.env.CI === "true";

const ormConfig: PostgresConnectionOptions = {
  type: "postgres",
  username: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database:
    process.env.NODE_ENV === "test" && !isCI
      ? `test_${process.env.PG_DATABASE}`
      : process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT),
  synchronize: false,
  entities: [...AllEntities],
  logger: new DbQueryLogger(),
  useUTC: true,
  migrations:
    process.env.NODE_ENV === "test"
      ? [
          path.join(
            __dirname,
            "..",
            "..",
            "..",
            "postgresql",
            "dist/db/migrations/*.js"
          ),
        ]
      : null,
  migrationsRun: false,
  extra: {
    poolSize: 50,
  },
  maxQueryExecutionTime: 300, //it will log all queries that take more than Xms
};

export default ormConfig;

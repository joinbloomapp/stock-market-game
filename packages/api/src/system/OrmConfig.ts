/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import AllEntities from "@bloom-smg/postgresql";
import DbQueryLogger from "./DbQueryLogger";

const isCI = process.env.CI === "true";
const isLocalTest = process.env.NODE_ENV === "test" && !isCI;

const ormConfig: PostgresConnectionOptions = {
  type: "postgres",
  username: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database: isLocalTest
    ? `test_${process.env.PG_DATABASE}`
    : process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT),
  synchronize: false,
  entities: [...AllEntities],
  logger: new DbQueryLogger(),
  maxQueryExecutionTime: 300, //it will log all queries that take more than Xms
};

export default ormConfig;

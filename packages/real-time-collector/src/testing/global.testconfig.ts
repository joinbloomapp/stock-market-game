/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import "../config";
import { createConnection, Connection } from "typeorm";
import ormConfig from "../system/OrmConfig";

const originalWarn = console.warn.bind(console.warn);

async function migrateTestDb(conn: Connection) {
  try {
    const exists = await conn.query(
      `CREATE DATABASE test_${process.env.PG_DATABASE}`
    );
    if ((exists as string).includes("ERROR")) {
      return;
    }
  } catch {
    return;
  }
  try {
    await conn.query(
      `CREATE ROLE "${process.env.PG_USERNAME}" WITH LOGIN SUPERUSER CREATEDB ENCRYPTED PASSWORD '${process.env.PG_PASSWORD}';`
    );
    await conn.query(
      `GRANT ALL PRIVILEGES ON DATABASE test_${process.env.PG_DATABASE} TO "${process.env.PG_USERNAME}";`
    );
  } catch (e) {
    console.warn(e);
  }
}

// Disable warning for js files in dist/
module.exports = async () => {
  if (process.env.NODE_ENV === "test" && process.env.CI !== "true") {
    const conn = await createConnection({
      ...ormConfig,
      database: process.env.PG_DATABASE,
      logging: true,
    });
    await migrateTestDb(conn);
    await conn.runMigrations({ transaction: "all" });
    await conn.close();
  }

  console.warn = (msg) => {
    for (const x of ["postgresql/dist/"]) {
      if (msg.toString().includes(x)) {
        return;
      }
    }
    originalWarn(msg);
  };
};

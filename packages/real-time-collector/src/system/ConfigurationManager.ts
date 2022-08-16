/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export default () => {
  const config = {
    storeLogsToLogServer: false,
  };

  config.storeLogsToLogServer =
    (process.env.LOG_LEVEL ?? "development").toLowerCase() !== "development" ||
    process.env.IS_AWS === "1";

  return config;
};

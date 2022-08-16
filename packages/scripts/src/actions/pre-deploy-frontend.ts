/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as core from "@actions/core";

async function configureFrontend(deploymentEnv) {
  let VITE_BASE_API_URL = `https://game-api-${deploymentEnv}.joinbloom.co`;
  let VITE_APP_URL = `https://game-${deploymentEnv}.joinbloom.co`;
  if (deploymentEnv === "prod") {
    VITE_BASE_API_URL = "https://game-api.joinbloom.co";
    VITE_APP_URL = "https://game.joinbloom.co";
  }
  if (deploymentEnv === "dev") {
    VITE_BASE_API_URL = "https://game-api-dev.joinbloom.co";
  }
  core.setOutput("VITE_BASE_API_URL", VITE_BASE_API_URL);
  core.setOutput("VITE_APP_URL", VITE_APP_URL);
}

async function run() {
  const { isManual, deploymentEnv } = process.env;
  const usesManual = isManual.toLowerCase() === "true";

  const runner: (...any) => Promise<any> = {
    frontend: configureFrontend,
  }[process.env.package];
  if (!runner) {
    return;
  }
  await runner(deploymentEnv, usesManual);
}

export default run;

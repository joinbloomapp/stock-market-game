/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

/**
 * This file is run in GitHub Actions ci.yml
 */

import * as core from "@actions/core";
import { checkDockerfiles } from "./ci/check/dockerfile";
import { checkEnv } from "./ci/check/env";
import { checkInitPackages } from "./ci/check/init-packages";

async function run() {
  const tasks: (() => Promise<boolean>)[] = [
    checkEnv,
    checkDockerfiles,
    checkInitPackages,
  ];
  let shouldExit = false;
  for (const task of tasks) {
    const taskShouldExit = await task();
    if (!shouldExit) {
      shouldExit = taskShouldExit;
    }
  }
  if (shouldExit) {
    core.setFailed("Failed");
  } else {
    core.info("No errors!");
  }
}

export default run;

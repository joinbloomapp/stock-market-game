/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import * as core from "@actions/core";

/**
 * Manipulates packages using our necessary logic
 * @param isManual {boolean} whether the button in GitHub Actions tab was used
 * i.e. whether workflow_dispatch was utilized
 * @param deploymentEnv {'dev'|'staging'|'prod'} a string denoting the environment
 * to deploy to
 * @param packages {Array<string>} packages in the `packages` dir that should
 * be deployed
 */
function configurePackages(
  isManual: boolean,
  deploymentEnv: string,
  packages: string[]
) {
  const arrayDeploymentEnv = new Set([deploymentEnv]);

  const p = new Set(packages);
  const fp = new Set();

  if (p.has("frontend")) {
    p.delete("frontend");
    fp.add("frontend");
  }
  if (deploymentEnv !== "dev") {
    p.delete("real-time-collector");
  }

  core.setOutput(
    "deploymentEnv",
    JSON.stringify(Array.from(arrayDeploymentEnv))
  );
  core.setOutput("packages", JSON.stringify(Array.from(p)));
  core.setOutput("frontendPackages", JSON.stringify(Array.from(fp)));
}

async function run() {
  const { isManual, deploymentEnv, packages } = process.env;
  const usesManual = isManual.toLowerCase() === "true",
    parsedPackages = JSON.parse(packages);
  configurePackages(usesManual, deploymentEnv, parsedPackages);
}

export default run;

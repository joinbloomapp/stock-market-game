/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as core from "@actions/core";
import CITest from "./actions/ci-test";
import PreDeploy from "./actions/pre-deploy";
import PreDeployFrontend from "./actions/pre-deploy-frontend";
import Deploy from "./actions/deploy";
import PostDeploy from "./actions/post-deploy";
import CopyParameterStoreValues from "./aws/copy.parameterstore";

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return;
  }
  const actions = {
    "ci-test": CITest,
    "pre-deploy": PreDeploy,
    "pre-deploy-frontend": PreDeployFrontend,
    deploy: Deploy,
    "post-deploy": PostDeploy,
    "aws-parameter-store-copy": CopyParameterStoreValues,
  };
  const fn = actions[args[0]];
  if (fn === null || fn === undefined) {
    core.setFailed("Invalid script name");
    return;
  }
  await fn(...args.slice(1));
}

main();

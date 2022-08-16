/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { CodeDeploy } from "aws-sdk";
import * as core from "@actions/core";

export const completedStatuses = ["Succeeded", "Failed", "Stopped", "Ready"];

export function getDeploymentNames(): {
  applicationName: string;
  deploymentGroupName: string;
} {
  const cluster = process.env.ecsCluster ?? "game-api-dev";
  const service = process.env.ecsService ?? "game-api-dev-service";
  return {
    applicationName: `AppECS-${cluster}-${service}`,
    deploymentGroupName: `DgpECS-${cluster}-${service}`,
  };
}

export async function getLatestDeployment(
  cdClient: CodeDeploy
): Promise<CodeDeploy.ListDeploymentsOutput> {
  try {
    // if not a blue/green HTTP facing deployment, then this doesn't matter
    const deployments = await cdClient
      .listDeployments(getDeploymentNames())
      .promise();
    if (!deployments.deployments.length) {
      core.info("No history of any deployments");
    } else {
      return deployments;
    }
  } catch {
    const names = getDeploymentNames();
    core.info(
      `No group ${names.deploymentGroupName} and app ${names.applicationName}`
    );
  }
  throw new Error("return");
}

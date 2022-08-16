/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { CodeDeploy } from "aws-sdk";
import * as core from "@actions/core";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async/fixed";
import { getLatestDeployment, completedStatuses } from "./utils";
import { checkForServiceStability } from "./post-deploy";

/**
 * Stops any active deployments for service to allow for this commit's
 * new deployment. This allows for a burst of deployments. Previously,
 * if there was an active deployment, the GitHub Action would crash
 * because of the active deployment conflict.
 */
async function stopDeployments() {
  core.info("Stopping any active deployments");

  const region = "us-east-1";
  const cdClient = new CodeDeploy({ region: region });
  let deployments: CodeDeploy.ListDeploymentsOutput;
  try {
    deployments = await getLatestDeployment(cdClient);
  } catch (e) {
    return;
  }
  const latestDeploymentId = deployments.deployments[0];
  core.info(
    `Current active deployment: ${latestDeploymentId} (https://${region}.console.aws.amazon.com/codesuite/codedeploy/deployments/${latestDeploymentId}?region=${region})`
  );
  const currentDeployment = await cdClient
    .getDeployment({
      deploymentId: latestDeploymentId,
    })
    .promise();
  // With currentDeployment.deploymentInfo.instanceTerminationWaitTimeStarted
  // Don't delete the original task set if this is true since we haven't
  // performed a proper health check. Also, Andrew has no idea how (2022-06-13)
  if (completedStatuses.includes(currentDeployment.deploymentInfo.status)) {
    core.info("No active deployments");
    return;
  }
  core.info(`Stopping deployment ${latestDeploymentId}`);
  const deploymentStopped = await cdClient
    .stopDeployment({
      deploymentId: latestDeploymentId,
    })
    .promise();
  core.info(`Status message: ${deploymentStopped.statusMessage}`);
  // give it 15 seconds so that we get a rollback
  core.info("Waiting 10 seconds for rollback deployment to start");
  setTimeout(() => {
    const interval = setIntervalAsync(async () => {
      const currentDeployment = await cdClient
        .getDeployment({
          deploymentId: latestDeploymentId,
        })
        .promise();
      if (completedStatuses.includes(currentDeployment.deploymentInfo.status)) {
        await clearIntervalAsync(interval);
        // Wait for rollback deployment so that new deployment won't crash
        await checkForServiceStability();
        core.info("Successfully stopped active deployment");
      }
    }, 1000);
  }, 10000);
}

async function run() {
  await stopDeployments();
}

export default run;

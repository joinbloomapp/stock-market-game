/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { CodeDeploy } from "aws-sdk";
import fetch from "node-fetch";
import * as core from "@actions/core";
import { getLatestDeployment, completedStatuses } from "./utils";

export function slackFailedDeploymentMessage() {
  // Customize further here: https://app.slack.com/block-kit-builder/T02RR0A0EBB#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Bloomrepo%20Deployment%20Failed%22,%22emoji%22:true%7D%7D,%7B%22type%22:%22section%22,%22fields%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Type:*%5CnStaging%22%7D,%7B%22type%22:%22mrkdwn%22,%22text%22:%22*Created%20by:*%5Cn%3Cexample.com%7CFred%20Enriquez%3E%22%7D%5D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22Click%20to%20see%20CI/CD%20Logs%22%7D,%22accessory%22:%7B%22type%22:%22button%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22CI%20Logs%22,%22emoji%22:true%7D,%22value%22:%22github-runner-view%22,%22url%22:%22https://github.com/joinbloomapp/bloomrepo/runs/6846204290?check_suite_focus=true%22,%22action_id%22:%22button-action%22%7D%7D,%7B%22type%22:%22section%22,%22text%22:%7B%22type%22:%22mrkdwn%22,%22text%22:%22Commit%20SHA%22%7D,%22accessory%22:%7B%22type%22:%22button%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Commit%20link%22,%22emoji%22:true%7D,%22value%22:%22github-commit-link%22,%22url%22:%22https://github.com/joinbloomapp/bloomrepo/commit/68315c2eb6a7d7a62da1107ad7624b0c9760d94f%22,%22action_id%22:%22button-action%22%7D%7D%5D%7D
  return {
    text: `Latest ${process.env.GITHUB_REPOSITORY} commit failed to deploy to ${process.env.deploymentEnv}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Bloomrepo Deployment Failed",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Type:*\n${process.env.deploymentEnv}`,
          },
          {
            type: "mrkdwn",
            text: `*Created by:*\n<https://github.com/${process.env.GITHUB_ACTOR}|${process.env.GITHUB_ACTOR}>`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Click to see CI/CD Logs",
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Log Link",
            emoji: true,
          },
          value: "github-runner-view",
          url: `https://github.com/${process.env.GITHUB_REPOSITORY}/runs/${process.env.GITHUB_RUN_ID}?check_suite_focus=true`,
          action_id: "button-action",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Commit SHA: ${process.env.GITHUB_SHA}`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Commit link",
            emoji: true,
          },
          value: "github-commit-link",
          url: `https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${process.env.GITHUB_SHA}`,
          action_id: "button-action",
        },
      },
    ],
  };
}

/**
 * Checks for new task stability
 */
export async function checkForServiceStability() {
  const cdClient = new CodeDeploy({ region: "us-east-1" });
  let deployments: CodeDeploy.ListDeploymentsOutput;
  try {
    deployments = await getLatestDeployment(cdClient);
  } catch (e) {
    return;
  }
  const latestDeploymentId = deployments.deployments[0];
  // the time doesn't really matter since we just wait until traffic re-routed
  core.info(
    "Waiting 1.75 minutes for post-install hook in CodeDeploy to finish"
  );
  let numFailedAttempts = 0;
  let successfulAttempts = 0;

  const subdomains = {
    api: {
      dev: "game-api-dev",
      staging: "game-api-staging",
      prod: "game-api",
    },
  };
  const subdomain =
    subdomains[process.env.package ?? "api"][
      process.env.deploymentEnv ?? "dev"
    ];

  setTimeout(() => {
    const interval = setInterval(async () => {
      const currentDeployment = await cdClient
        .getDeployment({
          deploymentId: latestDeploymentId,
        })
        .promise();
      const url = `https://${subdomain}.joinbloom.co`;
      if (completedStatuses.includes(currentDeployment.deploymentInfo.status)) {
        clearInterval(interval);
        core.info(
          `Current deployment ${latestDeploymentId} reached status ${currentDeployment.deploymentInfo.status}`
        );
      } else if (
        currentDeployment.deploymentInfo.instanceTerminationWaitTimeStarted
      ) {
        // Perform several requests to ensure the instance is working
        try {
          const resp = await fetch(url);
          if (resp.ok || [401, 403].includes(resp.status)) {
            core.info(
              `Successfully contacted server ${++successfulAttempts} time${
                successfulAttempts === 1 ? "" : "s"
              }`
            );
            if (successfulAttempts === 3) {
              clearInterval(interval);
            }
            return;
          } else {
            core.error(`${resp.statusText} with status code ${resp.status}`);
          }
        } catch (e) {
          core.error(e);
        }
        if (++numFailedAttempts === 5) {
          clearInterval(interval);
          core.setFailed(`Health check against ${url} failed`);
          // Send in Slack this failure with webhooks
          if (process.env.CI === "true") {
            await fetch(process.env.SLACK_ENGINEERING_WEBHOOK, {
              method: "POST",
              headers: {
                "User-Agent": "github-actions-bloom-smg-post-deploy",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(slackFailedDeploymentMessage()),
            });
          }
        } else {
          core.error(
            `Failed ${numFailedAttempts} time${
              numFailedAttempts === 1 ? "" : "s"
            } for health check`
          );
        }
      }
    }, 5000);
  }, 1.75 + 1000 * 60);
}

async function run() {
  await checkForServiceStability();
}

export default run;

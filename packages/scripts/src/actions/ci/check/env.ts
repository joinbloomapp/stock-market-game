/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { promises as fs } from "fs";
import * as core from "@actions/core";
import { getParameters } from "../../../aws/utils/ssm";
import { fromDir } from "../../utils/from-dir";
import { parse as dotenvParse } from "dotenv";

export enum Environment {
  dev = "dev",
  staging = "staging",
  prod = "prod",
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Checks task definition details outside of environment variables
 * @param data {Object} parsed task definition
 * @param environment {Environment}
 * @param pkg {string} package name in packages/
 * @returns {string[]} error messages
 * @private
 */
function _checkTaskDefDetails(
  data: any,
  environment: Environment,
  pkg: string
) {
  const messages = [];

  const correctFam = `smg-${pkg}-${environment}`;
  const envCap = capitalizeFirstLetter(environment);
  const correctTaskRoleArn = `arn:aws:iam::968542545167:role/ecsSmg${envCap}InstanceRole`;
  const correctExecutionRoleArn = `arn:aws:iam::968542545167:role/ecsSmg${envCap}TaskExecutionRole`;

  const conditions = [
    {
      condition: data.family === correctFam,
      message: `uses wrong family. Specify ${correctFam}`,
    },
    {
      condition: data.taskRoleArn === correctTaskRoleArn,
      message: `uses wrong taskRoleArn. Specify ${correctTaskRoleArn}`,
    },
    {
      condition: data.executionRoleArn === correctExecutionRoleArn,
      message: `uses wrong taskExecutionRoleArn. Specify ${correctExecutionRoleArn}`,
    },
  ];
  for (const condition of conditions) {
    if (!condition.condition) {
      messages.push(`File ${condition.message}`);
    }
  }
  return messages;
}

/**
 * Checks task definition and environment variables from .env
 * @param data {ParameterList}
 * @return {Promise<boolean>}
 * @private
 */
async function _checkPkgEnvAndTaskDef(data) {
  const dotenvFiles = await fromDir(".env", "./packages");
  let shouldExit = false;

  const paramARNs = new Set(data.map((x) => x.ARN));

  for (const file of dotenvFiles) {
    const components = file.split("/");
    const pkg = components[components.indexOf("packages") + 1];
    const basePath = `./${file.split(`packages/${pkg}`, 1)[0]}packages/${pkg}`;
    try {
      await fs.access(`${basePath}/deploy`);
    } catch {
      continue;
    }

    const env = dotenvParse(await fs.readFile(file));
    const envKeys = Object.keys(env);

    // Checking task definitions aren't missing .env variables
    for (const taskDef of await fromDir(".json", `${basePath}/deploy`)) {
      const task = JSON.parse(await fs.readFile(taskDef, "utf-8"));
      // for readability purposes, remove home dir
      let messages = [];

      const taskKeys = new Set();
      const taskARNs = new Set();
      const environment = taskDef.includes("dev")
        ? Environment.dev
        : taskDef.includes("staging")
        ? Environment.staging
        : Environment.prod;
      // Checking task definition values use correct environment
      const incorrectEnvironmentARNs = [];
      task.containerDefinitions.forEach((def) => {
        if (def.environment) {
          def.environment.forEach((x) => {
            taskKeys.add(x.name);
          });
        }
        if (def.secrets) {
          const correctEnv = `parameter/smg-${environment}`;
          def.secrets.forEach((x) => {
            taskKeys.add(x.name);
            taskARNs.add(x.valueFrom);
            // Check if using wrong environment for task definition
            if (!x.valueFrom.includes(correctEnv)) {
              incorrectEnvironmentARNs.push(x.valueFrom);
            }
          });
        }
      });
      // Check if there are variables in .env that are missing in task def
      // We don't need to check if there are variables in task def that are
      // missing in .env since it could be deployment environment related
      const missing = new Set([...envKeys].filter((x) => !taskKeys.has(x)));

      // Check if all task definition keys are in AWS, and output those that
      // are missing, as well.
      const missingARNs = new Set(
        [...taskARNs].filter((x) => !paramARNs.has(x))
      );

      // Check Task Definition setup is correct e.g. using right roles for its VPC
      messages = [...messages, ..._checkTaskDefDetails(task, environment, pkg)];

      const pStore = "AWS Systems Manager Parameter Store";

      // Missing env vars in task definition
      if (missing.size) {
        messages.push(
          `Task definition missing environment variables from package ${pkg} (checked using .env):\n${Array.from(
            missing
          ).join("\n")}`
        );
      }

      // Missing in AWS Systems Manager Parameter Store
      if (missing.size + missingARNs.size) {
        messages.push(
          `Task definition includes secret values for package ${pkg} that aren't in ${pStore}.` +
            ` Refer to docs/devops for how to add environment variables to ${pStore}`
        );
        if (missingARNs.size) {
          messages.push(`Missing ARNs:\n${Array.from(missingARNs).join("\n")}`);
        }
        if (missing.size) {
          messages.push(
            `\nAdd these suggested missing ARNs to ${pStore} AND this task definition file:\n${Array.from(
              missing
            )
              .map(
                (x) =>
                  `arn:aws:ssm:us-east-1:968542545167:parameter/smg-${environment}/${pkg}/${x}`
              )
              .join("\n")}`
          );
        }
      }

      // Incorrect environment
      if (incorrectEnvironmentARNs.length) {
        messages.push(
          `\nTask definition has an ARN using the incorrect environment for task definition (${taskDef}). The ARN should specify bloom-${environment} in its ARN:\n${incorrectEnvironmentARNs.join(
            "\n"
          )}`
        );
      }

      if (messages.length) {
        shouldExit = true;
        core.error(`\nTask definition: ${taskDef}`);
        core.error("----------------------------------------");
        messages.forEach((msg) => {
          core.error(`${msg}\n`);
        });
      }
    }
  }
  return shouldExit;
}

/**
 * First grabs all environment variables from SSM
 * 1. Checks .env contents are in task-definition
 * 2. Checks all task-definition contents are in Systems Manager Parameter Store
 * 3. Checks task definition set up is correct
 * @returns {boolean} whether to exit code 1
 */
export async function checkEnv() {
  return await _checkPkgEnvAndTaskDef(await getParameters());
}

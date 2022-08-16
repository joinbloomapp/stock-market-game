/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { SSM } from "aws-sdk";
import * as core from "@actions/core";
import { getParameters } from "./utils/ssm";

/**
 * Copy parameter store values from one environment to another.
 * Really helpful for copying staging environment variables to dev
 * @param env1 {string} environment copying from
 * @param env2 {string} destination environment
 */
async function copyStagingToEnv(env1: string, env2: string) {
  const environments = ["dev", "staging", "prod"];
  const checkEnv = (_env: string) => {
    if (!environments.includes(_env)) {
      core.setFailed(`${_env} is an invalid environment. Use ${environments}`);
      return false;
    }
    return true;
  };
  if (!checkEnv(env1) || !checkEnv(env2)) return;
  const parameters = await getParameters();
  const existingParameters = new Set();
  parameters.forEach((x) => {
    existingParameters.add(x.Name);
  });
  const ssmClient = new SSM({
    region: "us-east-1",
  });
  core.info(`Add new parameters for ${env2} environment`);
  for (const param of parameters) {
    if (param.ARN.split("/")[1].split("-")[1] !== env1) continue;
    const newName = param.Name.replace(`smg-${env1}`, `smg-${env2}`);
    if (existingParameters.has(newName)) continue;
    // add the parameter
    core.info(`Adding new parameter ${newName}`);
    await ssmClient
      .putParameter({
        Name: newName,
        Value: param.Value,
        Type: param.Type,
        DataType: param.DataType,
        Overwrite: false,
      })
      .promise();
  }
}

export default copyStagingToEnv;

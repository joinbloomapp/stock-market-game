/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as core from "@actions/core";
import { SSM } from "aws-sdk";

type deploymentEnv = "dev" | "staging" | "prod";

async function getDeploymentEnvParameters(
  ssmClient: SSM,
  env: deploymentEnv
): Promise<SSM.ParameterList> {
  const parameters: SSM.ParameterList = [];
  let r = await ssmClient
    .getParametersByPath({
      Path: `/smg-${env}/`,
      Recursive: true,
    })
    .promise();
  parameters.push(...r.Parameters.filter((x) => x.Name.startsWith("/smg-")));
  while (r.NextToken) {
    r = await ssmClient
      .getParametersByPath({
        Path: `/smg-${env}/`,
        Recursive: true,
        NextToken: r.NextToken,
      })
      .promise();
    parameters.push(...r.Parameters.filter((x) => x.Name.startsWith("/smg-")));
  }
  return parameters;
}

export async function getParameters(): Promise<SSM.ParameterList> {
  core.info("Checking environment variables in each package");
  core.info(
    "Loading AWS Systems Manager Parameter Store environment variables..."
  );

  const ssmClient = new SSM({
    region: "us-east-1",
  });
  const parameters: SSM.ParameterList = [];
  for (const env of ["dev", "staging", "prod"]) {
    parameters.push(
      ...(await getDeploymentEnvParameters(ssmClient, env as deploymentEnv))
    );
  }
  core.info("Done loading Parameter Store variables");
  return parameters;
}

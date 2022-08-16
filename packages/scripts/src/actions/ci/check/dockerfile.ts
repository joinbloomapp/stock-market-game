/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as core from "@actions/core";
import { promises as fs } from "fs";
import { fromDir } from "../../utils/from-dir";

export async function checkDockerfiles() {
  core.info("Checking Dockerfile in each deployable package");
  let shouldExit = false;

  // clean out in docker compose files (even though they don't exist... yet)
  const dockerfiles = (await fromDir("Dockerfile", "./packages")).filter(
    (x) => x.split("/packages/")[0].split("/").length === 2
  );
  for (const file of dockerfiles) {
    const components = file.split("/");
    const pkg = components[components.indexOf("packages") + 1];
    const basePath = `./${file.split(`packages/${pkg}`, 1)[0]}packages/${pkg}`;
    const packageJson = JSON.parse(
      await fs.readFile(`${basePath}/package.json`, "utf-8")
    );
    const DockerfileContent = await fs.readFile(file, "utf-8");
    const _depFn = (name) =>
      Object.keys(packageJson[name]).filter((x) => {
        return x.includes("@bloom/");
      });
    const messages = [];
    [pkg, ..._depFn("dependencies"), ..._depFn("devDependencies")].forEach(
      (x) => {
        const outsidePackage = x.split("/")[1];
        [
          `ADD ./packages/${outsidePackage}/ ./packages/${outsidePackage}/`,
          `WORKDIR /server/packages/${outsidePackage}/`,
        ].forEach((includes) => {
          if (!DockerfileContent.includes(includes)) {
            messages.push(`Dockerfiles doesn't include: ${includes}`);
          }
        });
      }
    );

    if (messages.length) {
      shouldExit = true;
      core.error(`\nDockerfile ${file}`);
      core.error("----------------------------------------");
      messages.forEach((msg) => {
        core.error(msg);
      });
    }
  }
  return shouldExit;
}

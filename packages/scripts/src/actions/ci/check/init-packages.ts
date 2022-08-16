/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as core from "@actions/core";
import { fromDir } from "../../utils/from-dir";

/**
 * Checks whether a file exists in a package
 * @param filename
 * @param allPackages
 * @returns all packages that didn't include the file
 */
async function fileExists(
  filename: string,
  allPackages: string[]
): Promise<string[]> {
  const foundPackages = [];
  const files = await fromDir(filename, "./packages");
  for (const file of files) {
    const components = file.split("/");
    const pkg = components[components.indexOf("packages") + 1];
    foundPackages.push(pkg);
  }
  return allPackages.filter((x) => !foundPackages.includes(x));
}

/**
 * Checks all lint files are in all packages
 */
export async function checkInitPackages(): Promise<boolean> {
  core.info("Checking all necessary initialized files are in packages");
  const allPackages = [];
  const files = await fromDir("package.json", "./packages");
  for (const file of files) {
    const components = file.split("/");
    const pkg = components[components.indexOf("packages") + 1];
    allPackages.push(pkg);
  }
  let shouldExit = false;
  for (const x of [".lintstagedrc.json"]) {
    const missing = await fileExists(x, allPackages);
    if (missing.length) {
      shouldExit = true;
      missing.forEach((pkg) => {
        core.error(`Package ${pkg} did not include ${x}`);
      });
    }
  }
  return shouldExit;
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { promises as fs } from "fs";
import * as path from "path";

/**
 * @param filter {string}
 * @param startPath {string}
 * @return {Promise<Array<string>>} returns a list of files
 */
export async function fromDir(filter, startPath) {
  if (!(await fs.stat(startPath))) {
    return [];
  }

  const files = await fs.readdir(startPath);
  const fileList = [];
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = await fs.lstat(filename);
    if (stat.isDirectory()) {
      fileList.push(...(await fromDir(filter, filename)));
    } else if (filename.endsWith(filter)) {
      fileList.push(filename);
    }
  }
  return fileList;
}

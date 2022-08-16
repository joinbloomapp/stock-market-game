/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { through } from "through";

export function mapSync(sync) {
  return through(function write(data) {
    let mappedData;
    try {
      mappedData = sync(data);
    } catch (e) {
      return this.emit("error", e);
    }
    if (mappedData !== undefined) {
      this.emit("data", mappedData);
    }
  });
}

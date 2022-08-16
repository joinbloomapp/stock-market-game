/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import "../config";

const originalWarn = console.warn.bind(console.warn);

// Disable warning for js files in dist/
module.exports = async () => {
  console.warn = (msg) => {
    for (const x of ["postgresql/dist/"]) {
      if (msg.toString().includes(x)) {
        return;
      }
    }
    originalWarn(msg);
  };
};

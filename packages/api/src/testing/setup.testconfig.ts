/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const originalWarn = console.warn.bind(console.warn);

// Disable warning for js files in dist/
module.exports = () => {
  console.warn = (msg) => {
    for (const x of ["/dist/"]) {
      if (msg.toString().includes(x)) {
        return;
      }
    }
    originalWarn(msg);
  };
};

if (!process.env.CI) {
  jest.setTimeout(1000000);
}

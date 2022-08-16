/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  ColumnNumberTransformer,
  NumberTransformOptions,
} from "./string-to-number.transformer";

export class Int8MultiplierTransformer extends ColumnNumberTransformer {
  multiplier: number;

  /**
   * @param multiplier Given a value, multiply it
   * @param opts options
   * @param opts.positive If true, ensure all numbers are positive
   * @param opts.silent If true, forces options to be enforced without throwing
   */
  constructor(multiplier = 1000, opts: NumberTransformOptions = {}) {
    super(opts);
    this.multiplier = multiplier;
  }

  public to(data: number): number {
    if (this.positive) {
      if (data < 0) {
        if (this.silent) {
          return 0;
        } else {
          throw new Error(`Negative number: ${data}`);
        }
      }
    }
    return Math[this.operator](data * this.multiplier);
  }

  public from(data: string): number {
    // output value, you can use Number, parseFloat variations
    // also you can add nullable condition:
    // if (!Boolean(data)) return 0;

    return parseInt(data) / this.multiplier;
  }
}

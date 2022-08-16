/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export type NumberTransformerOperator = "trunc" | "round";

export interface NumberTransformOptions {
  positive?: boolean;
  silent?: boolean;
  operator?: NumberTransformerOperator;
}

export class ColumnNumberTransformer {
  positive: boolean;
  silent: boolean;
  operator: NumberTransformerOperator;
  parseFloat: boolean;

  /**
   * @param opts options
   * @param opts.positive If true, ensure all numbers are positive
   * @param opts.silent If true, forces options to be enforced without throwing
   */
  constructor(
    opts: {
      positive?: boolean;
      silent?: boolean;
      operator?: NumberTransformerOperator;
      parseFloat?: boolean;
    } = {}
  ) {
    this.positive = opts.positive || false;
    this.silent = opts.silent || false;
    this.operator = opts.operator || "trunc";
    this.parseFloat = opts.parseFloat || false;
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
    return data;
  }

  public from(data: string): number {
    // output value, you can use Number, parseFloat variations
    // also you can add nullable condition:
    // if (!Boolean(data)) return 0;
    if (this.parseFloat) {
      return parseFloat(data);
    }
    return parseInt(data);
  }
}

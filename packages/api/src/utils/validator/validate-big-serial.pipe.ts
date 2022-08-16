/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  Injectable,
  HttpStatus,
  Optional,
  ArgumentMetadata,
  PipeTransform,
} from "@nestjs/common";
import {
  ErrorHttpStatusCode,
  HttpErrorByCode,
} from "../http-error-by-code.util";

export interface ValidateBigSerialPipeOptions {
  errorHttpStatusCode?: ErrorHttpStatusCode;
  exceptionFactory?: (error: string) => any;
  allowLeadingZeroes?: boolean;
  min?: string;
  max?: string;
  lt?: string;
  gt?: string;
}

const int = /^(?:0|[1-9][0-9]*)$/;
const intLeadingZeroes = /^[0-9]+$/;

/**
 * Verifies that the value is a valid Postgres big serial value
 *
 * @publicApi
 * @pipe
 */
@Injectable()
export class ValidateBigSerialPipe implements PipeTransform<string> {
  protected exceptionFactory: (error: string) => any;
  protected allowLeadingZeroes: boolean;
  protected min?: bigint;
  protected max?: bigint;
  protected lt?: bigint;
  protected gt?: bigint;

  constructor(@Optional() options?: ValidateBigSerialPipeOptions) {
    options = options || {};
    const {
      exceptionFactory,
      errorHttpStatusCode = HttpStatus.BAD_REQUEST,
      allowLeadingZeroes = true,
      min = "1",
      max = "9223372036854775807",
      lt,
      gt,
    } = options;

    this.min = BigInt(min);
    this.max = BigInt(max);
    this.lt = BigInt(lt || 0);
    this.gt = BigInt(gt || 0);
    this.allowLeadingZeroes = allowLeadingZeroes;
    this.exceptionFactory =
      exceptionFactory ||
      ((error) => new HttpErrorByCode[errorHttpStatusCode](error));
  }

  /**
   * Method that accesses and performs optional transformation on argument for
   * in-flight requests.
   *
   * @param value currently processed route argument
   * @param metadata contains metadata about the currently processed route argument
   */
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    if (!this.isBigSerial(BigInt(value))) {
      throw this.exceptionFactory(
        "Validation failed (numeric string valued from 1 to 9223372036854775807 required)"
      );
    }
    return value.toString();
  }

  /**
   * @param value currently processed route argument
   * @returns `true` if `value` is a valid integer number
   */
  protected isBigSerial(value: bigint): boolean {
    const regex = this.allowLeadingZeroes ? intLeadingZeroes : int;

    // Check min/max/lt/gt
    const minCheckPassed = !this.min || value >= this.min;
    const maxCheckPassed = !this.max || value < this.max;
    const ltCheckPassed = !this.lt || value < this.lt;
    const gtCheckPassed = !this.gt || value > this.gt;

    return (
      regex.test(value.toString()) &&
      minCheckPassed &&
      maxCheckPassed &&
      ltCheckPassed &&
      gtCheckPassed
    );
  }
}

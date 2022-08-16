/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ValidationOptions, buildMessage, ValidateBy } from "class-validator";
import isInt from "validator/lib/isInt";
import ValidatorJS from "validator";

export const IS_BIG_SERIAL_STRING = "isBigSerialString";

/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 *
 * @decorator
 */
export function isBigSerialString(
  value: unknown,
  options?: ValidatorJS.IsNumericOptions
): boolean {
  options = options || {};
  options.max = "9223372036854775807";
  options.min = "1";
  return typeof value === "string" && isInt(value, options);
}

/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
export function IsBigSerialString(
  options?: ValidatorJS.IsNumericOptions,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  options = options || {};
  options.max = "9223372036854775807";
  options.min = "1";
  return ValidateBy(
    {
      name: IS_BIG_SERIAL_STRING,
      constraints: [options],
      validator: {
        validate: (value, args): boolean =>
          isBigSerialString(value, args.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + "$property must be a positive integer string",
          validationOptions
        ),
      },
    },
    validationOptions
  );
}

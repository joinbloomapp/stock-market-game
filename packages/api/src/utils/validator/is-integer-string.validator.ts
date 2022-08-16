/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ValidationOptions, buildMessage, ValidateBy } from "class-validator";
import isInt from "validator/lib/isInt";
import ValidatorJS from "validator";

export const IS_INTEGER_STRING = "isIntegerString";

/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
export function isIntegerString(
  value: unknown,
  options?: ValidatorJS.IsNumericOptions
): boolean {
  return typeof value === "string" && isInt(value, options);
}

/**
 * Checks if the string is numeric.
 * If given value is not a string, then it returns false.
 */
export function IsIntegerString(
  options?: ValidatorJS.IsNumericOptions,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_INTEGER_STRING,
      constraints: [options],
      validator: {
        validate: (value, args): boolean =>
          isIntegerString(value, args.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + "$property must be an integer string",
          validationOptions
        ),
      },
    },
    validationOptions
  );
}

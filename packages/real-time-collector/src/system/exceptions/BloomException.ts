/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { InternalServerErrorException } from "@nestjs/common";
import BloomExceptionType, { AllMessagesForUsers } from "./BloomExceptionType";

/**
 *
 *  Bloom exception
 *
 */
export default class BloomException extends InternalServerErrorException {
  code: string;
  message: string;
  type: BloomExceptionType;

  /**
   * Creates an instance of bloom exception.
   *
   * @param  {string} uniqueId - uniqueId needs to be unique in the whole code (= easy to find) for example #1522BE-1 (1 = day of the month | 5 = Month # | 22 = year | BE = intials of this class | -1 = first in this class)
   * @param  {string} message
   * @param  {string} [type]
   *
   */
  constructor(uniqueId: string, message: string, type?: BloomExceptionType) {
    super({
      uniqueId: uniqueId,
      message: message,
      type: type,
      messageForUser: AllMessagesForUsers[type],
    });
  }
}

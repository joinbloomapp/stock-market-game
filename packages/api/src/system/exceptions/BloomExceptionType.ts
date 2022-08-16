/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSONValue } from "src/utils/types";

enum BloomExcpetionType {
  InternalServerError = "InternalServerError",
  NotEnoughCoins = "NotEnoughCoins",
}

/*
 * WARNING: keep AllMessagesForUsers key equal to BloomExcpetionType so we can do AllMessagesForUsers[type] and find the right message
 */
export const AllMessagesForUsers: JSONValue = {
  InternalServerError: "We had a problem, please try again",
  NotEnoughCoins: "Not enough coins",
};

export default BloomExcpetionType;

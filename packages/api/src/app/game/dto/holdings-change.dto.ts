/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class PlayerHoldingsChangeDto {
  totalChange: number; // in dollars
  totalChangePercent: number; // percent change
  todayChange: number; // in today's dollars change
  todayChangePercent: number; // today's percent change
}

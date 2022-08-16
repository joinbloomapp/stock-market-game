/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface StartGameDto {
  name: string; // user's first name
  gameName: string; // game name
  inviteCode: string; // game invite code
}

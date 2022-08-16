/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export interface EndGameDto {
  name: string; // user first name
  gameName: string; // game name
  inviteCode: string; // invite code
  rank: string; // final game rank (i.e. 3rd, 4th, etc.)
  numPlayers: number; // number of players in the game
}

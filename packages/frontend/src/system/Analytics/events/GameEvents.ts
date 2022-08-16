/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum GameEvents {
  CLICKED_MANAGE_GAMES = 'GAME:clicked_manage_games',
  CLICKED_JOIN_NEW_GAME = 'GAME:clicked_join_new_game',
  CLICKED_CREATE_GAME = 'GAME:clicked_create_game',
  SWITCH_GAME = 'GAME:switch_game',
  JOIN_GAME_SUCCESS = 'GAME:join_game_success',
  JOIN_GAME_ERROR = 'GAME:join_game_error',
  CREATE_GAME_SUCCESS = 'GAME:create_game_success',
  CREATE_GAME_ERROR = 'GAME:create_game_error',
  START_GAME = 'GAME:start_game',
  END_GAME = 'GAME:end_game',
  TIMER_EXPIRED = 'GAME:timer_expired',
  COPY_INVITE_CODE = 'GAME:copy_invite_code',
  COPY_INVITE_LINK = 'GAME:copy_invite_link',
  CLICKED_VIEW_PLAYER_PORTFOLIO = 'GAME:clicked_view_player_portfolio',
  KICK_PLAYER = 'GAME:kick_player',
  LEAVE_GAME = 'GAME:leave_game',
  EDIT_GAME_DETAILS = 'GAME:edit_game_details',
  UPDATE_GAME_SUCCESS = 'GAME:update_game_success',
  UPDATE_GAME_ERROR = 'GAME:update_game_error',
  INVITE_VIA_EMAIL = 'GAME:invite_via_email',
  CLICKED_GAME = 'GAME:clicked_game',
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

export enum OnboardingEvents {
  ENTERED_INVITE_CODE = 'ONBOARDING:entered_invite_code',
  CLICKED_SIGNUP_WITH_INVITE_CODE = 'ONBOARDING:clicked_signup_with_invite_code',
  SIGNUP_STEP_TO = 'ONBOARDING:signup_step_to',
  SIGNUP_SUCCESS = 'ONBOARDING:signup_success',
  SIGNUP_ERROR = 'ONBOARDING:signup_error',
  CLICKED_LOGIN = 'ONBOARDING:clicked_login',
  LOGIN_SUCCESS = 'ONBOARDING:login_success',
  LOGIN_ERROR = 'ONBOARDING:login_error',
  CLICKED_LOGOUT = 'ONBOARDING:clicked_logout',
  CLICKED_JOIN_GAME = 'ONBOARDING:clicked_join_game',
  CLICKED_CREATE_GAME = 'ONBOARDING:clicked_create_game',
  CLICKED_FORGOT_PASSWORD = 'ONBOARDING:clicked_forgot_password',
  SENT_RESET_PASSWORD_EMAIL_SUCCESS = 'ONBOARDING:sent_reset_password_email_success',
  SENT_RESET_PASSWORD_EMAIL_ERRROR = 'ONBOARDING:sent_reset_password_email_error',
  RESET_PASSWORD_SUCCESS = 'ONBOARDING:reset_password_success',
  RESET_PASSWORD_ERROR = 'ONBOARDING:reset_password_error',
}

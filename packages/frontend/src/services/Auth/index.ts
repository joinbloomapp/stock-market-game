/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import client from '..';
import { AuthResponse, LoginUser, SignupUser } from './types';

namespace AuthService {
  /**
   * Sign up a new user
   *
   * @param body Signup body
   */
  export async function signup(body: SignupUser): Promise<void> {
    const res = await client.post('/auth/signup', body);
    localStorage.setItem('authToken', res?.data?.access);
  }

  /**
   * Log in a new user
   *
   * @param body Login body
   */
  export async function login(body: LoginUser): Promise<AuthResponse | undefined> {
    const res = await client.post('/auth/login', body);

    if (res?.data?.access) {
      localStorage.setItem('authToken', res?.data?.access);
      return res?.data;
    }
  }

  /**
   * Sends user password reset link
   *
   * @param email email to send password reset link to
   */
  export async function sendPasswordResetLink(email: string): Promise<void> {
    await client.post('/auth/forgot-password', { email });
  }

  /**
   * Sends user password reset link if they forgot password, not authenticated
   *
   * @param token password reset token
   * @param newPassword new password the users wants to set
   */
  export async function resetForgotPassword(token: string, newPassword: string): Promise<void> {
    await client.patch('/auth/reset-forgot-password', { token, newPassword });
  }
}

export default AuthService;

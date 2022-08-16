/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import client from '..';
import { UpdateUser, User } from './../User/types';

namespace UserService {
  /**
   * Updates current user information
   *
   * @param body Update user body
   */
  export async function updateUser(body: UpdateUser): Promise<void> {
    await client.patch('/user', body);
  }

  /**
   * This is used when a user is already authenticated, knows their old password, and wants to willingly change it
   *
   * @param oldPassword Verify that the user remembers their old password for extra security
   * @param newPassword new password the users wants to set
   */
  export async function resetPassword(oldPassword: string, newPassword: string): Promise<void> {
    await client.patch('/user/reset-password', { oldPassword, newPassword });
  }

  // /**
  //  * Delete current user
  //  */
  // export async function deleteUser(): Promise<void> {
  //   await client.delete('/user');
  // }

  /**
   * Gets the current user
   *
   * @returns current user
   */
  export async function getUser(): Promise<User> {
    const res = await client.get('/user/me');
    return res?.data;
  }
}

export default UserService;

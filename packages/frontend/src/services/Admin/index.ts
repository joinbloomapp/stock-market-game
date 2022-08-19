/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import client from '..';

namespace AdminService {
  export async function loginToUserDashboard(email: string): Promise<void> {
    const res = await client.post('/admin/login', { email });
    localStorage.setItem('userAuthToken', res?.data?.access);
  }
}

export default AdminService;

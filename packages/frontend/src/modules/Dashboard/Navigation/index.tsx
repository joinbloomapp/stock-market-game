/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MobileBottomNavbar from './MobileBottomNavbar';
import Sidebar from './Sidebar';

export default function Navigation() {
  return (
    <div>
      <div className="w-[340px] hidden md:block">
        <Sidebar />
      </div>
      <MobileBottomNavbar className="flex md:hidden" />
    </div>
  );
}

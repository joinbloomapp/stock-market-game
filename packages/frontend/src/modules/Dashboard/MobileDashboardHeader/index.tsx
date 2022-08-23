/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Logo from '../../../assets/images/bloom.png';
import MobileGamesToggle from '../../../common/MobileGamesToggle';

export default function MobileDashboardHeader() {
  return (
    <div className="fixed top-0 flex items-center justify-between w-full h-14 text-t-1 bg-b-2 z-40 px-4">
      <img alt="Bloom logo" width="114" height="32" src={Logo} className="" />
      <MobileGamesToggle />
    </div>
  );
}

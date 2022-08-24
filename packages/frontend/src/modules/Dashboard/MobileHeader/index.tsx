/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Link } from 'react-router-dom';
import Logo from '../../../assets/images/bloom.png';
import MobileGamesToggle from '../../../common/MobileGamesToggle';

export default function MobileHeader() {
  return (
    <div className="fixed top-0 flex items-center justify-between w-full h-14 text-t-1 bg-b-2 z-40 px-4">
      <Link to="portfolio">
        <img alt="Bloom logo" width="114" height="32" src={Logo} className="" />
      </Link>
      <MobileGamesToggle />
    </div>
  );
}

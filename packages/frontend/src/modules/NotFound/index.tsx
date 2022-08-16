/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import Header from '../Header';

export default function NotFound() {
  return (
    <div className="bg-polka bg-cover bg-center min-h-screen">
      <Header />
      <div className="flex w-full justify-center text-t-1">
        <div className="bg-b-2 w-[482px] h-[120px] rounded-xl p-12 absolute-vertical-center">
          <h1 className="text-2xl font-bold text-center">Sorry, could not find the page!</h1>
        </div>
      </div>
    </div>
  );
}

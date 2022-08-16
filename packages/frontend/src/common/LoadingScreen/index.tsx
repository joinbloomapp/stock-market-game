/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export default function LoadingScreen() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-b-1">
      <div className="animate-ping">
        <div className="rounded-full bg-b-3 h-12 w-12" />
      </div>
    </div>
  );
}

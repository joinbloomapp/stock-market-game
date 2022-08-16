/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function setLeaderboardGraphicPositions(
  leaderboardRef: React.MutableRefObject<HTMLDivElement | undefined>,
  pRefs: React.MutableRefObject<HTMLDivElement | undefined>[]
) {
  const posRect = leaderboardRef?.current?.getBoundingClientRect();
  const [p1, p2, p3] = pRefs;

  if (p1.current) {
    const p1Rect = p1.current.getBoundingClientRect();
    const x1 = (posRect?.width || 0) / 2;
    const y1 = (posRect?.height || 0) / 3.8;
    p1.current.style.left = x1 - p1Rect.width / 2 + 8 + 'px';
    p1.current.style.top = y1 + 'px';
  }

  if (p2.current) {
    const p2Rect = p2?.current.getBoundingClientRect();
    const x2 = (posRect?.width || 0) / 3.2;
    const y2 = (posRect?.height || 0) / 2.5;
    p2.current.style.left = x2 - p2Rect.width / 2 + 8 + 'px';
    p2.current.style.top = y2 + 'px';
    p2.current.style.rotate = '-10deg';
  }

  if (p3.current) {
    const p3Rect = p3?.current.getBoundingClientRect();
    const x3 = (posRect?.width || 0) / 1.4;
    const y3 = (posRect?.height || 0) / 2.1;
    p3.current.style.left = x3 - p3Rect.width / 2 + 'px';
    p3.current.style.top = y3 + 'px';
    p3.current.style.rotate = '10deg';
  }
}

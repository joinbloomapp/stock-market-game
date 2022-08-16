/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react';
import ArrayUtils from '../utils/ArrayUtils';

const getTimeLeft = (countDown: number) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export default function useCountdown(
  targetDate: string | number | Date,
  onExpire?: () => Promise<void>
) {
  const countdownDate = new Date(targetDate).getTime();

  const [countdown, setCountdown] = useState(countdownDate - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(async () => {
      const newCountdown = countdownDate - new Date().getTime();
      if (onExpire && ArrayUtils.sum(getTimeLeft(newCountdown)) <= 0) {
        onExpire();
      }
      setCountdown(newCountdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdownDate]);

  return getTimeLeft(countdown);
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import useCountdown from '../../hooks/useCountdown';

interface ICountdownTimerProps {
  targetDate: string | number | Date;
  expiredMessage?: string;
  onExpire?: () => Promise<void>;
}
export default function CountdownTimer({
  targetDate,
  expiredMessage,
  onExpire,
}: ICountdownTimerProps) {
  const [days, hours, minutes, seconds] = useCountdown(targetDate, onExpire);

  if (days + hours + minutes + seconds <= 0) {
    return <div>{expiredMessage || 'Expired'}</div>;
  }

  return (
    <div>
      {days > 0 ? `${days} days, ` : ''}
      {hours > 0 ? `${hours} hours, ` : ''}
      {minutes > 0 ? `${minutes} minutes, ` : ''}
      {seconds > 0 ? `${seconds} seconds` : ''}
    </div>
  );
}

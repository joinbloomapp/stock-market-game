/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import dayjs from 'dayjs';

namespace DateTimeUtils {
  export function getCurrentTimeOfDayMessage() {
    const curHours = dayjs().local().hour();

    if (curHours < 12) {
      return 'Good morning';
    } else if (curHours < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }
}

export default DateTimeUtils;

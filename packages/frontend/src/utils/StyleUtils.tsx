/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon20ChevronUpOutline, Icon20Dropdown } from '@vkontakte/icons';

namespace StyleUtils {
  /**
   * Returns the arrow prefix for displaying changes in numbers
   *
   * @param value the value to check
   * @param includeNeutralDash whether '--' should be used for value === 0
   * @returns prefix
   */
  export function getChangePrefix(value: number, includeNeutralDash = true) {
    if (value > 0) {
      return <Icon20ChevronUpOutline />;
    } else if (value < 0) {
      return <Icon20Dropdown />;
    }

    return <>{includeNeutralDash ? <>&#8212;</> : ''}</>;
  }

  /**
   * Gets the three change tailwind colors for numbers based on positive, negative, or 0
   *
   * @param value the number value to check
   * @returns the tailwind colors for a number based on its sign
   */
  export function getChangeStyle(value: number) {
    return {
      'text-u-positive': value > 0,
      'text-u-negative': value < 0,
      'text-t-2': value === 0,
    };
  }
}

export default StyleUtils;

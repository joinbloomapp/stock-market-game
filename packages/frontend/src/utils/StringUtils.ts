/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

namespace StringUtils {
  /**
   * Formats number value into USD string with dollar sign
   *
   * @param value Value to format into USD string with dollar sign
   * @returns formatted USD string with dollar sign
   */
  export function USD(value: number): string {
    return value
      ? value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })
      : '$0.00';
  }

  /**
   * Truncates numbers 1 million and up to short form using 'M', 'B', and 'T'
   *
   * @param value Value to format/truncate into short form
   * @returns numbers truncated to short form (ie. 1M, 2.53B, 6.3T, etc.)
   */
  export function truncate(value: number): string {
    if (value) {
      if (value >= 1e6) {
        // Only million and up will have the unit 'M', 'B', or 'T' following it
        return value.toLocaleString('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } else {
        return String(value);
      }
    }

    return '0.00';
  }

  /**
   * Gives number appropriate sign (+ or -) and formats as a currency or percentage
   *
   * @param value value to format
   * @param style 'percent' or 'currency' format
   * @returns
   */
  export function signNumber(value: number, style: 'percent' | 'currency'): string {
    return value.toLocaleString('en-US', {
      style,
      signDisplay: 'exceptZero',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Checks if a password is at least 8 characters long, and has at least one number and one letter
   *
   * @param password password user enters
   * @returns true or false
   */
  export function isValidPassword(password: string): boolean {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  }
}

export default StringUtils;

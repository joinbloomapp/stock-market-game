/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare global {
  interface Window {
    analytics: any;
  }
}

export const ANALYTICS_USER_ID_MAX_LEN = 19;

export default class Analytics {
  /**
   * Tracks the specified Segment event with optional properties
   *
   * @param event {string} Analytics event name
   * @param props {Record<string, any>} Optional --> Properties to track with
   */
  static track(event: string, props?: Record<string, any>) {
    if (import.meta.env.DEV) return console.log('TRACK::', event);
    window.analytics.track(event, { ...(props || {}) });
  }

  /**
   * Identifies the specified userId with optional traits
   *
   * @param userId {string} User id to to identify, will automatically pad front with 0s to make sure id is max length
   * @param traits {Record<string, any>} Optional --> Properties to identify by
   */
  static identify(userId: string, traits?: Record<string, any>) {
    if (import.meta.env.DEV) return;
    window.analytics.identify(userId?.padStart(ANALYTICS_USER_ID_MAX_LEN, '0'), {
      ...(traits || {}),
    });
  }
}

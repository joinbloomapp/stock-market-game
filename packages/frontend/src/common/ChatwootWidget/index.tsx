/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-nocheck

import { useEffect } from 'react';

export default function ChatwootWidget() {
  useEffect(() => {
    // Add Chatwoot Settings
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: 'right', // This can be left or right
      locale: 'en', // Language to be set
      type: 'standard', // [standard, expanded_bubble]
    };

    // Paste the script from inbox settings except the <script> tag
    (function (d, t) {
      var BASE_URL = 'https://app.chatwoot.com';
      var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + '/packs/js/sdk.js';
      g.defer = true;
      g.async = true;
      s.parentNode.insertBefore(g, s);
      g.onload = function () {
        window.chatwootSDK.run({
          websiteToken: import.meta.env.VITE_CHATWOOT_TOKEN,
          baseUrl: BASE_URL,
        });
      };
    })(document, 'script');
  }, []);

  return null;
}

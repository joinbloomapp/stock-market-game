/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        md: '16px',
      },
      colors: {
        t: {
          1: '#FFFFFF',
          2: '#8A87B6',
          3: '#625F85',
          4: '#13121C',
        },
        a: {
          1: '#FF4F83',
        },
        b: {
          1: '#13121C',
          2: '#171621',
          3: '#1B1A27',
        },
        u: {
          positive: '#5ECF8C',
          negative: '#EA7979',
        },
        i: {
          1: '#525072',
          2: '#FFFFFF',
        },
        line: {
          1: '#262538',
          2: '#D2CEFA',
        },
      },
      borderWidth: {
        DEFAULT: '0.5px',
        0.5: '0.5px',
        1: '1px',
      },
      divideWidth: {
        DEFAULT: '0.5px',
      },
      backgroundImage: {
        polka: "url('/src/assets/images/polka-bg.png')",
        'purple-polka': "url('/src/assets/images/purple-polka-bg.png')",
      },
    },
  },
  plugins: [],
};

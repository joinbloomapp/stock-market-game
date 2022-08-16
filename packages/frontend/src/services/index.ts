/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  // Insert authorization bearer token into every request if it exists
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  };
});

client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      // If JWT is expired or invalid for some reason, just remove it and send them back to login page
      localStorage.removeItem('authToken');
      location.reload();
    }
    return Promise.reject(error);
  }
);

export default client;

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

// import { captureException } from '@sentry/node';
import axios, { AxiosError, AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

export const alpacaBaseUrl = (mock = false) => {
  if (["production", "staging"].includes(process.env.NODE_ENV)) {
    return "https://broker-api.alpaca.markets";
  }
  return "https://broker-api.sandbox.alpaca.markets";
};

// we need to instantiate through a class because process.env variables don't load on first initialization
export default class AlpacaClientClass {
  private readonly _client: AxiosInstance;

  constructor(sponsor = false) {
    const baseURL = alpacaBaseUrl(!sponsor);

    if (
      process.env.NODE_ENV !== "test" &&
      (!process.env.SPONSOR_APCA_API_KEY_BROKER ||
        !process.env.SPONSOR_APCA_API_SECRET_BROKER)
    ) {
      throw Error("Environment keys are not defined");
    }

    const authHeader = `Basic ${Buffer.from(
      `${process.env.SPONSOR_APCA_API_KEY_BROKER}:${process.env.SPONSOR_APCA_API_SECRET_BROKER}`
    ).toString("base64")}`;

    this._client = axios.create({
      baseURL,
      responseType: "json",
      headers: {
        Authorization: authHeader,
        "Content-Type": "text/plain",
        Accept: "application/pdf",
      },
    });
    this._client.interceptors.response.use(
      (config) => config,
      (error) => {
        const errorMessage = {
          status: error.response.status,
          message: error.response?.data?.message,
          path: `${error.request?.method} ${error.request?.path}`,
          payload: error?.response?.config?.data,
        };
        console.error("[AlpacaError]:", errorMessage);
        // captureException(error, { extra: { errorType: 'Alpaca', message: errorMessage } });
        return Promise.reject(errorMessage);
      }
    );

    // @ts-ignore
    axiosRetry(this._client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError) =>
        !error.response || error.response.status >= 500,
    });
  }

  get client() {
    return this._client;
  }
}

/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MessageEvent, WebSocket } from "ws";
import { Injectable, Logger } from "@nestjs/common";
import { JSONValue } from "src/utils/types";

type TradeTypeT = "crypto" | "stock";

@Injectable()
export abstract class AbstractMinutesService {
  logger = new Logger(AbstractMinutesService.name);

  url: string;
  socket: WebSocket;
  type: TradeTypeT;

  constructor() {
    if (process.env.CI !== "true" && process.env.NODE_ENV !== "test") {
      this.socket = new WebSocket("wss://delayed.polygon.io/stocks");
      this.setSocketLifetime();
    }
  }

  private setSocketLifetime() {
    this.socket.onerror = (event) => {
      this.logger.error(`Websocket connection error (${event.message})`);
    };
    const retry = async () => {
      this.logger.log(`Restarting ${this.type} socket due to connection loss`);
      this.socket = new WebSocket(this.url);
      this.setSocketLifetime();
    };
    this.socket.onclose = function () {
      setTimeout(retry, 500); // Apply back pressure
    };
    this.socket.onopen = () => {
      // Send handshake data
      this.socket.send(
        JSON.stringify({
          action: "auth",
          params: process.env.POLYGON_API_KEY,
        })
      );
    };
    this.socket.onmessage = (event) => this.initialConnectionOnMessage(event);
  }

  private async initialConnectionOnMessage(event) {
    const msg = JSON.parse(event.data);
    this.logger.log(event.data);
    if (msg[0].status === "connected") return;
    if (msg[0].status !== "auth_success") {
      throw new Error("Failed to connect to Polygon");
    } else {
      this.socket.onmessage = (x) => this.onReceive(x);
      await this.onConnect();
    }
  }

  /**
   * @abstract
   * Handler for authenticated connection open
   */
  abstract onConnect(): Promise<void>;

  /**
   * Event handler for every message received.
   * @param event {MessageEvent}
   */
  async onReceive(event: MessageEvent): Promise<void> {
    if (!event) return;

    const localData = JSON.parse(<string>event.data);
    if (
      process.env.NODE_ENV === "development" &&
      process.env.IS_AWS !== "1" &&
      process.env.LOG_WEBSOCKET_MESSAGES === "true"
    ) {
      this.logger.debug(event.data);
    }
    await this.receive(localData);
  }

  /**
   * Convenience asynchronous method given an event that is JSON parsed.
   * @param data JSON parsed data from the event
   */
  abstract receive(data: JSONValue): Promise<void>;
}

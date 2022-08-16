/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Injectable, Logger } from "@nestjs/common";
import { AbstractMinutesService } from "../abstract-minutes.service";
import { MinuteBarData } from "./dto/minute-bar-data.dto";

@Injectable()
export class CryptoMinutesService extends AbstractMinutesService {
  logger = new Logger(CryptoMinutesService.name);
  url = "wss://delayed.polygon.io/crypto";

  async onConnect(): Promise<void> {
    this.socket.send(
      JSON.stringify({
        action: "subscribe",
        params: "XA.*",
      })
    );
  }

  async receive(data) {
    for (const x of data) {
      if (x.ev === "XA") {
        await this.handleNewMinute(x);
      }
    }
  }

  async handleNewMinute(data: MinuteBarData) {
    return data;
  }
}

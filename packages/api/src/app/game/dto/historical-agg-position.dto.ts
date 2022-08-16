/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HistoricalAggregatePositionEntity } from "@bloom-smg/postgresql";

export class HistoricalAggPositionDto {
  value: number;
  createdAt: Date;
  playerId: string;

  constructor(position: HistoricalAggregatePositionEntity, playerId: string) {
    this.value = position.value;
    this.createdAt = position.createdAt;
    this.playerId = playerId;
  }
}

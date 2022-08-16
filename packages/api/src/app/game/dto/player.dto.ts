/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PlayerEntity } from "@bloom-smg/postgresql";

export class PlayerDto {
  playerId: string;
  userId: string;
  name: string;
  isGameAdmin: boolean;
  createdAt: Date;
  buyingPower: number;
  portfolioValue?: number;
  totalValue: number;
  rank: number;
  totalChange: number;
  totalChangePercent: number;

  constructor(
    player: PlayerEntity,
    rank: number,
    totalValue: number,
    totalChange: number,
    totalChangePercent: number,
    portfolioValue?: number
  ) {
    this.playerId = player.id;
    this.userId = player.userId;
    this.name = player.user.name;
    this.isGameAdmin = player.isGameAdmin;
    this.createdAt = player.createdAt;
    this.buyingPower = player.buyingPower;
    this.portfolioValue = portfolioValue;
    this.totalValue = player.buyingPower + portfolioValue ?? 0;
    this.rank = rank;
    this.totalChange = totalChange;
    this.totalChangePercent = totalChangePercent;
  }
}

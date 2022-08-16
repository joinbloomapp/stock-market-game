/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon56CheckCircleOutline, Icon56DoNotDisturbOutline } from '@vkontakte/icons';
import { Order, OrderType } from '../../../../services/Order/types';
import StringUtils from '../../../../utils/StringUtils';
import { OrderAssetInfo } from './index';

interface GetBtnState {
  amount: number;
  notEnough: boolean;
  notEnoughError: string;
  orderType: OrderType;
}

export function getBtnState({
  amount,
  notEnough,
  notEnoughError,
  orderType,
}: GetBtnState): [string, boolean] {
  let text = '';
  let disabled = true;
  switch (true) {
    case notEnough:
      text = notEnoughError;
      break;
    case amount > 0:
      text = orderType === OrderType.BUY ? 'Confirm purchase' : 'Confirm sell';
      disabled = false;
      break;
    default:
      text = 'Enter amount';
      break;
  }
  return [text, disabled];
}

interface GetInfo {
  orderType: OrderType;
  asset: OrderAssetInfo;
  buyingPower: number;
  amount: number;
  completedOrder?: Order;
  error?: string;
}

export function getInfo({ orderType, asset, buyingPower, amount, completedOrder, error }: GetInfo) {
  if (orderType === OrderType.BUY) {
    let title = `Buy ${asset.ticker}`;

    if (completedOrder) {
      title = `You bought ${StringUtils.USD(completedOrder?.notional)} of ${asset.ticker} stock`;
    } else if (error) {
      title = 'Unable to place order at this time';
    }

    return {
      title,
      subtitle: `Buying power: ${StringUtils.USD(buyingPower)}`,
      notEnough: amount > buyingPower,
      notEnoughError: 'Not enough buying power',
      success: `You bought ${StringUtils.USD(completedOrder?.notional as number)} of ${
        asset.ticker
      } stock`,
      completeIcon: error ? (
        <Icon56DoNotDisturbOutline className="text-u-negative mt-16" />
      ) : (
        <Icon56CheckCircleOutline className="text-u-positive mt-16" />
      ),
    };
  }

  let title = `Sell ${asset.ticker}`;

  if (completedOrder) {
    title = `You sold ${StringUtils.USD(completedOrder?.notional as number)} of ${
      asset.ticker
    } stock`;
  } else if (error) {
    title = 'Unable to place order at this time';
  }

  return {
    title,
    subtitle: `Available to sell: ${StringUtils.USD(asset.availableToSell)}`,
    notEnough: amount > asset.availableToSell,
    notEnoughError: 'Not enough stocks',
    success: `You sold ${StringUtils.USD(completedOrder?.notional as number)} of ${
      asset.ticker
    } stock`,
    completeIcon: error ? (
      <Icon56DoNotDisturbOutline className="text-u-negative" />
    ) : (
      <Icon56CheckCircleOutline className="text-u-positive" />
    ),
  };
}

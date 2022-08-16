/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Dialog } from '@headlessui/react';
import { Icon24Cancel } from '@vkontakte/icons';
import cls from 'classnames';
import _ from 'lodash';
import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '../..';
import Button, { ButtonType } from '../../../../components/Button';
import DictTable from '../../../../components/DictTable';
import DollarInput from '../../../../components/DollarInput';
import Modal, { IModalProps } from '../../../../components/Modal';
import OrderService from '../../../../services/Order';
import { Order, OrderType } from '../../../../services/Order/types';
import Analytics from '../../../../system/Analytics';
import { OrderEvents } from '../../../../system/Analytics/events/OrderEvents';
import MathUtils from '../../../../utils/MathUtils';
import StringUtils from '../../../../utils/StringUtils';
import { getBtnState, getInfo } from './utils';

export interface OrderAssetInfo {
  name: string;
  ticker: string;
  availableToSell: number; // Total value of this asset (same as how much they have available to sell)
  latestPrice: number;
}

interface IOrderModalProps extends IModalProps {
  type: OrderType;
  buyingPower: number;
  asset: OrderAssetInfo;
  onOrderSuccess: (order: Order) => Promise<void>;
}

export default function OrderModal({
  open,
  setOpen,
  type,
  buyingPower,
  asset,
  onOrderSuccess,
}: IOrderModalProps) {
  const { game } = useContext(DashboardContext);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order>();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!open) {
      timeout = setTimeout(() => {
        setError('');
        setCompletedOrder(undefined);
        setAmount(0);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const display = getInfo({
    orderType: type,
    asset,
    amount,
    buyingPower,
    completedOrder,
    error,
  });

  const [btnText, btnDisabled] = getBtnState({
    amount,
    notEnough: display.notEnough,
    notEnoughError: display.notEnoughError,
    orderType: type,
  });

  const isFirstStep = !error && !completedOrder;

  const onSubmit = async () => {
    setLoading(true);

    const analyticsProps = {
      enteredNotional: amount,
      [type === OrderType.BUY ? 'originalBuyingPower' : 'originalAvailableToSell']:
        type === OrderType.BUY ? buyingPower : asset.availableToSell,
      type,
      ticker: asset.ticker,
    };

    try {
      let order: Order;

      if (type === OrderType.BUY) {
        order = await OrderService.buy(game?.id as string, {
          ticker: asset.ticker,
          notional: amount,
        });
      } else {
        order = await OrderService.sell(game?.id as string, {
          ticker: asset.ticker,
          notional: amount,
        });
      }

      Analytics.track(OrderEvents.ORDER_SUCCESS, {
        ...analyticsProps,
        ..._.omit(order, 'quantity'),
        qty: order.quantity,
      });

      setCompletedOrder(order);
      await onOrderSuccess(order);
    } catch (error) {
      Analytics.track(OrderEvents.ORDER_ERROR, {
        ...analyticsProps,
        // @ts-ignore
        error: error?.response?.data?.message || error?.message,
      });
      setError('Unable to place order at this time');
    }
    setLoading(false);
  };

  const renderBody = () => {
    if (isFirstStep) {
      return (
        <>
          <DollarInput
            initialAmount={amount}
            onChangeAmount={(value) => setAmount(value ? parseFloat(value) : 0)}
            className="my-2"
          />
          <DictTable
            classNames={{ container: 'bg-b-3 px-3', row: 'py-2' }}
            columns={[
              [
                {
                  key: 'Approx. stock price',
                  value: StringUtils.USD(asset.latestPrice),
                },
                {
                  key: 'Approx. shares',
                  value: MathUtils.round(amount / asset.latestPrice, 4).toLocaleString(),
                },
              ],
            ]}
          />
          <DictTable
            classNames={{ container: 'bg-b-3 px-3 mt-4', row: 'py-2' }}
            columns={[
              [
                {
                  key: 'Estimated cost',
                  value: StringUtils.USD(amount),
                },
              ],
            ]}
          />
        </>
      );
    }

    return <>{display.completeIcon}</>;
  };

  const renderBtn = () => {
    if (isFirstStep) {
      return (
        <Button
          disabled={btnDisabled || loading}
          shadow
          loading={loading}
          type={ButtonType.Primary}
          className={cls('w-full h-14', { 'disabled:text-u-negative': display.notEnough })}
          buttonType="submit"
        >
          {btnText}
        </Button>
      );
    }

    return (
      <Button shadow type={ButtonType.Primary} className="w-full h-14" buttonType="submit">
        {error ? 'Try again' : 'Gotcha'}
      </Button>
    );
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl min-h-[450px] bg-b-2 p-9 text-left align-middle shadow-xl transition-all h-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            return isFirstStep ? onSubmit() : error ? setError('') : setOpen(false);
          }}
          className="flex flex-col justify-between min-h-[350px]"
        >
          <div>
            <Dialog.Title as="h5" className="font-semibold text-center text-t-1 px-16">
              {display.title}
            </Dialog.Title>
            {isFirstStep && <p className="text-center text-t-2">{display.subtitle}</p>}
            <Button
              type={ButtonType.IconButton}
              className="absolute w-6 h-6 top-11 right-9 text-t-3"
              onClick={() => setOpen(false)}
              buttonType="button"
            >
              <Icon24Cancel />
            </Button>
          </div>
          <div className="flex flex-col justify-center items-center my-4 h-full">
            {renderBody()}
          </div>
          <div className="mt-4">{renderBtn()}</div>
        </form>
      </Dialog.Panel>
    </Modal>
  );
}

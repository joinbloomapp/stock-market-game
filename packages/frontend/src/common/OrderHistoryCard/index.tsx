/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon16Chevron, Icon24SearchOutline, Icon56RecentOutline } from '@vkontakte/icons';
import cls from 'classnames';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input, { InputHeight, InputStyle } from '../../components/Input';
import Loader from '../../components/Loader';
import { DashboardContext } from '../../modules/Dashboard';
import OrderService from '../../services/Order';
import { Order, OrderType } from '../../services/Order/types';
import Analytics from '../../system/Analytics';
import { OrderEvents } from '../../system/Analytics/events/OrderEvents';
import ArrayUtils from '../../utils/ArrayUtils';
import StringUtils from '../../utils/StringUtils';

interface IOrderHistoryCardProps {
  ticker?: string;
  limit?: number;
  refetch?: boolean;
  setRefetch?: (refetch: boolean) => void;
}

export default function OrderHistoryCard({
  ticker,
  limit,
  refetch = true,
  setRefetch,
}: IOrderHistoryCardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderResults, setOrderResults] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const { game } = useContext(DashboardContext);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getOrders(game?.id as string, undefined, {
        ticker,
        limit: limit || 30,
      });
      setOrders(ArrayUtils.orEmptyArray(data?.data));
      setOrderResults(ArrayUtils.orEmptyArray(data?.data));
    } catch (err) {
      setError('Could not fetch orders');
    }
    if (setRefetch) {
      setRefetch(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (refetch) {
      fetchOrders();
    }
  }, [ticker, refetch]);

  const getOrderTypeText = (orderType: OrderType) => {
    return orderType === OrderType.BUY ? 'bought' : 'sold';
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    const cleanedQuery = e.target.value.toLowerCase().trim();
    setOrderResults(
      orders.filter(
        (o) =>
          o.ticker.toLowerCase().trim().includes(cleanedQuery) ||
          o.name.toLowerCase().trim().includes(cleanedQuery) ||
          o.type.toLowerCase().trim().includes(cleanedQuery) ||
          getOrderTypeText(o.type).includes(cleanedQuery) ||
          dayjs(o.createdAt).format('MMM D, YYYY').toLowerCase().includes(cleanedQuery) ||
          StringUtils.USD(o?.notional).includes(cleanedQuery) ||
          StringUtils.USD(o?.quantity).includes(cleanedQuery)
      )
    );
  };

  const renderListItem = (order: Order, index: number) => {
    const clickAsset = (ticker: string) => {
      Analytics.track(OrderEvents.CLICKED_ORDER_HISTORY_ITEM, {
        gameId: game?.id,
        inviteCode: game?.inviteCode,
        order,
      });
      navigate(`/dashboard/g/${game?.inviteCode}/stock/${ticker}`);
    };

    return (
      <button
        onClick={() => clickAsset(order.ticker)}
        key={order.id}
        className="flex justify-between items-center text-t-1 py-4 text-left hover:bg-b-3 hover:rounded-2xl md:px-4"
      >
        <div className="flex space-x-4 w-full">
          <img
            src={order.image}
            alt={order.ticker}
            className="rounded-full w-11 h-11 bg-white object-cover object-center"
          />
          <div className="flex flex-row justify-between w-full">
            <div className="w-full">
              <p className="text-md md:text-lg">
                You {getOrderTypeText(order.type)}{' '}
                <span className="font-medium">{order.ticker}</span>
              </p>
              <p className="text-t-2 text-sm">{dayjs(order.createdAt).format('MMM D, YYYY')}</p>
            </div>
            <div className="text-right w-full">
              <p className="text-t-1">{StringUtils.USD(order.notional)}</p>
              <p className="text-xs md:text-sm text-t-2">
                {order.quantity} shares @ {StringUtils.USD(order.boughtAt)}
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center text-t-3">
            <Icon16Chevron />
          </div>
        </div>
      </button>
    );
  };

  if (ticker && orders.length === 0) {
    return null;
  }

  return (
    <div
      className={cls('rounded-2xl bg-b-2 text-t-1 py-5 px-4 md:px-7', {
        'min-h-[469px]': orders.length === 0,
      })}
    >
      <div className="flex justify-between">
        <p className="text-t-1 text-lg mb-4 w-1/2">Order history</p>
        <Input
          name="player"
          type="text"
          inputStyle={InputStyle.Primary}
          inputHeight={InputHeight.Small}
          iconLeft={<Icon24SearchOutline className="mt-0.5" />}
          className=" placeholder-t-2"
          value={query}
          onChange={onChange}
          autoComplete="off"
          placeholder="Search..."
        />
      </div>
      <div>
        {!loading ? (
          <>
            {orders.length ? (
              <div className="flex flex-col">{orderResults.map(renderListItem)}</div>
            ) : (
              <div className="w-full h-[450px] flex flex-col justify-center items-center text-center">
                <Icon56RecentOutline className="mx-auto text-i-1" />
                <p className="text-t-3 mt-2">No order history yet</p>
              </div>
            )}
          </>
        ) : (
          <Loader className="mx-auto" />
        )}
      </div>
    </div>
  );
}

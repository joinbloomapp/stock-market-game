/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Icon16Chevron } from '@vkontakte/icons';
import cls from 'classnames';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { DashboardContext } from '..';
import OrderHistoryCard from '../../../common/OrderHistoryCard';
import StatsBar from '../../../common/StatsBar';
import Button, { ButtonType } from '../../../components/Button';
import DictTable from '../../../components/DictTable';
import Loader from '../../../components/Loader';
import AssetsService from '../../../services/Assets';
import { AssetBasicInfo, AssetKeyStats, AssetRelated } from '../../../services/Assets/types';
import GameService from '../../../services/Game';
import { CurrentPosition, GameStatus } from '../../../services/Game/types';
import NewsService from '../../../services/News';
import { NewsItem } from '../../../services/News/types';
import { Order, OrderType } from '../../../services/Order/types';
import Analytics from '../../../system/Analytics';
import { IndividualAssetEvents } from '../../../system/Analytics/events/IndividualAssetEvents';
import { OrderEvents } from '../../../system/Analytics/events/OrderEvents';
import ArrayUtils from '../../../utils/ArrayUtils';
import StringUtils from '../../../utils/StringUtils';
import IndividualStockGraph from './IndividualStockGraph';
import OrderModal from './OrderModal';
import { getAboutTableData, getKeyStatsTableData, getStatsBarsData } from './utils';

export default function IndividualStock() {
  const navigate = useNavigate();
  const { game } = useContext(DashboardContext);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.BUY);
  const [basicInfo, setBasicInfo] = useState<AssetBasicInfo>();
  const [stats, setStats] = useState<AssetKeyStats>();
  const [position, setPosition] = useState<CurrentPosition>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [relatedAssets, setRelatedAssets] = useState<AssetRelated[]>([]);
  const [offset, setOffset] = useState(0);
  const [clampAboutText, setClampAboutText] = useState(true);
  const [buyingPower, setBuyingPower] = useState(0);
  const [latestPrice, setLatestPrice] = useState(0);
  const [refetchOrders, setRefetchOrders] = useState<boolean>(true);
  const { ticker } = useParams();

  const fetchData = async () => {
    setLoading(true);
    const [basicInfo, keyStats, currentPosition, relatedAssets, news] = await Promise.allSettled([
      AssetsService.getBasicInfo(ticker as string),
      AssetsService.getKeyStats(ticker as string),
      GameService.getCurrentPositionByTicker(game?.id as string, ticker as string),
      AssetsService.getRelatedAssets(ticker as string),
      NewsService.getNewsByTickers(4, [ticker as string]),
    ]);
    // @ts-ignore
    setBasicInfo(basicInfo?.value);
    // @ts-ignore
    setStats(keyStats?.value);
    // @ts-ignore
    setPosition(currentPosition?.value);
    // @ts-ignore
    setNews(ArrayUtils.orEmptyArray(news?.value));
    // @ts-ignore
    setRelatedAssets(ArrayUtils.orEmptyArray(relatedAssets?.value));
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchData();
  }, [ticker]);

  useEffect(() => {
    const onScroll = () => setOffset(window.pageYOffset);
    // clean up code
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onBuy = async () => {
    const data = await GameService.getHoldingsValue(game?.id as string);
    Analytics.track(OrderEvents.STARTED_ORDER, {
      currentBuyingPower: data?.currentBuyingPower,
      type: OrderType.BUY,
    });
    setBuyingPower(data?.currentBuyingPower);
    setOpen(true);
    setOrderType(OrderType.BUY);
  };

  const onSell = async () => {
    const data = await GameService.getCurrentPositionByTicker(game?.id as string, ticker as string);
    Analytics.track(OrderEvents.STARTED_ORDER, {
      availableToSell: data?.totalValue,
      type: OrderType.SELL,
    });
    setPosition(data);
    setOpen(true);
    setOrderType(OrderType.SELL);
  };

  const onOrderSuccess = async (order: Order) => {
    let currentPosition;

    try {
      currentPosition = await GameService.getCurrentPositionByTicker(
        game?.id as string,
        ticker as string
      );
    } catch (err) {}

    setRefetchOrders(true);
    setPosition(currentPosition);
    toast.success(
      `${order.type === OrderType.BUY ? 'Bought' : 'Sold'} ${StringUtils.USD(order.notional)} of ${
        order.ticker
      }!`
    );
  };

  const clickShowMoreOrLess = async () => {
    Analytics.track(IndividualAssetEvents.CLICKED_SHOW_MORE_OR_LESS, {
      type: clampAboutText ? 'more' : 'less',
    });
    setClampAboutText(!clampAboutText);
  };

  const renderAbout = () => {
    return (
      <div className="rounded-2xl text-t-1 mt-4 py-5 px-7 bg-b-2">
        <p className="text-t-2 text-lg">About</p>
        {!loading && basicInfo ? (
          <>
            <div>
              <p className={cls('mt-2', { 'line-clamp': clampAboutText })}>
                {basicInfo?.description}
              </p>
              <Button type={ButtonType.Link} className="mt-4" onClick={clickShowMoreOrLess}>
                Show {clampAboutText ? 'more +' : 'less -'}
              </Button>
            </div>
            <div className="flex mt-4">
              <DictTable columns={getAboutTableData(basicInfo)} />
            </div>
          </>
        ) : (
          <Loader className="mx-auto" />
        )}
      </div>
    );
  };

  const renderNews = () => {
    if (!news?.length) {
      return null;
    }

    const renderNewsItem = (item: NewsItem) => {
      return (
        <a
          key={item.snippet}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full justify-around space-x-4 py-4 h-[144px] text-left rounded-2xl hover:bg-line-1 px-4"
          onClick={() => Analytics.track(IndividualAssetEvents.CLICKED_NEWS_ITEM, item)}
        >
          <div>
            <p className="text-t-2 text-md">
              {item.sourceName} · {dayjs(item.date).fromNow(true)}
            </p>
            <p className="font-bold text-xl line-clamp">{item.snippet}</p>
          </div>
          <img
            src={item.imageSource}
            alt={item.sourceName}
            className="rounded-2xl w-16 h-16 object-cover object-center"
          />
        </a>
      );
    };

    return (
      <div className="flex rounded-2xl space-x-8 bg-b-2 text-t-1 mt-4 py-6">
        {!loading ? (
          <>
            <div
              className={cls('flex w-full pl-4', {
                'flex-col divide-y-0.5 divide-line-1': news.length > 2,
              })}
            >
              {news.slice(0, 2).map(renderNewsItem)}
            </div>
            {news.length > 2 && (
              <div className="flex flex-col w-full divide-y-0.5 divide-line-1 pr-4">
                {news.slice(2, 4).map(renderNewsItem)}
              </div>
            )}
          </>
        ) : (
          <Loader className="mx-auto" />
        )}
      </div>
    );
  };

  const renderKeyStats = () => {
    return (
      <div className="rounded-2xl bg-b-2 text-t-1 mt-4 py-5 px-7">
        <p className="text-t-1 text-lg">Key stats</p>
        {!loading ? (
          <div className="flex mt-4">
            <DictTable columns={getKeyStatsTableData(stats!, basicInfo?.isEtf as boolean)} />
          </div>
        ) : (
          <Loader className="mx-auto" />
        )}
      </div>
    );
  };

  const renderRelatedAssets = () => {
    if (!relatedAssets.length) {
      return null;
    }

    const renderListItem = (asset: AssetRelated) => {
      const clickAsset = (ticker: string) => {
        Analytics.track(IndividualAssetEvents.CLICKED_RELATED_ASSET, { ticker });
        navigate(`/dashboard/g/${game?.inviteCode}/stock/${ticker}`);
      };

      return (
        <button
          onClick={() => clickAsset(asset.ticker)}
          key={asset.ticker}
          className="flex justify-between items-center text-t-1 py-4 text-left hover:bg-b-3 hover:rounded-2xl px-4"
        >
          <div className="flex space-x-4">
            <img
              alt={asset.ticker}
              src={asset.image}
              className="rounded-full w-11 h-11 bg-white object-cover object-center"
            />
            <div>
              <p>{asset.name}</p>
              <p className="text-t-3 text-sm">
                {asset.ticker} · {StringUtils.USD(asset.latestPrice)}
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center text-t-3">
            <Icon16Chevron />
          </div>
        </button>
      );
    };

    return (
      <div className="rounded-2xl bg-b-2 text-t-1 mt-4 py-5 px-7">
        <p className="text-t-1 text-lg mb-2">Related stocks</p>
        {!loading ? (
          <div className="flex flex-col">{relatedAssets.map(renderListItem)}</div>
        ) : (
          <Loader className="mx-auto" />
        )}
      </div>
    );
  };

  return (
    <>
      {offset > window.innerHeight / 4 && (
        <div className="fixed left-0 md:left-[280px] top-0 right-0 flex justify-center items-center h-18 py-4 z-40 w-auto bg-b-2 nav-box-shadow space-x-2">
          <img
            src={basicInfo?.image}
            alt={basicInfo?.name}
            className="rounded-full w-6 h-6 bg-white object-cover object-center mr-2"
          />
          <h6 className="font-semibold">{basicInfo?.name}</h6>
          <p className="text-t-2 font-medium">{ticker}</p>
        </div>
      )}
      <div>
        <div className="flex space-x-4 items-center">
          <img
            src={basicInfo?.image}
            alt={basicInfo?.name}
            className="rounded-full w-16 h-16 bg-white object-cover object-center"
          />
          <div>
            <h5 className="font-semibold">{basicInfo?.name}</h5>
            <p className="text-t-2">{ticker}</p>
          </div>
        </div>
        <IndividualStockGraph ticker={ticker!} setLatestPrice={setLatestPrice} />
        {!loading && game?.status === GameStatus.ACTIVE && (
          <div className="flex justify-between space-x-4">
            {position && (
              <Button
                shadow
                type={ButtonType.Secondary}
                className="w-full h-14 bg-b-3"
                onClick={onSell}
              >
                Sell stock
              </Button>
            )}
            <Button shadow type={ButtonType.Primary} className="w-full h-14" onClick={onBuy}>
              Buy stock
            </Button>
          </div>
        )}
        {game?.status !== GameStatus.NOT_STARTED && position && (
          <StatsBar stats={getStatsBarsData(position)} />
        )}
        {renderAbout()}
        <div className="mt-4">
          <OrderHistoryCard
            ticker={ticker}
            limit={30}
            refetch={refetchOrders}
            setRefetch={setRefetchOrders}
          />
        </div>
        {renderNews()}
        {renderKeyStats()}
        {renderRelatedAssets()}
      </div>
      <OrderModal
        open={open}
        setOpen={setOpen}
        type={orderType}
        buyingPower={buyingPower}
        onOrderSuccess={onOrderSuccess}
        asset={{
          name: basicInfo?.name as string,
          ticker: ticker as string,
          availableToSell: position?.totalValue as number,
          latestPrice: latestPrice as number,
        }}
      />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="bg-b-3 rounded-2xl cursor-pointer p-3"
        bodyClassName="text-t-1 text-md flex items-center pl-3"
      />
    </>
  );
}

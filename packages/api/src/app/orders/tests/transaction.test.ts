/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import { Test, TestingModule } from "@nestjs/testing";
import { Connection, getConnection, Repository } from "typeorm";
import { TransactionalTestContext } from "typeorm-transactional-tests";
import { AppModule } from "src/app/app.module";
import { AppService } from "src/app/app.service";
import { OrdersService } from "../orders.service";
import {
  CurrentPositionEntity,
  GameEntity,
  GameStatusEnum,
  HistoricalAggregatePositionEntity,
  PlayerEntity,
  StockEntity,
  StockPriceEntity,
  UserEntity,
} from "@bloom-smg/postgresql";
import { createRequest, MockRequest } from "node-mocks-http";

describe("Stock minute processing", () => {
  let ordersService: OrdersService;
  let app: TestingModule;
  let connection: Connection;
  let transactionalContext: TransactionalTestContext;
  let user: UserEntity;
  let game: GameEntity;
  let player: PlayerEntity;
  let req: MockRequest<any>;
  let currentPositionsRepo: Repository<CurrentPositionEntity>;
  let historicalAggRepo: Repository<HistoricalAggregatePositionEntity>;
  let stock: StockEntity;
  let stockPrice: StockPriceEntity;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AppService],
    }).compile();
  });

  afterAll(async () => {
    try {
      await app.close();
    } catch (e) {
      //
    }
  });

  beforeEach(async () => {
    ordersService = app.get<OrdersService>(OrdersService);
    connection = getConnection();
    transactionalContext = new TransactionalTestContext(connection);
    await transactionalContext.start();

    user = await connection.getRepository(UserEntity).save({
      name: "test",
      password: "test",
      email: "",
      firstName: "",
      lastName: "",
    });
    game = await connection.getRepository(GameEntity).save({
      name: "test",
      startAt: new Date(),
      endAt: new Date(),
      status: GameStatusEnum.ACTIVE,
      defaultBuyingPower: 100000,
      inviteCode: "",
    });
    player = await connection.getRepository(PlayerEntity).save({
      gameId: game.id,
      userId: user.id,
      buyingPower: 100000,
      isGameAdmin: true,
    });
    currentPositionsRepo = connection.getRepository(CurrentPositionEntity);
    historicalAggRepo = connection.getRepository(
      HistoricalAggregatePositionEntity
    );
    stock = await connection.getRepository(StockEntity).save({
      ticker: "AAPL",
      name: "Apple Inc.",
      isActive: true,
      isEtf: true,
      shortable: true,
      description: "",
      image: "",
    });
    stockPrice = await connection.getRepository(StockPriceEntity).save({
      stockId: stock.id,
      ticker: "AAPL",
      price: Math.round(80.142),
      oldPrice: 0,
      percentChange: 0,
    });
    req = createRequest();
    req.user = { id: user.id };
  });

  afterEach(async () => {
    await transactionalContext.finish();
  });

  async function assertPlayerBuyingPower(change: number) {
    const newPlayer = await connection
      .getRepository(PlayerEntity)
      .findOne(player.id, { select: ["buyingPower"] });
    expect(newPlayer.buyingPower).toBe(player.buyingPower + change);
    return newPlayer.buyingPower;
  }

  it("Buy stock", async () => {
    let resp = await ordersService.buy(req, game.id, {
      stockId: stock.id,
      quantity: 1,
    });
    const currentPositionsRepo = connection.getRepository(
      CurrentPositionEntity
    );
    let [positions, count] = await currentPositionsRepo.findAndCount();
    expect(count).toBe(1);
    expect(positions[0].stockId).toBe(stock.id);
    expect(positions[0].quantity).toBe(1);
    let [historicalPos, countAgg] = await historicalAggRepo.findAndCount();
    expect(countAgg).toBe(1);
    expect(historicalPos[0].playerId).toBe(player.id);
    expect(historicalPos[0].value).toBe(stockPrice.price);

    let newBuyingPower = await assertPlayerBuyingPower(-stockPrice.price);
    expect(resp.currentBuyingPower).toBe(newBuyingPower);

    // Buy again
    resp = await ordersService.buy(req, game.id, {
      stockId: stock.id,
      quantity: 2,
    });
    [positions, count] = await currentPositionsRepo.findAndCount();
    expect(count).toBe(1);
    expect(positions[0].quantity).toBe(3);

    [historicalPos, countAgg] = await historicalAggRepo.findAndCount({
      order: { createdAt: "ASC" },
    });
    expect(countAgg).toBe(2);
    expect(historicalPos[0].playerId).toBe(player.id);
    expect(historicalPos[0].value).toBe(stockPrice.price);
    expect(historicalPos[1].playerId).toBe(player.id);
    expect(historicalPos[1].value).toBe(3 * stockPrice.price);
    newBuyingPower = await assertPlayerBuyingPower(-stockPrice.price * 3);
    expect(resp.currentBuyingPower).toBe(newBuyingPower);

    // Buy separate stock
    const otherStock = await connection.getRepository(StockEntity).save({
      ticker: "AAPLE",
      name: "Apple Inc.",
      isActive: true,
      isEtf: true,
      shortable: true,
      description: "",
      image: "",
    });
    const newPrice = await connection.getRepository(StockPriceEntity).save({
      stockId: otherStock.id,
      ticker: "AAPLE",
      price: 14.23,
      oldPrice: 0,
      percentChange: 0,
    });
    resp = await ordersService.buy(req, game.id, {
      stockId: otherStock.id,
      quantity: 5,
    });
    [positions, count] = await currentPositionsRepo.findAndCount({
      order: { id: "ASC" },
    });
    expect(count).toBe(2);
    expect(positions[0].stockId).toBe(stock.id);
    expect(positions[0].quantity).toBe(3);
    expect(positions[1].stockId).toBe(otherStock.id);
    expect(positions[1].quantity).toBe(5);
    [historicalPos, countAgg] = await historicalAggRepo.findAndCount({
      order: { id: "ASC" },
    });
    expect(countAgg).toBe(3);
    expect(historicalPos[0].playerId).toBe(player.id);
    expect(historicalPos[0].value).toBe(stockPrice.price);
    expect(historicalPos[1].playerId).toBe(player.id);
    expect(historicalPos[1].value).toBe(3 * stockPrice.price);
    expect(historicalPos[2].playerId).toBe(player.id);
    expect(historicalPos[2].value).toBe(
      3 * stockPrice.price + 5 * newPrice.price
    );
    newBuyingPower = await assertPlayerBuyingPower(
      -3 * stockPrice.price - 5 * newPrice.price
    );
    expect(resp.currentBuyingPower).toBe(newBuyingPower);
  });

  it("Cannot buy stock if not enough buying power", async () => {
    await ordersService.buy(req, game.id, {
      stockId: stock.id,
      notional: 100000,
    });
    await expect(
      ordersService.buy(req, game.id, {
        stockId: stock.id,
        quantity: 1,
      })
    ).rejects.toThrowError("Not enough buying power");
    await expect(
      ordersService.buy(req, game.id, {
        stockId: stock.id,
        notional: 1,
      })
    ).rejects.toThrowError("Not enough buying power");
  });

  it("Cannot buy stock if not enough buying power using notional", async () => {
    await ordersService.buy(req, game.id, {
      stockId: stock.id,
      notional: 100000,
    });
    await expect(
      ordersService.buy(req, game.id, {
        stockId: stock.id,
        quantity: 1,
      })
    ).rejects.toThrowError("Not enough buying power");
    await expect(
      ordersService.buy(req, game.id, {
        stockId: stock.id,
        notional: 1,
      })
    ).rejects.toThrowError("Not enough buying power");
  });

  // TODO Unskip this
  it.skip("Buy notional stock", async () => {
    let resp = await ordersService.buy(req, game.id, {
      stockId: stock.id,
      notional: stockPrice.price / 8 + 0.0000001, // testing rounding
    });
    const currentPositionsRepo = connection.getRepository(
      CurrentPositionEntity
    );
    let [positions, count] = await currentPositionsRepo.findAndCount();
    expect(count).toBe(1);
    expect(positions[0].stockId).toBe(stock.id);
    expect(positions[0].quantity).toBe(0.12500000125);
    let [historicalPos, countAgg] = await historicalAggRepo.findAndCount();
    expect(countAgg).toBe(1);
    expect(historicalPos[0].playerId).toBe(player.id);
    const currentValue = parseFloat(
      (stockPrice.price * 0.12500000125).toFixed(3)
    );
    expect(historicalPos[0].value).toBe(currentValue);

    let newBuyingPower = await assertPlayerBuyingPower(-currentValue);
    expect(resp.currentBuyingPower).toBe(newBuyingPower);

    // Buy again
    resp = await ordersService.buy(req, game.id, {
      stockId: stock.id,
      notional: stockPrice.price * 0.12500000125 + 0.013,
    });
    [positions, count] = await currentPositionsRepo.findAndCount();
    expect(count).toBe(1);
    const newQuantity =
      0.12500000125 +
      (stockPrice.price * 0.12500000125 + 0.013) / stockPrice.price;
    expect(positions[0].quantity).toBe(newQuantity);

    [historicalPos, countAgg] = await historicalAggRepo.findAndCount({
      order: { createdAt: "ASC" },
    });
    expect(countAgg).toBe(2);
    expect(historicalPos[0].playerId).toBe(player.id);
    expect(historicalPos[0].value).toBe(currentValue);
    expect(historicalPos[1].playerId).toBe(player.id);
    const newValue = newQuantity * stockPrice.price;
    expect(historicalPos[1].value).toBe(newValue);
    newBuyingPower = await assertPlayerBuyingPower(-newValue);
    expect(resp.currentBuyingPower).toBe(newBuyingPower);
  });

  it("Sell half stock", async () => {
    await ordersService.buy(req, game.id, {
      stockId: stock.id,
      quantity: 5,
    });
    let [aggPositions, aggCount] = await historicalAggRepo.findAndCount();
    expect(aggCount).toBe(1);
    expect(aggPositions[0].playerId).toBe(player.id);
    expect(aggPositions[0].value).toBe(5 * stockPrice.price);
    await assertPlayerBuyingPower(-5 * stockPrice.price);
    const resp = await ordersService.sell(req, game.id, {
      stockId: stock.id,
      quantity: 2,
    });
    const [currentPositions, currentPositionsCount] =
      await currentPositionsRepo.findAndCount();
    expect(currentPositionsCount).toBe(1);
    expect(currentPositions[0].quantity).toBe(3);
    [aggPositions, aggCount] = await historicalAggRepo.findAndCount({
      order: { createdAt: "ASC" },
    });
    expect(aggCount).toBe(2);
    expect(aggPositions[0].playerId).toBe(player.id);
    expect(aggPositions[0].value).toBe(5 * stockPrice.price);
    expect(aggPositions[1].playerId).toBe(player.id);
    expect(aggPositions[1].value).toBe(3 * stockPrice.price);
    const newBuyingPower = await assertPlayerBuyingPower(-3 * stockPrice.price);
    expect(resp.currentBuyingPower).toBe(newBuyingPower);
  });

  // TODO Unskip this
  it.skip("Sell notional stock", async () => {
    await ordersService.buy(req, game.id, {
      stockId: stock.id,
      quantity: 5,
    });
    let [aggPositions, aggCount] = await historicalAggRepo.findAndCount();
    expect(aggCount).toBe(1);
    expect(aggPositions[0].playerId).toBe(player.id);
    expect(aggPositions[0].value).toBe(5 * stockPrice.price);
    const resp = await ordersService.sell(req, game.id, {
      stockId: stock.id,
      quantity: 2.31513245, // testing rounding
    });
    const [currentPositions, currentPositionsCount] =
      await currentPositionsRepo.findAndCount();
    expect(currentPositionsCount).toBe(1);
    expect(currentPositions[0].quantity).toBe(5 - 2.31513245);
    [aggPositions, aggCount] = await historicalAggRepo.findAndCount({
      order: { createdAt: "ASC" },
    });
    expect(aggCount).toBe(2);
    expect(aggPositions[0].playerId).toBe(player.id);
    expect(aggPositions[0].value).toBe(5 * stockPrice.price);
    expect(aggPositions[1].playerId).toBe(player.id);
    expect(aggPositions[1].value).toBe(
      parseFloat(((5 - 2.31513245) * stockPrice.price).toFixed(3))
    );
    await assertPlayerBuyingPower(
      -parseFloat(((5 - 2.31513245) * stockPrice.price).toFixed(3))
    );
    const newBuyingPower = await assertPlayerBuyingPower(
      -parseFloat(((5 - 2.31513245) * stockPrice.price).toFixed(3))
    );
    expect(resp.currentBuyingPower).toBe(newBuyingPower);
  });

  it("Sell stock remove current position", async () => {
    await ordersService.buy(req, game.id, {
      stockId: stock.id,
      quantity: 6,
    });
    let [aggPositions, aggCount] = await historicalAggRepo.findAndCount();
    expect(aggCount).toBe(1);
    expect(aggPositions[0].playerId).toBe(player.id);
    expect(aggPositions[0].value).toBe(6 * stockPrice.price);
    await assertPlayerBuyingPower(-6 * stockPrice.price);
    await ordersService.sell(req, game.id, {
      stockId: stock.id,
      quantity: 6,
    });
    const [_, currentPositionsCount] =
      await currentPositionsRepo.findAndCount();
    expect(currentPositionsCount).toBe(0);
    [aggPositions, aggCount] = await historicalAggRepo.findAndCount({
      order: { createdAt: "ASC" },
    });
    expect(aggCount).toBe(2);
    expect(aggPositions[0].playerId).toBe(player.id);
    expect(aggPositions[0].value).toBe(6 * stockPrice.price);
    expect(aggPositions[1].playerId).toBe(player.id);
    expect(aggPositions[1].value).toBe(0);
    await assertPlayerBuyingPower(0);
  });

  it("Sell all stocks", async () => {
    await ordersService.buy(req, game.id, {
      stockId: stock.id,
      quantity: 5,
    });
    await ordersService.sellAll(req, game.id, {
      stockId: stock.id,
    });
    const [_, currentPositionsCount] =
      await currentPositionsRepo.findAndCount();
    expect(currentPositionsCount).toBe(0);
    const [aggPositions, aggCount] = await historicalAggRepo.findAndCount({
      order: { createdAt: "ASC" },
    });
    expect(aggCount).toBe(2);
    expect(aggPositions[0].playerId).toBe(player.id);
    expect(aggPositions[0].value).toBe(5 * stockPrice.price);
    expect(aggPositions[1].playerId).toBe(player.id);
    expect(aggPositions[1].value).toBe(0);
    await assertPlayerBuyingPower(0);
  });

  // TODO Unskip this
  it.skip("Sell all notional stocks", async () => {
    const resp = await ordersService.buy(req, game.id, {
      stockId: stock.id,
      quantity: 5.34123,
    });
    expect((await currentPositionsRepo.findOne()).quantity).toEqual(5.34123);
    expect((await historicalAggRepo.findOne()).value).toEqual(
      parseFloat((5.34123 * stockPrice.price).toFixed(3))
    );
    const newBuyingPower = await assertPlayerBuyingPower(
      -5.34123 * stockPrice.price
    );
    expect(resp.currentBuyingPower).toBe(newBuyingPower);
    await ordersService.sellAll(req, game.id, {
      stockId: stock.id,
    });
    const [_, currentPositionsCount] =
      await currentPositionsRepo.findAndCount();
    expect(currentPositionsCount).toBe(0);
    const [aggPositions, aggCount] = await historicalAggRepo.findAndCount({
      order: { createdAt: "ASC" },
    });
    expect(aggCount).toBe(2);
    expect(aggPositions[0].playerId).toBe(player.id);
    expect(aggPositions[0].value).toBe(
      parseFloat((5.34123 * stockPrice.price).toFixed(3))
    );
    expect(aggPositions[1].playerId).toBe(player.id);
    expect(aggPositions[1].value).toBe(0);
    await assertPlayerBuyingPower(0);
  });
});

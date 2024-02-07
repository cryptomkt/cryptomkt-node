import assert from "assert";
import "mocha";
import { Client } from "../../lib/client";

import { CONTINGENCY, ORDER_TYPE, SIDE, TIME_IN_FORCE } from "../../lib/constants";
import {
  SECOND,
  timeout,
  emptyList,
  goodBalance,
  goodList,
  goodOrder,
  goodTradingCommission,
  listSize,
} from "../test_helpers";
const keys = require("/home/ismael/cryptomarket/keys.json");

describe("spot trading", () => {
  let client = new Client(keys.apiKey, keys.apiSecret);
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const second = 1000;
  beforeEach(async function () {
    await sleep(second / 20); // make around 20 calls per second at most, to not pass the rate limiting of 30 calls per second, by a big margin.
  });
  describe("get spot trading balance", () => {
    it("spot balance", async function () {
      this.timeout(0);
      let balances = await client.getSpotTradingBalances();
      assert(goodList(goodBalance, balances), "not good balances");
    });
  });
  describe("get spot trading balance of currency", () => {
    it("", async function () {
      this.timeout(0);
      let balance = await client.getSpotTradingBalanceOfCurrency("ADA");
      assert(goodBalance(balance), "not good balance");
    });
  });
  describe("get all active spot orders", () => {
    it("", async function () {
      this.timeout(0);
      let orders = await client.getAllActiveSpotOrders();
      assert(goodList(goodOrder, orders), "not good orders");
    });
    it("filtering by symbol", async function () {
      let orders = await client.getAllActiveSpotOrders("CROETH");
      if (!goodList(goodOrder, orders)) assert(false, "not good orders");
    });
  });
  describe("spot order life cycle: createNewSpotOrder, getActiveOrder, replaceSpotOrder and cancelOrder", () => {
    it("with client order id", async function () {
      this.timeout(0);
      // creation
      let timestamp = Date.now().toString();
      let order = await client.createNewSpotOrder({
        symbol: "EOSETH",
        side: SIDE.SELL,
        quantity: "0.01",
        price: "1000",
        client_order_id: timestamp,
      });
      assert(goodOrder(order), "not good order after creation");

      // querying
      order = await client.getActiveSpotOrder(timestamp);
      assert(goodOrder(order), "not good order after query");

      // replacing
      let newOrderID = Date.now().toString() + "1";
      order = await client.replaceSpotOrder(order.client_order_id, {
        new_client_order_id: newOrderID,
        quantity: "0.02",
        price: "1000",
      });
      // cancelation
      order = await client.cancelSpotOrder(newOrderID);
      assert(goodOrder(order), "not good order after cancelation");
      assert(order.status == "canceled");
    });
    it("with no client order id", async function () {
      this.timeout(0);
      // creation
      let order = await client.createNewSpotOrder({
        symbol: "EOSETH",
        side: SIDE.SELL,
        quantity: "0.01",
        price: "1001",
      });
      assert(goodOrder(order), "not good order after creation");

      // cancelation
      order = await client.cancelSpotOrder(order.client_order_id);
      assert(goodOrder(order), "not good order after cancellation");
    });
  });
  describe("cancel all orders", () => {
    it("", async function () {
      this.timeout(0);

      // cleaning the order list
      await client.cancelAllSpotOrders();

      // filling the list
      await client.createNewSpotOrder({
        symbol: "EOSETH",
        side: SIDE.SELL,
        quantity: "0.01",
        price: "1001",
      });
      await client.createNewSpotOrder({
        symbol: "EOSBTC",
        side: SIDE.SELL,
        quantity: "0.01",
        price: "1001",
      });

      // checking list size
      let orders = await client.getAllActiveSpotOrders();
      assert(listSize(orders, 2), "wrong number of active orders");
      assert(goodList(goodOrder, orders), "not good active order");

      // cancelling
      let canceledOrders = await client.cancelAllSpotOrders();
      assert(listSize(canceledOrders, 2), "wrong number of canceled orders");
      assert(goodList(goodOrder, canceledOrders), "not good canceled");

      // checking empty list size of active orders
      orders = await client.getAllActiveSpotOrders();
      assert(emptyList(orders), "wrong number of active orders");
    });
  });
  describe("get all trading commissions", () => {
    it("", async function () {
      this.timeout(0);
      let tradingCommissions = await client.getAllTradingCommissions();
      assert(
        goodList(goodTradingCommission, tradingCommissions),
        "not good trading commission"
      );
    });
  });
  describe("get trading commission", () => {
    it("should succeed", async function () {
      this.timeout(0);
      let tradingCommission = await client.getTradingCommission("EOSETH");
      assert(
        goodTradingCommission(tradingCommission),
        "not good trading commision"
      );
    });
  });

  describe("create spot order list", () => {
    it("should create a list of orders", async function () {
      this.timeout(0);
      await timeout(3 * SECOND)

       let order_list_id = Date.now().toString();
      await client.createNewSpotOrderList({
        // order_list_id: order_list_id,
        contingency_type: CONTINGENCY.ALL_OR_NONE,
        orders: [
          {
            symbol: 'EOSETH',
            side: SIDE.SELL,
            type: ORDER_TYPE.LIMIT,
            time_in_force: TIME_IN_FORCE.FOK,
            quantity: '0.1',
            price: '1000',
            // client_order_id: order_list_id
          },
          {
            symbol: 'EOSUSDT',
            side: SIDE.SELL,
            type: ORDER_TYPE.LIMIT,
            time_in_force: TIME_IN_FORCE.FOK,
            quantity: '0.1',
            price: '1000'
          }
        ]
      });
    })
  })
});

const keys = require("/home/ismael/cryptomarket/keys-v3.json");
import { fail } from "assert";
import "mocha";
import { expect } from "chai";
import { WSTradingClient } from "../../lib";
import { SECOND, timeout } from "../test_helpers";

describe("TradingClient", () => {
  let wsclient: WSTradingClient;
  beforeEach(() => {
    wsclient = new WSTradingClient(keys.apiKey, keys.apiSecret);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("get trading balance", function () {
    it("list", async function () {
      this.timeout(0);
      try {
        await wsclient.connect();
        const balances = await wsclient.getSpotTradingBalances();
        console.log(balances);
        expect(balances.length).to.be.greaterThanOrEqual(1);
      } catch (err) {
        fail("should not fail. " + err);
      }
    });

    it("only one", async function () {
      this.timeout(0);
      try {
        await wsclient.connect();
        const balance = await wsclient.getSpotTradingBalanceOfCurrency({
          currency: "EOS",
        });
        console.log(balance);
      } catch (err) {
        fail("should not fail. " + err);
      }
    });
  });

  describe("order life cycle", function () {
    it("should succeed", async function () {
      this.timeout(0);
      try {
        await wsclient.connect();
        let clientOrderID = Math.floor(Date.now() / 1000).toString();

        let orderReport = await wsclient.createSpotOrder({
          client_order_id: clientOrderID,
          symbol: "EOSETH",
          side: "sell",
          quantity: "0.01",
          price: "1000",
        });
        console.log("after create order");
        console.log(orderReport);
        let activeOrders = await wsclient.getActiveSpotOrders();
        let present = false;
        for (orderReport of activeOrders) {
          if (orderReport.client_order_id === clientOrderID) present = true;
        }
        if (!present) fail("order is not present");

        let newClientOrderID = clientOrderID + "new";
        orderReport = await wsclient.replaceSpotOrder({
          client_order_id: clientOrderID,
          new_client_order_id: newClientOrderID,
          quantity: "0.01",
          price: "2000",
        });
        console.log("after replace");
        console.log(orderReport);
        orderReport = await wsclient.cancelSpotOrder(newClientOrderID);
        console.log("after cancel");
        console.log(orderReport);
      } catch (err) {
        console.log(err);
        fail("err");
      }
    });
  });
  describe("cancel all orders", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        await wsclient.cancelSpotOrders();
        const list = [1, 2, 3, 4, 5];
        list.map(async () => {
          await wsclient.createSpotOrder({
            symbol: "EOSETH",
            side: "sell",
            quantity: "0.01",
            price: "1000",
          });
        });
        await timeout(5 * SECOND);
        const activeList = await wsclient.getActiveSpotOrders();
        const canceledOrders = await wsclient.cancelSpotOrders();
        expect(canceledOrders.length).to.equal(activeList.length);
      } catch (err) {
        fail("should not fail " + err);
      }
    });
  });

  describe("get trading commission", function () {
    it("list", async function () {
      this.timeout(0);
      try {
        await wsclient.connect();
        const commissions = await wsclient.getSpotCommissions();
        console.log(commissions);
        expect(commissions.length).to.be.greaterThanOrEqual(1);
      } catch (err) {
        fail("should not fail. " + err);
      }
    });

    it("only one", async function () {
      this.timeout(0);
      try {
        await wsclient.connect();
        const commission = await wsclient.getSpotCommissionOfSymbol({
          symbol: "EOSETH",
        });
        console.log(commission);
      } catch (err) {
        fail("should not fail. " + err);
      }
    });
  });
});

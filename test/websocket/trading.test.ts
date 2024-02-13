const keys = require("../../keys.json");
import { expect } from "chai";
import "mocha";
import { WSTradingClient } from "../../lib";
import { CONTINGENCY, ORDER_STATUS, REPORT_STATUS, SIDE, TIME_IN_FORCE } from "../../lib/constants";
import { SECOND, goodBalance, goodReport, goodTradingCommission, timeout } from "../testHelpers";

describe("TradingClient", () => {
  let wsclient: WSTradingClient;
  beforeEach(() => {
    wsclient = new WSTradingClient(keys.apiKey, keys.apiSecret, undefined, 10_000);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("get trading balance", function () {
    it("gets a balance list", async function () {
      this.timeout(0);
      await wsclient.connect();
      const balances = await wsclient.getSpotTradingBalances();
      expect(balances.length).to.be.greaterThanOrEqual(1);
      const allGood = balances.map(goodBalance).every(Boolean)
      expect(allGood).to.be.true
    });

    it("gets only one", async function () {
      this.timeout(0);
      await wsclient.connect();
      const balance = await wsclient.getSpotTradingBalance("EOS");
      expect(goodBalance(balance)).to.be.true
    });
  });

  describe("order life cycle", function () {
    it("creates, replace and cancels an order", async function () {
      this.timeout(0);
      await wsclient.connect();
      const clientOrderID = newID();

      let orderReport = await wsclient.createSpotOrder({
        clientOrderId: clientOrderID,
        symbol: "EOSETH",
        side: "sell",
        quantity: "0.01",
        price: "1000",
      });

      expect(goodReport(orderReport)).to.be.true
      await expectActiveOrderWithID(clientOrderID);

      const newClientOrderID = clientOrderID + "new";
      orderReport = await wsclient.replaceSpotOrder({
        clientOrderId: clientOrderID,
        newClientOrderId: newClientOrderID,
        quantity: "0.01",
        price: "2000",
      });

      expect(goodReport(orderReport)).to.be.true
      await expectActiveOrderWithID(newClientOrderID);

      orderReport = await wsclient.cancelSpotOrder(newClientOrderID);

      expect(goodReport(orderReport)).to.be.true
      expect(orderReport.status).to.be.equal(ORDER_STATUS.CANCELED)

    });
  });
  describe("cancel all orders", function () {
    it("cancel all active orders of the client", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.cancelSpotOrders();
      for (let i = 1; i <= 5; i++) {
        await wsclient.createSpotOrder({
          symbol: "EOSETH",
          side: "sell",
          quantity: "0.01",
          price: "1000",
        });
        await timeout(1 * SECOND);
      }
      const activeList = await wsclient.getActiveSpotOrders();
      const canceledOrders = await wsclient.cancelSpotOrders();
      expect(canceledOrders.length).to.equal(activeList.length);
    });
  });

  describe("get trading commission", function () {
    it("gets a commission list", async function () {
      this.timeout(0);
      await wsclient.connect();
      const commissions = await wsclient.getSpotFees();
      expect(commissions.length).to.be.greaterThanOrEqual(1);
      const allGood = commissions.map(goodTradingCommission).every(Boolean)
      expect(allGood).to.be.true
    });

    it("gets only one", async function () {
      this.timeout(0);
      await wsclient.connect();
      const commission = await wsclient.getSpotFee("EOSETH");
      expect(goodTradingCommission(commission)).to.be.true
    });
  });
  describe("create spot order list", function () {
    it("makes a successfull request", async function () {
      this.timeout(0);
      const firstOrderID = newID()
      await wsclient.connect();
      const reports = await wsclient.createNewSpotOrderList({
        orderListId: firstOrderID,
        contingencyType: CONTINGENCY.ALL_OR_NONE,
        orders: [
          {
            clientOrderId: firstOrderID,
            symbol: "EOSETH",
            side: SIDE.SELL,
            timeInForce: TIME_IN_FORCE.FOK,
            quantity: "0.01",
            price: "100000"
          },
          {
            clientOrderId: firstOrderID + "2",
            symbol: "EOSBTC",
            side: SIDE.SELL,
            timeInForce: TIME_IN_FORCE.FOK,
            quantity: "0.01",
            price: "100000"
          }
        ]
      });
      expect(reports.length).to.be.equal(2)
      let allGood = reports.map(goodReport).every(Boolean)
      expect(allGood).to.be.true
      allGood = reports.map(report => report.status === REPORT_STATUS.EXPIRED).every(Boolean)
      expect(allGood).to.be.true
    });
  });

  async function expectActiveOrderWithID(clientOrderID: string) {
    const activeOrders = await wsclient.getActiveSpotOrders();
    const present = activeOrders.filter(order => order.clientOrderId === clientOrderID).length === 1;
    if (!present) expect.fail("order is not present");
  }

  function newID() {
    return Math.floor(Date.now() / 1000).toString();
  }
});


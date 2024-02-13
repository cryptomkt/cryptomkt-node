const keys = require("../../keys.json");
import { expect } from "chai";
import { WSTradingClient } from "../../lib";
import { SUBSCRIPTION_MODE } from "../../lib/constants";
import { SECOND, goodBalance, goodReport, timeout } from "../testHelpers";

describe("tradingClient subscriptions", function () {
  let wsclient: WSTradingClient;
  beforeEach(() => {
    wsclient = new WSTradingClient(keys.apiKey, keys.apiSecret, undefined, 10_000);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("Subscribe to reports", function () {
    it("gets a feed of order reports", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToReports((reports, type) => {
        const allGood = reports.map(goodReport).every(Boolean)
        expect(allGood).to.be.true
      });
      await timeout(3 * SECOND);
      const clientOrderID = newRandomID();
      await newOrderRequest(clientOrderID);
      await timeout(3 * SECOND);
      await wsclient.cancelSpotOrder(clientOrderID);
      const unsubscriptionSuccess = await wsclient.unsubscribeToReports();
      expect(unsubscriptionSuccess).to.be.true;
    });
  });
  describe("subscribe to spot balances", function () {
    it("gets a feed of spot balances", async function () {
      this.timeout(0)
      await wsclient.connect()
      await wsclient.subscribeToSpotBalance(balances => {
        const allGood = balances.map(goodBalance).every(Boolean)
        expect(allGood).to.be.true
      }, SUBSCRIPTION_MODE.UPDATES)
      await timeout(3 * SECOND)
      const clientOrderID = newRandomID()
      await newOrderRequest(clientOrderID);
      await timeout(3 * SECOND);
      await wsclient.cancelSpotOrder(clientOrderID);
      const unsubscriptionSuccess = await wsclient.unsubscribeToSpotBalance();
      expect(unsubscriptionSuccess).to.be.true;
    })
  })
  function newOrderRequest(clientOrderID: string) {
    return wsclient.createSpotOrder({
      clientOrderId: clientOrderID,
      symbol: "EOSETH",
      side: "sell",
      quantity: "0.01",
      price: "1000",
    });
  }

  function newRandomID(): string {
    return Math.floor(Date.now() / 1000).toString();
  }
});


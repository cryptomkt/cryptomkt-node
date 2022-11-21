const keys = require("/home/ismael/cryptomarket/keys-v3.json");
import { fail } from "assert";
import { expect } from "chai";
import { WSTradingClient } from "../../lib";
import { SECOND, timeout } from "../test_helpers";

describe("tradingClient subscriptions", function () {
  let wsclient: WSTradingClient;
  beforeEach(() => {
    wsclient = new WSTradingClient(keys.apiKey, keys.apiSecret);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("Subscribe to reports", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        await wsclient.subscribeToReports((notification, type) => {
          console.log(notification);
        });
        await timeout(3 * SECOND);
        let clientOrderID = Math.floor(Date.now() / 1000).toString();
        await wsclient.createSpotOrder({
          client_order_id: clientOrderID,
          symbol: "EOSETH",
          side: "sell",
          quantity: "0.01",
          price: "1000",
        });
        await timeout(3 * SECOND);
        await wsclient.cancelSpotOrder(clientOrderID);
        const result = await wsclient.unsubscribeToReports();
        expect(result).to.be.true;
      } catch (err) {
        fail("should not fail. " + err);
      }
    });
  });
});

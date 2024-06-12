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
} from "../testHelpers";
const keys = require("../../../../keys.json");

describe("change credentials test", () => {
  let client = new Client(keys.apiKey, keys.apiSecret);
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const second = 1000;
  beforeEach(async function () {
    await sleep(second / 20);
  });
  describe("change credentials", () => {
    it("spot balance", async function () {
      this.timeout(0);
      let balances = client.getWalletBalances();
      assert((await balances).length > 0, "empty balances");
      if (!goodList(goodOrder, balances)) assert(false, "not good balances");
      client.changeCredentials("", "");
      try {
        balances = client.getWalletBalances();
        assert(false, "should not fail");
      } catch (CryptomarketSDKException) {

      }
      client.changeCredentials(keys.apiKey, keys.apiSecret);
      balances = client.getWalletBalances();
      assert((await balances).length > 0, "empty balances");
      if (!goodList(goodOrder, balances)) assert(false, "not good balances");
    });
  });
});

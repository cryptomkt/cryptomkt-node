import assert from "assert";
import { Client } from "../../lib";
import { goodList, goodOrder, goodTrade } from "../testHelpers";
const keys = require("../../keys.json");

import "mocha";

describe("spot trading history", () => {
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const second = 1000;
  beforeEach(async function () {
    await sleep(second / 20); // make around 20 calls per second at most, to not pass the rate limiting of 30 calls per second, by a big margin.
  });
  let client = new Client(keys.apiKey, keys.apiSecret);
  describe("Get spot order history", () => {
    it("", async function () {
      this.timeout(0);
      let orderHistory = await client.getSpotOrdersHistory();
      assert(goodList(goodOrder, orderHistory), "not good order history");
    });
  });
  describe("Get spot Trades history", () => {
    it("", async function () {
      this.timeout(0);
      let tradesHistory = await client.getSpotTradesHistory();
      assert(goodList(goodTrade, tradesHistory), "not good trade history");
    });
  });
});

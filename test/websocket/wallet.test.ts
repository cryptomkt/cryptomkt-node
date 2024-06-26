
const keys = require("../../../../keys.json");
import { expect } from "chai";
import "mocha";
import { WSWalletClient } from "../../lib";
import { goodBalance, goodTransaction } from "../testHelpers";
import { ORDER_BY, SORT } from "../../lib/constants";

describe("WalletClient", function () {
  let wsclient: WSWalletClient;
  beforeEach(() => {
    wsclient = new WSWalletClient(keys.apiKey, keys.apiSecret, undefined, 10_000);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("get wallet balance", function () {
    it("gets wallet balance list", async function () {
      this.timeout(0);
      await wsclient.connect();
      const balances = await wsclient.getWalletBalances();
      expect(balances.length).to.be.greaterThan(1);
      const allGood = balances.map(goodBalance).every(Boolean)
      expect(allGood).to.be.true
    });
    it("gets only one balance", async function () {
      this.timeout(0);
      await wsclient.connect();
      const balance = await wsclient.getWalletBalance("EOS");
      expect(goodBalance(balance)).to.be.true
    });
  });

  describe("get transactions", function () {
    it("gets a list of transactions", async function () {
      this.timeout(0);
      await wsclient.connect();
      const transactions = await wsclient.getTransactions({ currencies: ["EOS"], limit: 3 });
      const allGood = transactions.map(goodTransaction).every(Boolean)
      expect(allGood).to.be.true
      await wsclient.close();
    });
  });
  describe("get transactions with params", function () {
    it("gets a list of transactions", async function () {
      this.timeout(0);
      await wsclient.connect();
      const transactions = await wsclient.getTransactions({
        currencies: ["CRO", "ETH"],
        orderBy: ORDER_BY.CREATED_AT,
        sort: SORT.ASC,
        limit: 100,
        offset: 2,
        from: "1614815872000"
      });
      const allGood = transactions.map(goodTransaction).every(Boolean)
      expect(allGood).to.be.true
      await wsclient.close();
    });
  });
});



const keys = require("/home/ismael/cryptomarket/keys.json");
import { expect } from "chai";
import "mocha";
import { WSWalletClient } from "../../lib";
import { goodBalance, goodTransaction } from "../test_helpers";

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
      const balance = await wsclient.getWalletBalanceOfCurrency("EOS");
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
});

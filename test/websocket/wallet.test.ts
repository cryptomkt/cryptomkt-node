const keys = require("/home/ismael/cryptomarket/keys-v3.json");
import { fail } from "assert";
import "mocha";
import { expect } from "chai";
import { WSWalletClient } from "../../lib";

describe("WalletClient", function () {
  let wsclient: WSWalletClient;
  beforeEach(() => {
    wsclient = new WSWalletClient(keys.apiKey, keys.apiSecret);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("get account balance", function () {
    it("list", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        const balances = await wsclient.getWalletBalances();
        console.log(balances);
        expect(balances.length).to.be.greaterThan(1);
      } catch (err) {
        fail("should not fail. " + err);
      }
    });
    it("single", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        const balance = await wsclient.getWalletBalanceOfCurrency({
          currency: "EOS",
        });
        console.log(balance);
      } catch (err) {
        fail("should not fail. " + err);
      }
    });
  });

  describe("get transactions", function () {
    it("should succeed", async function () {
      this.timeout(0);
      await wsclient.connect();
      try {
        const transactions = await wsclient.getTransactions({
          currencies: ["EOS"],
          limit: 3,
        });
        console.log(transactions);
      } catch (err) {
        fail("should not fail. " + err);
      }
      wsclient.close();
    });
  });
});

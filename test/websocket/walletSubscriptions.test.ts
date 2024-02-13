import { expect } from "chai";
import { Client, WSWalletClient } from "../../lib/index";
import { Balance, Transaction } from "../../lib/models";
import { SECOND, goodBalance, goodTransaction, timeout } from "../testHelpers";
const keys = require("../../keys.json");

describe("wallet transactions", function () {
  let wsclient: WSWalletClient;
  let restClient: any;
  beforeEach(() => {
    wsclient = new WSWalletClient(keys.apiKey, keys.apiSecret, undefined, 10_000);
    restClient = new Client(keys.apiKey, keys.apiSecret);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("Subscribe to transactions", function () {
    it("gets a feed of transactions", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToTransactions((transaction: Transaction, _) => {
        expect(goodTransaction(transaction)).to.be.true
      });
      await restClient.transferBetweenWalletAndExchange({
        source: "wallet",
        destination: "spot",
        currency: "USDT",
        amount: 1,
      });
      await timeout(3 * SECOND);
      await restClient.transferBetweenWalletAndExchange({
        source: "spot",
        destination: "wallet",
        currency: "USDT",
        amount: 1,
      });
      await timeout(3 * SECOND);
      const unsubscriptionSuccess = await wsclient.unsubscribeToTransactions()
      expect(unsubscriptionSuccess).to.be.true
    });
  });

  describe("Subscribe to balance", function () {
    it("gets a feed of wallet balances", async function () {
      this.timeout(0);
      await wsclient.connect();
      await wsclient.subscribeToBalance((balances: Balance[], _) => {
        const allGood = balances.map(goodBalance).every(Boolean)
        expect(allGood).to.be.true
      });
      await restClient.transferBetweenWalletAndExchange({
        source: "wallet",
        destination: "spot",
        currency: "USDT",
        amount: 1,
      });
      await timeout(3 * SECOND);
      await restClient.transferBetweenWalletAndExchange({
        source: "spot",
        destination: "wallet",
        currency: "USDT",
        amount: 1,
      });
      await timeout(3 * SECOND);
      const unsubscriptionSuccess = await wsclient.unsubscribeToBalance()
      expect(unsubscriptionSuccess).to.be.true

    });
  });
});

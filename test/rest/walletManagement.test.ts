import assert from "assert";
import "mocha";
import { CryptomarketAPIException, CryptomarketSDKException } from "../../lib";
import { Client } from "../../lib/client";
import { ACCOUNT, ORDER_BY, SORT } from "../../lib/constants";
import {
  goodAddress,
  goodAmountLock,
  goodBalance,
  goodFee,
  goodList,
  goodTransaction,
} from "../testHelpers";
import { Address } from "../../lib/models";
const keys = require("../../../../keys.json");

describe("wallet management", () => {
  let client = new Client(keys.apiKey, keys.apiSecret);
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const second = 1000;
  beforeEach(async function () {
    await sleep(second / 20); // make around 20 calls per second at most, to not pass the rate limiting of 30 calls per second, by a big margin.
  });
  describe("Get wallet balance", () => {
    it("", async function () {
      this.timeout(0);
      let balances = await client.getWalletBalances();
      assert(goodList(goodBalance, balances), "not good balance");
    });
  });
  describe("get wallet balance of currency", () => {
    it("", async function () {
      this.timeout(0);
      let balance = await client.getWalletBalance("ADA");
      assert(goodBalance(balance), "not good balance");
    });
  });
  describe("Get deposit crypto addresses", () => {
    it("", async function () {
      this.timeout(0);
      let addressList = await client.getDepositCryptoAddresses();
      assert(goodList(goodAddress, addressList), "not good address");
    });
  });
  describe("Get deposit crypto address of symbol", () => {
    it("", async function () {
      this.timeout(0);
      let address = await client.getDepositCryptoAddress("EOS");
      assert(goodAddress(address), "not good address");
    });
  });
  describe("create deposit crypto address", () => {
    it("", async function () {
      this.timeout(0);
      let oldAddress = await client.getDepositCryptoAddress("EOS");
      let newAddres = await client.createDepositCryptoAddress("EOS");
      assert(!sameAddress(oldAddress, newAddres), "not a new address");
      assert(goodAddress(newAddres), "not good address");
    });
  });
  describe("get last 10 deposit crypto addresses", () => {
    it("", async function () {
      this.timeout(0);
      let lastAddresses = await client.getLast10DepositCryptoAddresses("EOS");
      assert(goodList(goodAddress, lastAddresses), "not good address");
    });
  });
  describe("get last 10 withdrawal crypto addresses", () => {
    it("", async function () {
      this.timeout(0);
      let lastAddresses = await client.getLast10WithdrawalCryptoAddresses(
        "EOS"
      );
      assert(goodList(goodAddress, lastAddresses), "not good address");
    });
  });
  describe("withdraw crypto and commitment/rollback", () => {
    it("exception amount too low", async function () {
      this.timeout(0);
      let adaAddress = await client.getDepositCryptoAddress("ADA");
      try {
        let transactionID = await client.withdrawCrypto({
          currency: "ADA",
          amount: "0.01",
          address: adaAddress.address,
        });
        assert(transactionID !== "", "no transaction id");
      } catch (e) {
        if (e instanceof CryptomarketAPIException) {
          assert(e.code == 10001);
        }
      }
    });
    it("with auto commit (default mode)", async function () {
      this.timeout(0);
      let adaAddress = await client.getDepositCryptoAddress("ADA");
      let transactionID = await client.withdrawCrypto({
        currency: "ADA",
        amount: "0.1",
        address: adaAddress.address,
      });
      assert(transactionID !== "", "no transaction id");
    });
    it("with commit", async function () {
      this.timeout(0);
      let adaAddress = await client.getDepositCryptoAddress("ADA");
      let transactionID = await client.withdrawCrypto({
        currency: "ADA",
        amount: "0.1",
        address: adaAddress.address,
        autoCommit: false,
      });
      assert(transactionID !== "", "no transaction id");
      let commitResult = await client.withdrawCryptoCommit(transactionID);
      assert(commitResult, "failed to withdraw crypto");
    });
    it("with rollback", async function () {
      this.timeout(0);
      let adaAddress = await client.getDepositCryptoAddress("ADA");
      let transactionID = await client.withdrawCrypto({
        currency: "ADA",
        amount: "0.1",
        address: adaAddress.address,
        autoCommit: false,
      });
      assert(transactionID !== "", "no transaction id");
      let rollbackResult = await client.withdrawCryptoRollback(transactionID);
      assert(rollbackResult, "failed to rollback withdraw crypto transaction");
    });
  });
  describe("get estimate withdrawal fee", () => {
    it("", async function () {
      this.timeout(0);
      let fee = await client.getEstimateWithdrawalFee({
        currency: "CRO",
        amount: "100",
      });
      assert(fee !== "", "not a good fee");
    });
  });
  describe("get estimates withdrawal fees", () => {
    it("", async function () {
      this.timeout(0);
      let fees = await client.getEstimateWithdrawalFees([
        { currency: "CRO", amount: "100" },
        { currency: "EOS", amount: "12" }
      ]);
      fees.forEach(fee => assert(goodFee(fee), "not good fee"))
    });
  });
  describe("get bulk estimates withdrawal fees", () => {
    it("", async function () {
      this.timeout(0);
      let fees = await client.getBulkEstimateWithdrawalFees([
        { currency: "CRO", amount: "100" },
        { currency: "EOS", amount: "12" }
      ]);
      fees.forEach(fee => assert(goodFee(fee), "not good fee"))
    });
  });
  // describe("get estimate deposit fee", () => {
  //   it("", async function () {
  //     this.timeout(0);
  //     let fee = await client.getEstimateDepositFee({
  //       currency: "CRO",
  //       amount: "100",
  //     });
  //     assert(fee !== "", "not a good fee");
  //   });
  // });
  // describe("get bulk estimates deposit fees", () => {
  //   it("", async function () {
  //     this.timeout(0);
  //     let fees = await client.getBulkEstimateDepositFees([
  //       { currency: "CRO", amount: "100" },
  //       { currency: "EOS", amount: "12" }
  //     ]);
  //     fees.forEach(fee => assert(goodFee(fee), "not good fee"))
  //   });
  // });
  describe("check if crypto address belongs to current account", () => {
    it("eth belongs", async function () {
      this.timeout(0);
      let croAddress = await client.getDepositCryptoAddress("ETH");
      let result = await client.checkIfCryptoAddressBelongsToCurrentAccount(
        croAddress.address
      );
      assert(result === true, "does not belong");
    });
    it("btc belongs", async function () {
      this.timeout(0);
      let eosAddress = await client.getDepositCryptoAddress("BTC");
      let result = await client.checkIfCryptoAddressBelongsToCurrentAccount(
        eosAddress.address
      );
      assert(result === true, "does not belong");
    });
    it("does not belong", async function () {
      this.timeout(0);
      const result = await client.checkIfCryptoAddressBelongsToCurrentAccount(
        "abc"
      );
      assert(result === false, "belong");
    });
  });
  describe("transfer between wallet and exchange", () => {
    it("", async function () {
      this.timeout(0);
      // original wallet amount
      let startingADAInWallet = await client.getWalletBalance("ADA");
      // transfer to spot
      let transactionID = await client.transferBetweenWalletAndExchange({
        source: ACCOUNT.WALLET,
        destination: ACCOUNT.SPOT,
        currency: "ADA",
        amount: 1,
      });
      assert(transactionID !== "", "not good identifier of transfer to spot");

      // transfering back
      transactionID = await client.transferBetweenWalletAndExchange({
        source: ACCOUNT.SPOT,
        destination: ACCOUNT.WALLET,
        currency: "ADA",
        amount: 1,
      });
      assert(transactionID !== "", "not good identifier of transfer to wallet");

      // end wallet amount
      let endADAInWallet = await client.getWalletBalance("ADA");
      assert(
        startingADAInWallet.available === endADAInWallet.available,
        "not good tranfer"
      );
    });
  });
  describe("get transaction history", () => {
    it("", async function () {
      this.timeout(0);
      let transactions = await client.getTransactionHistory({ currencies: ["CRO", "ETH"] });
      assert(goodList(goodTransaction, transactions), "not good transaction");
    });
  });
  describe("get transaction history with params", () => {
    it("", async function () {
      this.timeout(0);
      let transactions = await client.getTransactionHistory({
        currencies: ["CRO", "ETH"],
        orderBy: ORDER_BY.CREATED_AT,
        sort: SORT.ASC,
        limit: 100,
        offset: 1,
        from: "1614815872000"
      });
      assert(goodList(goodTransaction, transactions), "not good transaction");
    });
  });
  describe("get transaction by identifier", () => {
    it("", async function () {
      this.timeout(0);
      // For more information see the ruby sdk test
    });
  });
  describe("check if offchain is available", () => {
    it("", async function () {
      this.timeout(0);
      let myEOSAddress = await client.getDepositCryptoAddress("EOS");
      let result = await client.checkIfOffchainIsAvailable({
        currency: "EOS",
        address: myEOSAddress.address,
      });
      // we do not care if its available or not, only if it runs properly,
      assert(result !== null, "not good result");
    });
  });
  describe.skip("get amount locks", () => {
    it("", async function () {
      this.timeout(0);
      let amountLocks = await client.getAmountLocks();
      assert(goodList(goodAmountLock, amountLocks), "not good amount locks");
    });
  });
});
function sameAddress(oldAddress: Address, newAddres: Address) {
  return oldAddress.address === newAddres.address && oldAddress.currency && newAddres.currency
    && oldAddress.paymentId === newAddres.paymentId && oldAddress.publicKey === oldAddress.publicKey
}


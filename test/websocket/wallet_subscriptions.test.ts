//@ts-ignore
import { fail } from "assert";
import { NOTIFICATION_TYPE } from "../../lib/constants";
import { Client, WSWalletClient } from "../../lib/index";
import { Balance, Transaction } from "../../lib/models";
import { SECOND, timeout } from "../test_helpers";
const keys = require("/home/ismael/cryptomarket/keys-v3.json");

describe("wallet transactions", function () {
  let wsclient: WSWalletClient;
  let restClient: any;
  beforeEach(() => {
    wsclient = new WSWalletClient(keys.apiKey, keys.apiSecret);
    restClient = new Client(keys.apiKey, keys.apiSecret);
  });

  afterEach(() => {
    wsclient.close();
  });

  describe("Subscribe to transactions", function () {
    it("should succeed", async function () {
      this.timeout(0);
      try {
        await wsclient.connect();
        await wsclient.subscribeToTransactions(
          (notification: Transaction[], type: NOTIFICATION_TYPE) => {
            console.log("transaction notification");
            console.log("type: " + type);
            console.log(notification);
          }
        );
        await restClient.transferBetweenWalletAndExchange({
          source: "wallet",
          destination: "spot",
          currency: "ADA",
          amount: 1,
        });
        await timeout(3 * SECOND);
        await restClient.transferBetweenWalletAndExchange({
          source: "spot",
          destination: "wallet",
          currency: "ADA",
          amount: 1,
        });
        await timeout(3 * SECOND);
      } catch (err) {
        fail("should not fail. " + err);
      }
    });
  });

  describe("Subscribe to balance", function () {
    it("should succeed", async function () {
      this.timeout(0);
      try {
        await wsclient.connect();
        await wsclient.subscribeToBalance(
          (notification: Balance[], type: NOTIFICATION_TYPE) => {
            console.log("balance notification");
            console.log("type: " + type);
            console.log(notification);
          }
        );
        await restClient.transferBetweenWalletAndExchange({
          source: "wallet",
          destination: "spot",
          currency: "ADA",
          amount: 1,
        });
        await timeout(3 * SECOND);
        await restClient.transferBetweenWalletAndExchange({
          source: "spot",
          destination: "wallet",
          currency: "ADA",
          amount: 1,
        });
        await timeout(3 * SECOND);
      } catch (err) {
        fail("should not fail. " + err);
      }
    });
  });
});

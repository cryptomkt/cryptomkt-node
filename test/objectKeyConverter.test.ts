import { expect } from "chai";
import "mocha";
import { fromCamelCaseToSnakeCase } from "../lib/camelCaseToSnakeCaseConverter";
import { fromSnakeCaseToCamelCase } from "../lib/snakeCaseToCamelCaseConverter";

describe.only("convert from camel case to snake case", function () {
  describe("convert object keys at base level", function () {
    it("converts for diferent value tyeps", function () {
      const camelCaseObj = {
        currenciesAsAList: ["EOS", "CRO"],
        symbol: "EOSCRO",
        amount: 1.2,
        activeSymbol: true,
        statusOfSymbol: undefined,
      }
      const snake_case_obj = fromCamelCaseToSnakeCase(camelCaseObj);
      expect(snake_case_obj).has.keys(["currencies_as_a_list", "symbol", "amount", "active_symbol", "status_of_symbol"])
    });
  });
  describe("convert object keys at inner levels", function () {
    it("converts for diferent value tyeps", function () {
      const camelCaseObj = {
        symbol: { aSymbol: "EOSCRO", tickSize: "1" },
      }
      const snake_case_obj = fromCamelCaseToSnakeCase(camelCaseObj);
      expect(snake_case_obj.symbol).has.keys(["a_symbol", "tick_size"])
    });
  });
  describe("convert object keys inside lists", function () {
    it("converts for diferent value tyeps", function () {
      const camelCaseObj = {
        currenciesAsAList: [{ code: "EOS", networkCode: "ETH" }, { code: "CRO", networkCode: ["netork 1", "network 2"] }],
      }
      const snake_case_obj = fromCamelCaseToSnakeCase(camelCaseObj);
      (snake_case_obj["currencies_as_a_list"] as any[]).forEach(currency =>
        expect(currency).has.keys(["code", "network_code"]));
    });
  });
});
describe.only("convert from camel case to snake case", function () {
  describe("convert object keys at base level", function () {
    it("converts for diferent value tyeps", function () {
      const snake_case_obj = {
        currencies_as_a_list: ["EOS", "CRO"],
        symbol: "EOSCRO",
        amount: 1.2,
        active_symbol: true,
        status_of_symbol: undefined,
      }
      const camel_case_obj = fromSnakeCaseToCamelCase(snake_case_obj);
      expect(camel_case_obj).has.keys(["currenciesAsAList", "symbol", "amount", "activeSymbol", "statusOfSymbol"])
    });
  });
  describe("convert object keys at inner levels", function () {
    it("converts for diferent value tyeps", function () {
      const snake_case_obj = {
        symbol: { a_symbol: "EOSCRO", tick_size: "1" },
      }
      const camelCaseObj = fromSnakeCaseToCamelCase(snake_case_obj);
      expect(camelCaseObj.symbol).has.keys(["aSymbol", "tickSize"])
    });
  });
  describe("convert object keys inside lists", function () {
    it("converts for diferent value tyeps", function () {
      const snake_case_obj = {
        currencies_as_a_list: [
          { code: "EOS", network_code: "ETH" },
          { code: "CRO", network_code: ["netork 1", "network 2"] }
        ],
      }
      const camelCaseObj = fromSnakeCaseToCamelCase(snake_case_obj);
      (camelCaseObj["currenciesAsAList"] as any[]).forEach(currency =>
        expect(currency).has.keys(["code", "networkCode"]));
    });
  });
});
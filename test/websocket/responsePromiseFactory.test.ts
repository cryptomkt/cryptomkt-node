import { assert, expect } from "chai";
import { ResponsePromiseFactory } from "../../lib/websocket/ResponsePromiseFactory";
import { EventEmitter } from "ws";

const withTimeout = (millis: number | undefined, promise: any) => {
  let timeout: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise((resolve, reject) => timeout = setTimeout(() => reject(new Error(`Timed out after ${millis} ms.`)), millis))
  return Promise.race([promise, timeoutPromise])
    .finally(() => {
      if (timeout) {
        clearTimeout(timeout)
      }
    })
};


describe("reesponse promise", function () {
  let responsePromiseFactory: ResponsePromiseFactory
  const emmiter: EventEmitter = new EventEmitter();
  beforeEach(() => {
    responsePromiseFactory = new ResponsePromiseFactory(emmiter)
  });

  describe("one event promise", () => {
    it("should return after await", async () => {
      const { id, promise } = responsePromiseFactory.newMultiResponsePromise(1)
      responsePromiseFactory.emit(id.toString(), { aValue: "first value" })
      let result = await promise
      assert(result.length === 1)
    })
  })
  describe("two event promise", () => {
    it("should return after await", async () => {
      const { id, promise } = responsePromiseFactory.newMultiResponsePromise(2)
      responsePromiseFactory.emit(id.toString(), { aValue: "first value" })
      responsePromiseFactory.emit(id.toString(), { aValue: "second value" })
      let result = await promise
      assert(result.length === 2)
    })
    it("does not consider third call", async () => {
      const { id, promise } = responsePromiseFactory.newMultiResponsePromise(2)
      responsePromiseFactory.emit(id.toString(), { aValue: "first value" })
      responsePromiseFactory.emit(id.toString(), { aValue: "second value" })
      responsePromiseFactory.emit(id.toString(), { aValue: "third value should not appear" })
      let result = await promise
      assert(result.length === 2)
    })
    it("does not return while waiting second call", async () => {
      const { id, promise } = responsePromiseFactory.newMultiResponsePromise(2)
      responsePromiseFactory.emit(id.toString(), { aValue: "first value" })
      try {
        await withTimeout(1000, promise)
        expect.fail("should throw timeout, as hangs waiting second value")
      }
      catch {
        // good, it fails
      }
    })
  })
});

import { EventEmitter } from "events";
import {
  CryptomarketAPIException, CryptomarketSDKException,
} from "../exceptions";
import { WSResponse } from "./WSResponse";

export class ResponsePromiseFactory {
  private nextId: number;
  protected emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.nextId = 1;
  }

  protected getNextId(): number {
    if (this.nextId < 1) this.nextId = 1;
    const next = this.nextId;
    this.nextId++;
    return next;
  }

  emit(key: string, data: any) {
    this.emitter.emit(key, data)
  }

  newMultiResponsePromise(responseCount: number = 1): { id: number, promise: Promise<any[]> } {
    const id = this.getNextId();
    return { id, promise: this.listenNTimes(this.emitter, id, responseCount) }
  }

  newOneResponsePromise(): { id: number, promise: Promise<any> } {
    const id = this.getNextId();
    const oneTimePromise = this.listenNTimes(this.emitter, id, 1)
    const oneResultResponse = new Promise(async (resolve, reject) => {
      const results = await oneTimePromise;
      if (results.length < 1) {
        reject(new CryptomarketSDKException("empty response"))
        return
      }
      if (results.length > 1) {
        reject(new CryptomarketSDKException("too many responses"))
        return
      }
      return resolve(results[0])
    })
    return { id, promise: oneResultResponse }
  }

  private listenNTimes(emitter: EventEmitter, id: number, responseCount: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: unknown[] = []
      emitter.on(id.toString(), (response: WSResponse) => {
        if (response.error != undefined) {
          emitter.removeAllListeners(id.toString())
          reject(new CryptomarketAPIException(response.error))
          return;
        }
        const currentLength = results.push(response.result)
        if (currentLength < responseCount) {
          return
        }
        emitter.removeAllListeners(id.toString())
        if (currentLength == responseCount) {
          resolve(results);
          return
        }
        reject(new CryptomarketSDKException("invalid response count, too many responses from api"))
        return
      })
    })
  }


}

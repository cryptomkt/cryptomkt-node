import { EventEmitter } from "events";
import WebSocket from "ws";
import { ResponsePromiseFactory } from "./ResponsePromiseFactory";
import { WSResponse } from "./WSResponse";

export class WSClientBase {
  private uri: string;
  private subscriptionKeys: { [x: string]: any };
  private multiResponsePromiseFactory: ResponsePromiseFactory;
  private nextId: number;
  private pingTimeout: NodeJS.Timeout;
  private requestTimeoutMs?: number
  protected ws: WebSocket;
  protected emitter: EventEmitter;

  constructor(uri: string, subscriptionKeys: { [x: string]: any } = {}, requestTimeoutMs?: number) {
    this.uri = uri;
    this.requestTimeoutMs = requestTimeoutMs;
    this.subscriptionKeys = subscriptionKeys;
    this.emitter = new EventEmitter();
    this.nextId = 1;
    this.ws = new WebSocket(null);
    this.pingTimeout = setTimeout(() => { });
    this.multiResponsePromiseFactory = new ResponsePromiseFactory(this.emitter);
  }

  protected getNextId(): number {
    if (this.nextId < 1) this.nextId = 1;
    const next = this.nextId;
    this.nextId++;
    return next;
  }

  protected heartbeat() {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      this.ws.terminate();
    }, 30_000 + 1_000);
  }

  /**
   * Connects the client with the server
   * 
   * Initializes the internal websocket, this method does not authenticate the client so it does not permit user related calls
   * 
   * @returns A prommise that resolves after the connection
   */
  public async connect(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.ws.readyState === this.ws.OPEN) this.ws.close();
      this.ws = new WebSocket(this.uri)
        .on("close", () => {
          clearTimeout(this.pingTimeout);
        })
        .on("ping", () => {
          this.heartbeat();
        })
        .on("message", (msg: any) => {
          this.handle({ msgJson: msg });
        })
        .once("open", () => {
          this.heartbeat;
          resolve();
        });
    });
  }

  /**
   * Close the client connection with the server
   * 
   * @returns A promise that resolve after the closure
   */
  public close(): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      this.ws.once("close", () => {
        resolve();
      });
    });
    this.ws.close();
    return promise;
  }

  protected sendSubscription({
    method,
    callback,
    params = {},
  }: {
    method: string;
    callback: (...args: any[]) => void;
    params?: {};
  }): Promise<unknown> {
    const { key } = this.subscriptionKeys[method];
    this.emitter.on(key, callback);
    return this.request({ method, params });
  }

  protected async sendUnsubscription({ method, params = {}, }: { method: any; params?: {}; }): Promise<Boolean> {
    const { key } = this.subscriptionKeys[method]
    this.emitter.removeAllListeners(key)
    const response = await this.request({ method, params });
    return response as Boolean;
  }

  protected request({ method, params = {} }: { method: any; params?: {}; }): Promise<unknown> {
    const { id, promise } = this.multiResponsePromiseFactory.newOneResponsePromise();
    const payload = { method, params, id };
    this.ws.send(JSON.stringify(payload));
    return withTimeout(this.requestTimeoutMs, promise);
  }
  protected requestList({ method, params = {}, responseCount = 1 }: { method: any; params?: {}; responseCount?: number; }): Promise<unknown> {
    const { id, promise } = this.multiResponsePromiseFactory.newMultiResponsePromise(responseCount);
    const payload = { method, params, id };
    this.ws.send(JSON.stringify(payload));
    return withTimeout(this.requestTimeoutMs, promise);
  }

  protected handle({ msgJson }: { msgJson: string }): void {
    const message = JSON.parse(msgJson);
    if ("id" in message) {
      this.handleResponse(message);
    } else if ("method" in message) {
      this.handleNotification(message);
    }
  }

  protected handleNotification({ method, params }: { method: string; params: any; }): void {
    const { key, type } = this.subscriptionKeys[method];
    this.emitter.emit(key, params, type);
  }

  protected handleResponse(response: WSResponse): void {
    const id = response["id"];
    if (id === null) return;
    this.emitter.emit(id, response);
  }
}

const withTimeout = (millis: number | undefined, promise: any) => {
  if (millis === undefined || millis === null) {
    return promise
  }
  let timeout: NodeJS.Timeout;
  const timeoutPromise = new Promise((resolve, reject) => timeout = setTimeout(() => reject(new Error(`Timed out after ${millis} ms.`)), millis))
  return Promise.race([promise, timeoutPromise])
    .finally(() => {
      if (timeout) {
        clearTimeout(timeout)
      }
    })
};
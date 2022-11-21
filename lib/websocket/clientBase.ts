import WebSocket from "ws";
import { EventEmitter } from "events";
import {
  CryptomarketAPIException,
  //@ts-ignore
} from "../exceptions";

export class WSClientBase {
  private uri: string;
  private subscriptionKeys: { [x: string]: any };
  private nextId: number;
  private pingTimeout: NodeJS.Timeout;
  protected ws: WebSocket;
  protected emitter: EventEmitter;

  constructor(uri: string, subscriptionKeys = {}) {
    this.uri = uri;
    this.subscriptionKeys = subscriptionKeys;
    this.emitter = new EventEmitter();
    this.nextId = 1;
    this.ws = new WebSocket(null);
    this.pingTimeout = setTimeout(() => {});
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
    return this.sendById({ method, params });
  }

  protected async sendUnsubscription({
    method,
    params = {},
  }: {
    method: any;
    params?: {};
  }): Promise<Boolean> {
    const { key } = this.subscriptionKeys[method];
    this.emitter.removeAllListeners(key);
    return ((await this.sendById({ method, params })) as { result: Boolean })
      .result;
  }

  protected sendById({
    method,
    params = {},
  }: {
    method: any;
    params?: {};
  }): Promise<unknown> {
    const id = this.getNextId();
    const emitter = this.emitter;
    const promise = new Promise(function (resolve, reject) {
      emitter.once(id.toString(), function (response) {
        if ("error" in response) {
          reject(new CryptomarketAPIException(response));
          return;
        }
        resolve(response.result);
      });
    });
    const payload = { method, params, id };
    this.ws.send(JSON.stringify(payload));
    return promise;
  }

  protected handle({ msgJson }: { msgJson: string }): void {
    const message = JSON.parse(msgJson);
    if ("method" in message) {
      this.handleNotification(message);
    } else if ("id" in message) {
      this.handleResponse(message);
    }
  }

  protected handleNotification({
    method,
    params,
  }: {
    method: string;
    params: any;
  }): void {
    const { key, type } = this.subscriptionKeys[method];
    this.emitter.emit(key, params, type);
  }

  protected handleResponse(response: { [x: string]: any }): void {
    const id = response["id"];
    if (id === null) return;
    this.emitter.emit(id, response);
  }
}

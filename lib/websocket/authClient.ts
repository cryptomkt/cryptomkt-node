import CryptoJS from "crypto-js";
import { WSClientBase } from "./clientBase";

interface AuthPayload {
  type: string
  apiKey: string
  timestamp: number
  window?: number
  signature: string
}

export class AuthClient extends WSClientBase {
  private apiKey: string;
  private apiSecret: string;
  private window?: number | null;

  constructor(
    url: string,
    apiKey: string,
    apiSecret: string,
    window?: number,
    requestTimeoutMs?: number,
    subscriptionKeys = {}
  ) {
    super(url, subscriptionKeys, requestTimeoutMs);
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.window = window || null;
  }

  /**
   * Connects the client with the server
   * 
   * Initializes the internal websocket, and then authenticates the client to permit user related calls
   * 
   * @returns A prommise that resolves after the authentication
   */
  async connect(): Promise<void> {
    await super.connect();
    await this.authenticate();
  }

  /**
   * Authenticates the websocket
   *
   * https://api.exchange.cryptomkt.com/#socket-session-authentication
   *
   * @param {function} [callback] Optional. A function to call with the result data. It takes two arguments, err and result. err is None for successful calls, result is None for calls with error: callback(err, result)
   *
   * @returns The transaction status as result argument for the callback.
   */
  private authenticate() {
    const timestamp = Math.floor(Date.now());
    const payload: AuthPayload = {
      type: "HS256",
      apiKey: this.apiKey,
      timestamp: timestamp,
      signature: "",
    };
    let toSign = timestamp.toString();
    if (this.window) {
      payload.window = this.window;
      toSign += this.window.toString();
    }
    const signature = CryptoJS.HmacSHA256(toSign, this.apiSecret).toString();
    payload.signature = signature;
    return this.request({
      method: "login",
      params: payload,
    });
  }

  async makeListRequest<T>(requestParams: { method: string; params?: any, responseCount?: number }): Promise<T[]> {
    return (await this.requestList(requestParams)) as T[];
  }

  async makeRequest<T>(requestParams: { method: string; params?: any }): Promise<T> {
    return (await this.request(requestParams)) as T;
  }
}

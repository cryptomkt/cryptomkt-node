import CryptoJS from "crypto-js";
import { WSClientBase } from "./clientBase";

export class AuthClient extends WSClientBase {
  private apiKey: string;
  private apiSecret: string;
  private window: number | null;

  constructor(
    url: string,
    apiKey: string,
    apiSecret: string,
    window: number | null = null,
    subscriptionKeys = {}
  ) {
    super(url, subscriptionKeys);
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.window = window;
  }

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
   * @return The transaction status as result argument for the callback.
   */
  authenticate() {
    const timestamp = Math.floor(Date.now());
    const params = {
      type: "HS256",
      api_Key: this.apiKey,
      timestamp: timestamp,
    };
    let toSign = timestamp.toString();
    if (this.window) {
      params["window"] = this.window;
      toSign += this.window.toString();
    }
    const signature = CryptoJS.HmacSHA256(toSign, this.apiSecret).toString();
    params["signature"] = signature;
    return this.sendById({
      method: "login",
      params,
    });
  }

  async makeRequest<T>(params: { method: string; params?: any }): Promise<T> {
    return (await this.sendById(params)) as T;
  }
}

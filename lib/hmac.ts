import CryptoJS from "crypto-js";
import { URL } from "url";
import { HTTP_METHOD } from "./httpMethods";


export class HMAC {
  apiKey: string
  apiSecret: string
  window: number | null

  constructor(apiKey: string,
    apiSecret: string,
    window: number | null = null) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.window = window
  }

  /**+
   *
   * @param {URL} url
   * @returns
   */
  buildCredential(httpMethod: string, url: URL, query: string) {
    const timestamp = Math.floor(Date.now()).toString();
    const messageToSign = this.getMessageToSign(httpMethod, url, query, timestamp);
    const signedMessage = this.sign(messageToSign);
    const fullMessage = this.getFullMessage(signedMessage, timestamp);
    return `HS256 ${Buffer.from(fullMessage).toString("base64")}`;
  }

  private getFullMessage(signedMessage: string, timestamp: string) {
    let fullMessage = this.apiKey + ":" + signedMessage + ":" + timestamp;
    if (this.window) {
      fullMessage += ":" + this.window;
    }
    return fullMessage;
  }

  private sign(messageToSign: string) {
    return CryptoJS.HmacSHA256(messageToSign, this.apiSecret).toString(CryptoJS.enc.Hex);
  }

  private getMessageToSign(httpMethod: string, url: URL, query: string, timestamp: string) {
    let messageToSign = httpMethod + url.pathname;
    if (query) {
      if (httpMethod === HTTP_METHOD.GET) {
        messageToSign += "?";
      }
      messageToSign += query;
    }
    messageToSign += timestamp;
    if (this.window) {
      messageToSign += this.window;
    }
    return messageToSign;
  }
}
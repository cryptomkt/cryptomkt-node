import { WSResponse, WSResponseError } from "./websocket/WSResponse";

export class CryptomarketSDKException extends Error {
  constructor(...args: any) {
    super(...args);
  }
}

export class CryptomarketAPIException extends CryptomarketSDKException {
  status: any;
  code: number;

  constructor({ code, message, description, }: WSResponseError, status?: any) {
    super(`(code=${code}) ${message}. ${description || ''}`);
    this.code = code;
    this.status = status;
  }
}

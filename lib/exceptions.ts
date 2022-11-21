export class CryptomarketSDKException extends Error {
  constructor(...args: any) {
    super(...args);
  }
}

export class CryptomarketAPIException extends CryptomarketSDKException {
  status: any;
  code: number;
  constructor(
    {
      code,
      message,
      description,
    }: { code: any; message: string; description: any },
    status?: any
  ) {
    super(`(code=${code}) ${message}. ${description}`);
    this.code = code;
    this.status = status;
  }
}

import fetch from "node-fetch";
import { URL, URLSearchParams } from "url";
import {
  CryptomarketAPIException,
  CryptomarketSDKException,
} from "./exceptions";
import { HMAC } from "./hmac";
import { HTTP_METHOD } from "./httpMethods";


export class HttpClient {
  apiPath: string
  hmac: HMAC

  constructor(apiUrl: string, apiVersion: string, apiKey: string, apiSecret: string, window: number | null = null) {
    this.apiPath = apiUrl + `/api/${apiVersion}/`
    this.hmac = new HMAC(apiKey, apiSecret, window)
  }

  async makeRequest(
    method: HTTP_METHOD,
    endpoint: string,
    params: any,
    publc: boolean = false
  ): Promise<any> {
    const { url, opts } = this.prepareRequest(params, method, publc, endpoint);
    try {
      return await this.makeFetch(url, opts);
    } catch (e) {
      throw new CryptomarketSDKException("Failed request to server. " + e, e);
    }
  }


  private prepareRequest(params_raw: any, method: HTTP_METHOD, publicMethod: boolean, endpoint: string): { url: URL, opts: Map<string, string> } {
    if (params_raw === undefined || params_raw === null) {
      params_raw = {}
    }
    let url = new URL(this.apiPath + endpoint);
    this.removeNulls(params_raw);
    const params: [string, string][] = Object.entries(params_raw)
      .map(([k, v]) => [k, String(v)])
    let rawQuery = new URLSearchParams(params);
    rawQuery.sort();
    let query = rawQuery.toString();

    // build fetch options
    let opts: any = {
      method: method,
      headers: {
        "User-Agent": "cryptomarket/node",
      }
    };
    let credentialParams = query
    if (method === HTTP_METHOD.POST) {
      opts.headers["Content-Type"] = "application/json";
      credentialParams = JSON.stringify(params_raw)
    }
    if (method === HTTP_METHOD.PATCH) {
      opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    // add auth header if not public endpoint
    if (!publicMethod)
      opts.headers["Authorization"] = this.hmac.buildCredential(method, url, credentialParams);
    // include query params to call
    if (method === HTTP_METHOD.GET || method === HTTP_METHOD.PUT)
      url.search = query;
    else {
      opts.body = credentialParams;
    }
    return { url, opts };
  }

  private removeNulls(params_raw: any) {
    Object.keys(params_raw).forEach(key => (params_raw[key] === undefined || params_raw[key] == null) ? delete params_raw[key] : {});
  }

  private async makeFetch(url: URL, opts: any): Promise<any> {
    const response = await fetch(url, opts)
    let jsonResponse: any
    try {
      jsonResponse = await response.json()
    } catch (e) {
      throw new CryptomarketSDKException(`Failed to parse response: ${response}`, e)
    }
    if (!response.ok) {
      throw new CryptomarketAPIException(jsonResponse["error"], response.status)
    }
    return jsonResponse
  }

  async publicGet(endpoint: string, params: any) {
    return this.makeRequest(HTTP_METHOD.GET, endpoint, params, true);
  }

  async get(endpoint: string, params: any | null = null) {
    return this.makeRequest(HTTP_METHOD.GET, endpoint, params);
  }

  async patch(endpoint: string, params: any) {
    return this.makeRequest(HTTP_METHOD.PATCH, endpoint, params);
  }

  async post(endpoint: string, params: any) {
    return this.makeRequest(HTTP_METHOD.POST, endpoint, params);
  }

  async delete(endpoint: string, params: any | null = null) {
    return this.makeRequest(HTTP_METHOD.DELETE, endpoint, params);
  }

  async put(endpoint: string, params: any | null = null) {
    return this.makeRequest(HTTP_METHOD.PUT, endpoint, params);
  }

}
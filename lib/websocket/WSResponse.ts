export interface WSResponse {
  id: string
  result: string;
  error: WSResponseError;
}

export interface WSResponseError {
  code: any;
  message: string;
  description: any;
}
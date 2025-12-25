// TypeScript декларации для e-imzo.js

export interface CAPIWSCallFunctionDef {
  plugin: string;
  name: string;
  arguments?: any[];
}

export interface CAPIWSResponse {
  success?: boolean;
  reason?: string;
  error?: string;
  [key: string]: any;
}

export interface CallbackFunction {
  (event: MessageEvent, data: CAPIWSResponse): void;
}

export interface CAPIWS {
  URL: string;
  callFunction: (
    funcDef: CAPIWSCallFunctionDef,
    callback: CallbackFunction,
    error?: (error: any) => void
  ) => void;
  version: (callback: CallbackFunction, error?: (error: any) => void) => void;
  apidoc: (callback: CallbackFunction, error?: (error: any) => void) => void;
  apikey: (
    domainAndKey: string[],
    callback?: CallbackFunction,
    error?: (error: any) => void
  ) => void;
}

export const CAPIWS: CAPIWS;

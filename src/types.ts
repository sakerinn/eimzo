// TypeScript типы и интерфейсы для EIMZO

/**
 * Интерфейс сертификата
 */
export interface ICert {
  inn: string;
  serialNumber: string;
  parsedAlias?: {
    cn: string;
    o: string;
    validto: string;
    ['1.2.860.3.16.1.2']?: string;
  };
  overdue?: boolean;
  type?: 'certkey' | 'pfx' | 'idcard' | 'ckc';
  disk?: string;
  path?: string;
  name?: string;
  alias?: string;
}

/**
 * Конфигурация для инициализации EIMZO
 */
export interface EimzoConfig {
  domainAndKey?: string[];
  timestamper?: TimestamperFunction;
}

/**
 * Тип функции для получения временной метки (timestamper)
 */
export interface TimestampResponse {
  success: boolean;
  isAttachedPkcs7: boolean;
  timeStampTokenB64: string;
  reason?: string;
}

export type TimestamperFunction = (
  signatureHex: string,
  pkcs7: string,
  callback: (args: TimestampResponse) => void,
  onReject: (args: any) => void
) => void;

/**
 * Результат получения списка сертификатов
 */
export interface IGetCertsRes {
  certificates: ICert[];
}

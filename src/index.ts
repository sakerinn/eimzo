// Главный файл экспорта пакета

// Экспорт функций инициализации
export {
  startApi,
  getInitialized,
  reset,
  setConfig,
  getTimestamper,
  setDefaultKeyId,
  getDefaultKeyId,
  clearDefaultKeyId,
} from './config';

// Экспорт функций работы с сертификатами
export { getAllCertificates, getEimzoUSBTokens } from './eimzo';

// Экспорт функций подписания
export { sign, getSignature, attach, getAcceptSignature } from './sign';
export type {
  SignOptions,
  SignResult,
  KeyIdentifier,
  Signer,
  AttachOptions,
  JoinSignaturesFunction,
} from './sign';

// Экспорт типов
export type {
  ICert,
  EimzoConfig,
  TimestamperFunction,
  TimestampResponse,
  IGetCertsRes,
} from './types';

// Экспорт ошибок и Result Pattern
export { EimzoError, EimzoErrorCode, ok, err } from './errors';
export type { Result } from './errors';

// Экспорт всех функций подписания

export { sign } from './sign';
export { getSignature } from './getSignature';
export { getAcceptSignature } from './getAcceptSignature';
export { attach } from './attach';
export { createPkcs7, attachTimestampToken, appendPkcs7Attached } from './pkcs7';
export { loadCertkeyKey, loadPfxKey, getPfxKeyId } from './keyLoaders';
export type {
  SignOptions,
  SignResult,
  KeyIdentifier,
  Signer,
  AttachOptions,
  JoinSignaturesFunction,
} from './types';


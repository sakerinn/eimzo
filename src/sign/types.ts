// Типы для функций подписания

import { EimzoCert } from '../types';
import { Result, EimzoError } from '../errors';

/**
 * Опции для функции подписания
 */
export interface SignOptions {
  isBase64?: boolean;
  useTimestamp?: boolean;
}

/**
 * Результат подписания
 */
export interface SignResult {
  signature: string; // PKCS7 в base64
  signerSerialNumber?: string;
}

/**
 * Тип для идентификатора ключа (ИНН или USB-токен)
 */
export type KeyIdentifier = string | 'idcard' | 'ckc';

/**
 * Тип для сертификата или USB-токена
 */
export type Signer = EimzoCert | 'idcard' | 'ckc';

/**
 * Тип функции для объединения подписей (для idcard/ckc с originalString)
 */
export type JoinSignaturesFunction = (
  existingPkcs7: string,
  newSignature: string
) => Promise<Result<{ pkcs7B64: string }, EimzoError>>;

/**
 * Опции для функции attach
 */
export interface AttachOptions extends SignOptions {
  /**
   * Оригинальная строка для подписания (используется для idcard/ckc)
   */
  originalString?: string;
  /**
   * Игнорировать поиск сертификата и использовать переданный
   */
  ignoreSearch?: boolean;
  /**
   * Функция для объединения подписей (для idcard/ckc с originalString)
   */
  joinSignatures?: JoinSignaturesFunction;
}


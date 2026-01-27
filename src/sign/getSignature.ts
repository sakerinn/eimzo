// Функция создания подписи по типу сертификата

import { Result, EimzoError, EimzoErrorCode, ok, err } from '../errors';
import { EimzoCert } from '../types';
import { SignOptions, SignResult } from './types';
import { loadCertkeyKey, getPfxKeyId } from './keyLoaders';
import { createPkcs7 } from './pkcs7';
import { ERROR_MESSAGES } from '../messages';

/**
 * Создать подпись для сертификата или USB-токена
 * @param signer - сертификат, 'idcard' или 'ckc'
 * @param data - данные для подписания
 * @param options - опции подписания
 * @returns Result с подписью в формате PKCS7 base64
 */
export async function getSignature(
  signer: EimzoCert | 'idcard' | 'ckc',
  data: string,
  options?: SignOptions
): Promise<Result<SignResult, EimzoError>> {
  const isBase64 = options?.isBase64 ?? false;
  const useTimestamp = options?.useTimestamp ?? true;

  // Обработка USB-токенов (idcard/ckc)
  if (signer === 'idcard' || signer === 'ckc') {
    // Для USB-токенов используем идентификатор напрямую как keyId
    const result = await createPkcs7(signer, data, isBase64, useTimestamp);
    if (result.success) {
      return ok({
        signature: result.data.pkcs7,
        signerSerialNumber: result.data.signerSerialNumber,
      });
    }
    return err(result.success ? undefined as any : result.error);
  }

  // Обработка сертификатов
  if (typeof signer === 'object' && signer.type) {
    if (signer.type === 'certkey') {
      // Загружаем ключ для certkey
      const keyIdResult = await loadCertkeyKey(signer);
      if (!keyIdResult.success) {
        return err(keyIdResult.error);
      }

      // Создаем подпись
      const pkcs7Result = await createPkcs7(
        keyIdResult.data,
        data,
        isBase64,
        useTimestamp
      );
      if (pkcs7Result.success) {
        return ok({
          signature: pkcs7Result.data.pkcs7,
          signerSerialNumber: pkcs7Result.data.signerSerialNumber,
        });
      }
      return err(pkcs7Result.error);
    } else if (signer.type === 'pfx') {
      // Получаем ID ключа для pfx (из кэша или загружаем)
      const keyIdResult = await getPfxKeyId(signer);
      if (!keyIdResult.success) {
        return err(keyIdResult.error);
      }

      // Создаем подпись
      const pkcs7Result = await createPkcs7(
        keyIdResult.data,
        data,
        isBase64,
        useTimestamp
      );
      if (pkcs7Result.success) {
        return ok({
          signature: pkcs7Result.data.pkcs7,
          signerSerialNumber: pkcs7Result.data.signerSerialNumber,
        });
      }
      return err(pkcs7Result.error);
    }
  }

  // Неизвестный тип сертификата
  return err(
    new EimzoError(
      EimzoErrorCode.INVALID_CERTIFICATE_TYPE,
      ERROR_MESSAGES.INVALID_CERTIFICATE_TYPE,
      { signer }
    )
  );
}


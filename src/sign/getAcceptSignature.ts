// Функция для присоединения подписи к существующей PKCS7 подписи

import { Result, EimzoError, EimzoErrorCode, ok, err } from '../errors';
import { ICert } from '../types';
import { SignOptions, SignResult } from './types';
import { loadCertkeyKey, getPfxKeyId } from './keyLoaders';
import { appendPkcs7Attached } from './pkcs7';
import { sign } from './sign';
import { ERROR_MESSAGES } from '../messages';
import { JoinSignaturesFunction } from './types';

/**
 * Создать подпись, которая присоединяется к существующей PKCS7 подписи
 * @param signer - сертификат, 'idcard' или 'ckc'
 * @param existingPkcs7 - существующая PKCS7 подпись в base64
 * @param options - опции подписания
 * @param originalString - оригинальная строка для подписания (используется для idcard/ckc)
 * @param joinSignatures - опциональная функция для объединения подписей (для idcard/ckc)
 * @returns Result с подписью в формате PKCS7 base64
 */
export async function getAcceptSignature(
  signer: ICert | 'idcard' | 'ckc',
  existingPkcs7: string,
  options?: SignOptions,
  originalString?: string,
  joinSignatures?: JoinSignaturesFunction
): Promise<Result<SignResult, EimzoError>> {
  const useTimestamp = options?.useTimestamp ?? true;

  // Обработка USB-токенов (idcard/ckc) с originalString
  if ((signer === 'idcard' || signer === 'ckc') && originalString) {
    if (!joinSignatures) {
      return err(
        new EimzoError(
          EimzoErrorCode.INVALID_PARAMETERS,
          'Для idcard/ckc с originalString требуется функция joinSignatures'
        )
      );
    }

    // Создаем новую подпись для originalString
    const signResult = await sign(originalString, signer, {
      ...options,
      isBase64: !!originalString,
    });

    if (!signResult.success) {
      return err(signResult.error);
    }

    // Объединяем подписи
    const joinResult = await joinSignatures(existingPkcs7, signResult.data.signature);
    if (!joinResult.success) {
      return err(joinResult.error);
    }

    return ok({
      signature: joinResult.data.pkcs7B64,
      signerSerialNumber: signResult.data.signerSerialNumber,
    });
  }

  // Обработка сертификатов и USB-токенов без originalString
  if (typeof signer === 'object' && signer.type) {
    if (signer.type === 'certkey') {
      // Загружаем ключ для certkey
      const keyIdResult = await loadCertkeyKey(signer);
      if (!keyIdResult.success) {
        return err(keyIdResult.error);
      }

      // Присоединяем подпись
      const pkcs7Result = await appendPkcs7Attached(
        keyIdResult.data,
        existingPkcs7,
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

      // Присоединяем подпись
      const pkcs7Result = await appendPkcs7Attached(
        keyIdResult.data,
        existingPkcs7,
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
  } else if (signer === 'idcard' || signer === 'ckc') {
    // USB-токен без originalString - просто присоединяем подпись
    const pkcs7Result = await appendPkcs7Attached(signer, existingPkcs7, useTimestamp);
    if (pkcs7Result.success) {
      return ok({
        signature: pkcs7Result.data.pkcs7,
        signerSerialNumber: pkcs7Result.data.signerSerialNumber,
      });
    }
    return err(pkcs7Result.error);
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


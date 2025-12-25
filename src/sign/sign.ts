// Основная функция подписания

import { Result, EimzoError, EimzoErrorCode, err } from '../errors';
import { getAllCertificates } from '../eimzo';
import { getDefaultKeyId } from '../config';
import { ERROR_MESSAGES } from '../messages';
import { Signer, SignOptions, SignResult } from './types';
import { getSignature } from './getSignature';

/**
 * Подписать данные
 * @param data - данные для подписания
 * @param signer - опциональный сертификат или USB-токен ('idcard'/'ckc')
 * @param options - опции подписания
 * @returns Result с подписью в формате PKCS7 base64
 */
export async function sign(
  data: string,
  signer?: Signer,
  options?: SignOptions
): Promise<Result<SignResult, EimzoError>> {
  // Если сертификат/ключ не передан, пытаемся использовать сохраненный идентификатор
  if (!signer) {
    const defaultKeyId = getDefaultKeyId();

    if (!defaultKeyId) {
      return err(
        new EimzoError(
          EimzoErrorCode.INVALID_PARAMETERS,
          ERROR_MESSAGES.NO_KEY_IDENTIFIER
        )
      );
    }

    // Проверяем тип идентификатора
    if (defaultKeyId === 'idcard' || defaultKeyId === 'ckc') {
      // Для USB-токенов используем идентификатор напрямую
      signer = defaultKeyId;
    } else {
      // Для сертификатов получаем по ИНН
      const certsResult = await getAllCertificates(defaultKeyId);
      if (!certsResult.success) {
        return err(certsResult.error);
      }

      if (certsResult.data.length === 0) {
        return err(
          new EimzoError(
            EimzoErrorCode.CERTIFICATE_NOT_FOUND,
            ERROR_MESSAGES.CERTIFICATE_NOT_SELECTED,
            { keyId: defaultKeyId }
          )
        );
      }

      // Берем первый не просроченный сертификат
      signer = certsResult.data[0];
    }
  }

  // Создаем подпись
  return getSignature(signer, data, options);
}


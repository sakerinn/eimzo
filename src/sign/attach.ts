// Функция для присоединения подписи к существующей PKCS7 подписи

import { Result, EimzoError, EimzoErrorCode, err } from '../errors';
import { getAllCertificates } from '../eimzo';
import { getDefaultKeyId } from '../config';
import { ERROR_MESSAGES } from '../messages';
import { Signer, SignResult, AttachOptions } from './types';
import { getAcceptSignature } from './getAcceptSignature';

/**
 * Присоединить подпись к существующей PKCS7 подписи
 * @param existingPkcs7 - существующая PKCS7 подпись в base64
 * @param signer - опциональный сертификат или USB-токен ('idcard'/'ckc')
 * @param options - опции для присоединения подписи
 * @returns Result с подписью в формате PKCS7 base64
 */
export async function attach(
  existingPkcs7: string,
  signer?: Signer,
  options?: AttachOptions
): Promise<Result<SignResult, EimzoError>> {
  // Если сертификат/ключ не передан и не указан ignoreSearch, пытаемся использовать сохраненный идентификатор
  if (!signer && !options?.ignoreSearch) {
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

  // Если signer все еще undefined, возвращаем ошибку
  if (!signer) {
    return err(
      new EimzoError(
        EimzoErrorCode.INVALID_PARAMETERS,
        ERROR_MESSAGES.NO_KEY_IDENTIFIER
      )
    );
  }

  // Присоединяем подпись
  return getAcceptSignature(
    signer,
    existingPkcs7,
    options,
    options?.originalString,
    options?.joinSignatures
  );
}


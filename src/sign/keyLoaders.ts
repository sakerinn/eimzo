// Функции загрузки ключей для подписания

import { CAPIWS } from '../vendors/e-imzo';
import { Result, EimzoError, EimzoErrorCode, ok, err } from '../errors';
import { ICert } from '../types';
import { ERROR_MESSAGES } from '../messages';

/**
 * Загрузить ключ для certkey сертификата
 * @param cert - сертификат типа certkey
 * @returns Result с ID загруженного ключа
 */
export async function loadCertkeyKey(
  cert: ICert
): Promise<Result<string, EimzoError>> {
  if (cert.type !== 'certkey') {
    return err(
      new EimzoError(
        EimzoErrorCode.INVALID_CERTIFICATE_TYPE,
        ERROR_MESSAGES.INVALID_CERTIFICATE_TYPE,
        { expected: 'certkey', actual: cert.type }
      )
    );
  }

  if (!cert.disk || !cert.path || !cert.name || !cert.serialNumber) {
    return err(
      new EimzoError(
        EimzoErrorCode.INVALID_PARAMETERS,
        'Не указаны обязательные параметры сертификата certkey (disk, path, name, serialNumber)',
        cert
      )
    );
  }

  return new Promise<Result<string, EimzoError>>((resolve) => {
    CAPIWS.callFunction(
      {
        plugin: 'certkey',
        name: 'load_key',
        arguments: [cert.disk, cert.path, cert.name, cert.serialNumber],
      },
      (_event: MessageEvent, response: any) => {
        if (response.success) {
          resolve(ok(response.keyId));
        } else {
          resolve(
            err(
              new EimzoError(
                EimzoErrorCode.KEY_LOAD_FAILED,
                response.reason || ERROR_MESSAGES.KEY_LOAD_FAILED,
                response
              )
            )
          );
        }
      },
      (error: any) => {
        resolve(
          err(
            new EimzoError(
              EimzoErrorCode.KEY_LOAD_FAILED,
              ERROR_MESSAGES.KEY_LOAD_FAILED,
              error
            )
          )
        );
      }
    );
  });
}

/**
 * Получить ID ключа из кэша или загрузить новый для pfx сертификата
 * @param cert - сертификат типа pfx
 * @returns Result с ID ключа
 */
export async function getPfxKeyId(cert: ICert): Promise<Result<string, EimzoError>> {
  if (cert.type !== 'pfx') {
    return err(
      new EimzoError(
        EimzoErrorCode.INVALID_CERTIFICATE_TYPE,
        ERROR_MESSAGES.INVALID_CERTIFICATE_TYPE,
        { expected: 'pfx', actual: cert.type }
      )
    );
  }

  // Проверяем кэш sessionStorage
  if (typeof window !== 'undefined' && cert.serialNumber) {
    const cachedKeyId = window.sessionStorage.getItem(cert.serialNumber);
    if (cachedKeyId) {
      return ok(cachedKeyId);
    }
  }

  // Если нет в кэше, загружаем ключ
  return loadPfxKey(cert);
}

/**
 * Загрузить ключ для pfx сертификата
 * @param cert - сертификат типа pfx
 * @returns Result с ID загруженного ключа
 */
export async function loadPfxKey(cert: ICert): Promise<Result<string, EimzoError>> {
  if (cert.type !== 'pfx') {
    return err(
      new EimzoError(
        EimzoErrorCode.INVALID_CERTIFICATE_TYPE,
        ERROR_MESSAGES.INVALID_CERTIFICATE_TYPE,
        { expected: 'pfx', actual: cert.type }
      )
    );
  }

  if (!cert.disk || cert.path === undefined || !cert.name || !cert.alias) {
    return err(
      new EimzoError(
        EimzoErrorCode.INVALID_PARAMETERS,
        'Не указаны обязательные параметры сертификата pfx (disk, path, name, alias)',
        cert
      )
    );
  }

  return new Promise<Result<string, EimzoError>>((resolve) => {
    CAPIWS.callFunction(
      {
        plugin: 'pfx',
        name: 'load_key',
        arguments: [cert.disk, cert.path, cert.name, cert.alias],
      },
      (_event: MessageEvent, response: any) => {
        if (response.success) {
          const keyId = response.keyId;
          // Сохраняем в кэш sessionStorage
          if (typeof window !== 'undefined' && cert.serialNumber) {
            window.sessionStorage.setItem(cert.serialNumber, keyId);
          }
          resolve(ok(keyId));
        } else {
          resolve(
            err(
              new EimzoError(
                EimzoErrorCode.KEY_LOAD_FAILED,
                response.reason || ERROR_MESSAGES.KEY_LOAD_FAILED,
                response
              )
            )
          );
        }
      },
      (error: any) => {
        resolve(
          err(
            new EimzoError(
              EimzoErrorCode.KEY_LOAD_FAILED,
              ERROR_MESSAGES.KEY_LOAD_FAILED,
              error
            )
          )
        );
      }
    );
  });
}


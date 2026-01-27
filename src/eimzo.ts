// Основная логика работы с EIMZO

import { CAPIWS } from './vendors/e-imzo';
import { Result, EimzoError, EimzoErrorCode, ok, err } from './errors';
import { EimzoCert, IGetCertsRes } from './types';
import { parseData, parseValidDate } from './utils/parseData';
import { getInitialized } from './config';
import { ERROR_MESSAGES } from './messages';

/**
 * Получить все сертификаты через certkey плагин
 */
async function getAllCertificatesCertkey(): Promise<
  Result<IGetCertsRes, EimzoError>
> {
  return new Promise<Result<IGetCertsRes, EimzoError>>((resolve) => {
    if (!getInitialized()) {
      resolve(
        err(
          new EimzoError(
            EimzoErrorCode.INITIALIZATION_FAILED,
            ERROR_MESSAGES.NOT_INITIALIZED
          )
        )
      );
      return;
    }

    CAPIWS.callFunction(
      {
        plugin: 'certkey',
        name: 'list_all_certificates',
      },
      (_event: MessageEvent, data: any) => {
        if (data && data.certificates) {
          resolve(ok(data as IGetCertsRes));
        } else {
          resolve(
            err(
              new EimzoError(
                EimzoErrorCode.EIMZO_SERVICE_ERROR,
                data?.reason || ERROR_MESSAGES.GET_CERTKEY_CERTS_ERROR,
                data
              )
            )
          );
        }
      },
      (error: any) => {
        resolve(
          err(
            new EimzoError(
              EimzoErrorCode.EIMZO_SERVICE_ERROR,
              ERROR_MESSAGES.CONNECT_CERTKEY_ERROR,
              error
            )
          )
        );
      }
    );
  });
}

/**
 * Получить все сертификаты через pfx плагин
 */
async function getAllCertificatesPfx(): Promise<
  Result<IGetCertsRes, EimzoError>
> {
  return new Promise<Result<IGetCertsRes, EimzoError>>((resolve) => {
    if (!getInitialized()) {
      resolve(
        err(
          new EimzoError(
            EimzoErrorCode.INITIALIZATION_FAILED,
            ERROR_MESSAGES.NOT_INITIALIZED
          )
        )
      );
      return;
    }

    CAPIWS.callFunction(
      {
        plugin: 'pfx',
        name: 'list_all_certificates',
      },
      (_event: MessageEvent, data: any) => {
        if (data && data.certificates) {
          resolve(ok(data as IGetCertsRes));
        } else {
          resolve(
            err(
              new EimzoError(
                EimzoErrorCode.EIMZO_SERVICE_ERROR,
                data?.reason || ERROR_MESSAGES.GET_PFX_CERTS_ERROR,
                data
              )
            )
          );
        }
      },
      (error: any) => {
        resolve(
          err(
            new EimzoError(
              EimzoErrorCode.EIMZO_SERVICE_ERROR,
              ERROR_MESSAGES.CONNECT_PFX_ERROR,
              error
            )
          )
        );
      }
    );
  });
}

/**
 * Получить все сертификаты (объединяет certkey и pfx)
 * @param uid - опциональный фильтр по ИНН/ПИНФЛ пользователя
 * @returns Result с массивом сертификатов
 */
export async function getAllCertificates(
  uid?: string
): Promise<Result<EimzoCert[], EimzoError>> {
  try {
    // Получаем сертификаты из обоих источников
    const pfxResult = await getAllCertificatesPfx();
    const certkeyResult = await getAllCertificatesCertkey();

    // Обрабатываем ошибки
    if (!pfxResult.success && !certkeyResult.success) {
      // Если оба источника вернули ошибку, возвращаем первую
      return err(
        new EimzoError(
          EimzoErrorCode.EIMZO_SERVICE_ERROR,
          ERROR_MESSAGES.NO_CERTS_SOURCES,
          {
            pfx: pfxResult.success ? undefined : pfxResult.error,
            certkey: certkeyResult.success ? undefined : certkeyResult.error,
          }
        )
      );
    }

    // Собираем сертификаты из успешных источников
    const pfxCerts = pfxResult.success ? pfxResult.data.certificates || [] : [];
    const certkeyCerts = certkeyResult.success
      ? certkeyResult.data.certificates || []
      : [];

    // Парсим данные
    const parsedPfxCerts = parseData(pfxCerts, 'pfx');
    const parsedCertkeyCerts = parseData(certkeyCerts, 'certkey');

    // Объединяем и обрабатываем
    const allCerts: EimzoCert[] = [...parsedPfxCerts, ...parsedCertkeyCerts]
      .map((cert) => {
        // Определяем просроченность сертификата
        const validTo = cert.parsedAlias?.validto;
        let overdue = false;
        if (validTo) {
          const validDate = parseValidDate(validTo);
          // Добавляем 1 день для учета времени
          validDate.setDate(validDate.getDate() + 1);
          overdue = new Date() > validDate;
        }
        return {
          ...cert,
          overdue,
        };
      })
      .sort((a, b) => {
        // Сортируем: сначала не просроченные, потом просроченные
        const aOverdue = a.overdue ? 1 : 0;
        const bOverdue = b.overdue ? 1 : 0;
        return aOverdue - bOverdue;
      });

    // Фильтруем по uid, если указан
    if (uid) {
      const filteredCerts = allCerts.filter(
        (cert) =>
          cert.inn === uid || cert.parsedAlias?.['1.2.860.3.16.1.2'] === uid
      );
      return ok(filteredCerts);
    }

    return ok(allCerts);
  } catch (error) {
    return err(
      new EimzoError(
        EimzoErrorCode.UNKNOWN_ERROR,
        ERROR_MESSAGES.UNEXPECTED_ERROR,
        error
      )
    );
  }
}

/**
 * Получить список USB-токенов (CKC устройств)
 * @returns Result с массивом строк описаний устройств
 */
export async function getEimzoUSBTokens(): Promise<
  Result<string[], EimzoError>
> {
  return new Promise<Result<string[], EimzoError>>((resolve) => {
    if (!getInitialized()) {
      resolve(
        err(
          new EimzoError(
            EimzoErrorCode.INITIALIZATION_FAILED,
            ERROR_MESSAGES.NOT_INITIALIZED
          )
        )
      );
      return;
    }

    CAPIWS.callFunction(
      {
        plugin: 'ckc',
        name: 'list_ckc',
      },
      (_event: MessageEvent, data: any) => {
        if (data && data.devices) {
          const devices = data.devices.map(
            (device: any) => `${device?.type} - ${device?.deviceID}`
          );
          resolve(ok(devices));
        } else {
          resolve(
            err(
              new EimzoError(
                EimzoErrorCode.EIMZO_SERVICE_ERROR,
                data?.reason || 'Ошибка при получении списка USB-токенов',
                data
              )
            )
          );
        }
      },
      (error: any) => {
        resolve(
          err(
            new EimzoError(
              EimzoErrorCode.EIMZO_SERVICE_ERROR,
              'Ошибка при подключении к EIMZO сервису (ckc)',
              error
            )
          )
        );
      }
    );
  });
}

// Управление конфигурацией и инициализацией EIMZO

import { CAPIWS } from './vendors/e-imzo';
import { Result, EimzoError, EimzoErrorCode, ok, err } from './errors';
import { EimzoConfig, TimestamperFunction } from './types';

/**
 * Предустановленные токены по умолчанию
 */
const DEFAULT_DOMAIN_AND_KEY: string[] = [
  'localhost',
  '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B',
  '127.0.0.1',
  'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F',
];

/**
 * Класс для управления конфигурацией и инициализацией EIMZO
 */
class EimzoConfigManager {
  private isInitialized: boolean = false;
  private domainAndKey: string[] = [];
  private timestamper?: TimestamperFunction;
  private defaultKeyId?: string;

  /**
   * Инициализация API EIMZO с токенами
   * @param domainAndKey - массив доменов и ключей [domain1, key1, domain2, key2, ...]
   * @returns Promise с результатом инициализации
   */
  async startApi(domainAndKey?: string[]): Promise<Result<void, EimzoError>> {
    try {
      // Используем переданные токены, сохраненные из конфигурации или предустановленные по умолчанию
      const tokens =
        domainAndKey || this.domainAndKey || DEFAULT_DOMAIN_AND_KEY;

      // Проверяем, что количество элементов четное (домен + ключ)
      if (tokens.length % 2 !== 0) {
        return err(
          new EimzoError(
            EimzoErrorCode.INVALID_PARAMETERS,
            'Количество токенов должно быть четным (домен + ключ)'
          )
        );
      }

      // Сохраняем токены для последующего использования
      if (domainAndKey) {
        this.domainAndKey = domainAndKey;
      }

      // Инициализируем API через CAPIWS.apikey
      return new Promise<Result<void, EimzoError>>((resolve) => {
        CAPIWS.apikey(
          tokens,
          (_event: MessageEvent, data: any) => {
            // Проверяем успешность инициализации
            if (data && !data.error) {
              this.isInitialized = true;
              resolve(ok(undefined));
            } else {
              this.isInitialized = false;
              resolve(
                err(
                  new EimzoError(
                    EimzoErrorCode.INITIALIZATION_FAILED,
                    data?.reason || 'Ошибка инициализации EIMZO API',
                    data
                  )
                )
              );
            }
          },
          (error: any) => {
            this.isInitialized = false;
            resolve(
              err(
                new EimzoError(
                  EimzoErrorCode.INITIALIZATION_FAILED,
                  'Не удалось подключиться к EIMZO сервису',
                  error
                )
              )
            );
          }
        );
      });
    } catch (error) {
      this.isInitialized = false;
      return err(
        new EimzoError(
          EimzoErrorCode.INITIALIZATION_FAILED,
          'Неожиданная ошибка при инициализации',
          error
        )
      );
    }
  }

  /**
   * Получить статус инициализации
   * @returns true если API успешно инициализирован
   */
  getInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Сбросить статус инициализации
   */
  reset(): void {
    this.isInitialized = false;
    this.domainAndKey = [];
    this.timestamper = undefined;
    this.defaultKeyId = undefined;
  }

  /**
   * Установить конфигурацию
   * @param config - конфигурация EIMZO
   */
  setConfig(config: EimzoConfig): void {
    if (config.domainAndKey) {
      this.domainAndKey = config.domainAndKey;
    }
    if (config.timestamper !== undefined) {
      this.timestamper = config.timestamper;
    }
  }

  /**
   * Получить функцию timestamper
   * @returns функция timestamper или undefined
   */
  getTimestamper(): TimestamperFunction | undefined {
    return this.timestamper;
  }

  /**
   * Установить идентификатор ключа по умолчанию
   * @param keyId - ИНН для сертификатов или 'idcard'/'ckc' для USB-токенов
   */
  setDefaultKeyId(keyId: string): void {
    this.defaultKeyId = keyId;
  }

  /**
   * Получить идентификатор ключа по умолчанию
   * @returns идентификатор ключа или undefined
   */
  getDefaultKeyId(): string | undefined {
    return this.defaultKeyId;
  }

  /**
   * Очистить идентификатор ключа по умолчанию
   */
  clearDefaultKeyId(): void {
    this.defaultKeyId = undefined;
  }
}

// Создаем единственный экземпляр (singleton)
const eimzoConfig = new EimzoConfigManager();

/**
 * Инициализация API EIMZO с токенами
 * @param domainAndKey - массив доменов и ключей [domain1, key1, domain2, key2, ...]
 * @returns Promise с результатом инициализации
 */
export async function startApi(
  domainAndKey?: string[]
): Promise<Result<void, EimzoError>> {
  return eimzoConfig.startApi(domainAndKey);
}

/**
 * Получить статус инициализации
 * @returns true если API успешно инициализирован
 */
export function getInitialized(): boolean {
  return eimzoConfig.getInitialized();
}

/**
 * Сбросить статус инициализации
 */
export function reset(): void {
  eimzoConfig.reset();
}

/**
 * Установить конфигурацию
 * @param config - конфигурация EIMZO
 */
export function setConfig(config: EimzoConfig): void {
  eimzoConfig.setConfig(config);
}

/**
 * Получить функцию timestamper из конфигурации
 * @returns функция timestamper или undefined
 */
export function getTimestamper(): TimestamperFunction | undefined {
  return eimzoConfig.getTimestamper();
}

/**
 * Установить идентификатор ключа по умолчанию
 * @param keyId - ИНН для сертификатов или 'idcard'/'ckc' для USB-токенов
 */
export function setDefaultKeyId(keyId: string): void {
  eimzoConfig.setDefaultKeyId(keyId);
}

/**
 * Получить идентификатор ключа по умолчанию
 * @returns идентификатор ключа или undefined
 */
export function getDefaultKeyId(): string | undefined {
  return eimzoConfig.getDefaultKeyId();
}

/**
 * Очистить идентификатор ключа по умолчанию
 */
export function clearDefaultKeyId(): void {
  eimzoConfig.clearDefaultKeyId();
}

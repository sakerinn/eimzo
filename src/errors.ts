// Result Pattern и енумы ошибок для EIMZO

/**
 * Result Pattern для обработки ошибок
 */
export type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Енум кодов ошибок EIMZO
 */
export enum EimzoErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  CERTIFICATE_NOT_FOUND = 'CERTIFICATE_NOT_FOUND',
  PASSWORD_INCORRECT = 'PASSWORD_INCORRECT',
  EIMZO_SERVICE_ERROR = 'EIMZO_SERVICE_ERROR',
  TIMESTAMP_ERROR = 'TIMESTAMP_ERROR',
  SIGNATURE_ERROR = 'SIGNATURE_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  SIGNATURE_CREATION_FAILED = 'SIGNATURE_CREATION_FAILED',
  KEY_LOAD_FAILED = 'KEY_LOAD_FAILED',
  TIMESTAMP_ATTACH_FAILED = 'TIMESTAMP_ATTACH_FAILED',
  INVALID_CERTIFICATE_TYPE = 'INVALID_CERTIFICATE_TYPE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Класс ошибки EIMZO
 */
export class EimzoError extends Error {
  constructor(
    public code: EimzoErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'EimzoError';
    Object.setPrototypeOf(this, EimzoError.prototype);
  }
}

/**
 * Утилита для создания успешного результата
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Утилита для создания результата с ошибкой
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

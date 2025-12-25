// Функции работы с PKCS7 подписями

import { CAPIWS } from '../vendors/e-imzo';
import { Result, EimzoError, EimzoErrorCode, ok, err } from '../errors';
import { getTimestamper } from '../config';
import { ERROR_MESSAGES } from '../messages';

/**
 * Создать PKCS7 подпись
 * @param keyId - ID ключа для подписания
 * @param data - данные для подписания (в base64 или обычная строка)
 * @param isBase64 - флаг, указывающий что данные уже в base64
 * @param useTimestamp - использовать ли временную метку
 * @returns Result с PKCS7 подписью в base64
 */
export async function createPkcs7(
  keyId: string,
  data: string,
  isBase64?: boolean,
  useTimestamp?: boolean
): Promise<Result<{ pkcs7: string; signerSerialNumber?: string }, EimzoError>> {
  return new Promise<Result<{ pkcs7: string; signerSerialNumber?: string }, EimzoError>>(
    (resolve) => {
      // Преобразуем данные в base64, если нужно
      const dataBase64 = !isBase64
        ? btoa(unescape(encodeURIComponent(data)))
        : data;

      CAPIWS.callFunction(
        {
          plugin: 'pkcs7',
          name: 'create_pkcs7',
          arguments: [dataBase64, keyId, 'no'],
        },
        (_event: MessageEvent, response: any) => {
          if (response.success) {
            const pkcs7 = response.pkcs7_64;
            const signerSerialNumber = response.signer_serial_number;

            // Если нужно добавить timestamp
            if (useTimestamp) {
              const timestamper = getTimestamper();
              if (timestamper) {
                timestamper(
                  response.signature_hex,
                  pkcs7,
                  (tst) => {
                    if (tst.isAttachedPkcs7) {
                      resolve(
                        ok({
                          pkcs7: tst.timeStampTokenB64,
                          signerSerialNumber,
                        })
                      );
                    } else {
                      // Присоединяем timestamp токен
                      attachTimestampToken(pkcs7, signerSerialNumber, tst.timeStampTokenB64)
                        .then((result) => {
                          if (result.success) {
                            resolve(
                              ok({
                                pkcs7: result.data,
                                signerSerialNumber,
                              })
                            );
                          } else {
                            resolve(err(result.success ? undefined as any : result.error));
                          }
                        })
                        .catch((error) => {
                          resolve(
                            err(
                              new EimzoError(
                                EimzoErrorCode.TIMESTAMP_ATTACH_FAILED,
                                ERROR_MESSAGES.TIMESTAMP_ATTACH_FAILED,
                                error
                              )
                            )
                          );
                        });
                    }
                  },
                  (error) => {
                    resolve(
                      err(
                        new EimzoError(
                          EimzoErrorCode.TIMESTAMP_ERROR,
                          ERROR_MESSAGES.TIMESTAMP_ATTACH_FAILED,
                          error
                        )
                      )
                    );
                  }
                );
              } else {
                // Timestamp не настроен, возвращаем подпись без timestamp
                resolve(
                  ok({
                    pkcs7,
                    signerSerialNumber,
                  })
                );
              }
            } else {
              resolve(
                ok({
                  pkcs7,
                  signerSerialNumber,
                })
              );
            }
          } else {
            resolve(
              err(
                new EimzoError(
                  EimzoErrorCode.SIGNATURE_CREATION_FAILED,
                  response.reason || ERROR_MESSAGES.SIGNATURE_CREATION_FAILED,
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
                EimzoErrorCode.SIGNATURE_CREATION_FAILED,
                ERROR_MESSAGES.SIGNATURE_CREATION_FAILED,
                error
              )
            )
          );
        }
      );
    }
  );
}

/**
 * Присоединить timestamp токен к PKCS7 подписи
 * @param pkcs7 - PKCS7 подпись в base64
 * @param signerSerialNumber - серийный номер подписанта
 * @param timestampToken - timestamp токен в base64
 * @returns Result с PKCS7 подписью с timestamp в base64
 */
export async function attachTimestampToken(
  pkcs7: string,
  signerSerialNumber: string,
  timestampToken: string
): Promise<Result<string, EimzoError>> {
  return new Promise<Result<string, EimzoError>>((resolve) => {
    CAPIWS.callFunction(
      {
        plugin: 'pkcs7',
        name: 'attach_timestamp_token_pkcs7',
        arguments: [pkcs7, signerSerialNumber, timestampToken],
      },
      (_event: MessageEvent, response: any) => {
        if (response.success) {
          resolve(ok(response.pkcs7_64));
        } else {
          resolve(
            err(
              new EimzoError(
                EimzoErrorCode.TIMESTAMP_ATTACH_FAILED,
                response.reason || ERROR_MESSAGES.TIMESTAMP_ATTACH_FAILED,
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
              EimzoErrorCode.TIMESTAMP_ATTACH_FAILED,
              ERROR_MESSAGES.TIMESTAMP_ATTACH_FAILED,
              error
            )
          )
        );
      }
    );
  });
}

/**
 * Присоединить подпись к существующей PKCS7 подписи
 * @param keyId - ID ключа для подписания
 * @param existingPkcs7 - существующая PKCS7 подпись в base64
 * @param useTimestamp - использовать ли временную метку
 * @returns Result с PKCS7 подписью в base64
 */
export async function appendPkcs7Attached(
  keyId: string,
  existingPkcs7: string,
  useTimestamp?: boolean
): Promise<Result<{ pkcs7: string; signerSerialNumber?: string }, EimzoError>> {
  return new Promise<Result<{ pkcs7: string; signerSerialNumber?: string }, EimzoError>>(
    (resolve) => {
      CAPIWS.callFunction(
        {
          plugin: 'pkcs7',
          name: 'append_pkcs7_attached',
          arguments: [existingPkcs7, keyId],
        },
        (_event: MessageEvent, response: any) => {
          if (response.success) {
            const pkcs7 = response.pkcs7_64;
            const signerSerialNumber = response.signer_serial_number;

            // Если нужно добавить timestamp
            if (useTimestamp) {
              const timestamper = getTimestamper();
              if (timestamper) {
                timestamper(
                  response.signature_hex,
                  pkcs7,
                  (tst) => {
                    if (tst.isAttachedPkcs7) {
                      resolve(
                        ok({
                          pkcs7: tst.timeStampTokenB64,
                          signerSerialNumber,
                        })
                      );
                    } else {
                      // Присоединяем timestamp токен
                      attachTimestampToken(pkcs7, signerSerialNumber, tst.timeStampTokenB64)
                        .then((result) => {
                          if (result.success) {
                            resolve(
                              ok({
                                pkcs7: result.data,
                                signerSerialNumber,
                              })
                            );
                          } else {
                            resolve(err(result.success ? undefined as any : result.error));
                          }
                        })
                        .catch((error) => {
                          resolve(
                            err(
                              new EimzoError(
                                EimzoErrorCode.TIMESTAMP_ATTACH_FAILED,
                                ERROR_MESSAGES.TIMESTAMP_ATTACH_FAILED,
                                error
                              )
                            )
                          );
                        });
                    }
                  },
                  (error) => {
                    resolve(
                      err(
                        new EimzoError(
                          EimzoErrorCode.TIMESTAMP_ERROR,
                          ERROR_MESSAGES.TIMESTAMP_ATTACH_FAILED,
                          error
                        )
                      )
                    );
                  }
                );
              } else {
                // Timestamp не настроен, возвращаем подпись без timestamp
                resolve(
                  ok({
                    pkcs7,
                    signerSerialNumber,
                  })
                );
              }
            } else {
              resolve(
                ok({
                  pkcs7,
                  signerSerialNumber,
                })
              );
            }
          } else {
            resolve(
              err(
                new EimzoError(
                  EimzoErrorCode.SIGNATURE_CREATION_FAILED,
                  response.reason || ERROR_MESSAGES.SIGNATURE_CREATION_FAILED,
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
                EimzoErrorCode.SIGNATURE_CREATION_FAILED,
                ERROR_MESSAGES.SIGNATURE_CREATION_FAILED,
                error
              )
            )
          );
        }
      );
    }
  );
}


"use strict";
exports.__esModule = true;
exports.ERROR_MESSAGES = void 0;
/**
 * Тексты ошибок для функций работы с EIMZO
 */
exports.ERROR_MESSAGES = {
    NOT_INITIALIZED: 'EIMZO API не инициализирован. Вызовите startApi() перед использованием.',
    GET_CERTKEY_CERTS_ERROR: 'Ошибка при получении сертификатов certkey',
    CONNECT_CERTKEY_ERROR: 'Ошибка при подключении к EIMZO сервису (certkey)',
    GET_PFX_CERTS_ERROR: 'Ошибка при получении сертификатов pfx',
    CONNECT_PFX_ERROR: 'Ошибка при подключении к EIMZO сервису (pfx)',
    NO_CERTS_SOURCES: 'Не удалось получить сертификаты ни из одного источника',
    UNEXPECTED_ERROR: 'Неожиданная ошибка при получении сертификатов',
    SIGNATURE_CREATION_FAILED: 'Ошибка создания подписи',
    KEY_LOAD_FAILED: 'Ошибка загрузки ключа',
    TIMESTAMP_ATTACH_FAILED: 'Ошибка добавления временной метки',
    INVALID_CERTIFICATE_TYPE: 'Неверный тип сертификата',
    NO_KEY_IDENTIFIER: 'Не указан идентификатор ключа и сертификат не передан',
    CERTIFICATE_NOT_SELECTED: 'Не удалось выбрать сертификат для подписания'
};

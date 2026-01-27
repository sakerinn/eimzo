"use strict";
// Управление конфигурацией и инициализацией EIMZO
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.clearDefaultKeyId = exports.getDefaultKeyId = exports.setDefaultKeyId = exports.getTimestamper = exports.setConfig = exports.reset = exports.getInitialized = exports.startApi = void 0;
var e_imzo_1 = require("./vendors/e-imzo");
var errors_1 = require("./errors");
/**
 * Предустановленные токены по умолчанию
 */
var DEFAULT_DOMAIN_AND_KEY = [
    'localhost',
    '96D0C1491615C82B9A54D9989779DF825B690748224C2B04F500F370D51827CE2644D8D4A82C18184D73AB8530BB8ED537269603F61DB0D03D2104ABF789970B',
    '127.0.0.1',
    'A7BCFA5D490B351BE0754130DF03A068F855DB4333D43921125B9CF2670EF6A40370C646B90401955E1F7BC9CDBF59CE0B2C5467D820BE189C845D0B79CFC96F',
];
/**
 * Класс для управления конфигурацией и инициализацией EIMZO
 */
var EimzoConfigManager = /** @class */ (function () {
    function EimzoConfigManager() {
        this.isInitialized = false;
        this.domainAndKey = [];
    }
    /**
     * Инициализация API EIMZO с токенами
     * @param domainAndKey - массив доменов и ключей [domain1, key1, domain2, key2, ...]
     * @returns Promise с результатом инициализации
     */
    EimzoConfigManager.prototype.startApi = function (domainAndKey) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens_1;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    tokens_1 = domainAndKey || this.domainAndKey || DEFAULT_DOMAIN_AND_KEY;
                    // Проверяем, что количество элементов четное (домен + ключ)
                    if (tokens_1.length % 2 !== 0) {
                        return [2 /*return*/, (0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.INVALID_PARAMETERS, 'Количество токенов должно быть четным (домен + ключ)'))];
                    }
                    // Сохраняем токены для последующего использования
                    if (domainAndKey) {
                        this.domainAndKey = domainAndKey;
                    }
                    // Инициализируем API через CAPIWS.apikey
                    return [2 /*return*/, new Promise(function (resolve) {
                            e_imzo_1.CAPIWS.apikey(tokens_1, function (_event, data) {
                                // Проверяем успешность инициализации
                                if (data && !data.error) {
                                    _this.isInitialized = true;
                                    resolve((0, errors_1.ok)(undefined));
                                }
                                else {
                                    _this.isInitialized = false;
                                    resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.INITIALIZATION_FAILED, (data === null || data === void 0 ? void 0 : data.reason) || 'Ошибка инициализации EIMZO API', data)));
                                }
                            }, function (error) {
                                _this.isInitialized = false;
                                resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.INITIALIZATION_FAILED, 'Не удалось подключиться к EIMZO сервису', error)));
                            });
                        })];
                }
                catch (error) {
                    this.isInitialized = false;
                    return [2 /*return*/, (0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.INITIALIZATION_FAILED, 'Неожиданная ошибка при инициализации', error))];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Получить статус инициализации
     * @returns true если API успешно инициализирован
     */
    EimzoConfigManager.prototype.getInitialized = function () {
        return this.isInitialized;
    };
    /**
     * Сбросить статус инициализации
     */
    EimzoConfigManager.prototype.reset = function () {
        this.isInitialized = false;
        this.domainAndKey = [];
        this.timestamper = undefined;
        this.defaultKeyId = undefined;
    };
    /**
     * Установить конфигурацию
     * @param config - конфигурация EIMZO
     */
    EimzoConfigManager.prototype.setConfig = function (config) {
        if (config.domainAndKey) {
            this.domainAndKey = config.domainAndKey;
        }
        if (config.timestamper !== undefined) {
            this.timestamper = config.timestamper;
        }
    };
    /**
     * Получить функцию timestamper
     * @returns функция timestamper или undefined
     */
    EimzoConfigManager.prototype.getTimestamper = function () {
        return this.timestamper;
    };
    /**
     * Установить идентификатор ключа по умолчанию
     * @param keyId - ИНН для сертификатов или 'idcard'/'ckc' для USB-токенов
     */
    EimzoConfigManager.prototype.setDefaultKeyId = function (keyId) {
        this.defaultKeyId = keyId;
    };
    /**
     * Получить идентификатор ключа по умолчанию
     * @returns идентификатор ключа или undefined
     */
    EimzoConfigManager.prototype.getDefaultKeyId = function () {
        return this.defaultKeyId;
    };
    /**
     * Очистить идентификатор ключа по умолчанию
     */
    EimzoConfigManager.prototype.clearDefaultKeyId = function () {
        this.defaultKeyId = undefined;
    };
    return EimzoConfigManager;
}());
// Создаем единственный экземпляр (singleton)
var eimzoConfig = new EimzoConfigManager();
/**
 * Инициализация API EIMZO с токенами
 * @param domainAndKey - массив доменов и ключей [domain1, key1, domain2, key2, ...]
 * @returns Promise с результатом инициализации
 */
function startApi(domainAndKey) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, eimzoConfig.startApi(domainAndKey)];
        });
    });
}
exports.startApi = startApi;
/**
 * Получить статус инициализации
 * @returns true если API успешно инициализирован
 */
function getInitialized() {
    return eimzoConfig.getInitialized();
}
exports.getInitialized = getInitialized;
/**
 * Сбросить статус инициализации
 */
function reset() {
    eimzoConfig.reset();
}
exports.reset = reset;
/**
 * Установить конфигурацию
 * @param config - конфигурация EIMZO
 */
function setConfig(config) {
    eimzoConfig.setConfig(config);
}
exports.setConfig = setConfig;
/**
 * Получить функцию timestamper из конфигурации
 * @returns функция timestamper или undefined
 */
function getTimestamper() {
    return eimzoConfig.getTimestamper();
}
exports.getTimestamper = getTimestamper;
/**
 * Установить идентификатор ключа по умолчанию
 * @param keyId - ИНН для сертификатов или 'idcard'/'ckc' для USB-токенов
 */
function setDefaultKeyId(keyId) {
    eimzoConfig.setDefaultKeyId(keyId);
}
exports.setDefaultKeyId = setDefaultKeyId;
/**
 * Получить идентификатор ключа по умолчанию
 * @returns идентификатор ключа или undefined
 */
function getDefaultKeyId() {
    return eimzoConfig.getDefaultKeyId();
}
exports.getDefaultKeyId = getDefaultKeyId;
/**
 * Очистить идентификатор ключа по умолчанию
 */
function clearDefaultKeyId() {
    eimzoConfig.clearDefaultKeyId();
}
exports.clearDefaultKeyId = clearDefaultKeyId;

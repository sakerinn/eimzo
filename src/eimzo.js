"use strict";
// Основная логика работы с EIMZO
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.getEimzoUSBTokens = exports.getAllCertificates = void 0;
var e_imzo_1 = require("./vendors/e-imzo");
var errors_1 = require("./errors");
var parseData_1 = require("./utils/parseData");
var config_1 = require("./config");
var messages_1 = require("./messages");
/**
 * Получить все сертификаты через certkey плагин
 */
function getAllCertificatesCertkey() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    if (!(0, config_1.getInitialized)()) {
                        resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.INITIALIZATION_FAILED, messages_1.ERROR_MESSAGES.NOT_INITIALIZED)));
                        return;
                    }
                    e_imzo_1.CAPIWS.callFunction({
                        plugin: 'certkey',
                        name: 'list_all_certificates'
                    }, function (_event, data) {
                        if (data && data.certificates) {
                            resolve((0, errors_1.ok)(data));
                        }
                        else {
                            resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.EIMZO_SERVICE_ERROR, (data === null || data === void 0 ? void 0 : data.reason) || messages_1.ERROR_MESSAGES.GET_CERTKEY_CERTS_ERROR, data)));
                        }
                    }, function (error) {
                        resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.EIMZO_SERVICE_ERROR, messages_1.ERROR_MESSAGES.CONNECT_CERTKEY_ERROR, error)));
                    });
                })];
        });
    });
}
/**
 * Получить все сертификаты через pfx плагин
 */
function getAllCertificatesPfx() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    if (!(0, config_1.getInitialized)()) {
                        resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.INITIALIZATION_FAILED, messages_1.ERROR_MESSAGES.NOT_INITIALIZED)));
                        return;
                    }
                    e_imzo_1.CAPIWS.callFunction({
                        plugin: 'pfx',
                        name: 'list_all_certificates'
                    }, function (_event, data) {
                        if (data && data.certificates) {
                            resolve((0, errors_1.ok)(data));
                        }
                        else {
                            resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.EIMZO_SERVICE_ERROR, (data === null || data === void 0 ? void 0 : data.reason) || messages_1.ERROR_MESSAGES.GET_PFX_CERTS_ERROR, data)));
                        }
                    }, function (error) {
                        resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.EIMZO_SERVICE_ERROR, messages_1.ERROR_MESSAGES.CONNECT_PFX_ERROR, error)));
                    });
                })];
        });
    });
}
/**
 * Получить все сертификаты (объединяет certkey и pfx)
 * @param uid - опциональный фильтр по ИНН/ПИНФЛ пользователя
 * @returns Result с массивом сертификатов
 */
function getAllCertificates(uid) {
    return __awaiter(this, void 0, void 0, function () {
        var pfxResult, certkeyResult, pfxCerts, certkeyCerts, parsedPfxCerts, parsedCertkeyCerts, allCerts, filteredCerts, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getAllCertificatesPfx()];
                case 1:
                    pfxResult = _a.sent();
                    return [4 /*yield*/, getAllCertificatesCertkey()];
                case 2:
                    certkeyResult = _a.sent();
                    // Обрабатываем ошибки
                    if (!pfxResult.success && !certkeyResult.success) {
                        // Если оба источника вернули ошибку, возвращаем первую
                        return [2 /*return*/, (0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.EIMZO_SERVICE_ERROR, messages_1.ERROR_MESSAGES.NO_CERTS_SOURCES, {
                                pfx: pfxResult.success ? undefined : pfxResult.error,
                                certkey: certkeyResult.success ? undefined : certkeyResult.error
                            }))];
                    }
                    pfxCerts = pfxResult.success ? pfxResult.data.certificates || [] : [];
                    certkeyCerts = certkeyResult.success
                        ? certkeyResult.data.certificates || []
                        : [];
                    parsedPfxCerts = (0, parseData_1.parseData)(pfxCerts, 'pfx');
                    parsedCertkeyCerts = (0, parseData_1.parseData)(certkeyCerts, 'certkey');
                    allCerts = __spreadArray(__spreadArray([], parsedPfxCerts, true), parsedCertkeyCerts, true).map(function (cert) {
                        var _a;
                        // Определяем просроченность сертификата
                        var validTo = (_a = cert.parsedAlias) === null || _a === void 0 ? void 0 : _a.validto;
                        var overdue = false;
                        if (validTo) {
                            var validDate = (0, parseData_1.parseValidDate)(validTo);
                            // Добавляем 1 день для учета времени
                            validDate.setDate(validDate.getDate() + 1);
                            overdue = new Date() > validDate;
                            console.log(cert, validDate, overdue);
                        }
                        return __assign(__assign({}, cert), { overdue: overdue });
                    })
                        .sort(function (a, b) {
                        // Сортируем: сначала не просроченные, потом просроченные
                        var aOverdue = a.overdue ? 1 : 0;
                        var bOverdue = b.overdue ? 1 : 0;
                        return aOverdue - bOverdue;
                    });
                    // Фильтруем по uid, если указан
                    if (uid) {
                        filteredCerts = allCerts.filter(function (cert) { var _a; return cert.inn === uid || ((_a = cert.parsedAlias) === null || _a === void 0 ? void 0 : _a['1.2.860.3.16.1.2']) === uid; });
                        return [2 /*return*/, (0, errors_1.ok)(filteredCerts)];
                    }
                    return [2 /*return*/, (0, errors_1.ok)(allCerts)];
                case 3:
                    error_1 = _a.sent();
                    return [2 /*return*/, (0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.UNKNOWN_ERROR, messages_1.ERROR_MESSAGES.UNEXPECTED_ERROR, error_1))];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getAllCertificates = getAllCertificates;
/**
 * Получить список USB-токенов (CKC устройств)
 * @returns Result с массивом строк описаний устройств
 */
function getEimzoUSBTokens() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    if (!(0, config_1.getInitialized)()) {
                        resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.INITIALIZATION_FAILED, messages_1.ERROR_MESSAGES.NOT_INITIALIZED)));
                        return;
                    }
                    e_imzo_1.CAPIWS.callFunction({
                        plugin: 'ckc',
                        name: 'list_ckc'
                    }, function (_event, data) {
                        if (data && data.devices) {
                            var devices = data.devices.map(function (device) { return "".concat(device === null || device === void 0 ? void 0 : device.type, " - ").concat(device === null || device === void 0 ? void 0 : device.deviceID); });
                            resolve((0, errors_1.ok)(devices));
                        }
                        else {
                            resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.EIMZO_SERVICE_ERROR, (data === null || data === void 0 ? void 0 : data.reason) || 'Ошибка при получении списка USB-токенов', data)));
                        }
                    }, function (error) {
                        resolve((0, errors_1.err)(new errors_1.EimzoError(errors_1.EimzoErrorCode.EIMZO_SERVICE_ERROR, 'Ошибка при подключении к EIMZO сервису (ckc)', error)));
                    });
                })];
        });
    });
}
exports.getEimzoUSBTokens = getEimzoUSBTokens;

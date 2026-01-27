"use strict";
// Result Pattern и енумы ошибок для EIMZO
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.err = exports.ok = exports.EimzoError = exports.EimzoErrorCode = void 0;
/**
 * Енум кодов ошибок EIMZO
 */
var EimzoErrorCode;
(function (EimzoErrorCode) {
    EimzoErrorCode["INITIALIZATION_FAILED"] = "INITIALIZATION_FAILED";
    EimzoErrorCode["CERTIFICATE_NOT_FOUND"] = "CERTIFICATE_NOT_FOUND";
    EimzoErrorCode["PASSWORD_INCORRECT"] = "PASSWORD_INCORRECT";
    EimzoErrorCode["EIMZO_SERVICE_ERROR"] = "EIMZO_SERVICE_ERROR";
    EimzoErrorCode["TIMESTAMP_ERROR"] = "TIMESTAMP_ERROR";
    EimzoErrorCode["SIGNATURE_ERROR"] = "SIGNATURE_ERROR";
    EimzoErrorCode["WEBSOCKET_ERROR"] = "WEBSOCKET_ERROR";
    EimzoErrorCode["INVALID_PARAMETERS"] = "INVALID_PARAMETERS";
    EimzoErrorCode["SIGNATURE_CREATION_FAILED"] = "SIGNATURE_CREATION_FAILED";
    EimzoErrorCode["KEY_LOAD_FAILED"] = "KEY_LOAD_FAILED";
    EimzoErrorCode["TIMESTAMP_ATTACH_FAILED"] = "TIMESTAMP_ATTACH_FAILED";
    EimzoErrorCode["INVALID_CERTIFICATE_TYPE"] = "INVALID_CERTIFICATE_TYPE";
    EimzoErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(EimzoErrorCode = exports.EimzoErrorCode || (exports.EimzoErrorCode = {}));
/**
 * Класс ошибки EIMZO
 */
var EimzoError = /** @class */ (function (_super) {
    __extends(EimzoError, _super);
    function EimzoError(code, message, details) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.details = details;
        _this.name = 'EimzoError';
        Object.setPrototypeOf(_this, EimzoError.prototype);
        return _this;
    }
    return EimzoError;
}(Error));
exports.EimzoError = EimzoError;
/**
 * Утилита для создания успешного результата
 */
function ok(data) {
    return { success: true, data: data };
}
exports.ok = ok;
/**
 * Утилита для создания результата с ошибкой
 */
function err(error) {
    return { success: false, error: error };
}
exports.err = err;

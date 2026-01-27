"use strict";
// Парсинг данных сертификатов
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
exports.__esModule = true;
exports.parseValidDate = exports.parseData = void 0;
/**
 * Вспомогательная функция для получения значения из X500 строки
 * Эмулирует splitKeep - разделяет строку с сохранением разделителей
 */
function getX500Val(s, f) {
    // Ищем паттерн "FIELD=" в строке
    var searchPattern = f + '=';
    var index = s.indexOf(searchPattern);
    if (index === -1) {
        return '';
    }
    // Берем значение после "FIELD="
    var valueStart = index + searchPattern.length;
    var remaining = s.substring(valueStart);
    // Ищем следующий разделитель (паттерн ,[A-Z]+=)
    var nextDelimiterMatch = remaining.match(/,[A-Z]+=/);
    if (nextDelimiterMatch && nextDelimiterMatch.index !== undefined) {
        // Возвращаем значение до следующего разделителя
        return remaining.substring(0, nextDelimiterMatch.index);
    }
    // Если разделителя нет, возвращаем все оставшееся значение
    return remaining;
}
/**
 * Парсинг данных сертификатов
 * @param data - массив сырых данных сертификатов
 * @param type - тип сертификата ('pfx' или 'certkey')
 * @returns массив распарсенных сертификатов
 */
function parseData(data, type) {
    if (!data || data.length === 0) {
        return [];
    }
    return data.map(function (item) {
        var array = [];
        if (type === 'pfx') {
            array = item.alias ? item.alias.split(',') : [];
        }
        else {
            array = item.subjectName ? item.subjectName.split(',') : [];
        }
        var json = {};
        array.forEach(function (itemStr) {
            var parsedItem = itemStr.split('=');
            if (parsedItem.length >= 2) {
                json[parsedItem[0]] = parsedItem[1];
            }
        });
        var inn = '';
        var serialNumber = '';
        if (type === 'certkey') {
            var x500name_ex = (item.subjectName || '').toUpperCase();
            var x500name_normalized = x500name_ex
                .replace(/1\.2\.860\.3\.16\.1\.1=/g, 'INN=')
                .replace(/1\.2\.860\.3\.16\.1\.2=/g, 'PINFL=');
            inn =
                getX500Val(x500name_normalized, 'INITIALS') ||
                    getX500Val(x500name_normalized, 'INN') ||
                    getX500Val(x500name_normalized, 'UID') ||
                    '';
            serialNumber = getX500Val((item.subjectName || '').toUpperCase(), 'SERIALNUMBER');
        }
        else {
            var x500name_ex = (item.alias || '').toUpperCase();
            var x500name_normalized = x500name_ex
                .replace(/1\.2\.860\.3\.16\.1\.1=/g, 'INN=')
                .replace(/1\.2\.860\.3\.16\.1\.2=/g, 'PINFL=');
            inn =
                getX500Val(x500name_normalized, 'INN') ||
                    getX500Val(x500name_normalized, 'UID') ||
                    '';
            serialNumber = getX500Val((item.alias || '').toUpperCase(), 'SERIALNUMBER');
        }
        return __assign(__assign({}, item), { inn: inn, serialNumber: serialNumber, type: type, parsedAlias: json });
    });
}
exports.parseData = parseData;
/**
 * Парсинг даты из формата YYYY.MM.DD
 */
function parseValidDate(date) {
    if (!date) {
        return new Date();
    }
    // Формат: "YYYY.MM.DD HH:mm:ss" -> берем только дату
    var datePart = date.split(' ')[0];
    var _a = datePart.split('.'), year = _a[0], month = _a[1], day = _a[2];
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}
exports.parseValidDate = parseValidDate;

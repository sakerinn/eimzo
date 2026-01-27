// Парсинг данных сертификатов

import { EimzoCert } from '../types';

/**
 * Вспомогательная функция для получения значения из X500 строки
 * Эмулирует splitKeep - разделяет строку с сохранением разделителей
 */
function getX500Val(s: string, f: string): string {
  // Ищем паттерн "FIELD=" в строке
  const searchPattern = f + '=';
  const index = s.indexOf(searchPattern);

  if (index === -1) {
    return '';
  }

  // Берем значение после "FIELD="
  const valueStart = index + searchPattern.length;
  const remaining = s.substring(valueStart);

  // Ищем следующий разделитель (паттерн ,[A-Z]+=)
  const nextDelimiterMatch = remaining.match(/,[A-Z]+=/);
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
export function parseData(data: any[], type: 'pfx' | 'certkey'): EimzoCert[] {
  if (!data || data.length === 0) {
    return [];
  }

  return data.map((item) => {
    let array: string[] = [];
    if (type === 'pfx') {
      array = item.alias ? item.alias.split(',') : [];
    } else {
      array = item.subjectName ? item.subjectName.split(',') : [];
    }

    const json: Record<string, string> = {};
    array.forEach((itemStr) => {
      const parsedItem = itemStr.split('=');
      if (parsedItem.length >= 2) {
        json[parsedItem[0]] = parsedItem[1];
      }
    });

    let inn = '';
    let serialNumber = '';

    if (type === 'certkey') {
      const x500name_ex = (item.subjectName || '').toUpperCase();
      const x500name_normalized = x500name_ex
        .replace(/1\.2\.860\.3\.16\.1\.1=/g, 'INN=')
        .replace(/1\.2\.860\.3\.16\.1\.2=/g, 'PINFL=');
      inn =
        getX500Val(x500name_normalized, 'INITIALS') ||
        getX500Val(x500name_normalized, 'INN') ||
        getX500Val(x500name_normalized, 'UID') ||
        '';
      serialNumber = getX500Val(
        (item.subjectName || '').toUpperCase(),
        'SERIALNUMBER'
      );
    } else {
      const x500name_ex = (item.alias || '').toUpperCase();
      const x500name_normalized = x500name_ex
        .replace(/1\.2\.860\.3\.16\.1\.1=/g, 'INN=')
        .replace(/1\.2\.860\.3\.16\.1\.2=/g, 'PINFL=');
      inn =
        getX500Val(x500name_normalized, 'INN') ||
        getX500Val(x500name_normalized, 'UID') ||
        '';
      serialNumber = getX500Val(
        (item.alias || '').toUpperCase(),
        'SERIALNUMBER'
      );
    }

    return {
      ...item,
      inn,
      serialNumber,
      type,
      parsedAlias: json,
    } as EimzoCert;
  });
}

/**
 * Парсинг даты из формата YYYY.MM.DD
 */
export function parseValidDate(date: string): Date {
  if (!date) {
    return new Date();
  }
  // Формат: "YYYY.MM.DD HH:mm:ss" -> берем только дату
  const datePart = date.split(' ')[0];
  const [year, month, day] = datePart.split('.');

  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

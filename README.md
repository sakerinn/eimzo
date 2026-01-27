# @nicksakerin/eimzo

Библиотека для работы с клиентом EIMZO (электронная цифровая подпись для Узбекистана).

## Установка

```bash
npm install @nicksakerin/eimzo
```

## Требования

- Установленный и запущенный клиент EIMZO
- Современный браузер с поддержкой WebSocket

## Быстрый старт

```typescript
import {
  startApi,
  getAllCertificates,
  sign,
  setDefaultKeyId,
  setConfig,
} from '@nicksakerin/eimzo';

// 1. Инициализация API
const initResult = await startApi();
if (!initResult.success) {
  console.error('Ошибка инициализации:', initResult.error);
  return;
}

// 2. Настройка timestamper (опционально)
setConfig({
  timestamper: (signatureHex, pkcs7, callback, onReject) => {
    fetch('https://example.uz/timestamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signatureHex, pkcs7 }),
    })
      .then((res) => res.json())
      .then((data) => callback(data))
      .catch((err) => onReject(err));
  },
});

// 3. Установка ИНН по умолчанию (опционально)
setDefaultKeyId('123456789');

// 4. Получение сертификатов
const certsResult = await getAllCertificates();
if (certsResult.success) {
  console.log('Найдено сертификатов:', certsResult.data.length);
}

// 5. Подписание данных
const signResult = await sign('Данные для подписания');
if (signResult.success) {
  console.log('Подпись создана:', signResult.data.signature);
}
```

## API

### Инициализация

#### `startApi(domainAndKey?: string[])`

Инициализирует API EIMZO с токенами доступа.

```typescript
const result = await startApi();
// или с кастомными токенами
const result = await startApi(['domain1', 'key1', 'domain2', 'key2']);
```

#### `getInitialized(): boolean`

Проверяет, инициализирован ли API.

```typescript
if (getInitialized()) {
  // API готов к использованию
}
```

#### `reset()`

Сбрасывает состояние инициализации и очищает конфигурацию.

### Работа с сертификатами

#### `getAllCertificates(uid?: string)`

Получает все доступные сертификаты (из certkey и pfx источников).

```typescript
// Все сертификаты
const result = await getAllCertificates();

// Сертификаты по ИНН
const result = await getAllCertificates('123456789');
```

Возвращает `Result<EimzoCert[], EimzoError>` где `EimzoCert` содержит:
- `inn` - ИНН
- `serialNumber` - серийный номер
- `type` - тип сертификата ('certkey' | 'pfx')
- `overdue` - просрочен ли сертификат
- `parsedAlias` - распарсенные данные из alias

#### `getEimzoUSBTokens()`

Получает список доступных USB-токенов (CKC устройств).

```typescript
const result = await getEimzoUSBTokens();
if (result.success) {
  console.log('USB-токены:', result.data);
  // ['CKC - DEVICE-001', 'IDCARD - DEVICE-002']
}
```

### Подписание

#### `sign(data: string, signer?: Signer, options?: SignOptions)`

Подписывает данные. Если `signer` не указан, используется сохраненный `defaultKeyId`.

```typescript
// Подписание с автоматическим выбором сертификата (по defaultKeyId)
const result = await sign('Данные для подписания');

// Подписание с конкретным сертификатом
const certsResult = await getAllCertificates();
if (certsResult.success && certsResult.data.length > 0) {
  const result = await sign('Данные', certsResult.data[0]);
}

// Подписание с USB-токеном
const result = await sign('Данные', 'idcard'); // или 'ckc'

// Подписание с опциями
const result = await sign('Данные', cert, {
  isBase64: true,      // данные уже в base64
  useTimestamp: true,  // добавить временную метку
});
```

#### `attach(existingPkcs7: string, signer?: Signer, options?: AttachOptions)`

Присоединяет подпись к существующей PKCS7 подписи.

```typescript
// Присоединение подписи
const result = await attach(existingSignature, cert);

// С опцией ignoreSearch (игнорировать поиск сертификата)
const result = await attach(existingSignature, cert, {
  ignoreSearch: true,
});

// Для USB-токенов с originalString
const result = await attach(existingSignature, 'idcard', {
  originalString: 'Оригинальные данные',
  joinSignatures: async (existingPkcs7, newSignature) => {
    // Логика объединения подписей
    const response = await fetch('/api/join-signatures', {
      method: 'POST',
      body: JSON.stringify({ existingPkcs7, newSignature }),
    });
    return { success: true, data: { pkcs7B64: await response.text() } };
  },
});
```

### Управление идентификатором ключа по умолчанию

#### `setDefaultKeyId(keyId: string)`

Устанавливает идентификатор ключа по умолчанию (ИНН или 'idcard'/'ckc').

```typescript
// Для сертификата
setDefaultKeyId('123456789');

// Для USB-токена
setDefaultKeyId('idcard');
```

#### `getDefaultKeyId(): string | undefined`

Получает сохраненный идентификатор ключа.

#### `clearDefaultKeyId()`

Очищает сохраненный идентификатор ключа.

### Конфигурация

#### `setConfig(config: EimzoConfig)`

Устанавливает конфигурацию библиотеки.

```typescript
setConfig({
  domainAndKey: ['domain1', 'key1', 'domain2', 'key2'],
  timestamper: (signatureHex, pkcs7, callback, onReject) => {
    // Логика получения timestamp
    fetch('https://example.uz/timestamp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signatureHex, pkcs7 }),
    })
      .then((res) => res.json())
      .then((data) => callback(data))
      .catch((err) => onReject(err));
  },
});
```

#### `getTimestamper(): TimestamperFunction | undefined`

Получает установленную функцию timestamper.

## Типы

### `EimzoCert`

Интерфейс сертификата:

```typescript
interface EimzoCert {
  inn: string;
  serialNumber: string;
  type?: 'certkey' | 'pfx' | 'idcard' | 'ckc';
  overdue?: boolean;
  parsedAlias?: {
    cn: string;
    o: string;
    validto: string;
    '1.2.860.3.16.1.2'?: string; // ПИНФЛ
  };
  disk?: string;
  path?: string;
  name?: string;
  alias?: string;
}
```

### `SignOptions`

Опции для подписания:

```typescript
interface SignOptions {
  isBase64?: boolean;      // данные уже в base64
  useTimestamp?: boolean; // использовать временную метку
}
```

### `SignResult`

Результат подписания:

```typescript
interface SignResult {
  signature: string;              // PKCS7 подпись в base64
  signerSerialNumber?: string;    // серийный номер подписанта
}
```

### `Result<T, E>`

Result Pattern для обработки ошибок:

```typescript
type Result<T, E> =
  | { success: true; data: T }
  | { success: false; error: E };
```

## Обработка ошибок

Библиотека использует Result Pattern для обработки ошибок. Все функции возвращают `Result<T, EimzoError>`.

```typescript
const result = await sign('Данные');

if (result.success) {
  // Успех
  console.log(result.data.signature);
} else {
  // Ошибка
  console.error('Код ошибки:', result.error.code);
  console.error('Сообщение:', result.error.message);
  console.error('Детали:', result.error.details);
}
```

### Коды ошибок

- `INITIALIZATION_FAILED` - ошибка инициализации API
- `CERTIFICATE_NOT_FOUND` - сертификат не найден
- `PASSWORD_INCORRECT` - неверный пароль
- `EIMZO_SERVICE_ERROR` - ошибка сервиса EIMZO
- `TIMESTAMP_ERROR` - ошибка получения timestamp
- `SIGNATURE_ERROR` - ошибка создания подписи
- `KEY_LOAD_FAILED` - ошибка загрузки ключа
- `TIMESTAMP_ATTACH_FAILED` - ошибка добавления timestamp
- `INVALID_CERTIFICATE_TYPE` - неверный тип сертификата
- `INVALID_PARAMETERS` - неверные параметры
- `UNKNOWN_ERROR` - неизвестная ошибка

## Примеры использования

### Полный цикл работы

```typescript
import {
  startApi,
  setConfig,
  setDefaultKeyId,
  getAllCertificates,
  sign,
  clearDefaultKeyId,
} from '@nicksakerin/eimzo';

async function main() {
  // 1. Инициализация
  const initResult = await startApi();
  if (!initResult.success) {
    throw initResult.error;
  }

  // 2. Настройка timestamper
  setConfig({
    timestamper: (signatureHex, pkcs7, callback, onReject) => {
      fetch('https://example.uz/timestamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureHex, pkcs7 }),
      })
        .then((res) => res.json())
        .then((data) => callback(data))
        .catch((err) => onReject(err));
    },
  });

  // 3. Установка ИНН по умолчанию
  setDefaultKeyId('123456789');

  // 4. Получение сертификатов
  const certsResult = await getAllCertificates();
  if (!certsResult.success) {
    throw certsResult.error;
  }

  console.log('Найдено сертификатов:', certsResult.data.length);

  // 5. Подписание
  const signResult = await sign('Важные данные для подписания');
  if (signResult.success) {
    console.log('Подпись создана успешно!');
    console.log('Длина подписи:', signResult.data.signature.length);
  } else {
    console.error('Ошибка подписания:', signResult.error);
  }

  // 6. Очистка (при выходе)
  clearDefaultKeyId();
}

main();
```

### Работа с USB-токенами

```typescript
import { getEimzoUSBTokens, sign } from '@nicksakerin/eimzo';

// Получение списка USB-токенов
const tokensResult = await getEimzoUSBTokens();
if (tokensResult.success) {
  console.log('Доступные USB-токены:', tokensResult.data);
}

// Подписание с USB-токеном
const signResult = await sign('Данные', 'idcard');
// или
const signResult = await sign('Данные', 'ckc');
```

### Присоединение нескольких подписей

```typescript
import { sign, attach } from '@nicksakerin/eimzo';

// Первая подпись
const firstResult = await sign('Документ', cert1);
if (!firstResult.success) throw firstResult.error;

// Вторая подпись (присоединение)
const secondResult = await attach(firstResult.data.signature, cert2);
if (!secondResult.success) throw secondResult.error;

console.log('Документ подписан двумя подписями');
```

## Лицензия

ISC

## Автор

Nikita Sakerin


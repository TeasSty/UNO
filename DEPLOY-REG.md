# Деплой на Reg.ru (uno-saratov-64.ru)

Сайт — статика: содержимое папки `dist/` после `npm run build:reg`.

## Сборка

```bash
npm run build:reg
```

По умолчанию `base: '/'` (корневой домен). GitHub Pages по-прежнему собирается в Actions с `VITE_BASE=/UNO/`.

Готовый архив (если есть): `uno-saratov-64-dist.zip` — можно загрузить через File Manager и распаковать.

## Куда класть файлы

В ispmanager откройте **WWW-домены → uno-saratov-64.ru → корневая директория сайта**.

Обычно это:

- `www/uno-saratov-64.ru/` или
- `httpdocs/` (если домен привязан к этой папке)

Загружайте **содержимое** `dist/` (не саму папку `dist`):

- `index.html`
- `privacy.html`
- `consent.html`
- `assets/`
- `images/`
- и остальные файлы из `dist/`

После загрузки должны открываться:

- `https://uno-saratov-64.ru/`
- `https://uno-saratov-64.ru/privacy.html`
- `https://uno-saratov-64.ru/consent.html`

## FTP через ispmanager

1. **Учётные записи FTP** → создать пользователя (домашняя папка = корень сайта).
2. Подключение:
   - **Хост:** обычно `server64.hosting.reg.ru` или `server84.hosting.reg.ru` (смотрите в письме Reg.ru / в панели)
   - **Порт:** 21 (FTP) или 22 (SFTP, если включён)
   - **Логин / пароль:** от созданного FTP-пользователя (не путать с логином панели `u3633327`, если отдельно не указано)
3. Залить файлы из `dist/` в корень сайта.
4. Права: файлы `644`, папки `755`.

## SSL (Let's Encrypt)

Самоподписанный сертификат браузеры ругают. В ispmanager:

**SSL → Let's Encrypt** для `uno-saratov-64.ru` (+ www, если нужно) → включить HTTPS и редирект HTTP→HTTPS.

## DNS

A-запись домена должна указывать на IP хостинга Reg.ru (из панели / письма). После смены DNS подождите Propagate.

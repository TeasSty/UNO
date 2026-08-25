# УНО — сайт салона красоты (Саратов)

Лендинг салона **УНО** (ул. Менякина, 4): услуги и цены, работы, контакты. Запись через [VK](https://vk.com/uno.saratov64).

## Локальный запуск

```bash
npm install
npm run dev
```

Сборка и превью:

```bash
npm run build
npm run preview
```

Локально `base` = `/`. Для GitHub Pages при сборке задаётся `VITE_BASE=/UNO/`.

## Публикация на GitHub Pages

После пуша workflow сам соберёт `dist/` и задеплоит сайт.

### 1. Создайте репозиторий

На GitHub создайте репозиторий с именем **`UNO`** (важно: путь в URL будет `/UNO/`).

### 2. Подключите remote и запушьте

В папке проекта:

```bash
git remote add origin https://github.com/<ваш-username>/UNO.git
git branch -M main
git push -u origin main
```

### 3. Включите Pages (Actions)

1. Откройте репозиторий → **Settings** → **Pages**
2. **Source**: **GitHub Actions**
3. Дождитесь успешного прогона workflow **Deploy to GitHub Pages** (вкладка **Actions**)

### 4. Ссылка на демо

```
https://<ваш-username>.github.io/UNO/
```

Пример: `https://popoo.github.io/UNO/` (подставьте свой username).

Если репозиторий назван иначе — в `.github/workflows/deploy-pages.yml` и при необходимости в `vite.config.js` замените `/UNO/` на `/ИМЯ_РЕПО/`.

## Содержание

- Реальные контакты салона (VK `uno.saratov64`, телефоны, адрес)
- Текстовый прайс (табы + аккордеон), не скриншоты прайсов
- Фото из сообщества → WebP в `public/images/`
- Без рейтингов и «звёзд»
- CTA записи → VK

## Фото

Оптимизированные WebP: `public/images/work-*.webp`  
Заметки по пайплайну: `public/images/ASSETS.md`

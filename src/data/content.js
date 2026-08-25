/** Real salon content from VK / open directories — no invented ratings. */

export const salon = {
  name: 'УНО',
  fullName: 'Салон красоты УНО',
  slogan: 'Управление новыми образами',
  tagline: 'Ценим каждого',
  address: 'Саратов, ул. им. Менякина Ю.И., 4',
  addressShort: 'Менякина, 4',
  hours: 'Ежедневно 09:00–20:00',
  hoursNote: 'По предварительной записи',
  phones: [
    { display: '+7 (8452) 90-04-25', href: 'tel:+78452900425', short: '900-425' },
    { display: '+7 (908) 557-75-88', href: 'tel:+79085577588' },
  ],
  /** Primary booking for now — VK community */
  booking: 'https://vk.com/uno.saratov64',
  telegram: 'https://t.me/unosaratov64',
  vk: 'https://vk.com/uno.saratov64',
  mapEmbed:
    'https://yandex.ru/map-widget/v1/?ll=46.07547%2C51.575792&z=17&pt=46.07547,51.575792,pm2rdm',
  mapLink: 'https://yandex.ru/maps/?pt=46.07547,51.575792&z=17&l=map',
  promo: 'Скидка 5% на услуги — уточняйте условия при записи',
}

export const nav = [
  { id: 'services', label: 'Услуги' },
  { id: 'about', label: 'О салоне' },
  { id: 'gallery', label: 'Работы' },
  { id: 'contacts', label: 'Контакты' },
]

/** Prices transcribed from VK price graphics into native text. */
export const serviceTabs = [
  {
    id: 'nails',
    label: 'Ногти',
    note: 'Цены из прайса салона. Итог зависит от состояния ногтей и объёма работы.',
    groups: [
      {
        title: 'Педикюр',
        items: [
          { name: 'Педикюр женский', price: '1 400 ₽' },
          { name: 'Педикюр мужской', price: '1 600 ₽' },
          { name: 'Педикюр детский (с 7 до 12 лет)', price: '1 200 ₽' },
          { name: 'Smart-педикюр женский (с уходовыми средствами)', price: '1 600 ₽' },
          { name: 'Smart-педикюр мужской (с уходовыми средствами)', price: '1 800 ₽' },
          { name: 'Обработка пальцев ног', price: '1 000 ₽' },
          { name: 'Обработка стопы', price: '1 000 ₽' },
          { name: 'Покрытие лаком', price: '300 ₽' },
          { name: 'Покрытие лечебным лаком', price: '300 ₽' },
          { name: 'Покрытие гель-лаком', price: '800 ₽' },
          { name: 'Покрытие плёнкой', price: '1 000 ₽' },
          { name: 'Снятие лака', price: '100 ₽' },
          { name: 'Снятие покрытия гель-лаком', price: '200 ₽' },
        ],
      },
      {
        title: 'SPA-комплексы',
        items: [
          { name: 'Женский педикюр + spa-терапия + массаж стопы', price: '1 800 ₽' },
          { name: 'Мужской педикюр + spa-терапия + массаж стопы', price: '1 900 ₽' },
        ],
      },
      {
        title: 'Педикюр парамедицинский',
        items: [
          { name: 'Педикюр с проблемной стопой', price: '1 800 ₽' },
          { name: 'Обработка проблемной стопы', price: '1 000 ₽' },
          { name: 'Обработка вросшего ногтя', price: '500 ₽' },
          { name: 'Тампонада вросшего ногтя (Каполин)', price: '600 ₽' },
          { name: 'Тампонада вросшего ногтя (Ligasano)', price: '600 ₽' },
          { name: 'Удаление сложных мозолей и натоптышей', price: '250 ₽' },
          { name: 'Протезирование ногтевой пластины', price: 'от 200 ₽' },
          { name: 'Установка титановой нити (большой)', price: '3 500 ₽' },
          { name: 'Установка титановой нити (маленький)', price: '2 700 ₽' },
          { name: 'Лечение пяток: разгрузка, тейпирование', price: 'от 600 ₽' },
        ],
      },
      {
        title: 'Маникюр',
        items: [
          { name: 'Маникюр без покрытия', price: 'от 450 ₽' },
          { name: 'Маникюр с покрытием гель-лак', price: 'от 900 ₽' },
          { name: 'Дизайн, наращивание, снятие', price: 'уточняйте при записи' },
        ],
      },
    ],
  },
  {
    id: 'face',
    label: 'Лицо',
    note: 'Косметология, брови, ресницы и перманентный макияж — по прайсу салона.',
    groups: [
      {
        title: 'Косметик-эстетист',
        items: [
          { name: 'Первичная консультация', price: '300 ₽' },
          { name: 'Альгинатная маска', price: '800 ₽' },
          { name: 'Альгинатная маска KEENWELL', price: '900 ₽' },
          { name: 'Очищающий уход', price: '1 500 ₽' },
          { name: 'Чистка лица ультразвуковая', price: '1 500 ₽' },
          { name: 'Миндальный / молочный / феруловый / салициловый пилинг', price: '1 500 ₽' },
          { name: 'Азелаиновый пилинг', price: '1 500 ₽' },
          { name: 'Мультикислотный пилинг', price: '1 900 ₽' },
          { name: 'Срединный пилинг Джесснера', price: '1 800 ₽' },
          { name: 'Жёлтый пилинг', price: '2 700 ₽' },
          { name: 'Карбокситерапия', price: '1 600 ₽' },
          { name: 'Авторский массаж лица, шеи, декольте', price: '1 800 ₽' },
          { name: 'Массаж лица классический с альгинатной маской', price: '2 500 ₽' },
          { name: 'Фракционная мезотерапия «Янтарное омоложение»', price: '1 900 ₽' },
          { name: 'Уходовая процедура «Королева»', price: '3 100 ₽' },
          { name: 'Чистка лица комбинированная + химический пилинг БИОТАЙМ', price: '3 000 ₽' },
          { name: 'Безинъекционный протокол «Дельфинья кожа» БИОТАЙМ', price: '3 000 ₽' },
          { name: 'Маски по типу лица', price: '500 ₽' },
        ],
      },
      {
        title: 'Перманентный макияж',
        items: [
          { name: 'Перманентный макияж бровей', price: '7 000 ₽' },
          { name: 'Коррекция перманента бровей', price: '4 500 ₽' },
          { name: 'Перманентный макияж губ', price: '8 000 ₽' },
          { name: 'Коррекция перманента губ', price: '5 000 ₽' },
          { name: 'Классическая стрелка', price: '6 000 ₽' },
          { name: 'Коррекция стрелки', price: '4 000 ₽' },
          { name: 'Межресничный контур', price: '4 500 ₽' },
          { name: 'Коррекция межресничного контура', price: '3 500 ₽' },
          { name: 'Лазерное удаление татуажа бровей', price: '3 000 ₽' },
          { name: 'Лазерное удаление татуажа губ', price: '3 500 ₽' },
          { name: 'Карбоновый пилинг лица (аппаратный)', price: '1 500 ₽ / сеанс' },
        ],
      },
      {
        title: 'Брови и ресницы',
        items: [
          { name: 'Коррекция и окрашивание бровей', price: 'уточняйте при записи' },
          { name: 'Ламинирование бровей / ресниц', price: 'уточняйте при записи' },
          { name: 'Наращивание ресниц', price: 'уточняйте при записи' },
        ],
      },
    ],
  },
  {
    id: 'hair',
    label: 'Волосы',
    note: 'Стрижки, уходы и сложные окрашивания. Стоимость сложных работ — после консультации.',
    groups: [
      {
        title: 'Стрижки',
        items: [
          { name: 'Женская стрижка', price: 'от 900 ₽' },
          { name: 'Мужская стрижка', price: 'от 750 ₽' },
          { name: 'Детская стрижка', price: 'уточняйте при записи' },
        ],
      },
      {
        title: 'Окрашивание и уход',
        items: [
          { name: 'Сложное окрашивание, мелирование, тонирование', price: 'по консультации' },
          { name: 'Ботокс волос, полировка, нанопластика, кератин', price: 'по консультации' },
          { name: 'Укладки и причёски', price: 'уточняйте при записи' },
        ],
      },
    ],
  },
  {
    id: 'body',
    label: 'Тело',
    note: 'Депиляция и солярий — по прайсу салона. Точную зону подтвердит мастер при записи.',
    groups: [
      {
        title: 'Депиляция',
        items: [
          { name: 'Бикини классическое', price: '1 000 ₽' },
          { name: 'Бикини глубокое', price: '1 200 ₽' },
          { name: 'Ноги полностью', price: '1 300 ₽' },
          { name: 'Ноги голень', price: '900 ₽' },
          { name: 'Ноги бедра', price: '900 ₽' },
          { name: 'Руки полностью', price: '900 ₽' },
          { name: 'Руки до локтя', price: '500 ₽' },
          { name: 'Ягодицы', price: '600 ₽' },
          { name: 'Поясница', price: '500 ₽' },
          { name: 'Линия живота', price: '400 ₽' },
          { name: 'Спина', price: '700 ₽' },
          { name: 'Подмышечные впадины', price: '500 ₽' },
          { name: 'Верхняя губа', price: '200 ₽' },
          { name: 'Лицо 1 зона', price: '250 ₽' },
        ],
      },
      {
        title: 'Депиляция мужская',
        items: [
          { name: 'Грудь', price: '900 ₽' },
          { name: 'Живот', price: '900 ₽' },
          { name: 'Спина', price: '1 100 ₽' },
          { name: 'Подмышки', price: '700 ₽' },
          { name: 'Ноги полностью', price: '1 700 ₽' },
          { name: 'Руки', price: '900 ₽' },
          { name: 'Линия живота', price: '500 ₽' },
          { name: 'Зона паха', price: '1 900 ₽' },
        ],
      },
      {
        title: 'Солярий',
        items: [{ name: 'Солярий', price: 'уточняйте при записи' }],
      },
    ],
  },
]

/** Short factual lines for the about editorial block — not feature-card fluff. */
export const aboutFacts = [
  {
    label: 'Адрес',
    text: 'Саратов, ул. им. Менякина Ю.И., 4 — волосы, ногти, ресницы, брови, косметология, эпиляция и солярий.',
  },
  {
    label: 'Часы',
    text: 'Ежедневно 09:00–20:00, по предварительной записи.',
  },
  {
    label: 'Запись',
    text: 'Сообщение во VK, звонок или Telegram — администратор подберёт мастера и время.',
  },
]

/** Gallery: atmosphere / results only — never price-list screenshots. Paths relative to site base. */
export const galleryItems = [
  { src: 'images/work-00.webp', alt: 'Маникюр — красный гель-лак', cat: 'nails' },
  { src: 'images/work-02.webp', alt: 'Маникюр с шиммером', cat: 'nails' },
  { src: 'images/work-03.webp', alt: 'Нюдовый маникюр', cat: 'nails' },
  { src: 'images/work-04.webp', alt: 'Дизайн ногтей', cat: 'nails' },
  { src: 'images/work-05.webp', alt: 'Минималистичный маникюр в горошек', cat: 'nails' },
  { src: 'images/work-06.webp', alt: 'Молочный маникюр', cat: 'nails' },
  { src: 'images/work-07.webp', alt: 'Светлый маникюр', cat: 'nails' },
  { src: 'images/work-08.webp', alt: 'Светлый маникюр с хлопьями', cat: 'nails' },
  { src: 'images/work-09.webp', alt: 'Окрашивание волос в процессе', cat: 'hair' },
  { src: 'images/work-10.webp', alt: 'Стрижка и окрашивание — пепельный блонд', cat: 'hair' },
  { src: 'images/work-11.webp', alt: 'Французский маникюр с красным акцентом', cat: 'nails' },
  { src: 'images/work-12.webp', alt: 'Тёмный гель-лак', cat: 'nails' },
  { src: 'images/work-13.webp', alt: 'Бургунди-маникюр', cat: 'nails' },
  { src: 'images/work-14.webp', alt: 'Нюдовый маникюр на журнале', cat: 'nails' },
  { src: 'images/work-15.webp', alt: 'Ярко-розовый маникюр', cat: 'nails' },
  { src: 'images/work-16.webp', alt: 'Стрижка — светлый боб', cat: 'hair' },
  { src: 'images/work-17.webp', alt: 'Стрижка — тёмный боб в салоне', cat: 'hair' },
  { src: 'images/work-18.webp', alt: 'Голубой френч', cat: 'nails' },
  { src: 'images/work-19.webp', alt: 'Светлый маникюр с цветами', cat: 'nails' },
  { src: 'images/work-20.webp', alt: 'Классический френч', cat: 'nails' },
]

/**
 * Hero: clean beauty results only — nail close-ups from VK portfolio.
 * Avoid client-profile hair shots (plastic cape / LV top / awkward crop).
 * Video: no local UNO reel; add muted autoplay only when they supply a VK clip.
 */
export const heroImages = [
  { src: 'images/work-00.webp', position: 'center 40%' },
  { src: 'images/work-11.webp', position: 'center 35%' },
  { src: 'images/work-13.webp', position: 'center 45%' },
  { src: 'images/work-06.webp', position: 'center 40%' },
]

export const galleryFilters = [
  { id: 'all', label: 'Все' },
  { id: 'nails', label: 'Ногти' },
  { id: 'hair', label: 'Волосы' },
]

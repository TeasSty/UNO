import { useEffect, useMemo, useRef, useState } from 'react'
import {
  aboutFacts,
  galleryFilters,
  galleryItems,
  heroImages,
  nav,
  salon,
  serviceTabs,
} from './data/content.js'

const BOOK_VK = salon.booking
const BOOK_TG = salon.telegram
const BOOK_PHONE = salon.phones[0].href

/** Respect Vite `base` (e.g. `/UNO/` on GitHub Pages). */
function asset(path) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${String(path).replace(/^\//, '')}`
}

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'))
      return undefined
    }
    const nodes = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    nodes.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function Header({ menuOpen, setMenuOpen }) {
  const scrolled = useScrolled()
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="УНО — на главную">
          <img src={asset('images/logo-uno.webp')} alt="УНО" width="148" height="40" />
        </a>
        <nav className="nav-desktop" aria-label="Основное меню">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="btn btn-ghost phone-link" href={BOOK_PHONE}>
            {salon.phones[0].display}
          </a>
          <a className="btn btn-primary" href={BOOK_VK} target="_blank" rel="noreferrer">
            Записаться
          </a>
          <button
            type="button"
            className="burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' is-open' : ''}`}>
        <div className="container mobile-menu-inner">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a className="btn btn-primary" href={BOOK_VK} target="_blank" rel="noreferrer">
            Записаться во VK
          </a>
          <a className="btn btn-secondary" href={BOOK_TG} target="_blank" rel="noreferrer">
            Telegram
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const pick = useMemo(() => {
    const i = Math.floor(Date.now() / 86400000) % heroImages.length
    return heroImages[i]
  }, [])

  return (
    <section className="hero" id="top">
      <div className="hero-media" aria-hidden="true">
        <img
          src={asset(pick.src)}
          alt=""
          className="hero-img"
          style={{ objectPosition: pick.position }}
          width="1600"
          height="2000"
          fetchPriority="high"
        />
        <div className="hero-veil" />
      </div>
      <div className="container hero-content">
        <h1>
          <span className="h1-brand">УНО</span>
          <span className="h1-sub">{salon.slogan}</span>
        </h1>
        <p className="lead">{salon.tagline}. Саратов, {salon.addressShort}.</p>
        <div className="hero-cta">
          <a className="btn btn-primary btn-lg" href={BOOK_VK} target="_blank" rel="noreferrer">
            Записаться во VK
          </a>
          <a className="btn btn-secondary btn-lg btn-on-dark" href="#services">
            Услуги и цены
          </a>
        </div>
        <p className="hero-meta">
          {salon.hours}
          <span className="hero-meta-sep" aria-hidden="true">
            ·
          </span>
          {salon.hoursNote}
        </p>
      </div>
    </section>
  )
}

function Services({ tabId, setTabId }) {
  const tab = serviceTabs.find((t) => t.id === tabId) ?? serviceTabs[0]
  const [openGroups, setOpenGroups] = useState(() => new Set([0]))

  useEffect(() => {
    setOpenGroups(new Set([0]))
  }, [tabId])

  const toggleGroup = (index) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section className="section" id="services" data-reveal>
      <div className="container">
        <div className="section-head section-head-compact">
          <p className="section-kicker">Прайс</p>
          <h2>Услуги и цены</h2>
          <p>
            Актуальные позиции по материалам салона. Сложные процедуры — точная стоимость у мастера
            при записи.
          </p>
        </div>

        <div className="tabs" role="tablist" aria-label="Категории услуг">
          {serviceTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === tabId}
              className={`tab${t.id === tabId ? ' is-active' : ''}`}
              onClick={() => setTabId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={`price-panel price-panel--${tab.id}`}>
          <div className="price-panel-head">
            <span className="price-panel-mark" aria-hidden="true" />
            <div>
              <h3 className="price-panel-title">{tab.label}</h3>
              <p className="tab-note">{tab.note}</p>
            </div>
          </div>

          <div className="price-compact">
            {tab.groups.map((group, index) => {
              const open = openGroups.has(index)
              return (
                <div key={group.title} className={`price-acc${open ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="price-acc-head"
                    aria-expanded={open}
                    onClick={() => toggleGroup(index)}
                  >
                    <span>{group.title}</span>
                    <span className="price-acc-meta">
                      {group.items.length}
                      <span className="price-acc-chevron" aria-hidden="true" />
                    </span>
                  </button>
                  {open ? (
                    <ul className="price-rows">
                      {group.items.map((item) => (
                        <li key={item.name}>
                          <span className="price-name">{item.name}</span>
                          <span className="price-dots" aria-hidden="true" />
                          <span className="price-value">{item.price}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <div className="section-cta">
          <a className="btn btn-primary" href={BOOK_VK} target="_blank" rel="noreferrer">
            Записаться во VK
          </a>
          <a className="btn btn-secondary" href={BOOK_PHONE}>
            Позвонить
          </a>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section section-alt" id="about" data-reveal>
      <div className="container about-layout">
        <figure className="about-photo">
          <img
            src={asset('images/work-11.webp')}
            alt="Французский маникюр с красным акцентом — работа салона УНО"
            width="800"
            height="1000"
            loading="lazy"
          />
        </figure>
        <div className="about-copy">
          <p className="about-eyebrow">О салоне</p>
          <h2>Полный цикл на Менякина, 4</h2>
          <p className="lead-sm">
            Салон УНО в Саратове: стрижки и окрашивание, ногти, брови и ресницы, косметология,
            эпиляция и солярий — без беготни по разным адресам.
          </p>
          <ul className="about-facts">
            {aboutFacts.map((f) => (
              <li key={f.label}>
                <span className="about-fact-label">{f.label}</span>
                <span className="about-fact-text">{f.text}</span>
              </li>
            ))}
          </ul>
          <p className="promo-line">{salon.promo}</p>
          <div className="about-actions">
            <a className="btn btn-primary" href={BOOK_VK} target="_blank" rel="noreferrer">
              Записаться во VK
            </a>
            <a className="btn btn-ghost" href={BOOK_PHONE}>
              {salon.phones[0].display}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const dialogRef = useRef(null)
  const item = items[index]

  useEffect(() => {
    if (index == null || !item) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [index, item, onClose, onPrev, onNext])

  if (index == null || !item) return null

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      ref={dialogRef}
      tabIndex={-1}
      onClick={onClose}
    >
      <button type="button" className="lightbox-close" aria-label="Закрыть" onClick={onClose}>
        ×
      </button>
      <button
        type="button"
        className="lightbox-nav lightbox-prev"
        aria-label="Предыдущее фото"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
      >
        ‹
      </button>
      <figure
        className="lightbox-figure"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={asset(item.src)} alt={item.alt} />
        <figcaption>{item.alt}</figcaption>
      </figure>
      <button
        type="button"
        className="lightbox-nav lightbox-next"
        aria-label="Следующее фото"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
      >
        ›
      </button>
    </div>
  )
}

function Gallery() {
  const [filter, setFilter] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const items = useMemo(
    () => (filter === 'all' ? galleryItems : galleryItems.filter((g) => g.cat === filter)),
    [filter],
  )

  return (
    <section className="section" id="gallery" data-reveal>
      <div className="container">
        <div className="section-head">
          <p className="section-kicker">Портфолио</p>
          <h2>Работы</h2>
          <p>Фотографии из материалов сообщества УНО — атмосфера и результат.</p>
        </div>
        <div className="tabs" role="tablist" aria-label="Фильтр галереи">
          {galleryFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`tab${filter === f.id ? ' is-active' : ''}`}
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="gallery-grid">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              className="gallery-item"
              onClick={() => setLightboxIndex(i)}
              aria-label={`Открыть: ${item.alt}`}
            >
              <img src={asset(item.src)} alt={item.alt} loading="lazy" width="600" height="800" />
            </button>
          ))}
        </div>
      </div>
      <Lightbox
        items={items}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() =>
          setLightboxIndex((i) => (i == null ? i : (i - 1 + items.length) % items.length))
        }
        onNext={() => setLightboxIndex((i) => (i == null ? i : (i + 1) % items.length))}
      />
    </section>
  )
}

function Contacts() {
  return (
    <section className="section section-alt" id="contacts" data-reveal>
      <div className="container contacts-grid">
        <div className="contacts-copy">
          <p className="section-kicker">Связь</p>
          <h2>Контакты и запись</h2>
          <p className="lead-sm">
            Напишите во VK или позвоните — подберём время и мастера. Telegram — дополнительный канал
            связи.
          </p>
          <dl className="contact-list">
            <div>
              <dt>Адрес</dt>
              <dd>
                <a href={salon.mapLink} target="_blank" rel="noreferrer">
                  {salon.address}
                </a>
              </dd>
            </div>
            <div>
              <dt>Часы</dt>
              <dd>
                {salon.hours}
                <br />
                <span className="muted">{salon.hoursNote}</span>
              </dd>
            </div>
            <div>
              <dt>Телефоны</dt>
              <dd>
                {salon.phones.map((p) => (
                  <a key={p.href} className="block-link" href={p.href}>
                    {p.display}
                  </a>
                ))}
              </dd>
            </div>
            <div>
              <dt>Мессенджеры</dt>
              <dd>
                <a className="block-link" href={salon.vk} target="_blank" rel="noreferrer">
                  ВКонтакте — запись
                </a>
                <a className="block-link" href={salon.telegram} target="_blank" rel="noreferrer">
                  Telegram
                </a>
              </dd>
            </div>
          </dl>
          <div className="section-cta">
            <a className="btn btn-primary btn-lg" href={BOOK_VK} target="_blank" rel="noreferrer">
              Записаться во VK
            </a>
            <a className="btn btn-secondary btn-lg" href={BOOK_PHONE}>
              Позвонить
            </a>
          </div>
        </div>
        <div className="map-wrap">
          <iframe
            title="Карта: салон УНО на Менякина, 4"
            src={salon.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img
            src={asset('images/logo-mark.webp')}
            alt="UNO — салон красоты"
            width="96"
            height="40"
          />
          <p>
            {salon.fullName}
            <br />
            {salon.address}
          </p>
        </div>
        <div className="footer-links">
          <a href={salon.vk} target="_blank" rel="noreferrer">
            VK — запись
          </a>
          <a href={salon.telegram} target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href={BOOK_PHONE}>{salon.phones[0].display}</a>
        </div>
        <p className="footer-note">
          © {year} УНО · Саратов
          <br />
          Ежедневно {salon.hours.replace('Ежедневно ', '')}
        </p>
      </div>
    </footer>
  )
}

function StickyCta() {
  return (
    <div className="sticky-cta" role="region" aria-label="Быстрая запись">
      <a className="btn btn-secondary" href={BOOK_PHONE}>
        Позвонить
      </a>
      <a className="btn btn-primary" href={BOOK_VK} target="_blank" rel="noreferrer">
        Записаться
      </a>
    </div>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [serviceTabId, setServiceTabId] = useState(serviceTabs[0].id)
  useReveal()

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <Services tabId={serviceTabId} setTabId={setServiceTabId} />
        <About />
        <Gallery />
        <Contacts />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}

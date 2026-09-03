import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import CookieConsent from './components/CookieConsent.jsx'
import {
  hasContactsHash,
  hasScrollHash,
  scrollToHashIfPresent,
} from './scrollReset.js'
import {
  aboutFacts,
  galleryFilters,
  galleryItems,
  heroClip,
  nav,
  salon,
  serviceTabs,
} from './data/content.js'

const BOOK_VK = salon.booking
const BOOK_TG = salon.telegram
const BOOK_MAX = salon.max.href
const BOOK_PHONE = salon.phones[0].href

function legalHref(page) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${page}.html`
}

function MessengerLinks({ className = 'block-link', showPhone = false }) {
  return (
    <>
      <a className={className} href={salon.vk} target="_blank" rel="noreferrer">
        ВКонтакте — запись
      </a>
      <a className={className} href={salon.telegram} target="_blank" rel="noreferrer">
        Telegram
      </a>
      <a
        className={className}
        href={salon.max.href}
        target="_blank"
        rel="noreferrer"
        title={`Написать в MAX: ${salon.max.display}`}
      >
        MAX{showPhone ? ` ${salon.max.display}` : ''}
      </a>
    </>
  )
}

/** Respect Vite `base` (e.g. `/UNO/` on GitHub Pages). */
function asset(path) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${String(path).replace(/^\//, '')}`
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Horizontal tab-strip scroll only — never moves the page (unlike scrollIntoView). */
function scrollTabHorizontally(list, tab) {
  if (!list || !tab) return
  const pad = 8
  const tabLeft = tab.offsetLeft
  const tabRight = tabLeft + tab.offsetWidth
  const viewLeft = list.scrollLeft
  const viewRight = viewLeft + list.clientWidth

  if (tabLeft < viewLeft + pad) {
    list.scrollLeft = Math.max(0, tabLeft - pad)
  } else if (tabRight > viewRight - pad) {
    list.scrollLeft = tabRight - list.clientWidth + pad
  }
}

/** Full reload starts at top; explicit hash anchors still work. */
function useInitialScroll() {
  useLayoutEffect(() => {
    if (hasScrollHash()) {
      scrollToHashIfPresent(!prefersReducedMotion())
    }
  }, [])
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

/** Show sticky CTA only well after the hero has left the viewport. */
function usePastHero() {
  const [pastHero, setPastHero] = useState(false)
  useEffect(() => {
    const hero = document.querySelector('.hero')
    if (!hero) return undefined

    const check = () => {
      const { bottom } = hero.getBoundingClientRect()
      setPastHero(bottom <= -120)
    }

    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])
  return pastHero
}

function useReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) {
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

function SlidingTabs({ items, activeId, onChange, ariaLabel, role = 'tablist', className = '' }) {
  const listRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  const updateIndicator = () => {
    const list = listRef.current
    if (!list) return
    const active = list.querySelector('.tab.is-active')
    if (!active) return
    setIndicator({
      left: active.offsetLeft - list.scrollLeft,
      width: active.offsetWidth,
      ready: true,
    })
  }

  useLayoutEffect(() => {
    updateIndicator()
  }, [activeId, items])

  useLayoutEffect(() => {
    const list = listRef.current
    if (list) list.scrollLeft = 0
  }, [])

  useEffect(() => {
    const list = listRef.current
    if (!list) return undefined
    const onResize = () => updateIndicator()
    window.addEventListener('resize', onResize)
    list.addEventListener('scroll', onResize, { passive: true })
    return () => {
      window.removeEventListener('resize', onResize)
      list.removeEventListener('scroll', onResize)
    }
  }, [activeId, items])

  return (
    <div
      className={`tabs${className ? ` ${className}` : ''}`}
      role={role}
      aria-label={ariaLabel}
      ref={listRef}
    >
      <span
        className={`tabs-indicator${indicator.ready ? ' is-ready' : ''}`}
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
        }}
        aria-hidden="true"
      />
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          role={role === 'tablist' ? 'tab' : undefined}
          aria-selected={t.id === activeId}
          className={`tab${t.id === activeId ? ' is-active' : ''}`}
          onClick={(e) => {
            onChange(t.id)
            const list = listRef.current
            if (list) scrollTabHorizontally(list, e.currentTarget)
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function Header({ menuOpen, setMenuOpen }) {
  const scrolled = useScrolled()
  const solid = scrolled || menuOpen

  return (
    <header className={`site-header${solid ? ' is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="УНО — на главную">
          <img
            className="brand-logo brand-logo--light"
            src={asset('images/logo-uno-white.webp')}
            alt=""
            width="148"
            height="40"
            fetchPriority="high"
            aria-hidden="true"
          />
          <img
            className="brand-logo brand-logo--dark"
            src={asset('images/logo-uno.webp')}
            alt="УНО"
            width="148"
            height="40"
            fetchPriority="high"
          />
        </a>
        <nav className="nav-desktop" aria-label="Основное меню">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <div className="header-phones" aria-label="Телефоны салона">
            {salon.phones.map((phone) => (
              <a
                key={phone.href}
                className="btn btn-ghost phone-link"
                href={phone.href}
                title={phone.display}
              >
                <span className="phone-link-full">{phone.display}</span>
                <span className="phone-link-short">{phone.short ?? phone.display}</span>
              </a>
            ))}
          </div>
          <a className="btn btn-primary header-book" href={BOOK_VK} target="_blank" rel="noreferrer">
            Записаться
          </a>
          <a
            className="header-phone-mobile"
            href={BOOK_PHONE}
            aria-label={`Позвонить: ${salon.phones[0].display}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
                fill="currentColor"
              />
            </svg>
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
          <div className="mobile-menu-phones">
            {salon.phones.map((phone) => (
              <a key={phone.href} className="mobile-menu-phone" href={phone.href}>
                {phone.display}
              </a>
            ))}
          </div>
          <a className="btn btn-primary" href={BOOK_VK} target="_blank" rel="noreferrer">
            Записаться в VK
          </a>
          <a className="btn btn-secondary" href={BOOK_TG} target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a className="btn btn-secondary" href={BOOK_MAX} target="_blank" rel="noreferrer">
            MAX
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoSrc, setVideoSrc] = useState(null)

  useEffect(() => {
    const reduce = prefersReducedMotion()
    const id = requestAnimationFrame(() => setReady(true))

    if (reduce) {
      return () => cancelAnimationFrame(id)
    }

    const clipSrc = asset(heroClip.src)
    const mobile = window.matchMedia('(max-width: 719px)').matches
    const attachVideo = () => setVideoSrc(clipSrc)
    let idleId = 0
    let timeoutId = 0

    // Phones: attach immediately so muted autoplay + playsinline can start.
    // Desktop: idle-defer so the poster stays the LCP image.
    if (mobile) {
      attachVideo()
    } else if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(attachVideo, { timeout: 1800 })
    } else {
      timeoutId = window.setTimeout(attachVideo, 400)
    }

    return () => {
      cancelAnimationFrame(id)
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    const reduce = prefersReducedMotion()
    const el = videoRef.current
    if (!el || !videoSrc || reduce) return undefined

    el.muted = true
    el.defaultMuted = true
    el.playsInline = true
    el.setAttribute('playsinline', '')
    el.setAttribute('webkit-playsinline', '')
    el.setAttribute('muted', '')

    const tryPlay = () => {
      const play = el.play()
      if (play && typeof play.then === 'function') {
        play.then(() => setVideoLoaded(true)).catch(() => {})
      } else if (!el.paused) {
        setVideoLoaded(true)
      }
    }

    const onReady = () => {
      tryPlay()
    }

    if (el.readyState >= 2) onReady()
    else el.addEventListener('loadeddata', onReady)
    el.addEventListener('canplay', tryPlay)
    tryPlay()

    return () => {
      el.removeEventListener('loadeddata', onReady)
      el.removeEventListener('canplay', tryPlay)
    }
  }, [videoSrc])

  return (
    <section className={`hero${ready ? ' is-ready' : ''}`} id="top">
      <div
        className={`hero-media${videoLoaded ? ' is-video-ready' : ''}`}
        aria-hidden="true"
      >
        <img
          className="hero-poster-fallback"
          src={asset(heroClip.poster)}
          alt=""
          width="720"
          height="1280"
          decoding="async"
          fetchPriority="high"
        />
        <video
          ref={videoRef}
          className={`hero-video${videoLoaded ? ' is-loaded' : ''}`}
          src={videoSrc ?? undefined}
          poster={asset(heroClip.poster)}
          width="720"
          height="1280"
          muted
          loop
          playsInline
          autoPlay={Boolean(videoSrc)}
          preload={videoSrc ? 'metadata' : 'none'}
          disablePictureInPicture
        />
        <div className="hero-veil" />
        <div className="hero-depth" />
        <div className="hero-grain" />
      </div>
      <div className="container hero-stage">
        <div className="hero-content">
          <p className="hero-loc hero-enter" data-hero-step="0">
            Салон красоты · Саратов
          </p>
          <h1 className="hero-brand hero-enter" data-hero-step="1">
            <img
              className="hero-logo"
              src={asset('images/logo-uno-white.webp')}
              alt="УНО — Управление новыми образами"
              width="680"
              height="125"
              fetchPriority="high"
            />
          </h1>
          <p className="lead hero-enter" data-hero-step="2">
            От точного штриха до цельного образа — полный цикл beauty-услуг в одном месте.
          </p>
          <div className="hero-cta hero-enter" data-hero-step="3">
            <a className="btn btn-primary btn-lg" href={BOOK_VK} target="_blank" rel="noreferrer">
              <span>Записаться</span>
              <span className="hero-cta-arrow" aria-hidden="true">↗</span>
            </a>
            <a className="text-link text-link-on-dark" href="#services">
              Услуги и цены
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function BookingSteps() {
  const steps = [
    { n: '01', t: 'Напишите в VK', d: 'Укажите услугу и удобное время.' },
    { n: '02', t: 'Подберём мастера', d: 'Администратор подтвердит запись.' },
    { n: '03', t: 'Приходите в салон', d: `${salon.addressShort}, ежедневно до 20:00.` },
  ]
  return (
    <section className="section section-tight" id="booking" data-reveal>
      <div className="container">
        <div className="section-head section-head-compact" data-delay style={{ '--reveal-delay': '0ms' }}>
          <p className="section-kicker">Запись</p>
          <h2>Три шага до визита</h2>
        </div>
        <ol className="steps">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="step"
              data-delay
              style={{ '--reveal-delay': `${80 + i * 90}ms` }}
            >
              <span className="step-n">{s.n}</span>
              <div>
                <h3 className="step-t">{s.t}</h3>
                <p className="step-d">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="booking-note" data-delay style={{ '--reveal-delay': '360ms' }}>
          Готовы записаться?{' '}
          <a href={BOOK_VK} target="_blank" rel="noreferrer">
            Напишите в VK
          </a>
          ,{' '}
          <a href={BOOK_TG} target="_blank" rel="noreferrer">
            Telegram
          </a>{' '}
          или{' '}
          <a href={BOOK_MAX} target="_blank" rel="noreferrer">
            MAX
          </a>{' '}
          — либо{' '}
          <a href={BOOK_PHONE}>позвоните администратору</a>.
        </p>
      </div>
    </section>
  )
}

function QuoteBand() {
  return (
    <section className="quote-band quote-band--pull" data-reveal aria-label="Слоган салона">
      <div className="container">
        <p className="quote-text">{salon.slogan}</p>
        <p className="quote-sub">{salon.tagline}</p>
      </div>
    </section>
  )
}

function Services({ tabId, setTabId }) {
  const tab = serviceTabs.find((t) => t.id === tabId) ?? serviceTabs[0]
  const [openGroups, setOpenGroups] = useState(() => new Set())

  useEffect(() => {
    setOpenGroups(new Set())
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
        <div className="section-head section-head-compact" data-delay style={{ '--reveal-delay': '0ms' }}>
          <p className="section-kicker">Прайс</p>
          <h2>Услуги и цены</h2>
          <p>
            Актуальные позиции по материалам салона. Сложные процедуры — точная стоимость у мастера
            при записи.
          </p>
        </div>

        <div className="services-tabs-sticky" data-delay style={{ '--reveal-delay': '90ms' }}>
          <SlidingTabs
            items={serviceTabs}
            activeId={tabId}
            onChange={setTabId}
            ariaLabel="Категории услуг"
            className="tabs--price"
          />
        </div>

        <div
          className={`price-panel price-panel--${tab.id}`}
          data-delay
          style={{ '--reveal-delay': '160ms' }}
        >
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
                  <div className="price-acc-body">
                    <div className="price-acc-body-inner">
                      <ul className="price-rows">
                        {group.items.map((item) => (
                          <li key={item.name}>
                            <span className="price-name">{item.name}</span>
                            <span className="price-dots" aria-hidden="true" />
                            <span className="price-value">{item.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {tab.asteriskNote ? (
            <p className="services-footnote">{tab.asteriskNote}</p>
          ) : null}
        </div>

        <p className="services-footnote" data-delay style={{ '--reveal-delay': '240ms' }}>
          Точную стоимость уточняйте при записи —{' '}
          <a href={BOOK_PHONE}>позвоните</a> или{' '}
          <a href="#contacts">перейдите в контакты</a>.
        </p>
      </div>
    </section>
  )
}

function About() {
  const figureRef = useRef(null)

  useEffect(() => {
    const figure = figureRef.current
    if (!figure || prefersReducedMotion()) return undefined

    const img = figure.querySelector('img')
    if (!img) return undefined

    let ticking = false
    const update = () => {
      ticking = false
      const rect = figure.getBoundingClientRect()
      const viewH = window.innerHeight
      const progress = (viewH - rect.top) / (viewH + rect.height)
      const clamped = Math.min(1, Math.max(0, progress))
      const offset = (clamped - 0.5) * 6
      img.style.transform = `translate3d(0, ${offset}%, 0) scale(1.08)`
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section className="section section-alt" id="about" data-reveal>
      <div className="container about-layout">
        <figure className="about-photo" ref={figureRef} data-delay style={{ '--reveal-delay': '0ms' }}>
          <img
            src={asset('images/work-11.webp')}
            alt="Французский маникюр с красным акцентом — работа салона УНО"
            width="800"
            height="1000"
            loading="lazy"
          />
        </figure>
        <div className="about-copy" data-delay style={{ '--reveal-delay': '120ms' }}>
          <p className="about-eyebrow">О салоне</p>
          <h2>Полный цикл на Менякина, 4</h2>
          <p className="lead-sm">
            Стрижки и окрашивание, ногти, брови и ресницы, косметология, эпиляция и солярий — одно
            место, без беготни по городу.
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
            <a className="text-link" href="#contacts">
              Контакты и запись
            </a>
            {salon.phones.map((phone) => (
              <a key={phone.href} className="text-link" href={phone.href}>
                {phone.display}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Gallery() {
  const [filter, setFilter] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [Lightbox, setLightbox] = useState(null)
  const items = useMemo(
    () => (filter === 'all' ? galleryItems : galleryItems.filter((g) => g.cat === filter)),
    [filter],
  )
  const slides = useMemo(
    () =>
      items.map((item) => ({
        src: asset(item.src),
        alt: item.alt,
        title: item.alt,
      })),
    [items],
  )

  useEffect(() => {
    setLightboxIndex(-1)
  }, [filter])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('yet-another-react-lightbox'),
      import('yet-another-react-lightbox/styles.css'),
    ]).then(([mod]) => {
      if (!cancelled) setLightbox(() => mod.default)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const openLightbox = (index) => {
    if (!Lightbox) {
      Promise.all([
        import('yet-another-react-lightbox'),
        import('yet-another-react-lightbox/styles.css'),
      ]).then(([mod]) => setLightbox(() => mod.default))
    }
    setLightboxIndex(index)
  }

  return (
    <section className="section" id="gallery" data-reveal>
      <div className="container">
        <div className="section-head" data-delay style={{ '--reveal-delay': '0ms' }}>
          <p className="section-kicker">Портфолио</p>
          <h2>Работы</h2>
          <p>Результаты мастеров — без скринов прайса и случайных кадров «в процессе».</p>
        </div>
        <div data-delay style={{ '--reveal-delay': '80ms' }}>
          <SlidingTabs
            items={galleryFilters}
            activeId={filter}
            onChange={setFilter}
            ariaLabel="Фильтр галереи"
          />
        </div>
        <div className="gallery-grid">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              className="gallery-item"
              data-delay
              style={{ '--reveal-delay': `${120 + (i % 8) * 45}ms` }}
              onClick={() => openLightbox(i)}
              aria-label={`Открыть: ${item.alt}`}
            >
              <span className="gallery-item-media">
                <img src={asset(item.src)} alt={item.alt} loading="lazy" width="600" height="800" />
              </span>
              <span className="gallery-caption">{item.alt}</span>
            </button>
          ))}
        </div>
      </div>
      {Lightbox ? (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex < 0 ? 0 : lightboxIndex}
          slides={slides}
          controller={{ closeOnBackdropClick: true }}
          styles={{ container: { backgroundColor: 'rgba(14, 12, 11, 0.94)' } }}
        />
      ) : null}
    </section>
  )
}

function Contacts() {
  const [mapReady, setMapReady] = useState(() => hasContactsHash())

  const loadMap = () => setMapReady(true)

  return (
    <section className="section section-alt" id="contacts" data-reveal>
      <div className="container contacts-grid">
        <div className="contacts-copy" data-delay style={{ '--reveal-delay': '0ms' }}>
          <p className="section-kicker">Связь</p>
          <h2>Контакты и запись</h2>
          <p className="lead-sm">
            Напишите в VK — основной канал записи. Также Telegram, MAX или звонок на любой из
            телефонов салона.
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
                <MessengerLinks />
              </dd>
            </div>
          </dl>
          <div className="section-cta">
            <a className="btn btn-primary btn-lg" href={BOOK_VK} target="_blank" rel="noreferrer">
              Записаться в VK
            </a>
            <a className="text-link" href={BOOK_PHONE}>
              Позвонить
            </a>
          </div>
        </div>
        <div
          className="map-wrap"
          data-delay
          style={{ '--reveal-delay': '120ms' }}
        >
          {mapReady ? (
            <iframe
              title="Карта: салон УНО на Менякина, 4"
              src={salon.mapEmbed}
              loading="lazy"
              tabIndex={-1}
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className="map-placeholder map-load-trigger"
              onClick={loadMap}
              aria-label="Показать карту проезда"
            >
              <span className="map-load-label">Показать карту</span>
            </button>
          )}
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
        <div className="footer-row footer-row-brand">
          <img
            src={asset('images/logo-uno-white.webp')}
            alt="УНО — салон красоты"
            width="168"
            height="48"
            loading="lazy"
          />
          <div>
            <p className="footer-salon-name">{salon.fullName}</p>
            <p className="footer-address">{salon.address}</p>
          </div>
        </div>

        <div className="footer-row footer-row-messengers" aria-label="Мессенджеры">
          <a href={salon.vk} target="_blank" rel="noreferrer">
            VK
          </a>
          <span className="footer-sep" aria-hidden="true">
            |
          </span>
          <a href={salon.telegram} target="_blank" rel="noreferrer">
            Telegram
          </a>
          <span className="footer-sep" aria-hidden="true">
            |
          </span>
          <a href={salon.max.href} target="_blank" rel="noreferrer">
            MAX
          </a>
        </div>

        <div className="footer-row footer-row-phones" aria-label="Телефоны салона">
          {salon.phones.map((ph) => (
            <a key={ph.href} href={ph.href}>
              <span className="footer-phone-label">{ph.label ?? ph.display}</span>
              <span className="footer-phone-value">{ph.display}</span>
            </a>
          ))}
        </div>

        <div className="footer-row footer-row-meta">
          <div className="footer-legal">
            <a href={legalHref('privacy')}>Политика конфиденциальности</a>
            <a href={legalHref('consent')}>Согласие на обработку ПДн</a>
          </div>
          <p className="footer-note">
            © {year} УНО · Саратов
            <br />
            Ежедневно {salon.hours.replace('Ежедневно ', '')}
          </p>
        </div>
      </div>
    </footer>
  )
}

function StickyCta({ visible }) {
  return (
    <div
      className={`sticky-cta${visible ? ' is-visible' : ''}`}
      role="region"
      aria-label="Быстрая запись"
      aria-hidden={!visible}
    >
      <a className="sticky-cta-secondary" href={BOOK_PHONE}>
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
  const pastHero = usePastHero()
  useInitialScroll()
  useReveal()

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main id="main">
        <Hero />
        <BookingSteps />
        <Services tabId={serviceTabId} setTabId={setServiceTabId} />
        <QuoteBand />
        <About />
        <Gallery />
        <Contacts />
      </main>
      <Footer />
      <CookieConsent />
      <StickyCta visible={pastHero} />
    </>
  )
}

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'uno-cookie-consent'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const DECISIONS = new Set(['accepted', 'declined'])

function privacyHref() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}privacy.html`
}

function readCookie(name) {
  try {
    const parts = document.cookie.split(';')
    for (const part of parts) {
      const [rawKey, ...rest] = part.trim().split('=')
      if (rawKey === name) return decodeURIComponent(rest.join('='))
    }
  } catch {
    /* ignore */
  }
  return null
}

function writeCookie(name, value) {
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
  } catch {
    /* ignore */
  }
}

function readDecision() {
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY)
    if (fromStorage && DECISIONS.has(fromStorage)) return fromStorage
  } catch {
    /* private mode / blocked */
  }
  const fromCookie = readCookie(STORAGE_KEY)
  if (fromCookie && DECISIONS.has(fromCookie)) return fromCookie
  return null
}

function writeDecision(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore quota / private mode */
  }
  // Necessary preference cookie so Decline survives browsers/extensions
  // that wipe localStorage after rejecting non-essential storage.
  writeCookie(STORAGE_KEY, value)
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => !readDecision())

  useEffect(() => {
    const saved = readDecision()
    if (!saved) return
    // Rehydrate localStorage if a privacy tool wiped it after Decline.
    try {
      if (localStorage.getItem(STORAGE_KEY) !== saved) {
        localStorage.setItem(STORAGE_KEY, saved)
      }
    } catch {
      /* ignore */
    }
    setVisible(false)
  }, [])

  const persist = (value) => {
    writeDecision(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-title" aria-live="polite">
      <div className="container cookie-banner-inner">
        <div>
          <p id="cookie-title" className="cookie-banner-title">
            Мы используем cookie
          </p>
          <p className="cookie-banner-desc">
            Сайт применяет файлы cookie и локальное хранилище для корректной работы и запоминания
            вашего выбора. Подробнее — в{' '}
            <a className="cookie-inline-link" href={privacyHref()}>
              Политике конфиденциальности
            </a>
            .
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => persist('declined')}>
            Отклонить
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => persist('accepted')}>
            Принять
          </button>
        </div>
      </div>
    </div>
  )
}

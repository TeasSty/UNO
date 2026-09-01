import { useEffect, useState } from 'react'

const STORAGE_KEY = 'uno-cookie-consent'

function privacyHref() {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}privacy.html`
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const persist = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* ignore quota / private mode */
    }
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

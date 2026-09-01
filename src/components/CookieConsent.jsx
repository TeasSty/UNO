import { useEffect, useState } from 'react'

const STORAGE_KEY = 'uno-cookie-consent'

export default function CookieConsent({ onOpenPrivacy }) {
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
      <div className="cookie-banner-inner">
        <div className="cookie-banner-copy">
          <p id="cookie-title" className="cookie-banner-title">
            Мы используем cookie
          </p>
          <p className="cookie-banner-text">
            Сайт применяет файлы cookie и локальное хранилище для корректной работы и запоминания
            вашего выбора. Подробнее — в{' '}
            <button type="button" className="cookie-banner-link" onClick={onOpenPrivacy}>
              Политике конфиденциальности
            </button>
            .
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button type="button" className="btn btn-secondary cookie-btn" onClick={() => persist('declined')}>
            Отклонить
          </button>
          <button type="button" className="btn btn-primary cookie-btn" onClick={() => persist('accepted')}>
            Принять
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { personalDataConsentSections, privacyPolicySections } from '../data/legal.js'

const TITLES = {
  privacy: 'Политика конфиденциальности',
  consent: 'Согласие на обработку персональных данных',
}

export default function LegalModal({ type, onClose }) {
  const open = Boolean(type)
  const sections = type === 'consent' ? personalDataConsentSections : privacyPolicySections
  const title = TITLES[type] ?? ''

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="legal-modal" role="presentation" onClick={onClose}>
      <div
        className="legal-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="legal-modal-head">
          <h2 id="legal-modal-title">{title}</h2>
          <button type="button" className="legal-modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>
        <div className="legal-modal-body">
          {sections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              {section.body.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

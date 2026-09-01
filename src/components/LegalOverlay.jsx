import { useEffect } from 'react'

export default function LegalOverlay({ open, title, sections, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e) {
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
    <div className="legal-overlay" role="dialog" aria-modal="true" aria-labelledby="legal-overlay-title">
      <button type="button" className="legal-overlay-backdrop" aria-label="Закрыть" onClick={onClose} />
      <div className="legal-overlay-panel">
        <header className="legal-overlay-header">
          <h2 id="legal-overlay-title">{title}</h2>
          <button type="button" className="legal-overlay-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>
        <div className="legal-overlay-body">
          {sections.map((s) => (
            <section key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

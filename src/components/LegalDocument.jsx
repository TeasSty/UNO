import { privacyPolicySections, personalDataConsentSections } from '../data/legal.js'

/** Respect Vite `base` (e.g. `/UNO/` on GitHub Pages). */
function asset(path) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${String(path).replace(/^\//, '')}`
}

function homeHref() {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

export default function LegalDocument({ variant }) {
  const isPrivacy = variant === 'privacy'
  const title = isPrivacy
    ? 'Политика конфиденциальности'
    : 'Согласие на обработку персональных данных'
  const sections = isPrivacy ? privacyPolicySections : personalDataConsentSections

  return (
    <div className="legal-page">
      <header className="legal-page-header">
        <div className="container legal-page-header-inner">
          <a className="legal-page-brand" href={homeHref()} aria-label="УНО — на главную">
            <img src={asset('images/logo-uno.webp')} alt="УНО" width="148" height="40" />
          </a>
          <a className="text-link" href={homeHref()}>
            ← На главную
          </a>
        </div>
      </header>

      <main className="legal-page-main">
        <div className="container legal-page-content">
          <p className="section-kicker">Салон красоты УНО</p>
          <h1>{title}</h1>
          {sections.map((s) => (
            <section key={s.title} className="legal-page-section">
              <h2>{s.title}</h2>
              {s.body.split('\n\n').map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <footer className="legal-page-footer">
        <div className="container legal-page-footer-inner">
          <p>© {new Date().getFullYear()} УНО · Саратов</p>
          <p>
            <a href={isPrivacy ? `${homeHref()}consent.html` : `${homeHref()}privacy.html`}>
              {isPrivacy ? 'Согласие на обработку ПДн' : 'Политика конфиденциальности'}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

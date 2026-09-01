/** True when URL targets an in-page anchor (not bare "#" or hero #top). */
export function hasScrollHash() {
  const hash = window.location.hash
  if (hash.length <= 1) return false
  const id = decodeURIComponent(hash.slice(1))
  return id !== 'top'
}

export function hasContactsHash() {
  const hash = window.location.hash
  if (hash.length <= 1) return false
  return decodeURIComponent(hash.slice(1)) === 'contacts'
}

export function disableScrollRestoration() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
}

export function resetPageScroll() {
  const html = document.documentElement
  const prevBehavior = html.style.scrollBehavior
  html.style.scrollBehavior = 'auto'
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  html.scrollTop = 0
  document.body.scrollTop = 0
  html.style.scrollBehavior = prevBehavior
}

export function resetPageScrollUnlessHash() {
  if (hasScrollHash()) return
  disableScrollRestoration()
  resetPageScroll()
}

function onPageShow() {
  disableScrollRestoration()
  resetPageScrollUnlessHash()
}

function installUnloadScrollSnap() {
  const snap = () => {
    if (hasScrollHash()) return
    resetPageScroll()
  }
  window.addEventListener('beforeunload', snap)
  window.addEventListener('pagehide', snap)
}

let earlyResetDone = false

/** Called once from main.jsx before React mounts. */
export function applyEarlyPageScrollReset() {
  if (earlyResetDone) return
  earlyResetDone = true

  disableScrollRestoration()
  resetPageScrollUnlessHash()

  installUnloadScrollSnap()

  window.addEventListener('pageshow', onPageShow)

  if (!window.__unoScrollLoadHook) {
    window.__unoScrollLoadHook = true
    window.addEventListener(
      'load',
      () => {
        resetPageScrollUnlessHash()
      },
      { once: true },
    )
  }
}

export function scrollToHashIfPresent(preferSmooth = false) {
  const hash = window.location.hash
  if (hash.length <= 1) return
  const id = decodeURIComponent(hash.slice(1))
  if (id === 'top') {
    resetPageScroll()
    return
  }
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ block: 'start', behavior: preferSmooth ? 'smooth' : 'auto' })
}

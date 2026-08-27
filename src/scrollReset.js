/** True when URL targets an in-page anchor (not bare "#" or hero #top). */
export function hasScrollHash() {
  const hash = window.location.hash
  if (hash.length <= 1) return false
  const id = decodeURIComponent(hash.slice(1))
  return id !== 'top'
}

export function resetPageScroll() {
  const html = document.documentElement
  const prevBehavior = html.style.scrollBehavior
  html.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  html.scrollTop = 0
  document.body.scrollTop = 0
  html.style.scrollBehavior = prevBehavior
}

export function disableScrollRestoration() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }
}

/** Scroll to top unless the URL has a hash anchor. Safe to call repeatedly. */
export function resetPageScrollUnlessHash() {
  if (hasScrollHash()) return
  disableScrollRestoration()
  resetPageScroll()
}

/** Sync Lenis virtual scroll with a forced top position. */
export function syncLenisToTop(lenis) {
  if (!lenis || hasScrollHash()) return
  resetPageScrollUnlessHash()
  lenis.scrollTo(0, { immediate: true, force: true })
}

let lateGuardsInstalled = false
let unloadGuardInstalled = false

/**
 * Before unload, snap to top so the browser stores y=0 for the next reload.
 * Classic fix for scroll restoration racing deferred React/Lenis init.
 */
export function installUnloadScrollSnap() {
  if (unloadGuardInstalled) return
  unloadGuardInstalled = true

  window.addEventListener('beforeunload', () => {
    if (hasScrollHash()) return
    resetPageScroll()
  })
}

/**
 * Catch browser / bfcache scroll restore that runs after deferred module scripts.
 * Idempotent — installs listeners and a short rAF guard once per page load.
 */
export function installLateScrollRestoreGuards() {
  if (lateGuardsInstalled) return
  lateGuardsInstalled = true

  const onRestore = (event) => {
    if (event?.persisted) disableScrollRestoration()
    resetPageScrollUnlessHash()
  }

  window.addEventListener('pageshow', onRestore)
  window.addEventListener('load', onRestore)

  let frames = 0
  const guard = () => {
    if (hasScrollHash()) return
    if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
      resetPageScroll()
    }
    if (++frames < 90) requestAnimationFrame(guard)
  }
  requestAnimationFrame(guard)

  let blockedUntil = performance.now() + 2500
  const onScroll = () => {
    if (hasScrollHash() || performance.now() > blockedUntil) {
      window.removeEventListener('scroll', onScroll)
      return
    }
    if (window.scrollY > 0) resetPageScroll()
  }
  window.addEventListener('scroll', onScroll, { passive: true })
}

export function applyEarlyPageScrollReset() {
  disableScrollRestoration()
  resetPageScrollUnlessHash()
  requestAnimationFrame(resetPageScrollUnlessHash)
  requestAnimationFrame(() => requestAnimationFrame(resetPageScrollUnlessHash))
  installUnloadScrollSnap()
  installLateScrollRestoreGuards()
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

  target.scrollIntoView({
    block: 'start',
    behavior: preferSmooth ? 'smooth' : 'auto',
  })
}

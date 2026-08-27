/** True when URL targets an in-page anchor (not bare "#"). */
export function hasScrollHash() {
  return window.location.hash.length > 1
}

export function resetPageScroll() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
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

let lateGuardsInstalled = false

/**
 * Catch browser / bfcache scroll restore that runs after deferred module scripts.
 * Idempotent — installs listeners and a short rAF guard once per page load.
 */
export function installLateScrollRestoreGuards() {
  if (lateGuardsInstalled) return
  lateGuardsInstalled = true

  const onRestore = () => resetPageScrollUnlessHash()

  window.addEventListener('pageshow', onRestore)
  window.addEventListener('load', onRestore)

  let frames = 0
  const guard = () => {
    if (hasScrollHash()) return
    if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
      resetPageScroll()
    }
    if (++frames < 48) requestAnimationFrame(guard)
  }
  requestAnimationFrame(guard)
}

export function applyEarlyPageScrollReset() {
  resetPageScrollUnlessHash()
  requestAnimationFrame(resetPageScrollUnlessHash)
  requestAnimationFrame(() => requestAnimationFrame(resetPageScrollUnlessHash))
  installLateScrollRestoreGuards()
}

export function scrollToHashIfPresent(preferSmooth = false) {
  const hash = window.location.hash
  if (hash.length <= 1) return

  const target = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!target) return

  target.scrollIntoView({
    block: 'start',
    behavior: preferSmooth ? 'smooth' : 'auto',
  })
}

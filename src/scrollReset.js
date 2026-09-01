/** True when URL targets an in-page anchor (not bare "#" or hero #top). */
export function hasScrollHash() {
  const hash = window.location.hash
  if (hash.length <= 1) return false
  const id = decodeURIComponent(hash.slice(1))
  return id !== 'top'
}

const SCROLL_LOCK_CLASS = 'scroll-init-lock'
const SCROLL_SMOOTH_CLASS = 'scroll-smooth-ready'
const MIN_GUARD_MS = 3500

let lateGuardsInstalled = false
let unloadGuardInstalled = false
let scrollInitLockActive = false
let scrollGuardsActive = false
let lenisReady = false
let pageLoadTime = 0
let lastUserScrollInput = 0

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

/** Scroll to top unless the URL has a hash anchor. Safe to call repeatedly. */
export function resetPageScrollUnlessHash() {
  if (hasScrollHash()) return
  disableScrollRestoration()
  resetPageScroll()
}

function noteUserScrollInput() {
  lastUserScrollInput = performance.now()
}

/** Block layout scroll until React/Lenis finish init (prevents visible jump on reload). */
export function lockScrollInit() {
  if (hasScrollHash()) return
  scrollInitLockActive = true
  document.documentElement.classList.add(SCROLL_LOCK_CLASS)
  resetPageScroll()
}

export function releaseScrollInitLock() {
  if (!scrollInitLockActive || hasScrollHash()) return
  scrollInitLockActive = false
  document.documentElement.classList.remove(SCROLL_LOCK_CLASS)
  document.documentElement.classList.add(SCROLL_SMOOTH_CLASS)
}

export function markLenisReady() {
  lenisReady = true
  releaseScrollInitLock()
  maybeStopScrollGuards()
}

function guardsMayStop() {
  if (hasScrollHash()) return true
  const elapsed = performance.now() - pageLoadTime
  if (elapsed < MIN_GUARD_MS) return false

  const desktop = window.matchMedia('(min-width: 960px)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (desktop && !reduce && !lenisReady) return false
  return true
}

function maybeStopScrollGuards() {
  if (!scrollGuardsActive) return
  if (!guardsMayStop()) return
  scrollGuardsActive = false
  releaseScrollInitLock()
}

/** Sync Lenis virtual scroll with a forced top position. */
export function syncLenisToTop(lenis) {
  if (!lenis || hasScrollHash()) return false
  resetPageScrollUnlessHash()
  lenis.scrollTo(0, { immediate: true, force: true })
  return window.scrollY <= 1 && lenis.scroll <= 1
}

export function installUnloadScrollSnap() {
  if (unloadGuardInstalled) return
  unloadGuardInstalled = true

  const snap = () => {
    if (hasScrollHash()) return
    resetPageScroll()
  }

  window.addEventListener('beforeunload', snap)
  window.addEventListener('pagehide', snap)
}

function installScrollGuards() {
  if (lateGuardsInstalled) return
  lateGuardsInstalled = true
  scrollGuardsActive = true
  pageLoadTime = performance.now()

  window.addEventListener('wheel', noteUserScrollInput, { passive: true })
  window.addEventListener('touchstart', noteUserScrollInput, { passive: true })
  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
      noteUserScrollInput()
    }
  })

  const onRestore = (event) => {
    if (event?.persisted) disableScrollRestoration()
    if (hasScrollHash()) {
      scrollGuardsActive = false
      releaseScrollInitLock()
      return
    }
    pageLoadTime = performance.now()
    lockScrollInit()
    resetPageScrollUnlessHash()
  }

  window.addEventListener('pageshow', onRestore)
  window.addEventListener('load', onRestore)

  let frames = 0
  const guard = () => {
    if (!scrollGuardsActive || hasScrollHash()) return
    const userScrolling = performance.now() - lastUserScrollInput < 120
    if (!userScrolling && (window.scrollY !== 0 || document.documentElement.scrollTop !== 0)) {
      resetPageScroll()
    }
    if (++frames < 240) requestAnimationFrame(guard)
    else maybeStopScrollGuards()
  }
  requestAnimationFrame(guard)

  const onScroll = () => {
    if (!scrollGuardsActive || hasScrollHash()) return
    if (performance.now() - lastUserScrollInput < 120) return
    if (window.scrollY > 0) resetPageScroll()
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  window.setInterval(() => {
    if (scrollGuardsActive) maybeStopScrollGuards()
  }, 250)

  window.setTimeout(() => {
    lenisReady = true
    maybeStopScrollGuards()
  }, 8000)
}

export function applyEarlyPageScrollReset() {
  disableScrollRestoration()
  lockScrollInit()
  resetPageScrollUnlessHash()
  requestAnimationFrame(resetPageScrollUnlessHash)
  requestAnimationFrame(() => requestAnimationFrame(resetPageScrollUnlessHash))
  installUnloadScrollSnap()
  installScrollGuards()
}

export function scrollToHashIfPresent(preferSmooth = false) {
  const hash = window.location.hash
  if (hash.length <= 1) return

  scrollGuardsActive = false
  releaseScrollInitLock()
  document.documentElement.classList.add(SCROLL_SMOOTH_CLASS)

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

export function finishScrollInitWithoutLenis() {
  lenisReady = true
  releaseScrollInitLock()
  maybeStopScrollGuards()
}

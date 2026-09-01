/** True when URL targets an in-page anchor (not bare "#" or hero #top). */
export function hasScrollHash() {
  const hash = window.location.hash
  if (hash.length <= 1) return false
  const id = decodeURIComponent(hash.slice(1))
  return id !== 'top'
}

const SCROLL_LOCK_CLASS = 'scroll-init-lock'
const SCROLL_SMOOTH_CLASS = 'scroll-smooth-ready'
/** Hard guard: reset drift right after reload (does not block user scroll). */
const HARD_GUARD_MS = 800
/** Soft guard: catch late browser/Lenis restoration jumps. */
const SOFT_GUARD_MS = 4000
const SOFT_GUARD_THRESHOLD = 200
/** Max overflow lock — user-facing freeze cap. */
const OVERFLOW_LOCK_MAX_MS = 400
/** Stable-top rAF frames before unlock (~3 frames ≈ 50ms). */
const STABLE_TOP_FRAMES = 3
const USER_INPUT_GRACE_MS = 350

let lateGuardsInstalled = false
let unloadGuardInstalled = false
let scrollInitLockActive = false
let overflowLockReleased = false
let scrollGuardsActive = false
let lenisReady = false
let pageLoadTime = 0
let lastUserScrollInput = 0
let stableTopFrames = 0
let lenisScrollGuard = null
let guardRafId = 0
let lastSoftGuardY = 0
/** Set after wheel/touch/keyboard scroll — stops guards from fighting user scroll. */
let userHasScrolledDown = false

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

export function registerLenisScrollGuards(lenis) {
  lenisScrollGuard = lenis
}

function userScrollIntentActive() {
  return performance.now() - lastUserScrollInput < USER_INPUT_GRACE_MS
}

function noteUserScrollInput() {
  lastUserScrollInput = performance.now()
}

function releaseOverflowLock() {
  if (overflowLockReleased || hasScrollHash()) return
  overflowLockReleased = true
  scrollInitLockActive = false
  document.documentElement.classList.remove(SCROLL_LOCK_CLASS)
  document.documentElement.classList.add(SCROLL_SMOOTH_CLASS)
}

export function lockScrollInit() {
  if (hasScrollHash()) return
  scrollInitLockActive = true
  overflowLockReleased = false
  stableTopFrames = 0
  document.documentElement.classList.add(SCROLL_LOCK_CLASS)
  resetPageScroll()
}

export function releaseScrollInitLock() {
  releaseOverflowLock()
}

function tryEarlyOverflowRelease() {
  if (overflowLockReleased || hasScrollHash()) return
  if (window.scrollY <= 1 && document.documentElement.scrollTop <= 1) {
    stableTopFrames += 1
    if (stableTopFrames >= STABLE_TOP_FRAMES) releaseOverflowLock()
  } else {
    stableTopFrames = 0
  }
}

function onUserScrollIntent() {
  noteUserScrollInput()
  userHasScrolledDown = true
  releaseOverflowLock()
}

function forceTopUnlessUserScrolling() {
  if (userScrollIntentActive()) return
  if (userHasScrolledDown) {
    lastSoftGuardY = window.scrollY
    return
  }

  const y = window.scrollY
  const docTop = document.documentElement.scrollTop
  const lenisDrift = lenisScrollGuard && lenisScrollGuard.scroll > 1
  const elapsed = performance.now() - pageLoadTime
  const lateJump = y > SOFT_GUARD_THRESHOLD && lastSoftGuardY <= 80

  // Browser restoration: sudden jump without user input (mid-init reload, bfcache drift).
  if (
    lateJump
    || (scrollGuardsActive && elapsed < HARD_GUARD_MS && y > SOFT_GUARD_THRESHOLD)
  ) {
    resetPageScrollUnlessHash()
    lenisScrollGuard?.scrollTo(0, { immediate: true, force: true })
    lastSoftGuardY = lateJump ? 0 : y
    return
  }

  // Hard guard: suppress small pre-interaction drift only (F5 / reload snap-back).
  if (scrollGuardsActive && elapsed < HARD_GUARD_MS && (y > 0 || docTop > 0 || lenisDrift)) {
    resetPageScrollUnlessHash()
    lenisScrollGuard?.scrollTo(0, { immediate: true, force: true })
  }

  lastSoftGuardY = y
}

export function markLenisReady() {
  lenisReady = true
  releaseScrollInitLock()
  maybeStopScrollGuards()
}

function guardsMayStop() {
  if (hasScrollHash()) return true
  if (performance.now() - pageLoadTime < HARD_GUARD_MS) return false
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

export function syncLenisToTop(lenis) {
  if (!lenis || hasScrollHash()) return false
  if (userScrollIntentActive() && window.scrollY > 1) return false
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

function startGuardLoop() {
  if (guardRafId) cancelAnimationFrame(guardRafId)
  const guard = () => {
    guardRafId = 0
    if (hasScrollHash()) return
    const elapsed = performance.now() - pageLoadTime
    if (!scrollGuardsActive && elapsed >= SOFT_GUARD_MS) return
    tryEarlyOverflowRelease()
    forceTopUnlessUserScrolling()
    guardRafId = requestAnimationFrame(guard)
  }
  guardRafId = requestAnimationFrame(guard)
}

function beginRestoreGuards() {
  scrollGuardsActive = true
  lenisReady = false
  userHasScrolledDown = false
  pageLoadTime = performance.now()
  lastSoftGuardY = 0
  startGuardLoop()
}

function onBfcacheRestore(event) {
  if (!event?.persisted) return
  disableScrollRestoration()
  if (hasScrollHash()) {
    scrollGuardsActive = false
    releaseScrollInitLock()
    return
  }
  lockScrollInit()
  resetPageScrollUnlessHash()
  beginRestoreGuards()
}

function installScrollGuards() {
  if (lateGuardsInstalled) return
  lateGuardsInstalled = true

  window.addEventListener('pageshow', onBfcacheRestore)
  window.addEventListener('wheel', onUserScrollIntent, { passive: true })
  window.addEventListener('touchstart', onUserScrollIntent, { passive: true })
  window.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
      onUserScrollIntent()
    }
  })

  window.addEventListener('scroll', () => {
    if (!hasScrollHash()) forceTopUnlessUserScrolling()
  }, { passive: true })

  window.setInterval(() => {
    if (hasScrollHash()) return
    forceTopUnlessUserScrolling()
    maybeStopScrollGuards()
  }, 50)

  window.setTimeout(releaseOverflowLock, OVERFLOW_LOCK_MAX_MS)
  window.setTimeout(() => {
    lenisReady = true
    maybeStopScrollGuards()
  }, 2000)
}

export function applyEarlyPageScrollReset() {
  disableScrollRestoration()
  lockScrollInit()
  resetPageScrollUnlessHash()
  requestAnimationFrame(resetPageScrollUnlessHash)
  requestAnimationFrame(() => {
    resetPageScrollUnlessHash()
    tryEarlyOverflowRelease()
  })
  installUnloadScrollSnap()
  installScrollGuards()
  beginRestoreGuards()

  if (!window.__unoScrollLoadHook) {
    window.__unoScrollLoadHook = true
    window.addEventListener(
      'load',
      () => {
        resetPageScrollUnlessHash()
        requestAnimationFrame(resetPageScrollUnlessHash)
        window.setTimeout(resetPageScrollUnlessHash, 0)
        window.setTimeout(resetPageScrollUnlessHash, 120)
      },
      { once: true },
    )
  }
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
  target.scrollIntoView({ block: 'start', behavior: preferSmooth ? 'smooth' : 'auto' })
}

export function finishScrollInitWithoutLenis() {
  lenisReady = true
  releaseScrollInitLock()
  maybeStopScrollGuards()
}

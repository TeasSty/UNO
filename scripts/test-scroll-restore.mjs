/**
 * Scroll restoration test: scroll down, reload, assert scrollY stays 0
 * Run: node scripts/test-scroll-restore.mjs [url]
 */
import puppeteer from 'puppeteer'

const url = process.argv[2] ?? 'http://localhost:4173/'

async function waitForReady(page) {
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 15000 })
  await page.waitForFunction(
    () => document.body.scrollHeight > window.innerHeight * 2,
    { timeout: 15000 },
  )
  // Lenis loads async on desktop
  await new Promise((r) => setTimeout(r, 1500))
}

async function scrollDown(page) {
  const target = await page.evaluate(() => {
    const y = Math.min(2800, Math.floor(document.body.scrollHeight * 0.55))
    window.scrollTo(0, y)
    return y
  })
  await new Promise((r) => setTimeout(r, 400))
  const actual = await page.evaluate(() => window.scrollY)
  if (actual < 400) throw new Error(`Failed to scroll: wanted ~${target}, got ${actual}`)
  return actual
}

async function sampleScroll(page, label, ms = 6000) {
  const samples = []
  const start = Date.now()
  while (Date.now() - start < ms) {
    const y = await page.evaluate(() => ({
      scrollY: window.scrollY,
      docTop: document.documentElement.scrollTop,
      lenis: document.documentElement.classList.contains('lenis-active'),
      hash: location.hash,
    }))
    samples.push({ t: Date.now() - start, ...y })
    await new Promise((r) => setTimeout(r, 150))
  }
  const maxY = Math.max(...samples.map((s) => s.scrollY))
  const jump = samples.find((s) => s.scrollY > 400)
  console.log(
    `[${label}] max=${maxY} final=${samples.at(-1).scrollY} lenis=${samples.at(-1).lenis} hash=${samples.at(-1).hash}${jump ? ` JUMP@${jump.t}ms y=${jump.scrollY}` : ''}`,
  )
  return { maxY, finalY: samples.at(-1).scrollY, samples }
}

async function testReload(page, mode) {
  await waitForReady(page)
  const before = await scrollDown(page)
  console.log(`  scrolled to ${before}, reloading (${mode})...`)

  if (mode === 'F5') {
    await page.keyboard.down('Control')
    await page.keyboard.press('F5')
    await page.keyboard.up('Control')
  } else if (mode === 'hard') {
    await page.setCacheEnabled(false)
    await page.reload({ waitUntil: 'networkidle0' })
    await page.setCacheEnabled(true)
  } else {
    await page.reload({ waitUntil: 'networkidle0' })
  }

  return sampleScroll(page, mode)
}

async function testBfcache(browser, baseUrl) {
  const page = await browser.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle0' })
  await waitForReady(page)
  await scrollDown(page)
  await page.goto('about:blank')
  await new Promise((r) => setTimeout(r, 300))
  await page.goBack({ waitUntil: 'networkidle0' })
  const result = await sampleScroll(page, 'bfcache')
  await page.close()
  return result
}

async function testMobile(browser, baseUrl) {
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844 })
  await page.goto(baseUrl, { waitUntil: 'networkidle0' })
  const result = await testReload(page, 'mobile-reload')
  await page.close()
  return result
}

console.log(`Testing scroll restoration at ${url}\n`)

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: { width: 1280, height: 800 },
})

const page = await browser.newPage()
await page.goto(url, { waitUntil: 'networkidle0' })

const results = {}
results.f5 = await testReload(page, 'F5')
results.reload = await testReload(page, 'reload')
results.hard = await testReload(page, 'hard')
await page.close()

results.bfcache = await testBfcache(browser, url)
results.mobile = await testMobile(browser, url)

await browser.close()

console.log('\n--- SUMMARY ---')
let pass = true
for (const [name, r] of Object.entries(results)) {
  const ok = r.maxY <= 80
  if (!ok) pass = false
  console.log(`${name}: maxY=${r.maxY} ${ok ? 'PASS' : 'FAIL'}`)
}

process.exit(pass ? 0 : 1)

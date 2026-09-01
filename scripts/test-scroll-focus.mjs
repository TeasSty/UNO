/**
 * Focused scroll restoration test using location.reload() (same as F5)
 */
import puppeteer from 'puppeteer'

const url = process.argv[2] ?? 'http://localhost:4175/'

async function scrollDown(page) {
  await page.mouse.move(640, 400)
  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel({ deltaY: 600 })
    await new Promise((r) => setTimeout(r, 40))
  }
  const y = await page.evaluate(() => window.scrollY)
  if (y < 400) throw new Error(`Failed to scroll down: scrollY=${y}`)
  return y
}

async function runOnce(page, label) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => document.body.scrollHeight > 2000)
  await page.waitForFunction(
    () => !document.documentElement.classList.contains('scroll-init-lock'),
    { timeout: 15000 },
  )
  await new Promise((r) => setTimeout(r, 300))

  const before = await scrollDown(page)
  console.log(`${label}: scrolled to ${before}`)

  await page.evaluate(() => {
    sessionStorage.setItem('__scroll_test', String(window.scrollY))
    location.reload()
  })
  await page.waitForNavigation({ waitUntil: 'networkidle0' })

  const timeline = []
  for (let i = 0; i < 80; i++) {
    const s = await page.evaluate(() => ({
      y: window.scrollY,
      lenis: document.documentElement.classList.contains('lenis-active'),
      hash: location.hash,
    }))
    timeline.push({ ms: i * 125, ...s })
    await new Promise((r) => setTimeout(r, 125))
  }

  const maxY = Math.max(...timeline.map((t) => t.y))
  const firstBad = timeline.find((t) => t.y > 200)
  const lenisAt = timeline.find((t) => t.lenis)
  console.log(
    `${label}: maxY=${maxY} final=${timeline.at(-1).y} lenis@${lenisAt?.ms ?? '?'}ms firstBad@${firstBad?.ms ?? 'none'} y=${firstBad?.y ?? 0}`,
  )
  if (maxY > 200) {
    console.log('  bad samples:', timeline.filter((t) => t.y > 200).slice(0, 8))
  }
  return maxY
}

const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } })
const page = await browser.newPage()

const runs = []
for (let i = 1; i <= 3; i++) {
  runs.push(await runOnce(page, `run${i}`))
}

// mobile
await page.setViewport({ width: 390, height: 844 })
runs.push(await runOnce(page, 'mobile'))

await browser.close()
const pass = runs.every((y) => y <= 80)
console.log('\nRESULT:', pass ? 'PASS' : 'FAIL', runs)
process.exit(pass ? 0 : 1)

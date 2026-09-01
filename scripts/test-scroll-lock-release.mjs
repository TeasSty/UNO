/**
 * Verify scroll-init-lock is released and scroll works after init
 */
import puppeteer from 'puppeteer'

const url = process.argv[2] ?? 'http://localhost:4177/'

const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } })
const page = await browser.newPage()

await page.goto(url, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))

const afterInit = await page.evaluate(() => ({
  lock: document.documentElement.classList.contains('scroll-init-lock'),
  smooth: document.documentElement.classList.contains('scroll-smooth-ready'),
  lenis: document.documentElement.classList.contains('lenis-active'),
  y: window.scrollY,
}))

await page.evaluate(() => window.scrollTo(0, 2000))
await new Promise((r) => setTimeout(r, 300))
const afterUserScroll = await page.evaluate(() => window.scrollY)

console.log('After init:', afterInit)
console.log('User scroll allowed:', afterUserScroll > 500 ? 'YES' : 'NO', `(y=${afterUserScroll})`)

const ok = !afterInit.lock && afterUserScroll > 500
console.log(ok ? 'PASS' : 'FAIL')
await browser.close()
process.exit(ok ? 0 : 1)

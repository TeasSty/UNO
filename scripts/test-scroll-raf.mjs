/**
 * High-frequency scroll monitor — catches sub-frame scroll jumps
 */
import puppeteer from 'puppeteer'

const url = process.argv[2] ?? 'http://localhost:4175/'

const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } })
const page = await browser.newPage()

await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForFunction(() => document.body.scrollHeight > 2000)
await new Promise((r) => setTimeout(r, 2000))
await page.evaluate(() => window.scrollTo(0, 2800))

await page.evaluate(() => {
  window.__scrollLog = []
  const log = () => {
    const y = window.scrollY
    if (window.__scrollLog.length === 0 || window.__scrollLog.at(-1).y !== y) {
      window.__scrollLog.push({ t: performance.now(), y })
    }
    if (window.__scrollLog.length < 500) requestAnimationFrame(log)
  }
  requestAnimationFrame(log)
  location.reload()
})

await page.waitForNavigation({ waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 5000))

const log = await page.evaluate(() => window.__scrollLog ?? [])
const bad = log.filter((e) => e.y > 100)
console.log(`Total scroll changes: ${log.length}`)
console.log(`Max Y: ${Math.max(0, ...log.map((e) => e.y))}`)
if (bad.length) {
  console.log('Bad entries (>100):', bad.slice(0, 20))
} else {
  console.log('No scroll jump detected (all y <= 100)')
}

await browser.close()

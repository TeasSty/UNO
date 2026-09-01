/** Scroll restore during init (500ms) must be corrected */
import puppeteer from 'puppeteer'

const url = process.argv[2] ?? 'http://localhost:4178/'

const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } })
const page = await browser.newPage()

await page.goto(url, { waitUntil: 'networkidle0' })
await page.evaluate(() => window.scrollTo(0, 4000))
await page.evaluate(() => location.reload())
await page.evaluateOnNewDocument(() => {
  setTimeout(() => {
    window.scrollTo(0, 3500)
    document.documentElement.scrollTop = 3500
  }, 500)
})
await page.goto(url, { waitUntil: 'networkidle0' })

const timeline = []
for (let i = 0; i < 50; i++) {
  timeline.push(await page.evaluate(() => ({
    y: window.scrollY,
    lock: document.documentElement.classList.contains('scroll-init-lock'),
  })))
  await new Promise((r) => setTimeout(r, 100))
}

const maxY = Math.max(...timeline.map((t) => t.y))
console.log(`Mid-init restore: maxY=${maxY} final=${timeline.at(-1).y}`)
console.log(maxY <= 80 ? 'PASS' : 'FAIL')
await browser.close()
process.exit(maxY <= 80 ? 0 : 1)

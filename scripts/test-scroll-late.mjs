/**
 * Simulate late scroll restoration AFTER guards expire (3s delay)
 */
import puppeteer from 'puppeteer'

const url = process.argv[2] ?? 'http://localhost:4175/'

const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } })
const page = await browser.newPage()

await page.goto(url, { waitUntil: 'networkidle0' })
await page.evaluate(() => window.scrollTo(0, 2800))
await page.evaluate(() => location.reload())
await page.waitForNavigation({ waitUntil: 'networkidle0' })

// Simulate browser/Lenis restoring scroll after guards expire
await page.evaluate(() => {
  setTimeout(() => {
    console.log('LATE RESTORE ATTEMPT')
    window.scrollTo(0, 2800)
    document.documentElement.scrollTop = 2800
  }, 3000)
})

const timeline = []
for (let i = 0; i < 80; i++) {
  timeline.push(await page.evaluate(() => window.scrollY))
  await new Promise((r) => setTimeout(r, 100))
}

const maxY = Math.max(...timeline)
const at3s = timeline[30] // ~3000ms
const final = timeline.at(-1)
console.log(`Late restore test: at3s=${at3s} maxY=${maxY} final=${final}`)
console.log(maxY > 200 ? 'FAIL - late scroll stuck' : 'PASS')

await browser.close()
process.exit(maxY > 200 ? 1 : 0)

/**
 * Slow network: Lenis chunk loads after scroll guards expire
 */
import puppeteer from 'puppeteer'

const url = process.argv[2] ?? 'http://localhost:4175/'

const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } })
const page = await browser.newPage()
const client = await page.createCDPSession()
await client.send('Network.enable')
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: (400 * 1024) / 8,
  uploadThroughput: (400 * 1024) / 8,
  latency: 400,
})

await page.goto(url, { waitUntil: 'networkidle0' })
await page.waitForFunction(() => document.body.scrollHeight > 2000, { timeout: 60000 })
await new Promise((r) => setTimeout(r, 1000))
await page.evaluate(() => window.scrollTo(0, 2800))
await page.evaluate(() => location.reload())
await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 })

const timeline = []
for (let i = 0; i < 100; i++) {
  timeline.push(
    await page.evaluate(() => ({
      y: window.scrollY,
      lenis: document.documentElement.classList.contains('lenis-active'),
    })),
  )
  await new Promise((r) => setTimeout(r, 150))
}

const maxY = Math.max(...timeline.map((t) => t.y))
const lenisOn = timeline.find((t) => t.lenis)
console.log(`Slow 3G: maxY=${maxY} final=${timeline.at(-1).y} lenis@${lenisOn ? timeline.indexOf(lenisOn) * 150 : '?'}ms`)
console.log(maxY <= 80 ? 'PASS' : 'FAIL')

await browser.close()
process.exit(maxY <= 80 ? 0 : 1)

/**
 * Test with browser scroll restoration ENABLED (auto) to reproduce user bug
 */
import puppeteer from 'puppeteer'

const url = process.argv[2] ?? 'http://localhost:4175/'

async function testWithRestoration(page, scrollRestoration) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => document.body.scrollHeight > 2000)
  await new Promise((r) => setTimeout(r, 2000))

  await page.evaluate((mode) => {
    if ('scrollRestoration' in history) history.scrollRestoration = mode
  }, scrollRestoration)

  const before = await page.evaluate(() => {
    window.scrollTo(0, 2800)
    return window.scrollY
  })

  await page.evaluate(() => location.reload())
  await page.waitForNavigation({ waitUntil: 'networkidle0' })

  const timeline = []
  for (let i = 0; i < 60; i++) {
    timeline.push(
      await page.evaluate(() => ({
        y: window.scrollY,
        restoration: history.scrollRestoration,
        lenis: document.documentElement.classList.contains('lenis-active'),
      })),
    )
    await new Promise((r) => setTimeout(r, 100))
  }

  const maxY = Math.max(...timeline.map((t) => t.y))
  console.log(
    `scrollRestoration=${scrollRestoration} before=${before} maxY=${maxY} final=${timeline.at(-1).y} htmlRestoration=${timeline.at(-1).restoration}`,
  )
  return maxY
}

const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } })
const page = await browser.newPage()

console.log('With our guards (manual set by inline script):')
await testWithRestoration(page, 'manual')

console.log('\nIf scrollRestoration were auto (browser restores):')
await testWithRestoration(page, 'auto')

await browser.close()

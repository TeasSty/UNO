import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:4175/'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

async function scrollY() {
  return page.evaluate(() => window.scrollY)
}

let passed = 0
let failed = 0

function report(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${detail}`)
  if (ok) passed += 1
  else failed += 1
}

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
report('F5 load at top', (await scrollY()) === 0, `scrollY=${await scrollY()}`)

for (let i = 0; i < 3; i++) {
  await page.mouse.wheel(0, 400)
  await page.waitForTimeout(200)
}
const afterWheel = await scrollY()
report('Wheel scroll down', afterWheel > 500, `scrollY=${afterWheel}`)

await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
report('Reload at top', (await scrollY()) === 0, `scrollY=${await scrollY()}`)

for (let i = 0; i < 3; i++) {
  await page.mouse.wheel(0, 400)
  await page.waitForTimeout(200)
}
const yBefore = await scrollY()
await page.waitForTimeout(2000)
const yAfter = await scrollY()
report('Scroll stays (no snap-back)', yAfter > 500 && Math.abs(yAfter - yBefore) < 50, `y=${yBefore} -> ${yAfter}`)

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true })
await mobile.goto(url, { waitUntil: 'networkidle' })
await mobile.waitForTimeout(500)
await mobile.mouse.wheel(0, 600)
await mobile.waitForTimeout(300)
const mobileY = await mobile.evaluate(() => window.scrollY)
report('Mobile touch scroll', mobileY > 200, `scrollY=${mobileY}`)

await browser.close()
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)

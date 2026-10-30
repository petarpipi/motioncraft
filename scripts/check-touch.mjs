// Native touch checks (CDP touch events + Playwright tap) in 390x844 emulation. Needs :5184.
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
const browser = await chromium.launch({
  channel:
    process.env.MOTIONCRAFT_BROWSER_CHANNEL ??
    (process.platform === 'win32' ? 'msedge' : undefined),
  headless: true,
})
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
})
const results = []
const session = await page.context().newCDPSession(page)

// Hero sculpture: a tap plucks the slats; a horizontal drag steers them.
await page.goto('http://127.0.0.1:5184/', { waitUntil: 'networkidle' })
const sculpture = page.locator('canvas[data-renderer=sculpture]')
await sculpture.waitFor({ timeout: 30000 })
await page.waitForTimeout(2500)
await page.touchscreen.tap(195, 420)
await page.waitForTimeout(400)
const impulse = Number(await sculpture.getAttribute('data-impulse'))
await session.send('Input.dispatchTouchEvent', {
  type: 'touchStart',
  touchPoints: [{ x: 80, y: 420 }],
})
for (let i = 1; i <= 8; i++) {
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: 80 + i * 28, y: 421 }],
  })
  await page.waitForTimeout(30)
}
await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(400)
const pointer = await sculpture.getAttribute('data-pointer')
results.push({
  interaction: 'hero sculpture tap + horizontal drag',
  passed: impulse > 0.05 && parseFloat(pointer) > 0,
  impulse,
  pointer,
})

await page.goto('http://127.0.0.1:5184/experiences#magnetic', { waitUntil: 'networkidle' })
const core = page.getByRole('button', { name: /impulse the magnetic core/ })
await core.scrollIntoViewIfNeeded()
const bounds = await core.boundingBox(),
  x = bounds.x + bounds.width / 2,
  y = bounds.y + bounds.height / 2
const initialScroll = await page.evaluate(() => scrollY)
await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
for (let i = 1; i <= 5; i++) {
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: x + i * 12, y: y + i * 4 }],
  })
  await page.waitForTimeout(40)
}
await page.waitForTimeout(150)
const position = await page.locator('.elastic-stage').getAttribute('data-position'),
  scroll = await page.evaluate(() => scrollY)
results.push({
  interaction: 'magnetic core touch drag',
  passed: parseFloat(position) > 5 && Math.abs(scroll - initialScroll) < 2,
  position,
  pageScrollUnchanged: Math.abs(scroll - initialScroll) < 2,
})
await page.screenshot({ path: 'docs/screenshots/mobile-touch-drag.png' })
await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.getByRole('button', { name: 'Reset physics' }).tap()
results.push({
  interaction: 'touch physics reset',
  passed: (await page.locator('.elastic-stage').getAttribute('data-position')) === '0.00,0.00',
})
await page.locator('#fluid').scrollIntoViewIfNeeded()
await page.locator('.fluid-canvas canvas').waitFor({ timeout: 30000 })
await page.getByRole('button', { name: 'Wake the surface' }).tap()
results.push({
  interaction: 'touch shader pulse',
  passed:
    (await page.locator('[role=status]').filter({ hasText: 'Surface pulse 1' }).count()) === 1,
})
await page.getByRole('button', { name: 'Width', exact: true }).tap()
const slider = page.getByRole('slider', { name: 'Typography field position' })
await slider.scrollIntoViewIfNeeded()
const range = await slider.boundingBox()
await page.touchscreen.tap(range.x + range.width * 0.2, range.y + range.height / 2)
await page.waitForTimeout(700)
results.push({
  interaction: 'touch variable type field',
  passed: (await slider.inputValue()) !== '50',
})
await page.getByRole('button', { name: 'Next depth image' }).tap()
results.push({
  interaction: 'touch depth selection',
  passed: (await page.locator('.depth-gallery-controls [role=status]').textContent()).includes(
    'Interference field',
  ),
})
writeFileSync(
  'docs/qa/touch.json',
  JSON.stringify(
    {
      device: '390x844 touch emulation, Edge, native CDP touch events and Playwright tap',
      results,
    },
    null,
    2,
  ),
)
await browser.close()
console.log(JSON.stringify(results, null, 2))
if (results.some((r) => !r.passed)) process.exitCode = 1

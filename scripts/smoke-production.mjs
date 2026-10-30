import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
const browser = await chromium.launch({
  channel:
    process.env.MOTIONCRAFT_BROWSER_CHANNEL ??
    (process.platform === 'win32' ? 'msedge' : undefined),
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
const routes = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('response', (response) => {
  if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
})
for (const route of ['/', '/experiences#fluid', '/studio#contact', '/missing']) {
  const response = await page.goto(`http://127.0.0.1:4184${route}`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1 }).waitFor()
  if (route === '/')
    await page.waitForFunction(
      () => Number(document.querySelector('canvas[data-renderer=sculpture]')?.dataset.frames) > 0,
      {},
      { timeout: 30000 },
    )
  if (route.includes('#fluid'))
    await page.waitForFunction(
      () => Number(document.querySelector('.fluid-canvas canvas')?.dataset.frames) > 0,
      {},
      { timeout: 30000 },
    )
  routes.push({
    route,
    httpStatus: response.status(),
    heading: await page.getByRole('heading', { level: 1 }).innerText(),
  })
}
await browser.close()
writeFileSync(
  'docs/qa/production-smoke.json',
  JSON.stringify(
    {
      routes,
      version: 3,
      errors,
      passed: errors.length === 0 && routes.every((route) => route.httpStatus === 200),
    },
    null,
    2,
  ),
)
if (errors.length) throw new Error(errors.join('\n'))
console.log('Production routes and deep links: 4 passed; no console, runtime or HTTP errors.')

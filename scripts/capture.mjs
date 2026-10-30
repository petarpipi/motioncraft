// Live screenshots of animated states at six widths plus frame sequences of the
// signature motion. Needs `pnpm dev` on :5184. Writes docs/screenshots/*.png.
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
const base = 'http://127.0.0.1:5184'
const browser = await chromium.launch({
  channel:
    process.env.MOTIONCRAFT_BROWSER_CHANNEL ??
    (process.platform === 'win32' ? 'msedge' : undefined),
  headless: true,
})
const manifest = []
const scrollTo = (page, selector, vh = 0) =>
  page.evaluate(
    ({ selector, vh }) =>
      window.scrollTo({
        top:
          document.querySelector(selector).getBoundingClientRect().top + scrollY + innerHeight * vh,
        behavior: 'instant',
      }),
    { selector, vh },
  )
const widths = [
  ['desktop-1920', 1920, 1080],
  ['desktop-1440', 1440, 900],
  ['laptop-1024', 1024, 768],
  ['tablet-768', 768, 1024],
  ['mobile-390', 390, 844],
  ['mobile-375', 375, 812],
]
for (const [device, width, height] of widths) {
  const mobile = width < 768
  const page = await browser.newPage({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
  })
  const shot = async (name) => {
    const path = `docs/screenshots/${device}-${name}.png`
    await page.screenshot({ path })
    manifest.push({ device, name, path, width, height })
  }
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.locator('canvas[data-renderer=sculpture]').waitFor({ timeout: 30000 })
  await page.waitForTimeout(3200)
  await shot('hero')
  for (const [name, vh] of [
    ['cinema-form', 0.4],
    ['cinema-transformation', mobile ? 1.35 : 1.7],
    ['cinema-reveal', mobile ? 2.75 : 3.35],
  ]) {
    await scrollTo(page, '#scroll-story', vh)
    await page.waitForTimeout(1700)
    await shot(name)
  }
  await scrollTo(page, '.showcase-pin', mobile ? 0 : 0.05)
  await page.waitForTimeout(1300)
  await shot('showcase')
  await scrollTo(page, '.studies-index', -0.05)
  await page.waitForTimeout(800)
  await shot('studies')
  await page.goto(`${base}/experiences`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1600)
  await shot('experiences')
  for (const id of ['magnetic', 'fluid', 'type', 'depth']) {
    await scrollTo(page, `#${id}`, 0)
    await page.waitForTimeout(1400)
    await shot(`study-${id}`)
  }
  await page.goto(`${base}/studio`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await shot('studio')
  await page.close()
}

// Frame sequences: hero opening, route curtain and the cinema transitions.
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${base}/`)
for (let i = 0; i < 8; i++) {
  const path = `docs/screenshots/sequence-hero-opening-${i}.png`
  await page.screenshot({ path })
  manifest.push({ device: 'sequence', name: `hero-opening-${i}`, path, width: 1440, height: 900 })
  await page.waitForTimeout(260)
}
await page.waitForTimeout(1500)
for (let i = 0; i <= 10; i++) {
  await scrollTo(page, '#scroll-story', i * 0.42)
  await page.waitForTimeout(1300)
  const path = `docs/screenshots/sequence-cinema-${String(i).padStart(2, '0')}.png`
  await page.screenshot({ path })
  manifest.push({ device: 'sequence', name: `cinema-${i}`, path, width: 1440, height: 900 })
}
await page.goto(`${base}/`)
await page.waitForTimeout(1500)
await page
  .getByRole('navigation', { name: 'Main navigation' })
  .getByRole('link', { name: /Experiences/ })
  .click()
for (let i = 0; i < 5; i++) {
  const path = `docs/screenshots/sequence-route-curtain-${i}.png`
  await page.screenshot({ path })
  manifest.push({ device: 'sequence', name: `route-curtain-${i}`, path, width: 1440, height: 900 })
  await page.waitForTimeout(140)
}
await browser.close()
writeFileSync('docs/qa/screenshot-manifest.json', JSON.stringify(manifest, null, 2))
console.log(`${manifest.length} screenshots written to docs/screenshots`)

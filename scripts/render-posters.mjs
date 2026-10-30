// Renders the still artwork from the real-time scenes. Needs `pnpm dev` on :5184.
// Sculpture poses come from the engine's snapshot(); the liquid frame and the
// Open Graph image are captured from the live page.
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'

const base = 'http://127.0.0.1:5184'
const browser = await chromium.launch({
  channel:
    process.env.MOTIONCRAFT_BROWSER_CHANNEL ??
    (process.platform === 'win32' ? 'msedge' : undefined),
  headless: true,
})
const save = (path, dataUrl) => {
  const bytes = Buffer.from(dataUrl.split(',')[1], 'base64')
  writeFileSync(path, bytes)
  console.log(`${path}: ${bytes.length} bytes`)
}

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${base}/`, { waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__sculpture, null, { timeout: 30000 })
await page.waitForTimeout(3200)
const poses = [
  [
    'public/art/sculpture-column.webp',
    { morph: 0, scale: 1.05, x: 0, y: 0, assemble: 1 },
    900,
    1100,
  ],
  ['public/art/sculpture-fan.webp', { morph: 1, scale: 1.25, x: 0, y: 0, assemble: 1 }, 900, 900],
  ['public/art/sculpture-ring.webp', { morph: 2, scale: 0.92, x: 0, y: 0, assemble: 1 }, 900, 900],
  [
    'public/art/sculpture-macro.webp',
    { morph: 0, scale: 3.4, x: 0.08, y: 0.05, assemble: 1 },
    900,
    900,
  ],
]
for (const [path, state, width, height] of poses)
  save(
    path,
    await page.evaluate(
      ([s, w, h]) => window.__sculpture.snapshot(s, w, h),
      [state, width, height],
    ),
  )

await page.setViewportSize({ width: 1200, height: 630 })
await page.reload({ waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__sculpture, null, { timeout: 30000 })
await page.waitForTimeout(3600)
writeFileSync('public/og-image.jpg', await page.screenshot({ type: 'jpeg', quality: 86 }))
console.log('public/og-image.jpg written')

await page.setViewportSize({ width: 1200, height: 900 })
await page.goto(`${base}/experiences#fluid`, { waitUntil: 'networkidle' })
const canvas = page.locator('.fluid-canvas canvas')
await canvas.waitFor({ timeout: 30000 })
await page.getByRole('button', { name: 'Wake the surface' }).click()
await page.waitForTimeout(650)
await page.addStyleTag({ content: '.fluid-pulse,.fluid-annotation{visibility:hidden!important}' })
const png = await page.locator('.fluid-stage').screenshot()
const webp = await page.evaluate(async (data) => {
  const image = new Image()
  image.src = `data:image/png;base64,${data}`
  await image.decode()
  const size = Math.min(image.width, image.height)
  const out = document.createElement('canvas')
  out.width = out.height = 900
  out
    .getContext('2d')
    .drawImage(
      image,
      (image.width - size) / 2,
      (image.height - size) / 2,
      size,
      size,
      0,
      0,
      900,
      900,
    )
  return out.toDataURL('image/webp', 0.86)
}, png.toString('base64'))
save('public/art/liquid.webp', webp)
await browser.close()

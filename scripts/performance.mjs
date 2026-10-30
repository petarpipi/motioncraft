// Local performance samples against the production preview (`pnpm build && pnpm preview`, :4184).
// Writes docs/qa/performance.json. These are lab observations on this machine, not field data.
import { chromium } from '@playwright/test'
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const base = process.env.MOTIONCRAFT_PREVIEW ?? 'http://127.0.0.1:4184'
const browser = await chromium.launch({
  channel:
    process.env.MOTIONCRAFT_BROWSER_CHANNEL ??
    (process.platform === 'win32' ? 'msedge' : undefined),
  headless: true,
})
const profiles = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, cpu: 1 },
  { name: 'desktop-cpu4x-slow4g', viewport: { width: 1440, height: 900 }, cpu: 4, slow: true },
  { name: 'mobile-cpu4x', viewport: { width: 390, height: 844 }, cpu: 4, mobile: true },
]
const stats = (frames) => {
  const sorted = [...frames].sort((a, b) => a - b)
  const pick = (q) => +sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))].toFixed(1)
  return {
    frames: frames.length,
    medianMs: pick(0.5),
    p95Ms: pick(0.95),
    maxMs: +sorted[sorted.length - 1].toFixed(1),
    over33ms: frames.filter((f) => f > 33.4).length,
    over50ms: frames.filter((f) => f > 50).length,
  }
}
const runs = []
for (const profile of profiles) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: !!profile.mobile,
    hasTouch: !!profile.mobile,
  })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)
  if (profile.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu })
  if (profile.slow) {
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    })
  }
  await page.addInitScript(() => {
    window.__m = { lcp: 0, cls: 0, longTasks: [] }
    new PerformanceObserver((l) =>
      l.getEntries().forEach((e) => (window.__m.lcp = e.startTime)),
    ).observe({
      type: 'largest-contentful-paint',
      buffered: true,
    })
    new PerformanceObserver((l) =>
      l.getEntries().forEach((e) => {
        if (!e.hadRecentInput) window.__m.cls += e.value
      }),
    ).observe({ type: 'layout-shift', buffered: true })
    new PerformanceObserver((l) =>
      l.getEntries().forEach((e) => window.__m.longTasks.push(Math.round(e.duration))),
    ).observe({ type: 'longtask', buffered: true })
  })
  await page.goto(`${base}/`, { waitUntil: 'load' })
  const canvas = page.locator('canvas[data-renderer=sculpture]')
  await canvas.waitFor({ timeout: 60000 })
  await page.waitForTimeout(5000)
  const load = await page.evaluate(() => ({
    fcpMs: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0),
    lcpMs: Math.round(window.__m.lcp),
    cls: +window.__m.cls.toFixed(4),
    longTasksMs: window.__m.longTasks,
    totalBlockingMs: window.__m.longTasks.reduce((sum, t) => sum + Math.max(0, t - 50), 0),
    firstWebGLFrameMs: Number(
      document.querySelector('canvas[data-renderer=sculpture]').dataset.firstFrameMs,
    ),
    transferKB: Math.round(
      performance.getEntriesByType('resource').reduce((s, r) => s + r.transferSize, 0) / 1024,
    ),
    tier: document.querySelector('canvas[data-renderer=sculpture]').dataset.tier,
  }))
  // Idle: the sculpture keeps breathing; after 5 s without input it renders at half rate.
  const idleStart = Number(await canvas.getAttribute('data-frames'))
  await page.waitForTimeout(2000)
  const idleRenderedPerSecond = (Number(await canvas.getAttribute('data-frames')) - idleStart) / 2
  // Scroll through the pinned cinema with real wheel/touch-equivalent scrolling.
  const start = await page
    .locator('#scroll-story')
    .evaluate((e) => e.getBoundingClientRect().top + scrollY)
  await page.evaluate((y) => window.scrollTo({ top: y - 200, behavior: 'instant' }), start)
  await page.waitForTimeout(600)
  await page.evaluate(() => {
    window.__frames = []
    let last = performance.now()
    const loop = (t) => {
      window.__frames.push(t - last)
      last = t
      if (window.__frames.length < 900) requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  })
  for (let i = 0; i < 70; i++) {
    await page.mouse.wheel(0, 110)
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(600)
  const scroll = stats((await page.evaluate(() => window.__frames)).slice(1))
  const heap = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? 0)
  runs.push({
    profile: profile.name,
    viewport: profile.viewport,
    cpuThrottle: profile.cpu,
    network: profile.slow ? '1.6 Mbps / 150 ms' : 'unthrottled local',
    ...load,
    idleRenderedPerSecond,
    scrollCinemaFrames: scroll,
    jsHeapMB: +(heap / 1048576).toFixed(1),
  })
  await context.close()
}
const assets = readdirSync('dist/assets')
  .filter((name) => /\.(js|css|woff2)$/.test(name))
  .map((name) => {
    const bytes = readFileSync(`dist/assets/${name}`)
    return { name, bytes: statSync(`dist/assets/${name}`).size, gzipBytes: gzipSync(bytes).length }
  })
const output = {
  version: 3,
  method:
    'Fresh browser context per profile in one headless Edge process against the local production preview. CPU throttling uses CDP Emulation.setCPUThrottlingRate; mobile is touch emulation on desktop hardware, not a phone GPU. Frame deltas are requestAnimationFrame intervals while scrolling the pinned cinema with mouse-wheel steps; they are not an FPS guarantee.',
  browser: browser.version(),
  date: new Date().toISOString(),
  runs,
  assets,
}
writeFileSync('docs/qa/performance.json', JSON.stringify(output, null, 2))
await browser.close()
console.log(JSON.stringify(runs, null, 2))

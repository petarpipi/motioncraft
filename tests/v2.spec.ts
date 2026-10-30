import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const sculpture = (page: Page) => page.locator('canvas[data-renderer=sculpture]')
const scrollToStory = (page: Page, vh: number) =>
  page.evaluate((vh) => {
    const el = document.querySelector('#scroll-story')!
    window.scrollTo({
      top: el.getBoundingClientRect().top + scrollY + innerHeight * vh,
      behavior: 'instant',
    })
  }, vh)

test('routes, slat curtain, browser history and focus', async ({ page, isMobile }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Beyond static.')
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: /Experiences/ })
      .click()
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0)
  } else await page.getByRole('link', { name: /Enter the playground/ }).click()
  await expect(page).toHaveURL(/\/experiences$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await expect
    .poll(() => page.locator('.route-curtain').evaluate((e) => getComputedStyle(e).visibility))
    .toBe('hidden')
  await expect(page).toHaveTitle('MOTIONCRAFT — The interactive playground')
  await page.locator('.closing-cta > a').click()
  await expect(page).toHaveURL(/\/studio#contact$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await page.goBack()
  await expect(page).toHaveURL(/\/experiences$/)
  await page.goForward()
  await expect(page).toHaveURL(/\/studio#contact$/)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ACCIDENT.')
})

test('H1: the hero sculpture is real WebGL, alive at rest and responsive', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  const canvas = sculpture(page)
  await expect(canvas).toBeAttached({ timeout: 30000 })
  await expect(canvas).toHaveAttribute('data-blades', isMobile ? '26' : /3[4-9]|40/)
  await page.waitForTimeout(2500)
  // Idle motion: frames keep being rendered with no input at all.
  const instance = await canvas.getAttribute('data-instance')
  const before = Number(await canvas.getAttribute('data-frames'))
  await page.waitForTimeout(1500)
  // Same renderer instance throughout: no remount or duplicate engine.
  await expect(canvas).toHaveCount(1)
  expect(await canvas.getAttribute('data-instance')).toBe(instance)
  expect(Number(await canvas.getAttribute('data-frames')) - before).toBeGreaterThan(15)
  if (!isMobile) {
    await page.mouse.move(200, 200)
    await page.mouse.move(1200, 600, { steps: 8 })
    await expect
      .poll(async () => parseFloat((await canvas.getAttribute('data-pointer')) ?? '0'))
      .toBeGreaterThan(0.3)
  }
  const spin = await canvas.getAttribute('data-spin')
  await page.getByRole('button', { name: 'Twist form' }).click()
  await expect.poll(() => canvas.getAttribute('data-spin'), { timeout: 4000 }).not.toBe(spin)
  await page.getByRole('button', { name: 'Replay opening' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Opening replay 1' })).toHaveCount(1)
})

test('H2: a tap on the hero plucks the slats on touch screens', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch-only behaviour')
  await page.goto('/')
  const canvas = sculpture(page)
  await expect(canvas).toBeAttached({ timeout: 30000 })
  await page.waitForTimeout(2500)
  await page.touchscreen.tap(195, 420)
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-impulse')))
    .toBeGreaterThan(0.05)
})

test('H3: no visible text is set below 11px', async ({ page }) => {
  for (const route of ['/', '/experiences', '/studio']) {
    await page.goto(route)
    await page.getByRole('heading', { level: 1 }).waitFor()
    await page.evaluate(() => document.fonts.ready)
    const tiny = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((el) => {
          const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())
          if (!hasText || el.closest('.sr-only, .cinema-natural, .route-curtain')) return false
          const style = getComputedStyle(el)
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            parseFloat(style.fontSize) < 11
          )
        })
        .map((el) => `${el.tagName}.${el.className} ${getComputedStyle(el).fontSize}`),
    )
    expect(tiny, route).toEqual([])
  }
})

test('H4 + M2: the cinema pins on every device and captions follow the scenes', async ({
  page,
  isMobile,
}) => {
  await page.goto('/')
  await sculpture(page).waitFor({ state: 'attached', timeout: 30000 })
  const root = page.locator('#scroll-story')
  await expect(page.locator('.cinema-stage')).toBeVisible()
  // The cinema pins everywhere; the exhibition is native horizontal scroll on phones.
  await expect(page.locator('.pin-spacer')).toHaveCount(isMobile ? 1 : 2)
  await expect(page.locator('.cinema-stage').locator('xpath=..')).toHaveClass(/pin-spacer/)
  for (const [vh, scene, caption] of [
    [0.35, '0', '01 / Form'],
    [1.7, '1', '02 / Transformation'],
    [3.4, '2', '03 / Reveal'],
  ] as const) {
    await scrollToStory(page, vh)
    await expect(root).toHaveAttribute('data-scene', scene)
    await expect(page.locator(`.cin-caption-${scene}`)).toBeVisible()
    await expect(page.locator(`.cin-caption-${scene}`)).toContainText(caption, { ignoreCase: true })
  }
  await expect
    .poll(() =>
      page.locator('.iris').evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a),
    )
    .toBeGreaterThan(0.9)
  await page.locator('.studies-list a').first().click()
  await expect(page).toHaveURL(/experiences#magnetic$/)
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(sculpture(page)).toHaveCount(0)
})

test('H5: no artwork is reused in more than two places on a page', async ({ page }) => {
  for (const route of ['/', '/experiences', '/studio']) {
    await page.goto(route)
    await page.getByRole('heading', { level: 1 }).waitFor()
    const counts = await page.evaluate(() => {
      const map: Record<string, number> = {}
      document.querySelectorAll('img').forEach((img) => {
        const key = new URL(img.src).pathname
        map[key] = (map[key] ?? 0) + 1
      })
      return map
    })
    for (const [src, count] of Object.entries(counts))
      expect(count, `${route} ${src}`).toBeLessThanOrEqual(2)
  }
})

test('M4: hero labels and controls never overlap each other', async ({ page }) => {
  for (const width of [375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(2200)
    const overlaps = await page.evaluate(() => {
      const boxes = [
        ...document.querySelectorAll<HTMLElement>(
          '.hero-meta > span, .hero-word, .hero-scroll, .hero-lede, .hero-actions > *',
        ),
      ]
        .filter((el) => el.offsetParent)
        .map((el) => ({ name: el.className || el.textContent, r: el.getBoundingClientRect() }))
      const hits: string[] = []
      boxes.forEach((a, i) =>
        boxes.slice(i + 1).forEach((b) => {
          const r1 = a.r,
            r2 = b.r
          if (
            r1.left < r2.right - 1 &&
            r2.left < r1.right - 1 &&
            r1.top < r2.bottom - 1 &&
            r2.top < r1.bottom - 1
          )
            hits.push(`${a.name} × ${b.name}`)
        }),
      )
      return hits
    })
    expect(overlaps, `${width}px`).toEqual([])
  }
})

test('horizontal exhibition advances with visible controls', async ({ page, isMobile }) => {
  await page.goto('/')
  const viewport = page.locator('.project-viewport')
  await viewport.scrollIntoViewIfNeeded()
  if (isMobile) {
    await page.getByRole('button', { name: 'Next project' }).click()
    await expect.poll(() => viewport.evaluate((e) => e.scrollLeft)).toBeGreaterThan(300)
    await page.getByRole('button', { name: 'Previous project' }).click()
    await expect.poll(() => viewport.evaluate((e) => e.scrollLeft)).toBeLessThan(100)
    return
  }
  await page.evaluate(() => {
    const pin = document.querySelector('.showcase-pin')!
    window.scrollTo({ top: pin.getBoundingClientRect().top + scrollY + 10, behavior: 'instant' })
  })
  // L2: the controls live inside the pinned frame, so they are on screen during the travel.
  await expect(page.getByRole('button', { name: 'Next project' })).toBeInViewport()
  await page.getByRole('button', { name: 'Next project' }).click()
  await page.getByRole('button', { name: 'Next project' }).click()
  await expect
    .poll(() =>
      page
        .locator('.project-track')
        .evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).m41),
    )
    .toBeLessThan(-2000)
  await expect(page.getByRole('link', { name: 'Enter the fluid study' })).toBeInViewport()
})

test('magnetic physics carries velocity and supports keyboard reset', async ({ page }) => {
  await page.goto('/experiences#magnetic')
  const stage = page.locator('.elastic-stage')
  const button = page.getByRole('button', { name: /impulse the magnetic core/ })
  await button.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => stage.getAttribute('data-position')).not.toBe('0.00,0.00')
  const turned = await page
    .locator('.filing')
    .evaluateAll((els) => new Set(els.map((e) => (e as HTMLElement).style.transform)).size)
  expect(turned).toBeGreaterThan(20)
  await expect(page.getByRole('status').filter({ hasText: 'Impulse 1' })).toHaveCount(1)
  await page.getByRole('button', { name: 'Reset physics' }).click()
  await expect(stage).toHaveAttribute('data-position', '0.00,0.00')
})

test('fluid shader renders changing pixels and has a finite pulse', async ({ page, isMobile }) => {
  await page.goto('/experiences#fluid')
  const canvas = page.locator('.fluid-canvas canvas')
  await expect(canvas).toBeVisible({ timeout: 30000 })
  await page.waitForTimeout(700)
  const before = await canvas.screenshot()
  await page.getByRole('button', { name: 'Wake the surface' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Surface pulse 1' })).toHaveCount(1)
  if (!isMobile) {
    const r = await canvas.boundingBox()
    await page.mouse.move(r!.x + r!.width * 0.7, r!.y + r!.height * 0.4)
  }
  await page.waitForTimeout(250)
  expect((await canvas.screenshot()).equals(before)).toBe(false)
  await page.mouse.move(1, 1)
  await page.waitForTimeout(3600)
  const frames = await canvas.getAttribute('data-frames')
  await page.waitForTimeout(350)
  expect(await canvas.getAttribute('data-frames')).toBe(frames)
  await page.getByRole('button', { name: 'Reset surface' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Surface pulse' })).toHaveCount(0)
})

test('variable type field drives the width axis by keyboard', async ({ page }) => {
  await page.goto('/experiences#type')
  await page.getByRole('button', { name: 'Width', exact: true }).click()
  const slider = page.getByRole('slider', { name: 'Typography field position' })
  await slider.focus()
  await slider.press('Home')
  const first = page.locator('.displaced-char').first()
  await expect
    .poll(() => first.evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue('--wdth'))))
    .toBeGreaterThan(115)
  await expect
    .poll(() =>
      page
        .locator('.displaced-char')
        .last()
        .evaluate((e) => parseFloat(getComputedStyle(e).getPropertyValue('--wdth'))),
    )
    .toBeLessThan(100)
  await page.getByRole('button', { name: 'Replay type' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Type replay 1' })).toHaveCount(1)
})

test('spatial gallery changes depth and supports arrow navigation', async ({ page }) => {
  await page.goto('/experiences#depth')
  await page.getByRole('button', { name: 'Next depth image' }).click()
  const status = page.locator('.depth-gallery-controls').getByRole('status')
  await expect(status).toContainText('Interference field')
  await expect(page.locator('.depth-slot-0')).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.depth-slot-0').focus()
  await page.keyboard.press('ArrowRight')
  await expect(status).toContainText('Louvred iris')
  await page.getByRole('button', { name: 'Reset depth' }).click()
  await expect(status).toContainText('Liquid surface')
})

test('reduced motion: no pins or GPU scenes, complete content, and M5 toggle override', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')
  await expect(page.locator('.pin-spacer')).toHaveCount(0)
  await expect(page.locator('.cinema-natural')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('.hero-still img')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Twist form' })).toBeDisabled()
  const toggle = page.locator('.motion-toggle')
  await expect(toggle).toHaveAccessibleName('Motion off (system setting)')
  // The visitor can explicitly opt back in even though the OS asks for less motion.
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full')
  await expect(toggle).toHaveAccessibleName('Motion on')
  await expect(sculpture(page)).toBeAttached({ timeout: 30000 })
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full')
  await page.getByRole('button', { name: 'Motion on' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('keyboard entry, trapped mobile menu and simulated form', async ({ page, isMobile }) => {
  const posts: string[] = []
  page.on('request', (r) => {
    if (r.method() === 'POST') posts.push(r.url())
  })
  await page.goto('/studio')
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.getByRole('navigation', { name: 'Mobile navigation' })
    await expect(menu.getByRole('link').first()).toBeFocused()
    await expect(page.locator('#main')).toHaveAttribute('inert', '')
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
    expect(
      await page.evaluate(() => !!document.activeElement?.closest('#mobile-menu, .menu-button')),
    ).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
    await expect(page.locator('#main')).not.toHaveAttribute('inert', '')
  }
  await page.getByRole('button', { name: 'Preview demo brief' }).click()
  await expect(page.getByLabel('Your name', { exact: false })).toBeFocused()
  await page.getByLabel('Your name', { exact: false }).fill('Alex Example')
  await page.getByLabel('Email address', { exact: false }).fill('alex@example.com')
  await page
    .getByLabel('What would you like to move?', { exact: false })
    .fill('A cinematic portfolio with expressive motion.')
  await page.getByRole('button', { name: 'Preview demo brief' }).click()
  await expect(page.locator('#contact').getByRole('status')).toContainText('No email was sent')
  expect(posts).toEqual([])
})

test('six viewport widths fit every route', async ({ page }) => {
  test.setTimeout(180000)
  for (const width of [375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of ['/', '/experiences', '/studio']) {
      await page.goto(route)
      await page.getByRole('heading', { level: 1 }).waitFor()
      await page.evaluate(() => document.fonts.ready)
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth), {
          message: `Overflow ${route} ${width}px`,
        })
        .toBeLessThanOrEqual(1)
    }
  }
})

test('all routes pass axe checks in both motion modes', async ({ page }) => {
  test.setTimeout(180000)
  const findings: unknown[] = []
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    await page.emulateMedia({ reducedMotion })
    for (const route of ['/', '/experiences', '/studio']) {
      await page.goto(route)
      await page.getByRole('heading', { level: 1 }).waitFor()
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(1800)
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      findings.push(
        ...result.violations.map((v) => ({
          reducedMotion,
          route,
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
      )
    }
  }
  await test
    .info()
    .attach('axe', { body: JSON.stringify(findings, null, 2), contentType: 'application/json' })
  expect(findings).toEqual([])
})

test('WebGL unavailability shows a labelled still of the sculpture', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === 'webgl2') return null
      return (original as (...args: unknown[]) => unknown).apply(this, [type, ...args])
    } as typeof original
  })
  await page.goto('/')
  await expect(page.locator('.hero-still img')).toBeVisible({ timeout: 30000 })
  await expect(page.locator('.hero-still')).toContainText('WebGL unavailable')
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Beyond static.')
})

test('M6: a failed route chunk shows a recoverable error, not a blank page', async ({ page }) => {
  await page.route(/Experiences.*\.(tsx|js)(\?.*)?$/, (route) => route.abort())
  await page.goto('/')
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page
    .getByRole('navigation', { name: /navigation/ })
    .first()
    .waitFor()
  await page.evaluate(() => {
    history.pushState({}, '', '/experiences')
    dispatchEvent(new PopStateEvent('popstate'))
  })
  await expect(page.getByRole('alert')).toContainText('This scene failed to load.')
  await expect(page.getByRole('button', { name: 'Reload the page' })).toBeVisible()
  await expect(page.locator('.site-header')).toBeVisible()
})

test('M7: social metadata and per-route descriptions', async ({ page }) => {
  await page.goto('/')
  for (const property of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'])
    await expect(page.locator(`meta[property="${property}"]`)).toHaveAttribute('content', /.+/)
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  )
  const image = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect((await page.request.get(new URL(image!, page.url()).href)).status()).toBe(200)
  await page.goto('/experiences')
  await page.getByRole('heading', { level: 1 }).waitFor()
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /interaction studies/,
  )
})

test('route changes have no runtime or HTTP failures', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text())
  })
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`)
  })
  for (const path of ['/', '/experiences#fluid', '/studio#contact', '/missing', '/#%']) {
    await page.goto(path)
    await page.getByRole('heading', { level: 1 }).waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(800)
  }
  expect(errors).toEqual([])
})

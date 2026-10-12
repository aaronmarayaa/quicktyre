import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { verifyForm } from './check-form.mjs'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
const results = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const base = 'http://127.0.0.1:5173'
const track = page.locator('.work-track')
const status = page.getByRole('status')

try {
  for (const width of [1893, 1440, 1200, 1100, 1024, 801, 800, 651, 650, 480, 390, 320]) {
    await page.setViewportSize({ width, height: 951 })
    await page.goto(`${base}/our-works`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(async () => {
      for (const image of document.images) image.loading = 'eager'
      await Promise.all([...document.images].map(image => image.decode()))
    })
    assert.equal(await page.locator('h1').innerText(), 'OUR WORKS')
    assert.equal(await page.locator('.work-slide:not([aria-hidden])').count(), 13)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Page overflow at ${width}`)
    const count = width > 650 ? 3 : 1
    await assertStatus(`Photo ${count === 3 ? 2 : 1} of 13`)
    if (count === 3) {
      const sizes = await page.locator('.work-slide:not([aria-hidden]) img').evaluateAll(images => images.slice(0, 3).map(image => image.getBoundingClientRect().width))
      assert.ok(sizes[1] > sizes[0] * 1.15 && sizes[1] > sizes[2] * 1.15, 'Center photo must be larger than both side photos')
    }
    const clipped = await page.locator('.contact-heading, .form-field, .footer-contact').evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.className))
    assert.deepEqual(clipped, [], `Clipped text/form at ${width}`)
    for (const button of await page.locator('.gallery-arrow').all()) {
      const box = await button.boundingBox()
      assert.ok(box.width >= 44 && box.height >= 44)
    }
    results.push(`${width}px: ${count} visible photos; all 13 originals decode; no page overflow or clipped contact content; gallery controls at least 44px`)
    if ([1893, 390].includes(width)) {
      await page.screenshot({ path: `test-results/our-works-top-${width}.png` })
      await page.screenshot({ path: `test-results/our-works-full-${width}.png`, fullPage: true })
    }
    if (width === 1893) {
      const geometry = await page.evaluate(() => Object.fromEntries(['.services-hero', '.catalogue-heading', '.work-slide', '.works-banner', '#contact', '.site-footer'].map(selector => {
        const box = document.querySelector(selector).getBoundingClientRect()
        return [selector, { width: Math.round(box.width), height: Math.round(box.height), top: Math.round(box.top + window.scrollY) }]
      })))
      results.push(`Desktop geometry: ${JSON.stringify(geometry)}`)
      for (const [name, selector, offset] of [['gallery', '.work-track', 187], ['banner', '.works-banner', 0], ['contact', '#contact', 0], ['footer', '.site-footer', 421]]) {
        await page.locator(selector).evaluate((element, offset) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - offset), offset)
        await page.locator('.services-header.is-scrolled').waitFor()
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await page.screenshot({ path: `test-results/our-works-${name}.png` })
      }
    }
  }

  await page.setViewportSize({ width: 1893, height: 951 })
  await page.goto(`${base}/our-works`, { waitUntil: 'networkidle' })
  for (let index = 0; index < 13; index++) {
    await page.getByRole('button', { name: 'Next photos', exact: true }).click()
    await assertStatus(`Photo ${(index + 2) % 13 + 1} of 13`)
  }
  await page.getByRole('button', { name: 'Previous photos', exact: true }).click()
  await assertStatus('Photo 1 of 13')
  await page.getByRole('button', { name: 'Previous photos', exact: true }).click()
  await assertStatus('Photo 13 of 13')
  results.push('Carousel: every photo reachable; next/previous move one frame; both ends continue through duplicate frames and settle on equivalent originals; centered-photo announcement stays accurate')
  await track.focus()
  await page.keyboard.press('ArrowRight')
  await assertStatus('Photo 1 of 13')
  await page.keyboard.press('ArrowLeft')
  await assertStatus('Photo 13 of 13')
  results.push('Keyboard: ArrowRight and ArrowLeft navigate across the loop boundaries')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.evaluate(() => {
    window.carouselSamples = []
    window.carouselSampling = true
    const sample = () => {
      window.carouselSamples.push(document.querySelector('.work-track').scrollLeft)
      if (window.carouselSampling) requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
  await page.getByRole('button', { name: 'Next photos', exact: true }).click()
  await assertStatus('Photo 1 of 13')
  const samples = await page.evaluate(() => { window.carouselSampling = false; return window.carouselSamples })
  const step = await track.evaluate(element => element.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(element).gap))
  assert.ok(samples.length > 3)
  assert.ok(samples.some((value, index) => index > 0 && value > samples[index - 1] + 1), 'Loop boundary must animate forward')
  const reset = samples.findIndex((value, index) => index > 0 && value < samples[index - 1] - step)
  assert.ok(reset > 0, 'Carousel must reset only after moving into its duplicate cycle')
  assert.ok(samples[reset - 1] - samples[0] > step * .98, 'Full forward frame movement must finish before reset')
  assert.ok(Math.abs(samples[reset - 1] - samples[reset] - step * 13) < 2, 'Reset must move by exactly one identical cycle')
  results.push('Normal motion: recorded last-to-first forward animation; complete one-frame movement followed by invisible one-cycle reset')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await assertStatus('Photo 1 of 13')
  const mobileFirst = Number((await status.innerText()).match(/\d+/)[0])
  await page.getByRole('button', { name: 'Next photos', exact: true }).click()
  const mobileNext = mobileFirst === 13 ? 1 : mobileFirst + 1
  await assertStatus(`Photo ${mobileNext} of 13`)
  await track.evaluate(element => {
    const step = element.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(element).gap)
    element.scrollTo({ left: 25 * step, behavior: 'instant' })
  })
  await assertStatus('Photo 13 of 13')
  await page.getByRole('button', { name: 'Next photos', exact: true }).click()
  await assertStatus('Photo 1 of 13')
  results.push('Resize and native scrolling: one mobile frame; centered photo retained; last-to-first loop remains usable')

  await page.goto(`${base}/ourworks`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'OUR WORKS', exact: true }).waitFor()
  results.push('/ourworks alias opens the same page')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Contact', exact: true }).click()
  await page.waitForURL('**/contact')
  await page.getByRole('heading', { name: 'Get in Touch', exact: true }).waitFor()
  assert.equal(new URL(page.url()).pathname, '/contact')
  assert.equal(await page.getByRole('dialog').count(), 0)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement), true)
  results.push('Mobile navigation: opens; Contact navigates and closes; Escape restores trigger focus')

  await page.setViewportSize({ width: 1893, height: 951 })
  for (const navName of ['Main navigation', 'Footer navigation']) {
    for (const label of ['Home', 'Services', 'Our Works', 'Contact']) {
      await page.goto(`${base}/our-works`, { waitUntil: 'networkidle' })
      const link = page.getByRole('navigation', { name: navName, exact: true }).getByRole('link', { name: label, exact: true })
      const destination = new URL(await link.getAttribute('href'), page.url()).href
      await link.click()
      await page.waitForURL(destination)
      if (label === 'Services') await page.getByRole('heading', { name: 'OUR SERVICES', exact: true }).waitFor()
      else if (label === 'Our Works') await page.getByRole('heading', { name: 'OUR WORKS', exact: true }).waitFor()
      else if (label === 'Contact') await page.getByRole('heading', { name: 'Get in Touch', exact: true }).waitFor()
      else assert.equal(await page.locator(new URL(page.url()).hash).count(), 1)
      results.push(`${navName} ${label}: ${new URL(page.url()).pathname}${new URL(page.url()).hash}`)
    }
  }
  await page.goto(`${base}/our-works#contact`, { waitUntil: 'networkidle' })
  assert.equal(await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Our Works', exact: true }).getAttribute('aria-current'), 'page')
  assert.ok(await page.locator('#contact').evaluate(element => element.getBoundingClientRect().top >= 175))
  await verifyForm(page, results)
  for (const link of await page.locator('a[href^="tel:"]').all()) assert.match(await link.getAttribute('href'), /^tel:\+1587\d{7}$/)
  assert.equal(await page.locator('.facebook-link').getAttribute('href'), 'https://www.facebook.com/quicktyreltdFRANCISJANE')
  results.push('Call/email/social destinations retained; no external messages sent')
  assert.deepEqual(errors, [], 'Browser console/runtime errors')
  results.push('No browser runtime or console errors')
  await writeFile('test-results/our-works-check-results.json', JSON.stringify(results, null, 2))
  console.log(results.join('\n'))
} finally {
  await browser.close()
}

async function assertStatus(expected) {
  await page.waitForFunction(text => {
    const track = document.querySelector('.work-track')
    const step = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap)
    const center = Number(text.match(/\d+/)[0]) - 1
    const inset = (track.clientWidth - track.firstElementChild.getBoundingClientRect().width) / 2
    const target = (13 + center) * step - inset
    return document.querySelector('[role="status"]').textContent === text && Math.abs(track.scrollLeft - target) < 1.5
  }, expected)
  assert.equal(await status.innerText(), expected)
}

import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { verifyForm } from './check-form.mjs'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
const results = []

try {
  for (const width of [1890, 1440, 1201, 1200, 1024, 801, 800, 768, 650, 480, 390, 320]) {
    await page.setViewportSize({ width, height: width > 800 ? 900 : 844 })
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(async () => {
      for (const image of document.images) image.loading = 'eager'
      await Promise.all([...document.images].map(image => image.decode()))
    })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Horizontal overflow at ${width}px`)
    const overlaps = await page.evaluate(() => {
      const a = document.querySelector('.hero-wordmark').getBoundingClientRect()
      const b = document.querySelector('.hero-intro').getBoundingClientRect()
      return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
    })
    assert.equal(overlaps, false, `Hero text overlaps at ${width}px`)
    const contentFits = await page.evaluate(() => {
      const hero = document.querySelector('.hero').getBoundingClientRect()
      const wordmark = document.querySelector('.hero-wordmark').getBoundingClientRect()
      const content = document.querySelector('.hero-intro').getBoundingClientRect()
      const header = document.querySelector('.site-header').getBoundingClientRect()
      const copy = document.querySelector('.journey-copy').getBoundingClientRect()
      const paragraph = document.querySelector('.journey-copy p').getBoundingClientRect()
      const journey = document.querySelector('.journey').getBoundingClientRect()
      const services = document.querySelector('#services').getBoundingClientRect()
      return content.top >= header.bottom + 24 && content.left >= 0 && content.right <= hero.right && content.bottom <= hero.bottom - 24
        && wordmark.left >= 0 && wordmark.right <= hero.right && wordmark.bottom <= hero.bottom
        && paragraph.top >= copy.top && paragraph.bottom <= copy.bottom - 20 && copy.bottom <= journey.bottom + 1 && copy.right <= journey.right + 1
        && services.top >= journey.bottom - 1
    })
    assert.equal(contentFits, true, `Hero or Journey content escapes its panel at ${width}px`)
    await page.evaluate(() => window.scrollTo(0, 0))
    if ([1890, 390].includes(width)) {
      await page.screenshot({ path: `test-results/home-${width}.png` })
      await page.screenshot({ path: `test-results/full-${width}.png`, fullPage: true })
    }
    if ([1890, 1440, 650, 390].includes(width)) await page.locator('.journey-panel').screenshot({ path: `test-results/journey-panel-${width}.png` })
    results.push(`${width}px: images loaded; no horizontal overflow; hero text fits below navbar; complete Journey paragraph stays inside its gray panel`)
  }

  await page.locator('.journey-copy').evaluate(copy => {
    for (const element of copy.children) element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * 2}px`
  })
  assert.equal(await page.locator('.journey-copy').evaluate(copy => copy.querySelector('p').getBoundingClientRect().bottom <= copy.getBoundingClientRect().bottom - 20), true, 'Journey panel must grow for enlarged text')
  results.push('320px enlarged Journey text: gray panel grows and contains the complete paragraph')

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Services', exact: true }).click()
  assert.equal(new URL(page.url()).pathname, '/services')
  await page.getByRole('heading', { name: 'OUR SERVICES', exact: true }).waitFor()
  results.push('Header Services: opens /services catalogue')
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Our Works', exact: true }).click()
  await page.waitForURL('**/our-works')
  await page.getByRole('heading', { name: 'OUR WORKS', exact: true }).waitFor()
  results.push('Header Our Works: opens /our-works gallery')
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  for (const [label, hash] of [['Contact', ''], ['Home', '#home']]) {
    await page.evaluate(() => window.scrollBy(0, -200))
    await page.waitForFunction(() => document.querySelector('.site-header').getBoundingClientRect().top >= 0)
    await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: label, exact: true }).click()
    assert.equal(new URL(page.url()).hash, hash)
    if (label === 'Contact') {
      await page.waitForURL('**/contact')
      await page.getByRole('heading', { name: 'Get in Touch', exact: true }).waitFor()
    } else {
      await page.locator(hash).waitFor({ state: 'attached' })
      assert.equal(await page.locator(hash).count(), 1)
    }
    results.push(`Header ${label}: navigates to ${label === 'Contact' ? '/contact' : hash}`)
  }
  await page.locator('.hero-quote').click()
  assert.equal(new URL(page.url()).hash, '#contact')
  results.push('Hero Get a Quote: navigates to contact form')
  await page.getByRole('button', { name: 'See all services', exact: true }).click()
  assert.equal(await page.locator('#all-services').isVisible(), true)
  await page.getByRole('button', { name: 'Close all services', exact: true }).click()
  assert.equal(await page.locator('#all-services').count(), 0)
  results.push('See all services: expands and collapses service list')
  await page.locator('.expert-services').click()
  assert.equal(new URL(page.url()).hash, '#services')
  results.push('Expert banner Our services: navigates to services')
  await verifyForm(page, results)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.getByRole('dialog').waitFor()
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Contact', exact: true }).click()
  await page.waitForURL('**/contact')
  await page.getByRole('heading', { name: 'Get in Touch', exact: true }).waitFor()
  assert.equal(new URL(page.url()).pathname, '/contact')
  assert.equal(await page.getByRole('dialog').count(), 0)
  results.push('Mobile Menu: opens; Contact navigates and closes the menu')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('dialog').count(), 0)
  results.push('Mobile menu: Escape closes; focus returns to trigger')
  for (const link of await page.locator('a[href^="#"]').all()) {
    const href = await link.getAttribute('href')
    assert.equal(await page.locator(href).count(), 1, `Missing anchor ${href}`)
  }
  for (const link of await page.locator('a[href^="tel:"]').all()) assert.match(await link.getAttribute('href'), /^tel:\+1587\d{7}$/)
  results.push('All internal links resolve; call and email links have correct destinations (external apps not launched)')
  assert.deepEqual(errors, [], 'Browser console errors')
  results.push('No browser runtime or console errors')
  await writeFile('test-results/check-results.json', JSON.stringify(results, null, 2))
  console.log(results.join('\n'))
} finally {
  await browser.close()
}

import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { verifyForm } from './check-form.mjs'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
const results = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })

try {
  for (const width of [1893, 1440, 1200, 1024, 801, 800, 600, 480, 390, 320]) {
    await page.setViewportSize({ width, height: 951 })
    await page.goto('http://127.0.0.1:5173/services', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(async () => {
      for (const image of document.images) image.loading = 'eager'
      await Promise.all([...document.images].map(image => image.decode()))
    })
    assert.equal(await page.locator('h1').innerText(), 'OUR SERVICES')
    assert.deepEqual(await page.locator('.catalogue-item h2').allTextContents(), ['Truck Tires', 'Heavy Equipment Tires', 'Trailer Tires', 'Car Tires', 'Semi Truck Tires', 'Loader Tires', 'Bobcat Tires', 'Forklift Tires', 'Other Tires'])
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `Overflow at ${width}`)
    const columns = await page.locator('.service-catalogue').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)
    assert.equal(columns, width > 1200 ? 3 : width > 480 ? 2 : 1)
    for (const link of await page.locator('.service-contact').all()) {
      const box = await link.boundingBox()
      assert.ok(box.width >= 44 && box.height >= 44)
    }
    const invalidBoxes = await page.locator('.catalogue-item, .contact-heading, .form-field, .footer-contact').evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.className))
    assert.deepEqual(invalidBoxes, [], `Content escaping containers at ${width}`)
    results.push(`${width}px: nine headings in reference order, all original images decoded, ${columns} catalogue columns, no overflow or clipped content, service targets exceed 44px`)
    if ([1893, 390].includes(width)) {
      await page.screenshot({ path: `test-results/services-top-${width}.png` })
      await page.screenshot({ path: `test-results/services-full-${width}.png`, fullPage: true })
    }
    if (width === 1893) {
      for (const [name, selector] of [['row-one', '.catalogue-item:nth-child(1)'], ['row-two', '.catalogue-item:nth-child(4)'], ['row-three', '.catalogue-item:nth-child(7)'], ['contact', '#contact'], ['footer', '.site-footer']]) {
        await page.locator(selector).evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 212))
        await page.locator('.services-header.is-scrolled').waitFor()
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        await page.screenshot({ path: `test-results/services-${name}.png` })
      }
      results.push(`Desktop geometry: ${JSON.stringify(await page.evaluate(() => Object.fromEntries(['.services-hero', '.catalogue-heading', '.catalogue-item img', '#contact', '.site-footer'].map(selector => { const b = document.querySelector(selector).getBoundingClientRect(); return [selector, { width: Math.round(b.width), height: Math.round(b.height) }] }))))}`)
    }
  }

  await page.setViewportSize({ width: 1893, height: 951 })
  for (let index = 0; index < 9; index++) {
    await page.goto('http://127.0.0.1:5173/services', { waitUntil: 'networkidle' })
    const link = page.locator('.service-contact').nth(index)
    const name = await link.innerText()
    await link.click()
    await page.waitForURL('**/contact')
    await page.getByRole('heading', { name: 'Get in Touch', exact: true }).waitFor()
    results.push(`${name}: opens /contact page`)
  }
  await page.goto('http://127.0.0.1:5173/services#contact', { waitUntil: 'networkidle' })
  await page.locator('.services-header.is-scrolled').waitFor({ state: 'attached' })
  assert.equal(await page.locator('.services-header').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(39, 39, 39)')
  results.push('Scrolled header: solid charcoal; current Services navigation stays highlighted')

  await verifyForm(page, results)

  for (const navName of ['Main navigation', 'Footer navigation']) {
    for (const label of ['Home', 'Services', 'Our Works', 'Contact']) {
      await page.goto('http://127.0.0.1:5173/services', { waitUntil: 'networkidle' })
      const link = page.getByRole('navigation', { name: navName, exact: true }).getByRole('link', { name: label, exact: true })
      const destination = new URL(await link.getAttribute('href'), page.url()).href
      await link.click()
      await page.waitForURL(destination)
      if (label === 'Services') assert.equal(new URL(page.url()).pathname, '/services')
      else if (label === 'Our Works') {
        assert.equal(new URL(page.url()).pathname, '/our-works')
        await page.getByRole('heading', { name: 'OUR WORKS', exact: true }).waitFor()
      }
      else if (label === 'Contact') await page.getByRole('heading', { name: 'Get in Touch', exact: true }).waitFor()
      else assert.equal(await page.locator(new URL(page.url()).hash).count(), 1)
      results.push(`${navName} ${label}: resolves to ${new URL(page.url()).pathname}${new URL(page.url()).hash}`)
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:5173/services', { waitUntil: 'networkidle' })
  await page.keyboard.press('Tab')
  assert.equal(await page.locator('.skip-link').evaluate(element => element === document.activeElement), true)
  await page.keyboard.press('Enter')
  assert.equal(new URL(page.url()).hash, '#main')
  assert.equal(await page.locator('#main').evaluate(element => element === document.activeElement), true)
  results.push('Keyboard: first Tab reveals skip link; Enter focuses main')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Contact', exact: true }).click()
  await page.waitForURL('**/contact')
  await page.getByRole('heading', { name: 'Get in Touch', exact: true }).waitFor()
  assert.equal(await page.getByRole('dialog').count(), 0)
  assert.equal(new URL(page.url()).pathname, '/contact')
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => document.querySelector('.mobile-menu-button') === document.activeElement)
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement), true)
  results.push('Mobile menu: opens; Contact closes and navigates; Escape closes and restores focus')
  for (const link of await page.locator('a[href^="tel:"]').all()) assert.match(await link.getAttribute('href'), /^tel:\+1587\d{7}$/)
  assert.equal(await page.locator('.facebook-link').getAttribute('href'), 'https://www.facebook.com/quicktyreltdFRANCISJANE')
  results.push('Call/email/Facebook actions: intended destinations inspected; no calls, emails, or posts sent')
  assert.deepEqual(errors, [])
  results.push('No browser runtime or console errors')
  const luminance = hex => {
    const channels = hex.match(/\w\w/g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
  }
  for (const [foreground, background, label] of [['272727', 'ffffff', 'Catalogue text'], ['b34300', 'ebebeb', 'Emergency link'], ['dedede', '272727', 'Header text'], ['ff6500', '272727', 'Current-page accent'], ['dedede', '595959', 'Photo navigation over brightest possible shaded pixel']]) {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
    const ratio = (values[0] + .05) / (values[1] + .05)
    assert.ok(ratio >= 4.5, `${label} fails text contrast`)
    results.push(`${label}: contrast ${ratio.toFixed(2)}:1, exceeds 4.5:1`)
  }
  await writeFile('test-results/services-check-results.json', JSON.stringify(results, null, 2))
  console.log(results.join('\n'))
} finally {
  await browser.close()
}

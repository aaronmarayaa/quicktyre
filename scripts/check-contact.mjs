import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { verifyForm } from './check-form.mjs'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ reducedMotion: 'reduce' })
const errors = []
const results = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })

try {
  for (const width of [1893, 1440, 1024, 800, 650, 480, 390, 320]) {
    await page.setViewportSize({ width, height: 951 })
    await page.goto('http://127.0.0.1:5173/contact', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(async () => {
      for (const image of document.images) image.loading = 'eager'
      await Promise.all([...document.images].map(image => image.decode()))
    })
    assert.equal(await page.locator('h1').innerText(), 'Get in Touch')
    assert.equal(await page.locator('.contact-photo').count(), 0)
    assert.equal(await page.locator('.quote-submit').innerText(), 'Submit')
    assert.equal(await page.locator('#first-name').evaluate(element => element.required), false)
    assert.equal(await page.locator('#message').evaluate(element => element.required), false)
    assert.equal(await page.locator('.header-logo img').getAttribute('src'), '/images/logo.avif')
    assert.equal(await page.locator('.footer-brand img').getAttribute('src'), '/images/footer-logo.png')
    assert.equal(await page.locator('.facebook-link').getAttribute('href'), 'https://www.facebook.com/quicktyreltdFRANCISJANE')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.deepEqual(await page.locator('.contact-heading, .form-field, .footer-contact').evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.className)), [])
    const rows = await page.locator('.form-row').first().evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)
    assert.equal(rows, width <= 480 ? 1 : 2)
    const inputs = await page.locator('#first-name, #last-name, #email, #phone, .quote-submit').all()
    for (const input of inputs) assert.ok((await input.boundingBox()).height >= 44)
    if ([1893, 390].includes(width)) {
      await page.screenshot({ path: `test-results/contact-top-${width}.png` })
      await page.screenshot({ path: `test-results/contact-full-${width}.png`, fullPage: true })
      await page.locator('.site-footer').screenshot({ path: `test-results/contact-footer-${width}.png` })
    }
    const trigger = page.getByRole('button', { name: /^Phone country code:/ })
    await trigger.click()
    await page.getByRole('combobox', { name: 'Search countries' }).waitFor()
    assert.ok(await page.getByRole('option').count() > 230)
    const bounds = await page.locator('.country-dropdown').boundingBox()
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width)
    assert.equal(await page.getByRole('combobox', { name: 'Search countries' }).evaluate(element => element === document.activeElement), true)
    if ([1893, 390].includes(width)) await page.screenshot({ path: `test-results/country-dropdown-${width}.png` })
    await page.getByRole('combobox', { name: 'Search countries' }).fill('zzzzzz')
    await page.getByText('No countries found.', { exact: true }).waitFor()
    await page.getByRole('combobox', { name: 'Search countries' }).fill('aland')
    await page.getByRole('option', { name: 'Åland Islands +358', exact: true }).waitFor()
    await page.keyboard.press('Enter')
    assert.equal(await page.locator('input[name="country"]').inputValue(), '+358')
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true)
    await trigger.click()
    await page.getByRole('combobox', { name: 'Search countries' }).fill('+93')
    await page.getByRole('option', { name: 'Afghanistan +93', exact: true }).click()
    assert.equal(await page.locator('input[name="country"]').inputValue(), '+93')
    await trigger.click()
    await page.keyboard.press('Escape')
    assert.equal(await page.getByRole('listbox').count(), 0)
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true)
    results.push(`${width}px: reference full-width form, ${rows} columns, larger footer logo, Facebook URL, no clipping; searchable flag dropdown, accent-insensitive and dial-code search, empty state, mouse/Enter/Escape, focus restoration`)
  }
  await verifyForm(page, results, { contactPage: true })
  await page.goto('http://127.0.0.1:5173/contact/', { waitUntil: 'networkidle' })
  assert.equal(await page.locator('h1').innerText(), 'Get in Touch')
  await page.keyboard.press('Tab')
  await page.locator('.skip-link').focus()
  await page.keyboard.press('Enter')
  assert.equal(await page.locator('#main').evaluate(element => element === document.activeElement), true)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement), true)
  results.push('/contact/ route alias, skip link and mobile menu keyboard checks pass')
  assert.deepEqual(errors, [])
  results.push('No browser runtime or console errors; all submissions intercepted')
  await writeFile('test-results/contact-check-results.json', JSON.stringify(results, null, 2))
  console.log(results.join('\n'))
} finally { await browser.close() }

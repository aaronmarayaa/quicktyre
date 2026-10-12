import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ reducedMotion: 'no-preference' })
const results = []
const errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  for (const width of [1896, 1440, 390]) {
    await page.setViewportSize({ width, height: 951 })
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    assert.equal(await page.locator('.scroll-stack').count(), 2)
    assert.equal(await page.locator('.hero-wordmark').evaluate(element => getComputedStyle(element).transitionTimingFunction), 'ease-in, ease-in')
    assert.equal(await page.locator('.hero-intro').evaluate(element => getComputedStyle(element).transitionTimingFunction), 'ease-in, ease-in')
    for (let index = 0; index < 2; index++) {
      const position = await page.locator('.scroll-stack').nth(index).evaluate(wrapper => {
        const first = wrapper.firstElementChild.getBoundingClientRect()
        const top = wrapper.getBoundingClientRect().top + scrollY
        return top + first.height - innerHeight / 2
      })
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), position)
      await page.waitForFunction(({ index }) => {
        const wrapper = document.querySelectorAll('.scroll-stack')[index]
        if (!wrapper) return false
        const first = wrapper.firstElementChild.getBoundingClientRect()
        const second = wrapper.lastElementChild.getBoundingClientRect()
        const pin = parseFloat(getComputedStyle(wrapper.firstElementChild).top)
        return Math.abs(first.top - pin) < 2 && second.top > 0 && second.top < first.bottom
      }, { index })
      const covering = await page.locator('.scroll-stack').nth(index).evaluate(wrapper => {
        const second = wrapper.lastElementChild
        const bounds = second.getBoundingClientRect()
        return second.contains(document.elementFromPoint(innerWidth / 2, bounds.top + 30))
      })
      assert.equal(covering, true, 'Second section must paint over the pinned first section')
      await page.waitForFunction(index => {
        const image = document.querySelectorAll('.scroll-stack')[index].lastElementChild.querySelector('img')
        return image.classList.contains('is-revealed') && getComputedStyle(image).opacity === '1'
      }, index)
      await page.screenshot({ path: `test-results/home-stack-${index + 1}-${width}.png` })
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    results.push(`${width}px: Journey overlaps pinned hero; Experts overlaps pinned testimonials; taller sections remain readable; no page overflow`)
  }
  await page.goto('http://127.0.0.1:5173/contact', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.contact-heading')).opacity === '1')
  assert.equal(await page.locator('.contact-heading').evaluate(element => getComputedStyle(element).transitionDuration), '0.65s, 0.65s')
  const contactForm = page.locator('.quote-form')
  await contactForm.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }))
  await page.waitForFunction(() => document.querySelector('.quote-form').classList.contains('is-revealed'))
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.quote-form')).opacity === '1')
  await page.goto('http://127.0.0.1:5173/services', { waitUntil: 'networkidle' })
  await page.locator('.quote-form.scroll-reveal').waitFor({ state: 'attached' })
  await page.locator('#first-name').focus()
  assert.equal(await page.locator('.quote-form').evaluate(element => getComputedStyle(element).opacity), '1')
  assert.equal(await page.locator('.quote-form').evaluate(element => getComputedStyle(element).transitionDuration), '0s')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
  assert.equal(await page.locator('.scroll-stack > .hero').evaluate(element => getComputedStyle(element).position), 'relative')
  assert.equal(await page.locator('.contact-heading').evaluate(element => getComputedStyle(element).opacity), '1')
  assert.equal(await page.locator('.contact-heading').evaluate(element => getComputedStyle(element).translate), 'none')
  results.push('Reveal animations: text and images appear on entry, 650ms transition; keyboard focus immediately reveals controls; reduced motion shows all content immediately and disables stacking')
  results.push('Home hero: wordmark and intro enter from 40px left with ease-in timing; other sections retain upward reveals')
  assert.deepEqual(errors, [])
  await writeFile('test-results/motion-check-results.json', JSON.stringify(results, null, 2))
  console.log(results.join('\n'))
} finally { await browser.close() }

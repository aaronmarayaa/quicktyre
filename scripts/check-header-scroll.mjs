import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const results = []
const errors = []

try {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  const header = page.locator('.site-header')
  const scroll = async y => {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  }
  const hidden = async expected => {
    await page.waitForFunction(expected => {
      const element = document.querySelector('.site-header')
      const bounds = element.getBoundingClientRect()
      return element.classList.contains('is-hidden') === expected && (expected ? bounds.bottom <= 0 : Math.abs(bounds.y) < 1)
    }, expected)
    const bounds = await header.boundingBox()
    assert.ok(expected ? bounds.y + bounds.height <= 0 : Math.abs(bounds.y) < 1, `Header position does not match hidden=${expected}`)
  }

  for (const width of [1896, 1440, 390]) {
    await page.setViewportSize({ width, height: 951 })
    for (const route of ['/', '/services', '/our-works']) {
      await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      assert.equal(await header.count(), 1)
      await hidden(false)
      const midpoint = await page.evaluate(() => {
        const bounds = (document.querySelector('[data-header-second-section]') ?? document.getElementById('main').children[1]).getBoundingClientRect()
        return bounds.top + scrollY + bounds.height / 2
      })
      const headerHeight = await header.evaluate(element => element.offsetHeight)
      let previousOffset = 0
      for (const progress of [.25, .5, .75]) {
        await scroll(30 + (midpoint - 30) * progress)
        await page.waitForFunction(progress => {
          const header = document.querySelector('.site-header')
          return Math.abs(-header.getBoundingClientRect().y - (header.offsetHeight + 2) * progress) < 2
        }, progress)
        const bounds = await header.boundingBox()
        const offset = -bounds.y
        assert.ok(offset > previousOffset && offset < headerHeight, `${route} ${width}px at ${progress}: offset ${offset}, previous ${previousOffset}, height ${headerHeight}, midpoint ${midpoint}`)
        assert.ok(Math.abs(offset - (headerHeight + 2) * progress) < 2, 'Header movement must follow scroll distance')
        previousOffset = offset
      }
      assert.equal(await header.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(39, 39, 39)')
      assert.equal(await header.evaluate(element => getComputedStyle(element, '::before').backgroundImage), 'none')
      assert.equal(await header.evaluate(element => Math.round(element.getBoundingClientRect().width)), width)
      await scroll(Math.floor(midpoint))
      await hidden(true)
      await scroll(midpoint + 300)
      const downY = await page.evaluate(() => scrollY)
      await scroll(downY - 40)
      await page.waitForFunction(() => {
        const bounds = document.querySelector('.site-header').getBoundingClientRect()
        return bounds.y < 0 && bounds.bottom > 0
      })
      const returning = await header.boundingBox()
      assert.ok(returning.y < 0 && returning.y + returning.height > 0, 'Upward scrolling should progressively reveal the navbar')
      await scroll(downY - 200)
      await hidden(false)
      await scroll(downY + 100)
      await hidden(true)
      await page.keyboard.press('Tab')
      await header.locator(width > 800 ? '.header-logo' : '.mobile-menu-button').focus()
      await hidden(false)
      await scroll(downY + 300)
      await hidden(false)
      await page.evaluate(() => document.activeElement.blur())
      await scroll(downY + 600)
      await hidden(true)
      await scroll(downY + 400)
      await hidden(false)

      if (width === 390) {
        await page.getByRole('button', { name: 'Menu', exact: true }).click()
        await page.getByRole('navigation', { name: 'Mobile navigation' }).waitFor()
        await scroll(downY + 700)
        await hidden(false)
        await page.keyboard.press('Escape')
        assert.equal(await page.getByRole('dialog').count(), 0)
        assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement), true)
        results.push(`${route} ${width}px: menu stays usable while open; Escape restores focus`)
      }

      await page.evaluate(() => document.activeElement.blur())
      await scroll(0)
      await hidden(false)
      assert.equal(await header.evaluate(element => element.classList.contains('is-scrolled')), false)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      if (width === 1896 && route === '/services') {
        await scroll(midpoint + 300)
        await hidden(true)
        await scroll(midpoint + 100)
        await hidden(false)
        await header.locator('img').evaluate(image => image.decode())
        await header.screenshot({ path: 'test-results/scrolled-navbar-1896.png' })
        await page.screenshot({ path: 'test-results/scrolled-navbar-page-1896.png' })
      }
      results.push(`${route} ${width}px: full-width charcoal navbar; progressive upward movement at 25%, 50%, 75%; fully hidden halfway through second section; progressively returns over 160px upward travel; keyboard focus reveals and holds it; top restores photo style; no overflow`)
    }
  }
  await page.setViewportSize({ width: 1896, height: 951 })
  await page.goto('http://127.0.0.1:5173/contact', { waitUntil: 'networkidle' })
  const contactMidpoint = await page.locator('#contact').evaluate(element => {
    const bounds = element.getBoundingClientRect()
    return bounds.top + scrollY + bounds.height / 2
  })
  await scroll(Math.floor(contactMidpoint))
  await hidden(true)
  await scroll(contactMidpoint - 200)
  await hidden(false)
  assert.equal(await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Contact', exact: true }).getAttribute('aria-current'), 'page')
  results.push('/contact: navbar fully hidden halfway through form section, restores upward, Contact highlighted')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  assert.equal(await header.evaluate(element => getComputedStyle(element).transitionDuration), '0.36s, 0.3s')
  assert.equal(await header.evaluate(element => getComputedStyle(element, '::before').transitionDuration), '0.3s')
  await scroll(0)
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-header'), '::before').opacity === '0')
  await scroll(80)
  await page.waitForFunction(() => {
    const opacity = Number(getComputedStyle(document.querySelector('.site-header'), '::before').opacity)
    return opacity > 0 && opacity < 1
  })
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-header'), '::before').opacity === '1')
  await scroll(0)
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.site-header'), '::before').opacity === '0')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.ok(await header.evaluate(element => parseFloat(getComputedStyle(element).transitionDuration) < .001))
  results.push('Motion: 360ms eased slide; observed 300ms charcoal fade in and out; reduced-motion disables visible transitions')
  assert.deepEqual(errors, [])
  results.push('No browser runtime or console errors')
  await writeFile('test-results/header-scroll-check-results.json', JSON.stringify(results, null, 2))
  console.log(results.join('\n'))
} finally {
  await browser.close()
}

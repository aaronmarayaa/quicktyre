import assert from 'node:assert/strict'

export async function verifyForm(page, results, { contactPage = false } = {}) {
  const endpoint = 'https://formsubmit.co/ajax/quicktyreltd@gmail.com'
  const requests = []
  let release
  let response = { success: 'true' }
  let gate = new Promise(resolve => { release = resolve })
  const handler = async route => {
    requests.push(route.request().postDataJSON())
    await gate
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) })
  }
  await page.route(endpoint, handler)
  try {
    await page.locator('.quote-submit').click()
    assert.equal(await page.locator(contactPage ? '#email' : '#first-name').evaluate(input => input.validity.valueMissing), true)
    assert.equal(requests.length, 0)
    await page.getByLabel('First name', { exact: false }).fill('Test')
    await page.getByLabel('Last name', { exact: false }).fill('Customer')
    await page.getByLabel('Email', { exact: false }).fill('invalid')
    await page.locator('.quote-submit').click()
    assert.equal(await page.locator('#email').evaluate(input => input.validity.typeMismatch), true)
    assert.equal(await page.locator('#message').evaluate(input => input.required), false)
    assert.equal(await page.locator('label[for="message"]').innerText(), 'Message')
    results.push('Form validation: empty required fields and malformed email prevent network submission')
    await page.getByLabel('Email', { exact: false }).fill('test@example.com')
    await page.getByLabel('Phone', { exact: true }).fill('9175550123')
    await page.getByRole('button', { name: /^Phone country code:/ }).click()
    await page.getByRole('combobox', { name: 'Search countries' }).fill('Philippines')
    await page.keyboard.press('Enter')
    assert.equal(await page.locator('input[name="country"]').inputValue(), '+63')
    await page.getByLabel('Message', { exact: false }).fill('Please quote for mobile tire service.')
    const request = page.waitForRequest(endpoint)
    await page.locator('.quote-submit').click()
    await request
    await page.getByRole('button', { name: 'Sending...', exact: true }).waitFor()
    assert.equal(await page.locator('.quote-submit').isDisabled(), true)
    assert.equal(await page.locator('#email').isDisabled(), true)
    assert.equal(await page.locator('.quote-form').getAttribute('aria-busy'), 'true')
    assert.match(requests[0]._subject, /^QuickTyre request \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z [a-f0-9]{8}$/)
    assert.deepEqual(requests[0], {
      name: 'Test Customer', email: 'test@example.com', phone: '+63 9175550123', country: 'Philippines',
      message: 'Please quote for mobile tire service.', _subject: requests[0]._subject, _template: 'table', _honey: '',
    })
    release()
    await page.getByText('Thank you. Your request has been submitted.', { exact: true }).waitFor()
    assert.equal(await page.locator('#email').inputValue(), '')
    assert.equal(await page.locator('input[name="country"]').inputValue(), '+1')
    results.push('FormSubmit: correct recipient and complete payload; disabled controls during send; success acknowledgement and form reset; request intercepted without sending email')
    await page.getByLabel('First name', { exact: false }).fill('Retry')
    await page.getByLabel('Last name', { exact: false }).fill('Customer')
    await page.getByLabel('Email', { exact: false }).fill('retry@example.com')
    await page.getByLabel('Message', { exact: false }).fill('Keep these details on failure.')
    response = { success: false }
    gate = Promise.resolve()
    await page.locator('.quote-submit').click()
    await page.getByRole('alert').waitFor()
    assert.equal(await page.locator('#email').inputValue(), 'retry@example.com')
    assert.equal(await page.locator('#message').inputValue(), 'Keep these details on failure.')
    assert.equal(await page.getByRole('alert').getByRole('link', { name: 'quicktyreltd@gmail.com' }).getAttribute('href'), 'mailto:quicktyreltd@gmail.com')
    response = { success: true }
    await page.locator('.quote-submit').click()
    await page.getByText('Thank you. Your request has been submitted.', { exact: true }).waitFor()
    assert.equal(requests.length, 3)
    results.push('Submission failure: details retained, email/phone fallback shown, retry succeeds')
    await page.getByLabel('First name', { exact: false }).fill('No message')
    await page.getByLabel('Last name', { exact: false }).fill('Customer')
    await page.getByLabel('Email', { exact: false }).fill('blank-message@example.com')
    assert.equal(await page.locator('#message').inputValue(), '')
    const blankMessageResponse = page.waitForResponse(endpoint)
    await page.locator('.quote-submit').click()
    await blankMessageResponse
    await page.getByText('Thank you. Your request has been submitted.', { exact: true }).waitFor()
    assert.equal(requests.length, 4)
    assert.equal(requests[3].message, '')
    assert.equal(new Set(requests.map(request => request._subject)).size, requests.length)
    results.push('Optional Message: blank submission succeeds with an empty message payload and no automatic quote text')
    results.push('Each submission attempt sends a unique email subject so new requests can appear in separate Gmail conversations')
  } finally {
    release()
    await page.unroute(endpoint, handler)
  }
}

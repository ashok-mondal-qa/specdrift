import { expect, test } from '@playwright/test'
import { createRecorder } from 'pw-radar'

// pw-radar's own recipe for UI tests (from its README): a page.on('response') listener
// feeding its recorder. We pass the response field names too, so its
// "undeclared response field" rule has the best chance to spot the stale mock.
test('mocked UI test, recorded by pw-radar', async ({ page }) => {
  const rec = createRecorder({ outputDir: 'experiments/pw-radar/coverage-output' })
  page.on('response', async (res) => {
    const req = res.request()
    if (req.resourceType() !== 'fetch') return
    const body = await res.json()
    rec.record({
      method: req.method(),
      url: res.url(),
      status: res.status(),
      responseContentType: res.headers()['content-type'],
      // For a list, use the keys of the first item; for an object, its own keys.
      responseBodyKeys: Object.keys(Array.isArray(body) ? body[0] ?? {} : body),
    })
  })

  await page.route('**/api/users', (route) => route.fulfill({ json: [{ id: 1, name: 'Ada Lovelace' }] }))
  await page.route('**/api/users/1', (route) => route.fulfill({ json: { id: 1, name: 'Ada Lovelace' } }))
  // A second kind of drift: required fields missing and `id` sent as a string.
  await page.route('**/api/users/2', (route) => route.fulfill({ json: { id: '2' } }))
  await page.goto('/')
  await expect(page.getByRole('listitem')).toHaveText(['Ada Lovelace'])
  await page.evaluate(() => Promise.all([fetch('/api/users/1'), fetch('/api/users/2')]))
  await expect.poll(() => rec.size).toBe(3)
  rec.flush()
})

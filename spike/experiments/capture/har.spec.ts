import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

// Question: does Playwright's own HAR recording include responses that page.route fulfilled?
test('HAR includes fulfilled responses', async ({ browser }) => {
  // Saved next to the experiments so the TraceCov and Redocly checks can read it.
  const harPath = 'experiments/run.har'
  const context = await browser.newContext({ baseURL: 'http://localhost:3100', recordHar: { path: harPath, content: 'embed' } })
  const page = await context.newPage()
  await page.route('**/api/users', (route) => route.fulfill({ json: [{ id: 1, name: 'Ada Lovelace' }] }))
  await page.goto('/')
  await expect(page.getByRole('listitem')).toHaveText(['Ada Lovelace'])
  await context.close()

  const entries = JSON.parse(readFileSync(harPath, 'utf8')).log.entries
  const api = entries.filter((e: any) => e.request.url.includes('/api/'))
  console.log(JSON.stringify(api.map((e: any) => ({ url: e.request.url, status: e.response.status, body: e.response.content.text })), null, 2))
})

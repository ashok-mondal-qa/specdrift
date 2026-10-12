import { expect, test } from '@playwright/test'

// Question: can a fixture or listener see the body of a response that page.route fulfilled,
// and tell it apart from a response that came from the real server?
test('capture mocked and live responses', async ({ page }) => {
  const seen: { url: string; status: number; body: unknown; mocked: boolean }[] = []
  const mockedUrls = new Set<string>()

  page.on('response', async (res) => {
    if (res.request().resourceType() !== 'fetch') return
    seen.push({ url: res.url(), status: res.status(), body: await res.json(), mocked: mockedUrls.has(res.url()) })
  })

  // Mock only the list; the detail call goes to the real server.
  await page.route('**/api/users', (route) => {
    mockedUrls.add(route.request().url())
    return route.fulfill({ json: [{ id: 1, name: 'Ada Lovelace' }] })
  })

  await page.goto('/')
  await expect(page.getByRole('listitem')).toHaveText(['Ada Lovelace'])
  await page.evaluate(() => fetch('/api/users/2').then((r) => r.json()))
  await expect.poll(() => seen.length).toBe(2)

  console.log(JSON.stringify(seen, null, 2))
})

import { test } from '@tracecov/playwright'
import { expect } from '@playwright/test'

// TraceCov's documented setup (swap the test import, add the reporter) on a mocked UI test.
// Its fixture wraps the `request` fixture, so browser traffic from `page` is not seen.
test('mocked UI test, with the TraceCov fixture', async ({ page }) => {
  await page.route('**/api/users', (route) => route.fulfill({ json: [{ id: 1, name: 'Ada Lovelace' }] }))
  await page.goto('/')
  await expect(page.getByRole('listitem')).toHaveText(['Ada Lovelace'])
})

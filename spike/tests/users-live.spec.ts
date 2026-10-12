import { expect, test } from '@playwright/test'

// The same page against the real backend. Two rows appear, so a count check passes,
// but the names render as "undefined": the drift the mocked test hides.
test('shows the user list (real API)', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('listitem')).toHaveCount(2)
})

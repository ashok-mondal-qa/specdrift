import { expect, test } from '@playwright/test'

// The kind of test specdrift is about: the API is mocked with an old response shape.
// It passes, even though the real backend no longer sends `name`.
test('shows the user list (mocked API)', async ({ page }) => {
  await page.route('**/api/users', (route) =>
    route.fulfill({ json: [{ id: 1, name: 'Ada Lovelace' }, { id: 2, name: 'Alan Turing' }] }),
  )
  await page.goto('/')
  await expect(page.getByRole('listitem')).toHaveText(['Ada Lovelace', 'Alan Turing'])
})

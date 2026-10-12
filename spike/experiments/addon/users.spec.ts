import { expect, test } from './fixture'

test('shows the user list (mocked API)', async ({ page }) => {
  await page.route('**/api/users', (route) =>
    route.fulfill({ json: [{ id: 1, name: 'Ada Lovelace' }, { id: 2, name: 'Alan Turing' }] }),
  )
  await page.goto('/')
  await expect(page.getByRole('listitem')).toHaveText(['Ada Lovelace', 'Alan Turing'])
})

test('shows the user list (real API)', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('listitem')).toHaveCount(2)
})

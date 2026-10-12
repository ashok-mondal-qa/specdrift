import { test as base } from '@playwright/test'

// Prototype of the add-on's Playwright part: every test gets its own HAR file,
// named after the test, in specdrift-results/. Nothing else in the test changes.
export const test = base.extend({
  context: async ({ browser, baseURL }, use, testInfo) => {
    const name = testInfo.titlePath.slice(1).join(' > ').replace(/[^\w-]+/g, '_')
    const context = await browser.newContext({
      baseURL,
      recordHar: { path: `specdrift-results/${name}.har`, content: 'embed' },
    })
    await use(context)
    await context.close() // the HAR is written on close
  },
})
export { expect } from '@playwright/test'

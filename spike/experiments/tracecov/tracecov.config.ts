import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  testMatch: 'ui.spec.ts',
  use: { baseURL: 'http://localhost:3100' },
  webServer: { command: 'node ../../app/server.mjs', url: 'http://localhost:3100', reuseExistingServer: true },
  reporter: [
    ['list'],
    ['@tracecov/playwright/reporter', { schema: '../../openapi.json', report: { markdown: 'coverage.md' } }],
  ],
})

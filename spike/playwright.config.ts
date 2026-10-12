import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  use: { baseURL: 'http://localhost:3100' },
  webServer: { command: 'node app/server.mjs', url: 'http://localhost:3100', reuseExistingServer: true },
})

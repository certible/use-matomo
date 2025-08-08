import { defineConfig } from 'vitest/config'
/// <reference types="@vitest/browser/providers/playwright" />
export default defineConfig({
  test: {
    browser: {
      provider: 'playwright',
      enabled: true,
      name: 'chromium',
    },
  }
})
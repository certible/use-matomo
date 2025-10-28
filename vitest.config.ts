import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

/// <reference types="@vitest/browser/providers/playwright" />
export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      screenshotFailures: false,
      instances: [
        { name: 'chromium', browser: 'chromium' },
      ],
    },
  }
})
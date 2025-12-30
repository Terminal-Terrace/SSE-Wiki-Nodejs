import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 30000, // 30 seconds for MongoDB connection
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 75,
      functions: 75,
      branches: 70,
    },
  },
})

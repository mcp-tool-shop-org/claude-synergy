import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    exclude: ['test/smoke/**', 'node_modules/**'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        // Covered by integration tests instead of unit
        'src/cli.ts',
        'src/mcp-server.ts',
        // Paid providers — shape-only tests; no real network paths
        'src/providers/context/claude-haiku.ts',
        'src/providers/embedding/voyage.ts',
        'src/providers/rerank/voyage.ts',
        'src/providers/rerank/cohere.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80,
      },
    },
  },
});

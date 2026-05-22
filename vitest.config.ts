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
    // cheerio is a hybrid CJS/ESM package that Vite's SSR transformer chokes on
    // (especially under coverage instrumentation). Externalize so Node loads it directly.
    server: {
      deps: {
        external: ['cheerio'],
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
        // Tier 4b fetch strategies — RSS / raw markdown / HTML scrape against
        // live external feeds. Test against real feeds would burn budget and
        // network; same reason paid providers are shape-only.
        // The gh-releases path inside fetch.ts is covered.
        'src/fetch-rss.ts',
        'src/fetch-changelog.ts',
        'src/fetch-html.ts',
        // Interface-only declaration file (no executable code)
        'src/providers/types.ts',
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

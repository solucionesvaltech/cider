/**
 * Jest configuration for the Cider Angular app.
 *
 * Replaces the Karma + Chrome runner so unit tests execute on jsdom
 * with no browser — they run in CI and in the sandboxed dev
 * container alike. Real-browser coverage lives in the Playwright
 * E2E suite (see playwright.config.ts).
 */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // Transpile-only: keeps the runner fast and decoupled from
  // pre-existing type sloppiness in CLI-generated stub specs.
  // App-code type safety is still enforced by `ng build`.
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        isolatedModules: true
      }
    ]
  },
  // Only unit specs under src/ — keeps the Playwright e2e/ specs out.
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/e2e/'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  // ESM-only packages that a spec may pull in transitively and that
  // Jest must transpile rather than skip as node_modules.
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|swiper|ssr-window|dom7|@swimlane|d3-.*|internmap|delaunator|robust-predicates|mime-wrapper)'
  ]
};

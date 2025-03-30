export default {
  // Core configuration
  testEnvironment: "jsdom",
  verbose: true,

  // Path configurations
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/test/",
    "/test/performance/",
  ],
  moduleDirectories: ["node_modules", "src"],

  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/index.js",
    "!src/**/*.d.ts",
    "!src/**/*.min.js",
  ],
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "test/coverage",
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },

  // File transformations
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  // Test patterns
  testMatch: ["<rootDir>/test/**/*.test.js"],

  // Custom setup
  setupFilesAfterEnv: ["<rootDir>/test/setup/jest.setup.js"],

  // Display settings
  displayName: {
    name: "Eleva.js",
    color: "cyan",
  },

  // Improve test output
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./test/reports",
        filename: "report.html",
        pageTitle: "Eleva.js Test Report",
        enableMergeData: true,
        enableSkipTestButton: true,
      },
    ],
  ],

  // Performance tuning
  maxWorkers: "80%",

  // Add timeouts for tests that might hang
  testTimeout: 10000,

  // Enable watch plugins
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  // Automatically clear mock calls between every test
  clearMocks: true,

  // Automatically restore mocks between tests
  restoreMocks: true,

  // // Module name mapping for package imports
  // // Uncomment this section unless any of the following applies:
  // // 1. Test the built package instead of source files
  // // 2. Use "import from 'eleva'" syntax in tests instead of relative paths
  // // 3. Test code that imports eleva as a dependency
  // moduleNameMapper: {
  //   "^eleva$": "<rootDir>/dist/eleva.esm.js",
  // },

  // // Enable more verbose test output during debugging
  // // Comment out when not needed
  // bail: true, // Stop running tests after the first failure
  // notify: true, // Show desktop notifications for test results

  // Configure how tests are run in sequence or parallel
  maxConcurrency: 5, // Maximum number of tests running concurrently
};

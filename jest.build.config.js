export default {
  // Core configuration
  testEnvironment: "jsdom",
  verbose: true,

  // Path configurations
  testPathIgnorePatterns: ["/node_modules/", "/source/"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/",
    "/test/",
    "/test/source/",
    "/test/build/performance/",
    ".*/performance/.*",
    ".*\\.performance\\.js$",
    ".*\\.perf\\.js$",
  ],
  moduleDirectories: ["node_modules", "dist"],

  // Coverage settings
  collectCoverageFrom: [
    "dist/*.esm.js",
    "dist/*.umd.js",
    "dist/*.min.js",
    "!dist/*.d.ts",
    "!dist/*.map",
  ],
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "test/build/coverage",
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
  testMatch: ["<rootDir>/test/build/**/*.test.js"],

  // Custom setup
  setupFilesAfterEnv: ["<rootDir>/test/build/setup/jest.setup.js"],

  // Source map support for better error reporting
  setupFiles: ["source-map-support/register"],

  // Display settings
  displayName: {
    name: "Eleva.js (Build)",
    color: "cyan",
  },

  // Improve test output
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./test/build/reports",
        filename: "report.html",
        pageTitle: "Eleva.js Build Test Report",
        enableMergeData: true,
        enableSkipTestButton: true,
      },
    ],
  ],

  // Performance tuning
  maxWorkers: "80%",

  // Timeouts for tests that might hang
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

  // Configure how tests are run in sequence or parallel
  maxConcurrency: 5, // Maximum number of tests running concurrently
};

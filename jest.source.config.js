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
    "/test/build/",
    "/test/source/performance/",
    ".*/performance/.*",
    ".*\\.performance\\.js$",
    ".*\\.perf\\.js$",
  ],
  moduleDirectories: ["node_modules", "src"],

  // Coverage settings
  collectCoverageFrom: [
    "src/*.js",
    "src/**/*.js",
    "!src/**/index.js",
    "!src/**/*.d.ts",
    "!src/**/*.min.js",
  ],
  collectCoverage: true,
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "test/source/coverage",
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
  testMatch: ["<rootDir>/test/source/**/*.test.js"],

  // Custom setup
  setupFilesAfterEnv: ["<rootDir>/test/source/setup/jest.setup.js"],

  // Display settings
  displayName: {
    name: "Eleva.js (Source)",
    color: "yellow",
  },

  // Test output
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./test/source/reports",
        filename: "report.html",
        pageTitle: "Eleva.js Source Test Report",
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

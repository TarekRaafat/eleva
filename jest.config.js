export default {
  testEnvironment: "jsdom",
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["**/test/**/*.test.js"],
  moduleNameMapper: {
    "^eleva$": "<rootDir>/dist/eleva.esm.js",
  },
};

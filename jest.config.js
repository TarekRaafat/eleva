module.exports = {
  testEnvironment: "jsdom",
  verbose: true,
  collectCoverage: true,
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["**/test/**/*.test.js"],
  moduleNameMapper: {
    "^eleva$": "<rootDir>/dist/eleva.esm.js",
  },
};

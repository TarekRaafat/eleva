/**
 * Source code test setup
 */

// Import the source code directly
import Eleva from "../../../src/index.js";

// Make it available globally for tests
window.Eleva = Eleva;

// Add any global mocks or configurations specific to source tests
beforeAll(() => {
  // Setup code that runs before all tests
  // Add any global setup needed for source tests
});

afterAll(() => {
  // Cleanup code that runs after all tests
  // Add any global cleanup needed for source tests
});

// Add any global test utilities
global.performance = window.performance;
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        `Expected ${received} to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },
});

// Global setup before tests
beforeEach(() => {
  // Reset the DOM for each test
  document.body.innerHTML = "";

  // Use fake timers if needed
  // jest.useFakeTimers();
});

// Global teardown after tests
afterEach(() => {
  // Cleanup DOM
  document.body.innerHTML = "";

  // Reset timers if using fake timers
  // jest.useRealTimers();
});

// Global mock objects if needed
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

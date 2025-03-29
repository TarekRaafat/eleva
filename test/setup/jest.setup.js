/**
 * Jest setup file - runs before each test file
 */

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () => `Expected ${received} to be within range ${floor} - ${ceiling}`,
      pass
    };
  },
});

// Global setup before tests
beforeEach(() => {
  // Reset the DOM for each test
  document.body.innerHTML = '';
  
  // Use fake timers if needed
  // jest.useFakeTimers();
});

// Global teardown after tests
afterEach(() => {
  // Cleanup DOM
  document.body.innerHTML = '';
  
  // Reset timers if using fake timers
  // jest.useRealTimers();
});

// Global mock objects if needed
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};
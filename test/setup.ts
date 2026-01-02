/**
 * Bun test setup file for Eleva.js
 *
 * This file is preloaded before all tests run.
 * It sets up the DOM environment and global utilities.
 */

import { beforeAll, afterAll, beforeEach, afterEach, expect } from "bun:test";

// Check if we're in a browser-like environment
const hasDOM = typeof document !== "undefined";

// Setup happy-dom for Node/Bun environment
if (!hasDOM) {
  const { GlobalRegistrator } = await import("@happy-dom/global-registrator");
  GlobalRegistrator.register();
}

// Dynamically import Eleva after DOM is available
const ElevaModule = await import("../src/index.js");
const Eleva = ElevaModule.default;

// Make Eleva available globally for tests
declare global {
  interface Window {
    Eleva: typeof Eleva;
  }
  var Eleva: typeof Eleva;
}

globalThis.Eleva = Eleva;

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () =>
        `Expected ${received} to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },
});

// Global setup before all tests
beforeAll(() => {
  // Setup code that runs before all tests
});

// Global teardown after all tests
afterAll(() => {
  // Cleanup code that runs after all tests
});

// Global setup before each test
beforeEach(() => {
  // Reset the DOM for each test
  if (typeof document !== "undefined") {
    document.body.innerHTML = "";
  }
});

// Global teardown after each test
afterEach(() => {
  // Cleanup DOM
  if (typeof document !== "undefined") {
    document.body.innerHTML = "";
  }
});

// Mock MutationObserver if not available
if (typeof MutationObserver === "undefined") {
  (globalThis as any).MutationObserver = class {
    constructor(callback: MutationCallback) {}
    disconnect() {}
    observe(element: Node, initObject: MutationObserverInit) {}
    takeRecords(): MutationRecord[] {
      return [];
    }
  };
}

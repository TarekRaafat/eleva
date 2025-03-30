/**
 * Performance tests for framework loading time
 * These tests measure the time taken to load and initialize the framework
 */

import {
  measurePerformance,
  measureMultipleRuns,
  logPerformanceMetrics,
} from "./helpers";

describe("Eleva.js Load Time Performance", () => {
  beforeEach(() => {
    // Clear any existing instances
    window.Eleva = undefined;
  });

  test("should load framework within performance budget", () => {
    const { duration } = measurePerformance(() => {
      window.Eleva = require("../../../dist/eleva.min.js");
    });

    console.log(`Framework load time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100);
  });

  test("should initialize basic component within performance budget", () => {
    const { duration } = measurePerformance(() => {
      window.Eleva = require("../../../dist/eleva.min.js");

      document.body.innerHTML = `<div id="app"></div>`;
      const appContainer = document.getElementById("app");

      const app = new window.Eleva("TestApp");

      app.component("test-component", {
        template: () => "<div>Test</div>",
      });

      app.mount(appContainer, "test-component");
    });

    console.log(`Component initialization time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(50);
  });

  test("should handle multiple component initializations efficiently", () => {
    const { duration } = measurePerformance(() => {
      window.Eleva = require("../../../dist/eleva.min.js");

      document.body.innerHTML = `<div id="app"></div>`;

      const app = new window.Eleva("TestApp");

      Array(10)
        .fill(null)
        .map((_, i) =>
          app.component(`test-component-${i}`, {
            template: () => "<div>Test</div>",
          })
        );
    });

    console.log(
      `Multiple component initialization time: ${duration.toFixed(2)}ms`
    );
    expect(duration).toBeLessThan(200);
  });

  test("should maintain consistent load time across multiple runs", () => {
    const metrics = measureMultipleRuns(() => {
      window.Eleva = undefined;
      window.Eleva = require("../../../dist/eleva.min.js");
    });

    logPerformanceMetrics(metrics);

    // Assert that standard deviation is less than 20% of average
    expect(metrics.stdDev).toBeLessThan(metrics.average * 0.8);
  });

  test("should measure cold vs warm load times", () => {
    // Cold load (first time)
    const coldMetrics = measureMultipleRuns(() => {
      window.Eleva = undefined;
      window.Eleva = require("../../../dist/eleva.min.js");
    }, 3);

    // Warm load (subsequent times)
    const warmMetrics = measureMultipleRuns(() => {
      window.Eleva = require("../../../dist/eleva.min.js");
    }, 3);

    console.log("\nCold Load Metrics:");
    logPerformanceMetrics(coldMetrics);
    console.log("\nWarm Load Metrics:");
    logPerformanceMetrics(warmMetrics);

    // Warm load should be significantly faster than cold load
    expect(warmMetrics.average).toBeLessThan(coldMetrics.average * 0.8);
  });
});

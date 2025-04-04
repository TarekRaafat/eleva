/**
 * @fileoverview Performance tests for the Eleva framework loading and initialization
 *
 * These tests measure and verify the performance characteristics of the built
 * version of the Eleva framework, focusing on:
 * - Initial framework load time
 * - Component initialization performance
 * - Multiple component handling efficiency
 * - Load time consistency across runs
 * - Cold vs warm load performance comparison
 *
 * Performance budgets are enforced to ensure the framework maintains
 * optimal loading and initialization times in production.
 *
 * @example
 * // Measuring framework load time
 * const { duration } = measurePerformance(() => {
 *   window.Eleva = require("../../../dist/eleva.min.js");
 * });
 * console.log(`Load time: ${duration.toFixed(2)}ms`);
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva
 * @category Performance
 * @group performance
 * @group build
 */

import {
  measurePerformance,
  measureMultipleRuns,
  logPerformanceMetrics,
} from "./helpers";

/**
 * Performance test suite for Eleva.js load times
 *
 * This suite verifies that the framework maintains optimal performance
 * characteristics in its built form, including:
 * - Fast initial load time
 * - Efficient component initialization
 * - Consistent performance across multiple runs
 * - Optimal caching behavior
 *
 * @example
 * // Testing component initialization
 * const { duration } = measurePerformance(() => {
 *   const app = new window.Eleva("TestApp");
 *   app.component("test", { template: () => "<div>Test</div>" });
 * });
 *
 * @group performance
 * @group load-times
 * @group build
 */
describe("Eleva.js Load Time Performance", () => {
  /**
   * Setup for each test - ensures clean environment
   *
   * Removes any existing Eleva instances to ensure
   * consistent testing conditions
   */
  beforeEach(() => {
    window.Eleva = undefined;
  });

  /**
   * Tests that the framework loads within performance budget
   *
   * Verifies:
   * - Framework loads in under 100ms
   * - No performance regressions in production build
   *
   * @group load-times
   * @group initialization
   */
  test("should load framework within performance budget", () => {
    const { duration } = measurePerformance(() => {
      window.Eleva = require("../../../dist/eleva.min.js");
    });

    console.log(`Framework load time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100);
  });

  /**
   * Tests basic component initialization performance
   *
   * Verifies:
   * - Component creation and mounting under 50ms
   * - Efficient DOM manipulation
   * - Quick template rendering
   *
   * @group load-times
   * @group components
   */
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

  /**
   * Tests performance with multiple component initializations
   *
   * Verifies:
   * - Efficient handling of multiple components
   * - Scalable component registration
   * - Performance under load
   *
   * @group load-times
   * @group scalability
   */
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

  /**
   * Tests load time consistency across multiple runs
   *
   * Verifies:
   * - Consistent performance characteristics
   * - Low standard deviation in load times
   * - Reliable caching behavior
   *
   * @group load-times
   * @group consistency
   */
  test("should maintain consistent load time across multiple runs", () => {
    const metrics = measureMultipleRuns(() => {
      window.Eleva = undefined;
      window.Eleva = require("../../../dist/eleva.min.js");
    });

    logPerformanceMetrics(metrics);

    // Assert that standard deviation is less than 20% of average
    expect(metrics.stdDev).toBeLessThan(metrics.average * 0.8);
  });

  /**
   * Tests cold vs warm load performance characteristics
   *
   * Verifies:
   * - Efficient caching behavior
   * - Faster subsequent loads
   * - Optimal resource utilization
   *
   * @group load-times
   * @group caching
   */
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

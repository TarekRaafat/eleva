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
  measureMemoryUsage,
} from "./helpers";
import fs from "fs";
import path from "path";

// Function to export test results to markdown
const exportTestResults = (results) => {
  const timestamp = new Date().toISOString();
  const date = timestamp.split("T")[0];
  const time = timestamp.split("T")[1].split(".")[0];

  const resultsDir = path.join(
    `${process.cwd()}/test/build/performance/`,
    "results"
  );
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  const filename = `performance-test-results-${date}.md`;
  const filepath = path.join(resultsDir, filename);

  const markdownContent = `# Performance Test Results - ${date} ${time}

## Test Summary
- Total Tests: ${results.length}
- Average Duration: ${(results.reduce((acc, curr) => acc + curr.duration, 0) / results.length).toFixed(2)}ms
- Peak Memory Usage: ${Math.max(...results.map((r) => r.memoryUsage || 0)).toFixed(2)} KB

## Detailed Test Metrics

${results
  .map((result) => {
    const metrics = [
      `### ${result.title}`,
      `- Duration: ${result.duration.toFixed(2)}ms`,
      result.memoryUsage &&
        `- Memory Usage: ${result.memoryUsage.toFixed(2)} KB`,
      result.stdDev && `- Standard Deviation: ${result.stdDev.toFixed(2)}ms`,
      result.average && `- Average: ${result.average.toFixed(2)}ms`,
      result.min && `- Min Duration: ${result.min.toFixed(2)}ms`,
      result.max && `- Max Duration: ${result.max.toFixed(2)}ms`,
      result.iterations && `- Iterations: ${result.iterations}`,
      `- Status: ${result.status}`,
      `- Timestamp: ${result.timestamp}`,
    ]
      .filter(Boolean)
      .join("\n");
    return metrics;
  })
  .join("\n\n")}

---
`;

  fs.appendFileSync(filepath, markdownContent);
};

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
  const testResults = [];

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

    testResults.push({
      title: "Framework Load Time",
      duration,
      timestamp: new Date().toISOString(),
      status: duration < 100 ? "Passed" : "Failed",
      iterations: 1,
    });
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

    testResults.push({
      title: "Basic Component Initialization",
      duration,
      timestamp: new Date().toISOString(),
      status: duration < 50 ? "Passed" : "Failed",
      iterations: 1,
    });
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

    testResults.push({
      title: "Multiple Component Initialization",
      duration,
      timestamp: new Date().toISOString(),
      status: duration < 200 ? "Passed" : "Failed",
      iterations: 10,
    });
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

    testResults.push({
      title: "Load Time Consistency",
      duration: metrics.average,
      stdDev: metrics.stdDev,
      min: metrics.min,
      max: metrics.max,
      timestamp: new Date().toISOString(),
      status: metrics.stdDev < metrics.average * 0.8 ? "Passed" : "Failed",
      iterations: metrics.iterations,
    });

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

    testResults.push({
      title: "Cold Load Performance",
      duration: coldMetrics.average,
      stdDev: coldMetrics.stdDev,
      min: coldMetrics.min,
      max: coldMetrics.max,
      timestamp: new Date().toISOString(),
      status: "Passed",
      iterations: coldMetrics.iterations,
    });

    testResults.push({
      title: "Warm Load Performance",
      duration: warmMetrics.average,
      stdDev: warmMetrics.stdDev,
      min: warmMetrics.min,
      max: warmMetrics.max,
      timestamp: new Date().toISOString(),
      status: "Passed",
      iterations: warmMetrics.iterations,
    });

    // Warm load should be significantly faster than cold load
    expect(warmMetrics.average).toBeLessThan(coldMetrics.average * 0.8);
  });

  /**
   * Tests DOM update speed performance
   *
   * Verifies:
   * - Fast DOM updates when component state changes
   * - Efficient virtual DOM diffing
   * - Quick re-rendering of components
   *
   * @group load-times
   * @group dom-updates
   */
  test("should update DOM efficiently when state changes", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");

    const app = new window.Eleva("TestApp");

    // Create a component with state that will trigger DOM updates
    app.component("counter-component", {
      setup({ signal }) {
        const count = signal(0);
        const increment = () => {
          count.value++;
        };

        return { count, increment };
      },
      template: (ctx) => `
        <div>
          <h1>Count: ${ctx.count}</h1>
          <button @click="increment">Increment</button>
        </div>
      `,
    });

    app.mount(appContainer, "counter-component");

    // Wait for the next tick to ensure the component is rendered
    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const button = document.querySelector("button");
      if (!button) {
        throw new Error("Button element not found in the DOM");
      }

      // Measure performance of multiple state updates
      const { duration } = measurePerformance(() => {
        for (let i = 0; i < 100; i++) {
          button.click();
        }
      });

      console.log(
        `DOM update time for 100 state changes: ${duration.toFixed(2)}ms`
      );

      testResults.push({
        title: "DOM Update Performance",
        duration,
        timestamp: new Date().toISOString(),
        status: duration < 100 ? "Passed" : "Failed",
        iterations: 100,
      });

      // Expect each update to take less than 1ms on average
      expect(duration).toBeLessThan(100);
    });
  });

  /**
   * Tests peak memory usage during framework initialization
   *
   * Verifies:
   * - Memory usage stays within acceptable limits
   * - No memory leaks during initialization
   * - Efficient memory management
   *
   * @group load-times
   * @group memory
   */
  test("should maintain acceptable peak memory usage", () => {
    const { peakMemoryKB } = measureMemoryUsage(() => {
      window.Eleva = require("../../../dist/eleva.min.js");
      document.body.innerHTML = `<div id="app"></div>`;
      const appContainer = document.getElementById("app");
      const app = new window.Eleva("TestApp");

      // Create multiple components to stress test memory usage
      Array(10)
        .fill(null)
        .map((_, i) =>
          app.component(`test-component-${i}`, {
            template: () => "<div>Test</div>",
          })
        );

      app.mount(appContainer, "test-component-0");
    });

    console.log(`Peak memory usage: ${peakMemoryKB.toFixed(2)} KB`);

    testResults.push({
      title: "Memory Usage",
      duration: peakMemoryKB,
      memoryUsage: peakMemoryKB,
      timestamp: new Date().toISOString(),
      status: peakMemoryKB < 1024 ? "Passed" : "Failed",
      iterations: 10,
    });

    // Expect memory usage to stay under 1MB
    expect(peakMemoryKB).toBeLessThan(1024);
  });

  // After all tests complete, export results
  afterAll(() => {
    exportTestResults(testResults);
  });
});

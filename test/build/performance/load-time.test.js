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
  const timestamp = new Date();
  const isoDate = timestamp.toISOString();
  const date = isoDate.split("T")[0];

  const resultsDir = path.join(
    `${process.cwd()}/test/build/performance/`,
    "results"
  );
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  // Get version from package.json
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8")
  );
  const version = packageJson.version;

  const filename = `performance-test-results-${date}.md`;
  const filepath = path.join(resultsDir, filename);

  const formattedDate = timestamp.toLocaleDateString("en-GB");
  const formattedTime = timestamp.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  const markdownContent = `# Performance Test Results [v${version}]

  > Timestamp: ${formattedDate} (${formattedTime})

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

  /**
   * Tests reactive state update batching performance
   *
   * Verifies:
   * - Efficient batching of multiple state updates
   * - Reactive system performance under load
   * - Update propagation speed
   *
   * @group performance
   * @group reactivity
   */
  test("should batch reactive updates efficiently", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    app.component("reactive-test", {
      setup({ signal }) {
        const items = signal(Array(1000).fill(0));
        const total = () => items.value.reduce((a, b) => a + b, 0);

        const updateAll = () => {
          // Batch update all items
          items.value = items.value.map(() => Math.random());
        };

        return { items, total, updateAll };
      },
      template: (ctx) => `
        <div>
          <div>Total: ${ctx.total}</div>
          <button @click="updateAll">Update All</button>
        </div>
      `,
    });

    app.mount(appContainer, "reactive-test");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const button = document.querySelector("button");

      const { duration } = measurePerformance(() => {
        button.click();
      });

      console.log(`Batch update time for 1000 items: ${duration.toFixed(2)}ms`);

      testResults.push({
        title: "Reactive Batch Updates",
        duration,
        timestamp: new Date().toISOString(),
        status: duration < 50 ? "Passed" : "Failed",
        iterations: 1000,
      });

      expect(duration).toBeLessThan(50);
    });
  });

  /**
   * Tests lifecycle hooks performance
   *
   * Verifies:
   * - Fast lifecycle hook execution
   * - Efficient hook scheduling
   * - Hook cleanup performance
   *
   * @group performance
   * @group lifecycle
   */
  test("should execute lifecycle hooks efficiently", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    const { duration } = measurePerformance(async () => {
      app.component("lifecycle-test", {
        setup() {
          return {
            onMount: () => {
              console.log("Mounted");
            },
            onUpdate: () => {
              console.log("Updated");
            },
            onUnmount: () => {
              console.log("Unmounted");
            },
          };
        },
        template: () => "<div>Lifecycle Test</div>",
      });

      // Mount and unmount component multiple times
      for (let i = 0; i < 100; i++) {
        const mounted = await app.mount(appContainer, "lifecycle-test");
        mounted.unmount();
      }
    });

    console.log(`Lifecycle hooks execution time: ${duration.toFixed(2)}ms`);

    testResults.push({
      title: "Lifecycle Hooks Performance",
      duration,
      timestamp: new Date().toISOString(),
      status: duration < 200 ? "Passed" : "Failed",
      iterations: 100,
    });

    expect(duration).toBeLessThan(200);
  });

  /**
   * Tests nested components rendering performance
   *
   * Verifies:
   * - Efficient component composition
   * - Fast prop updates in deep trees
   * - Optimal re-rendering of nested structures
   *
   * @group performance
   * @group composition
   */
  test("should render nested components efficiently", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    // Create a deeply nested component structure
    app.component("leaf-component", {
      setup({ props }) {
        return { value: props.value };
      },
      template: (ctx) => `<div>Value: ${ctx.value}</div>`,
    });

    app.component("branch-component", {
      setup({ props }) {
        return { value: props.value };
      },
      template: (ctx) => `
        <div>
          <leaf-component value="${ctx.value * 2}"></leaf-component>
          <leaf-component value="${ctx.value * 3}"></leaf-component>
        </div>
      `,
    });

    app.component("tree-root", {
      setup({ signal }) {
        const rootValue = signal(1);
        const updateValue = () => {
          rootValue.value = Math.random() * 100;
        };
        return { rootValue, updateValue };
      },
      template: (ctx) => `
        <div>
          <button @click="updateValue">Update Tree</button>
          <branch-component value="${ctx.rootValue}"></branch-component>
          <branch-component value="${ctx.rootValue * 2}"></branch-component>
        </div>
      `,
    });

    app.mount(appContainer, "tree-root");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const button = document.querySelector("button");

      const { duration } = measurePerformance(() => {
        // Update tree 100 times
        for (let i = 0; i < 100; i++) {
          button.click();
        }
      });

      console.log(`Nested components update time: ${duration.toFixed(2)}ms`);

      testResults.push({
        title: "Nested Components Performance",
        duration,
        timestamp: new Date().toISOString(),
        status: duration < 200 ? "Passed" : "Failed",
        iterations: 100,
      });

      expect(duration).toBeLessThan(200);
    });
  });

  /**
   * Tests event handling performance
   *
   * Verifies:
   * - Fast event listener attachment
   * - Efficient event propagation
   * - Event handler execution speed
   *
   * @group performance
   * @group events
   */
  test("should handle events efficiently", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    app.component("event-test", {
      setup() {
        let counter = 0;
        const handleClick = () => {
          counter++;
        };
        return { handleClick };
      },
      template: () => `
        <div>
          ${Array(100)
            .fill(0)
            .map(() => '<button @click="handleClick">Click</button>')
            .join("")}
        </div>
      `,
    });

    app.mount(appContainer, "event-test");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const buttons = document.querySelectorAll("button");

      const { duration } = measurePerformance(() => {
        buttons.forEach((button) => button.click());
      });

      console.log(
        `Event handling time for 100 events: ${duration.toFixed(2)}ms`
      );

      testResults.push({
        title: "Event Handling Performance",
        duration,
        timestamp: new Date().toISOString(),
        status: duration < 100 ? "Passed" : "Failed",
        iterations: 100,
      });

      expect(duration).toBeLessThan(100);
    });
  });

  /**
   * Tests complex template rendering performance
   *
   * Verifies:
   * - Efficient rendering of complex templates
   * - Fast template compilation
   * - Performance with nested conditionals and loops
   *
   * @group performance
   * @group templates
   */
  test("should render complex templates efficiently", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    app.component("complex-template", {
      setup({ signal }) {
        const data = signal({
          items: Array(100)
            .fill(0)
            .map((_, i) => ({
              id: i,
              name: `Item ${i}`,
              nested: {
                value: Math.random(),
                children: Array(5)
                  .fill(0)
                  .map((_, j) => ({
                    id: j,
                    value: Math.random(),
                  })),
              },
            })),
          showDetails: true,
          filter: "",
        });

        const updateData = () => {
          data.value = {
            ...data.value,
            items: data.value.items.map((item) => ({
              ...item,
              nested: {
                ...item.nested,
                value: Math.random(),
                children: item.nested.children.map((child) => ({
                  ...child,
                  value: Math.random(),
                })),
              },
            })),
          };
        };

        return { data, updateData };
      },
      template: (ctx) => `
        <div>
          <button @click="updateData">Update</button>
          <div class="items">
            ${ctx.data.value.items
              .map(
                (item) => `
              <div class="item">
                <h3>${item.name}</h3>
                ${
                  ctx.data.showDetails
                    ? `
                  <div class="details">
                    <p>Nested Value: ${item.nested.value}</p>
                    <ul>
                      ${item.nested.children
                        .map(
                          (child) => `
                        <li>Child ${child.id}: ${child.value}</li>
                      `
                        )
                        .join("")}
                    </ul>
                  </div>
                `
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `,
    });

    app.mount(appContainer, "complex-template");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const button = document.querySelector("button");

      const { duration } = measurePerformance(() => {
        button.click();
      });

      console.log(`Complex template update time: ${duration.toFixed(2)}ms`);

      testResults.push({
        title: "Complex Template Rendering",
        duration,
        timestamp: new Date().toISOString(),
        status: duration < 100 ? "Passed" : "Failed",
        iterations: 100,
      });

      expect(duration).toBeLessThan(100);
    });
  });

  /**
   * Tests directive performance
   *
   * Verifies:
   * - Fast directive execution
   * - Efficient directive binding
   * - Performance with multiple directives
   *
   * @group performance
   * @group directives
   */
  test("should execute directives efficiently", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    app.component("directive-test", {
      setup({ signal }) {
        const items = signal(
          Array(100)
            .fill(0)
            .map((_, i) => ({
              id: i,
              value: Math.random(),
              visible: true,
              class: `item-${i % 5}`,
            }))
        );

        const updateItems = () => {
          items.value = items.value.map((item) => ({
            ...item,
            value: Math.random(),
            visible: Math.random() > 0.5,
            class: `item-${Math.floor(Math.random() * 5)}`,
          }));
        };

        return { items, updateItems };
      },
      template: (ctx) => `
        <div>
          <button @click="updateItems">Update</button>
          <div class="items">
            ${ctx.items.value
              .map(
                (item) => `
              <div 
                class="${item.class}"
                style="display: ${item.visible ? "block" : "none"}"
                data-value="${item.value}"
                @mouseover="console.log('hover')"
                @click="console.log('click')"
              >
                Item ${item.id}: ${item.value}
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `,
    });

    app.mount(appContainer, "directive-test");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const button = document.querySelector("button");

      const { duration } = measurePerformance(() => {
        button.click();
      });

      console.log(`Directive execution time: ${duration.toFixed(2)}ms`);

      testResults.push({
        title: "Directive Performance",
        duration,
        timestamp: new Date().toISOString(),
        status: duration < 50 ? "Passed" : "Failed",
        iterations: 100,
      });

      expect(duration).toBeLessThan(50);
    });
  });

  /**
   * Tests component communication performance
   *
   * Verifies:
   * - Fast event emission
   * - Efficient event handling
   * - Performance with multiple event listeners
   *
   * @group performance
   * @group communication
   */
  test("should handle component communication efficiently", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    app.component("child-component", {
      setup({ emitter }) {
        const emitEvent = () => {
          emitter.emit("update", Math.random());
        };
        return { emitEvent };
      },
      template: () => `
        <button @click="emitEvent">Emit</button>
      `,
    });

    app.component("parent-component", {
      setup({ signal }) {
        const value = signal(0);
        const handleUpdate = (newValue) => {
          value.value = newValue;
        };
        return { value, handleUpdate };
      },
      template: (ctx) => `
        <div>
          <div>Value: ${ctx.value}</div>
          ${Array(10)
            .fill(0)
            .map(
              () => `
            <child-component @update="handleUpdate"></child-component>
          `
            )
            .join("")}
        </div>
      `,
    });

    app.mount(appContainer, "parent-component");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const buttons = document.querySelectorAll("button");

      const { duration } = measurePerformance(() => {
        buttons.forEach((button) => button.click());
      });

      console.log(`Component communication time: ${duration.toFixed(2)}ms`);

      testResults.push({
        title: "Component Communication",
        duration,
        timestamp: new Date().toISOString(),
        status: duration < 100 ? "Passed" : "Failed",
        iterations: 10,
      });

      expect(duration).toBeLessThan(100);
    });
  });

  /**
   * Tests async operation performance
   *
   * Verifies:
   * - Fast async operation handling
   * - Efficient promise resolution
   * - Performance with multiple async operations
   *
   * @group performance
   * @group async
   */
  test("should handle async operations efficiently", async () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    app.component("async-test", {
      setup({ signal }) {
        const loading = signal(false);
        const data = signal([]);

        const fetchData = async () => {
          loading.value = true;
          // Simulate async operation
          await new Promise((resolve) => setTimeout(resolve, 0));
          data.value = Array(100)
            .fill(0)
            .map((_, i) => ({
              id: i,
              value: Math.random(),
            }));
          loading.value = false;
        };

        return { loading, data, fetchData };
      },
      template: (ctx) => `
        <div>
          <button @click="fetchData">Fetch</button>
          ${
            ctx.loading.value
              ? "<div>Loading...</div>"
              : `
            <div class="data">
              ${ctx.data.value
                .map(
                  (item) => `
                <div>Item ${item.id}: ${item.value}</div>
              `
                )
                .join("")}
            </div>
          `
          }
        </div>
      `,
    });

    await app.mount(appContainer, "async-test");

    const button = document.querySelector("button");

    const { duration } = await measurePerformance(async () => {
      await button.click();
    });

    console.log(`Async operation time: ${duration.toFixed(2)}ms`);

    testResults.push({
      title: "Async Operations",
      duration,
      timestamp: new Date().toISOString(),
      status: duration < 200 ? "Passed" : "Failed",
      iterations: 1,
    });

    expect(duration).toBeLessThan(200);
  });

  /**
   * Tests large list rendering performance
   *
   * Verifies:
   * - Efficient rendering of large lists
   * - Fast list updates
   * - Performance with list filtering and sorting
   *
   * @group performance
   * @group lists
   */
  test("should render large lists efficiently", () => {
    window.Eleva = require("../../../dist/eleva.min.js");
    document.body.innerHTML = `<div id="app"></div>`;
    const appContainer = document.getElementById("app");
    const app = new window.Eleva("TestApp");

    app.component("large-list", {
      setup({ signal }) {
        const items = signal(
          Array(1000)
            .fill(0)
            .map((_, i) => ({
              id: i,
              name: `Item ${i}`,
              value: Math.random(),
              category: `Category ${i % 5}`,
            }))
        );

        const filter = signal("");
        const sortBy = signal("value");

        const updateItems = () => {
          items.value = items.value.map((item) => ({
            ...item,
            value: Math.random(),
          }));
        };

        const filteredItems = () => {
          const filtered = items.value.filter((item) =>
            item.name.includes(filter.value)
          );
          return filtered.sort((a, b) =>
            sortBy.value === "value" ? a.value - b.value : a.id - b.id
          );
        };

        return { items, filter, sortBy, updateItems, filteredItems };
      },
      template: (ctx) => `
        <div>
          <div class="controls">
            <input 
              type="text" 
              value="${ctx.filter}" 
              @input="e => filter.value = e.target.value"
              placeholder="Filter..."
            />
            <select value="${ctx.sortBy}" @change="e => sortBy.value = e.target.value">
              <option value="value">Sort by Value</option>
              <option value="id">Sort by ID</option>
            </select>
            <button @click="updateItems">Update</button>
          </div>
          <div class="list">
            ${ctx
              .filteredItems()
              .map(
                (item) => `
              <div class="item">
                <span>${item.name}</span>
                <span>${item.value.toFixed(2)}</span>
                <span>${item.category}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `,
    });

    app.mount(appContainer, "large-list");

    return new Promise((resolve) => setTimeout(resolve, 0)).then(() => {
      const button = document.querySelector("button");

      const { duration } = measurePerformance(() => {
        button.click();
      });

      console.log(`Large list update time: ${duration.toFixed(2)}ms`);

      testResults.push({
        title: "Large List Rendering",
        duration,
        timestamp: new Date().toISOString(),
        status: duration < 200 ? "Passed" : "Failed",
        iterations: 1000,
      });

      expect(duration).toBeLessThan(200);
    });
  });

  // After all tests complete, export results
  afterAll(() => {
    exportTestResults(testResults);
  });
});

/**
 * @fileoverview Performance tests for the core Eleva framework functionality
 *
 * These tests measure and verify the performance characteristics of the core Eleva framework,
 * including component mounting, rendering, state management, and lifecycle hooks.
 *
 * Performance metrics measured:
 * - Component mounting time
 * - Rendering performance with complex component trees
 * - State updates and reactivity performance
 * - Memory usage during component lifecycle
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/core/Eleva
 * @category Performance
 * @group core
 */

import { Eleva } from "../../src/core/Eleva.js";

/**
 * Test suite for measuring core Eleva framework performance characteristics
 *
 * @group performance
 * @group core
 */
describe("Eleva Core Performance", () => {
  let eleva;
  let container;

  beforeEach(() => {
    eleva = new Eleva("test");
    container = document.createElement("div");
  });

  /**
   * Tests the performance of mounting a complex component tree
   *
   * This test verifies that the framework maintains acceptable performance
   * when mounting a component tree with 100 nested components, each containing
   * multiple reactive signals and event handlers.
   *
   * Performance expectations:
   * - Should complete under 200ms on modern hardware
   * - Memory usage should be efficient
   * - Component tree should render correctly
   *
   * @performance
   * @benchmark
   */
  test("mounting complex component tree is fast", () => {
    // Create a recursive component definition
    const createNestedComponent = (depth, maxDepth) => {
      if (depth >= maxDepth) return null;

      return {
        setup: (ctx) => ({
          count: ctx.signal(0),
          items: ctx.signal(
            Array(10)
              .fill()
              .map((_, i) => ({ id: i, value: `Item ${i}` }))
          ),
        }),
        template: (ctx) => `
          <div class="nested-component depth-${depth}">
            <h3>Level ${depth}</h3>
            <p>Count: {{count}}</p>
            <button @click="count = count + 1">Increment</button>
            <ul>
              ${ctx.items.value
                .map(
                  (item) => `
                <li>${item}</li>
              `
                )
                .join("")}
            </ul>
            ${depth < maxDepth - 1 ? `<div class="child-component"></div>` : ""}
          </div>
        `,
        children:
          depth < maxDepth - 1
            ? {
                ".child-component": createNestedComponent(depth + 1, maxDepth),
              }
            : {},
      };
    };

    // Register the component
    eleva.component("nested", createNestedComponent(0, 5));

    // Measure mounting performance
    const start = performance.now();
    eleva.mount(container, "nested");
    const end = performance.now();

    // Log performance results
    console.log(
      `Complex component tree mounting time: ${(end - start).toFixed(2)}ms`
    );

    // Performance assertion
    expect(end - start).toBeLessThan(200); // Under 200ms
  });

  /**
   * Tests the performance of state updates and reactivity
   *
   * This test measures how efficiently the framework handles rapid state updates
   * and propagates changes through the component tree.
   *
   * Performance expectations:
   * - Should handle 1000 rapid updates under 500ms
   * - UI should remain responsive during updates
   * - Memory usage should remain stable
   *
   * @performance
   * @benchmark
   */
  test("handles rapid state updates efficiently", async () => {
    // Create a component with multiple reactive signals
    const component = {
      setup: (ctx) => ({
        counter1: ctx.signal(0),
        counter2: ctx.signal(0),
        items: ctx.signal(
          Array(100)
            .fill()
            .map((_, i) => ({ id: i, value: `Item ${i}` }))
        ),
      }),
      template: (ctx) => `
        <div class="reactive-test">
          <div>Counter 1: {{ctx.counter1.value}}</div>
          <div>Counter 2: {{ctx.counter2.value}}</div>
          <ul>
            ${ctx.items.value
              .map(
                (item) => `
              <li>${item.value}</li>
            `
              )
              .join("")}
          </ul>
        </div>
      `,
    };

    eleva.component("reactive", component);
    const instance = await eleva.mount(container, "reactive");

    // Measure update performance
    const start = performance.now();
    const updates = 1000;

    for (let i = 0; i < updates; i++) {
      instance.data.counter1.value = i;
      instance.data.counter2.value = updates - i;
      instance.data.items.value = instance.data.items.value.map((item) => ({
        ...item,
        value: `Updated ${i} - ${item.id}`,
      }));
    }

    const end = performance.now();
    console.log(`Rapid state updates time: ${(end - start).toFixed(2)}ms`);

    // Performance assertion
    expect(end - start).toBeLessThan(500); // Under 500ms
  });

  /**
   * Tests memory usage during component lifecycle
   *
   * This test verifies that the framework properly cleans up resources
   * and doesn't leak memory during component mounting and unmounting.
   *
   * Performance expectations:
   * - Memory usage should remain stable after multiple mount/unmount cycles
   * - No memory leaks should be detected
   *
   * @performance
   * @benchmark
   */
  test("maintains stable memory usage during lifecycle", async () => {
    const component = {
      setup: (ctx) => ({
        data: ctx.signal(
          Array(1000)
            .fill()
            .map((_, i) => ({ id: i, value: `Item ${i}` }))
        ),
      }),
      template: (ctx) => `
        <div class="memory-test">
          <ul>
            ${ctx.data.value
              .map(
                (item) => `
              <li>${item}</li>
            `
              )
              .join("")}
          </ul>
        </div>
      `,
    };

    eleva.component("memory", component);

    // Measure memory usage before mounting
    const initialMemory = process.memoryUsage().heapUsed;
    const cycles = 10;
    let lastMemory = initialMemory;

    for (let i = 0; i < cycles; i++) {
      const instance = await eleva.mount(container, "memory");
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for rendering
      instance.unmount();

      const currentMemory = process.memoryUsage().heapUsed;
      const memoryDiff = currentMemory - lastMemory;

      console.log(
        `Cycle ${i + 1} memory difference: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`
      );

      // Memory should not grow significantly between cycles
      expect(memoryDiff).toBeLessThan(5 * 1024 * 1024); // Less than 5MB growth per cycle

      lastMemory = currentMemory;
    }
  });
});

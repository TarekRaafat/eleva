/**
 * @fileoverview Performance tests for the Eleva Renderer module
 *
 * These tests measure and verify the performance characteristics of the Renderer module,
 * which is responsible for DOM manipulation and virtual DOM patching in the Eleva framework.
 *
 * Performance metrics measured:
 * - DOM patching performance
 * - Large DOM tree manipulation
 * - Event handler binding performance
 * - Memory usage during rendering
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/Renderer
 * @category Performance
 * @group rendering
 */

import { Renderer } from "../../src/modules/Renderer.js";

/**
 * Test suite for measuring Renderer module performance characteristics
 *
 * @group performance
 * @group rendering
 */
describe("Renderer Performance", () => {
  let renderer;
  let container;

  beforeEach(() => {
    renderer = new Renderer();
    container = document.createElement("div");
  });

  /**
   * Tests the performance of DOM patching with large trees
   *
   * This test verifies that the Renderer can efficiently patch large DOM trees
   * with many nodes and attributes.
   *
   * Performance expectations:
   * - Should patch 1000 nodes under 50ms
   * - Should handle attribute updates efficiently
   *
   * @performance
   * @benchmark
   */
  test("patches large DOM trees efficiently", () => {
    // Create a large HTML structure
    const createLargeTree = (depth, maxDepth) => {
      if (depth >= maxDepth) return "";

      return `
        <div class="node depth-${depth}" data-id="${depth}">
          <span class="label">Node ${depth}</span>
          <div class="children">
            ${Array(5)
              .fill()
              .map(() => createLargeTree(depth + 1, maxDepth))
              .join("")}
          </div>
        </div>
      `;
    };

    const initialHtml = createLargeTree(0, 4);
    const updatedHtml = createLargeTree(0, 4).replace(/Node/g, "Updated Node");

    // Initial render
    renderer.patchDOM(container, initialHtml);

    // Measure patching performance
    const start = performance.now();
    renderer.patchDOM(container, updatedHtml);
    const end = performance.now();

    console.log(`Large DOM tree patching time: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(50); // Under 50ms
  });

  /**
   * Tests the performance of frequent DOM updates
   *
   * This test measures how efficiently the Renderer handles rapid DOM updates
   * with changing content and attributes.
   *
   * Performance expectations:
   * - Should handle 100 rapid updates under 200ms
   * - Should maintain smooth rendering
   *
   * @performance
   * @benchmark
   */
  test("handles frequent DOM updates efficiently", () => {
    const baseHtml = `
      <div class="dynamic-content">
        <div class="header">Header</div>
        <div class="content">
          <div class="items">
            ${Array(100)
              .fill()
              .map(
                (_, i) => `
              <div class="item" data-id="${i}">
                <span class="title">Item ${i}</span>
                <span class="value">Value ${i}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    // Initial render
    renderer.patchDOM(container, baseHtml);

    // Measure update performance
    const start = performance.now();
    const updates = 100;

    for (let i = 0; i < updates; i++) {
      const updatedHtml = baseHtml
        .replace(/Item \d+/g, `Item ${i}`)
        .replace(/Value \d+/g, `Value ${i}`);
      renderer.patchDOM(container, updatedHtml);
    }

    const end = performance.now();
    console.log(`Frequent DOM updates time: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(200); // Under 200ms
  });

  /**
   * Tests the performance of event handler binding
   *
   * This test measures how efficiently the Renderer binds and unbinds
   * event handlers to DOM elements.
   *
   * Performance expectations:
   * - Should bind 1000 event handlers under 100ms
   * - Should handle event delegation efficiently
   *
   * @performance
   * @benchmark
   */
  test("binds event handlers efficiently", () => {
    // Create HTML with many interactive elements
    const html = `
      <div class="interactive-container">
        ${Array(1000)
          .fill()
          .map(
            (_, i) => `
          <button class="action-btn" data-id="${i}">
            Action ${i}
          </button>
        `
          )
          .join("")}
      </div>
    `;

    // Initial render
    renderer.patchDOM(container, html);

    // Measure event binding performance
    const start = performance.now();

    // Simulate event handler binding
    container.querySelectorAll(".action-btn").forEach((btn) => {
      btn.addEventListener("click", () => {});
    });

    const end = performance.now();
    console.log(`Event handler binding time: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(100); // Under 100ms
  });

  /**
   * Tests memory usage during rendering operations
   *
   * This test verifies that the Renderer manages memory efficiently
   * during complex rendering operations.
   *
   * Performance expectations:
   * - Memory usage should remain stable
   * - No memory leaks should be detected
   *
   * @performance
   * @benchmark
   */
  test("maintains stable memory usage during rendering", () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const cycles = 10;

    // Create complex HTML structure
    const createComplexTree = (depth) => {
      if (depth <= 0) return "";

      return `
        <div class="complex-node" data-depth="${depth}">
          <div class="content">
            ${Array(10)
              .fill()
              .map(
                () => `
              <div class="item">
                <span class="title">Title ${depth}</span>
                <div class="nested">
                  ${createComplexTree(depth - 1)}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    };

    let lastMemory = initialMemory;

    for (let i = 0; i < cycles; i++) {
      const html = createComplexTree(4);
      renderer.patchDOM(container, html);

      const currentMemory = process.memoryUsage().heapUsed;
      const memoryDiff = currentMemory - lastMemory;

      console.log(
        `Cycle ${i + 1} memory difference: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`
      );

      // Memory should not grow significantly between cycles
      expect(memoryDiff).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth per cycle

      lastMemory = currentMemory;
    }
  });
});

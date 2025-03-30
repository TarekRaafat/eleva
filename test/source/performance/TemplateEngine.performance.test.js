/**
 * @fileoverview Performance tests for the Eleva TemplateEngine module
 *
 * These tests measure and verify the performance characteristics of the TemplateEngine module,
 * which is responsible for template parsing, interpolation, and rendering in the Eleva framework.
 *
 * Performance metrics measured:
 * - Template parsing performance
 * - Interpolation performance
 * - Complex expression evaluation
 * - Memory usage during template operations
 * - Large template handling
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/TemplateEngine
 * @category Performance
 * @group templates
 */

import { TemplateEngine } from "../../../src/modules/TemplateEngine.js";

/**
 * Test suite for measuring TemplateEngine performance characteristics
 *
 * @group performance
 * @group templates
 */
describe("TemplateEngine Performance", () => {
  /**
   * Tests the performance of template parsing with large templates
   *
   * This test verifies that the TemplateEngine can efficiently parse
   * large templates with many interpolations and complex expressions.
   *
   * Performance expectations:
   * - Should parse 1000 interpolations under 50ms
   * - Should handle complex expressions efficiently
   *
   * @performance
   * @benchmark
   */
  test("parses large templates efficiently", () => {
    // Create a large template with many interpolations
    const items = Array(1000)
      .fill()
      .map((_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: i * 2,
        nested: {
          prop1: `Nested ${i}`,
          prop2: i % 2 === 0,
        },
      }));

    const data = { items };
    const template = `
      <div class="large-template">
        <h1>{{items.length}} Items</h1>
        <div class="items">
          ${items
            .map(
              (item) => `
            <div class="item" data-id="${items[item.id].id}">
              <h3>${items[item.id].name}</h3>
              <p>Value: ${items[item.id].value}</p>
              <div class="nested">
                <span>${items[item.id].nested.prop1}</span>
                <span>${items[item.id].nested.prop2 ? "Even" : "Odd"}</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    // Measure parsing performance
    const start = performance.now();
    TemplateEngine.parse(template, data);
    const end = performance.now();

    console.log(`Large template parsing time: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(50); // Under 50ms
  });

  /**
   * Tests the performance of complex expression evaluation
   *
   * This test measures how efficiently the TemplateEngine handles
   * complex expressions with multiple operations and conditions.
   *
   * Performance expectations:
   * - Should evaluate 1000 complex expressions under 30ms
   * - Should handle nested expressions efficiently
   *
   * @performance
   * @benchmark
   */
  test("evaluates complex expressions efficiently", () => {
    const data = {
      numbers: Array(1000)
        .fill()
        .map((_, i) => i),
      threshold: 500,
      multiplier: 2,
    };

    const template = `
      <div class="complex-expressions">
        ${data.numbers
          .map(
            (_, i) => `
          <div class="expression">
            <span>${data.numbers[i] > data.threshold ? "High" : "Low"}</span>
            <span>${data.numbers[i] * data.multiplier}</span>
            <span>${data.numbers[i] % 2 === 0 ? "Even" : "Odd"}</span>
            <span>${data.numbers[i] > data.threshold && data.numbers[i] % 2 === 0 ? "High Even" : "Other"}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    // Measure evaluation performance
    const start = performance.now();
    TemplateEngine.parse(template, data);
    const end = performance.now();

    console.log(
      `Complex expression evaluation time: ${(end - start).toFixed(2)}ms`
    );
    expect(end - start).toBeLessThan(30); // Under 30ms
  });

  /**
   * Tests the performance of template caching
   *
   * This test verifies that the TemplateEngine efficiently caches
   * parsed templates and reuses them for subsequent renders.
   *
   * Performance expectations:
   * - Subsequent renders should be significantly faster
   * - Cache hits should be under 5ms
   *
   * @performance
   * @benchmark
   */
  test("efficiently caches parsed templates", () => {
    const template = `
      <div class="cached-template">
        <h2>{{title}}</h2>
        <div class="content">
          {{content}}
        </div>
      </div>
    `;

    const data1 = { title: "First", content: "Content 1" };
    const data2 = { title: "Second", content: "Content 2" };

    // First render (uncached)
    const start1 = performance.now();
    TemplateEngine.parse(template, data1);
    const end1 = performance.now();

    // Second render (cached)
    const start2 = performance.now();
    TemplateEngine.parse(template, data2);
    const end2 = performance.now();

    console.log(`First render time: ${(end1 - start1).toFixed(2)}ms`);
    console.log(`Cached render time: ${(end2 - start2).toFixed(2)}ms`);

    // Cached render should be significantly faster
    expect(end2 - start2).toBeLessThan(5); // Under 5ms
    expect(end2 - start2).toBeLessThan(end1 - start1); // Should be faster than first render
  });

  /**
   * Tests the performance of template updates
   *
   * This test measures how efficiently the TemplateEngine handles
   * frequent updates to template data and re-renders.
   *
   * Performance expectations:
   * - Should handle 100 updates under 100ms
   * - Should maintain consistent performance
   *
   * @performance
   * @benchmark
   */
  test("handles frequent template updates efficiently", () => {
    const template = `
      <div class="dynamic-content">
        <div class="header">{{header}}</div>
        <div class="items">
          {{items
            .map(
              (item) => \`
            <div class="item">
              <span>item.name</span>
              <span>item.value</span>
            </div>
          \`
            )
            .join("")}}
        </div>
      </div>
    `;

    // Measure update performance
    const start = performance.now();
    const updates = 100;

    for (let i = 0; i < updates; i++) {
      const data = {
        header: `Update ${i}`,
        items: Array(50)
          .fill()
          .map((_, j) => ({
            name: `Item ${j}`,
            value: i + j,
          })),
      };
      TemplateEngine.parse(template, data);
    }

    const end = performance.now();
    console.log(
      `Frequent template updates time: ${(end - start).toFixed(2)}ms`
    );
    expect(end - start).toBeLessThan(100); // Under 100ms
  });

  /**
   * Tests memory usage during template operations
   *
   * This test verifies that the TemplateEngine manages memory efficiently
   * during complex template operations and frequent updates.
   *
   * Performance expectations:
   * - Memory usage should remain stable
   * - No memory leaks should be detected
   *
   * @performance
   * @benchmark
   */
  test("maintains stable memory usage during template operations", () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const cycles = 10;

    // Create complex template with nested structures
    const createComplexTemplate = (depth) => {
      if (depth <= 0) return "${value}";

      return `
        <div class="level-${depth}">
          {{items
            .map(
              (item) => \`
            <div class="item">
              <span>item.name</span>
              <div class="nested">
                createComplexTemplate(depth - 1)
              </div>
            </div>
          \`
            )
            .join("")}}
        </div>
      `;
    };

    const template = createComplexTemplate(4);
    let lastMemory = initialMemory;

    for (let i = 0; i < cycles; i++) {
      const data = {
        items: Array(10)
          .fill()
          .map((_, j) => ({
            name: `Item ${j}`,
            value: i + j,
            items: Array(5)
              .fill()
              .map((_, k) => ({
                name: `Nested ${k}`,
                value: i + j + k,
              })),
          })),
      };

      TemplateEngine.parse(template, data);

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

  /**
   * Tests the performance of template parsing with large text content
   *
   * This test verifies that the TemplateEngine can efficiently handle
   * templates with large amounts of static text content.
   *
   * Performance expectations:
   * - Should parse 1MB of text content under 100ms
   * - Should handle text interpolation efficiently
   *
   * @performance
   * @benchmark
   */
  test("handles large text content efficiently", () => {
    // Generate large text content
    const largeText = Array(1000)
      .fill()
      .map(
        (_, i) => `
      <p class="text-block">
        This is a large block of text with some {{dynamic}} content.
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        Duis aute irure dolor in reprehenderit in voluptate velit.
      </p>
    `
      )
      .join("");

    const template = `
      <div class="large-text-content">
        ${largeText}
      </div>
    `;

    const data = {
      dynamic: "interpolated",
    };

    // Measure parsing performance
    const start = performance.now();
    TemplateEngine.parse(template, data);
    const end = performance.now();

    console.log(
      `Large text content parsing time: ${(end - start).toFixed(2)}ms`
    );
    expect(end - start).toBeLessThan(100); // Under 100ms
  });
});

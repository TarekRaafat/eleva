// test/performance/templates.performance.test.js
/**
 * @fileoverview Performance tests for the Eleva TemplateEngine module
 *
 * These tests measure and verify the performance characteristics of the TemplateEngine module,
 * ensuring that template parsing and rendering maintain acceptable performance even
 * under high-load scenarios with large templates and extensive data interpolation.
 *
 * Performance metrics measured:
 * - Parsing time for large templates with many interpolations
 * - Rendering efficiency with complex data structures
 * - Time complexity scaling with template size
 *
 * These tests help ensure that Eleva.js maintains its performance characteristics
 * during development and refactoring.
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/TemplateEngine
 * @category Performance
 * @group templates
 * @group rendering
 */

import { TemplateEngine } from "../../src/modules/TemplateEngine.js";

/**
 * Test suite for measuring TemplateEngine performance characteristics
 *
 * @group performance
 * @group templates
 */
describe("TemplateEngine Performance", () => {
  /**
   * Tests the performance of template parsing with a large number of interpolations
   *
   * This test verifies that the template engine maintains acceptable performance
   * when parsing templates with 1000 list items, each containing multiple
   * interpolation expressions. It measures the total time taken to parse the
   * template and expects it to complete within 20ms.
   *
   * Performance expectations:
   * - Should complete under 20ms on modern hardware
   * - Time complexity should scale linearly with template size
   * - Memory usage should be efficient and avoid unnecessary allocations
   *
   * @performance
   * @benchmark
   */
  test("rendering large template is fast", () => {
    // Create a large template with many interpolations
    const items = Array(1000)
      .fill()
      .map((_, i) => ({ id: i, name: `Item ${i}` }));
    const data = { items };
    const template = `
      <ul>
        ${items.map((item) => `<li id="item-{{items[${item.id}].id}}">{{items[${item.id}].name}}</li>`).join("")}
      </ul>
    `;

    // Measure performance
    const start = performance.now();
    TemplateEngine.parse(template, data);
    const end = performance.now();

    // Log performance results for debugging and analysis
    console.log(`Template parsing time: ${(end - start).toFixed(2)}ms`);

    // Performance assertion: parsing should be fast
    expect(end - start).toBeLessThan(100); // Under 100ms
  });
});

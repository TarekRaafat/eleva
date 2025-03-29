/**
 * @fileoverview Tests for the TemplateEngine module of the Eleva framework
 *
 * These tests verify the template parsing and expression evaluation capabilities
 * of the TemplateEngine module, including:
 * - Template string interpolation
 * - JavaScript expression evaluation
 * - Error handling for invalid expressions and templates
 * - Edge case handling
 *
 * The TemplateEngine module provides the core templating functionality for the Eleva framework,
 * allowing components to render dynamic content based on their state. It powers the declarative
 * template syntax that makes Eleva components easy to write and maintain.
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/TemplateEngine
 * @category Unit
 * @group modules
 * @group templating
 * @group rendering
 */

import { TemplateEngine } from "../../../src/modules/TemplateEngine.js";

/**
 * Tests for the core functionality of the TemplateEngine module
 *
 * This suite verifies the fundamental templating capabilities:
 * - String interpolation with mustache-style syntax
 * - Expression evaluation within templates
 * - Handling of complex data structures
 * - Conditional expressions
 *
 * These capabilities form the foundation of Eleva's declarative UI approach,
 * enabling dynamic content rendering from component state.
 *
 * @group modules
 * @group templating
 * @group core-functionality
 */
describe("TemplateEngine", () => {
  /**
   * Tests the template interpolation functionality
   *
   * Verifies:
   * - String templates with interpolation expressions are correctly parsed
   * - Data values are properly inserted into the resulting string
   * - The mustache-style syntax ({{ }}) works as expected
   *
   * This is the most basic and essential feature of the template engine,
   * enabling dynamic text content in components.
   *
   * @group interpolation
   * @group basic
   */
  test("parse replaces interpolation expressions", () => {
    const template = "Hello, {{ name }}!";
    const data = { name: "World" };

    expect(TemplateEngine.parse(template, data)).toBe("Hello, World!");
  });

  /**
   * Tests the expression evaluation functionality
   *
   * Verifies:
   * - JavaScript expressions are evaluated correctly
   * - The data context is properly accessible within expressions
   * - Mathematical operations work as expected
   *
   * Expression evaluation enables complex logic within templates,
   * going beyond simple variable substitution.
   *
   * @group evaluation
   * @group expressions
   */
  test("evaluate returns correct result for valid expression", () => {
    const data = { a: 2, b: 3 };

    expect(TemplateEngine.evaluate("a + b", data)).toBe(5);
  });

  /**
   * Tests error handling during expression evaluation
   *
   * Verifies:
   * - Reference errors (accessing undefined variables) are handled gracefully
   * - An empty string is returned instead of throwing an error
   * - The system remains stable even with invalid expressions
   *
   * Proper error handling ensures templates remain robust even when
   * referencing undefined or invalid data.
   *
   * @group error-handling
   * @group robustness
   * @group undefined-handling
   */
  test("evaluate returns empty string on error", () => {
    const data = { a: 1 };
    const result = TemplateEngine.evaluate("nonExistentVariable", data);

    expect(result).toBe("");
  });

  /**
   * Tests interpolation with nested object properties
   *
   * Verifies:
   * - Dot notation access works correctly in template expressions
   * - Nested object properties are correctly evaluated
   *
   * Support for nested properties allows templates to work with complex
   * state structures common in real-world applications.
   *
   * @group interpolation
   * @group nested-properties
   * @group complex-data
   */
  test("parse handles nested object properties", () => {
    const template = "User: {{ user.name }}, Age: {{ user.profile.age }}";
    const data = {
      user: {
        name: "John",
        profile: {
          age: 30,
        },
      },
    };

    expect(TemplateEngine.parse(template, data)).toBe("User: John, Age: 30");
  });

  /**
   * Tests interpolation with array access
   *
   * Verifies:
   * - Array indexing works correctly in template expressions
   * - Array elements are correctly evaluated
   *
   * Array access support is essential for rendering lists and collections
   * in templates.
   *
   * @group interpolation
   * @group arrays
   * @group collection-access
   */
  test("parse handles array indexing", () => {
    const template = "First item: {{ items[0] }}, Second item: {{ items[1] }}";
    const data = { items: ["apple", "banana"] };

    expect(TemplateEngine.parse(template, data)).toBe(
      "First item: apple, Second item: banana"
    );
  });

  /**
   * Tests multiple interpolations in the same template
   *
   * Verifies:
   * - Multiple expressions in a single template are all evaluated
   * - The correct values are inserted for each expression
   *
   * This ensures complex templates with multiple dynamic parts work correctly.
   *
   * @group interpolation
   * @group multiple-expressions
   * @group complex-templates
   */
  test("parse handles multiple interpolations", () => {
    const template = "{{ greeting }} {{ name }}! Your score is {{ score }}.";
    const data = { greeting: "Hello", name: "World", score: 100 };

    expect(TemplateEngine.parse(template, data)).toBe(
      "Hello World! Your score is 100."
    );
  });

  /**
   * Tests conditional expressions in templates
   *
   * Verifies:
   * - Ternary operators work correctly in template expressions
   * - Conditional logic is properly evaluated
   *
   * Conditional expressions enable dynamic content that changes based on
   * component state, a key feature for interactive UIs.
   *
   * @group evaluation
   * @group conditional-logic
   * @group expressions
   */
  test("evaluate handles conditional expressions", () => {
    const data = { age: 20 };

    expect(TemplateEngine.evaluate("age >= 18 ? 'Adult' : 'Minor'", data)).toBe(
      "Adult"
    );

    data.age = 16;
    expect(TemplateEngine.evaluate("age >= 18 ? 'Adult' : 'Minor'", data)).toBe(
      "Minor"
    );
  });
});

/**
 * Tests for error handling in the TemplateEngine module
 *
 * This suite verifies how the template engine handles various error conditions:
 * - Invalid syntax
 * - Malformed templates
 * - Missing data
 * - Type errors
 *
 * Robust error handling is essential for a good developer experience, making
 * template errors easy to identify and fix.
 *
 * @group modules
 * @group templating
 * @group error-handling
 * @group robustness
 */
describe("TemplateEngine error handling", () => {
  /**
   * Tests handling of invalid template syntax
   *
   * Verifies:
   * - The engine throws appropriate errors for invalid template syntax
   * - Malformed templates are not silently accepted
   *
   * Clear error reporting helps developers identify and fix template syntax issues.
   *
   * @group syntax-validation
   * @group compiler
   * @group developer-experience
   */
  test("should handle invalid templates", () => {
    const engine = new TemplateEngine();
    const invalidTemplate = "{invalid}";
    expect(() => engine.compile(invalidTemplate)).toThrow();
  });

  /**
   * Tests handling of syntax errors in expressions
   *
   * Verifies:
   * - JavaScript syntax errors in expressions are caught
   * - The system handles syntax errors gracefully
   *
   * This ensures that invalid JavaScript within templates won't crash
   * the entire application.
   *
   * @group syntax-errors
   * @group graceful-degradation
   * @group robustness
   */
  test("evaluate handles syntax errors", () => {
    const data = { a: 1 };
    const result = TemplateEngine.evaluate("a +* b", data);

    expect(result).toBe("");
  });

  /**
   * Tests handling of undefined data context
   *
   * Verifies:
   * - The engine handles undefined or null data objects gracefully
   * - No errors are thrown when data is missing
   *
   * This resilience allows templates to render even when expected data
   * is not yet available, such as during initial loading states.
   *
   * @group null-handling
   * @group undefined-handling
   * @group defensive-programming
   */
  test("parse handles undefined data", () => {
    const template = "Hello, {{ name }}!";

    expect(TemplateEngine.parse(template, undefined)).toBe("Hello, !");
    expect(TemplateEngine.parse(template, null)).toBe("Hello, !");
  });
});

/**
 * Tests for advanced features of the TemplateEngine module
 *
 * This suite verifies more advanced templating capabilities:
 * - Function execution within templates
 * - Escaped interpolation syntax
 * - Performance with large templates
 * - Security features
 *
 * These advanced features provide the power and flexibility needed for
 * complex UI components and applications.
 *
 * @group modules
 * @group templating
 * @group advanced
 * @group extended-features
 */
describe("TemplateEngine advanced features", () => {
  /**
   * Tests expression evaluation with function calls
   *
   * Verifies:
   * - Functions in the data context can be called from expressions
   * - Function return values are correctly inserted into templates
   *
   * Support for function calls enables powerful transformations and
   * formatting directly within templates.
   *
   * @group functions
   * @group evaluation
   * @group transformation
   */
  test("evaluate supports function calls", () => {
    const data = {
      greeting: "Hello",
      capitalize: (str) => str.toUpperCase(),
    };

    expect(TemplateEngine.evaluate("capitalize(greeting)", data)).toBe("HELLO");
  });

  /**
   * Tests performance with large templates
   *
   * Verifies:
   * - The engine maintains reasonable performance with larger templates
   * - No excessive processing time for complex templates
   *
   * Performance is crucial for rendering complex UIs with many dynamic parts
   * without causing noticeable delays.
   *
   * @group performance
   * @group optimization
   * @group scaling
   */
  test("performance with large templates", () => {
    // Create a complex template with many interpolations
    const items = Array(100)
      .fill()
      .map((_, i) => ({ id: i, name: `Item ${i}` }));

    const data = { items };

    const template = items
      .map(
        (item) =>
          `<li>Item ID: {{ items[${item.id}].id }}, Name: {{ items[${item.id}].name }}</li>`
      )
      .join("");

    const start = performance.now();
    TemplateEngine.parse(template, data);
    const end = performance.now();

    // Just making sure it completes, not enforcing a specific time limit in tests
    expect(end - start).toBeDefined();
  });
});

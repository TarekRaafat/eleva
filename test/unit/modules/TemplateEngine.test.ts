/**
 * @fileoverview Tests for the TemplateEngine module of the Eleva framework
 *
 * These tests verify the template parsing and rendering capabilities
 * of the TemplateEngine module.
 */

import { describe, test, expect } from "bun:test";
import { TemplateEngine } from "../../../src/modules/TemplateEngine.js";

describe("TemplateEngine", () => {
  test("should evaluate template expressions correctly", () => {
    const template = "Hello, {{ name }}!";
    const data = { name: "World" };

    expect(TemplateEngine.parse(template, data)).toBe("Hello, World!");
  });

  test("should evaluate valid expressions correctly", () => {
    const data = { a: 2, b: 3 };

    expect(TemplateEngine.evaluate("a + b", data)).toBe(5);
  });

  test("should handle nested object properties", () => {
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

  test("should handle array indexing", () => {
    const template = "First item: {{ items[0] }}, Second item: {{ items[1] }}";
    const data = { items: ["apple", "banana"] };

    expect(TemplateEngine.parse(template, data)).toBe(
      "First item: apple, Second item: banana"
    );
  });

  test("should handle multiple interpolations", () => {
    const template = "{{ greeting }} {{ name }}! Your score is {{ score }}.";
    const data = { greeting: "Hello", name: "World", score: 100 };

    expect(TemplateEngine.parse(template, data)).toBe(
      "Hello World! Your score is 100."
    );
  });

  test("should evaluate conditional expressions", () => {
    const data = { age: 20 };

    expect(TemplateEngine.evaluate("age >= 18 ? 'Adult' : 'Minor'", data)).toBe(
      "Adult"
    );

    data.age = 16;
    expect(TemplateEngine.evaluate("age >= 18 ? 'Adult' : 'Minor'", data)).toBe(
      "Minor"
    );
  });

  test("should handle invalid expressions", () => {
    const data = { a: 1 };
    const result = TemplateEngine.evaluate("a +* b", data);

    expect(result).toBe("");
  });

  test("should handle template syntax errors", () => {
    const engine = new TemplateEngine();
    const invalidTemplate = "{invalid}";
    expect(() => (engine as any).compile(invalidTemplate)).toThrow();
  });

  test("should handle edge cases correctly", () => {
    const data = { a: { b: { c: { d: { e: { f: "Hello" } } } } } };

    expect(TemplateEngine.parse("{{ a.b.c.d.e.f }}", data)).toBe("Hello");
  });
});

describe("TemplateEngine Edge Cases", () => {
  test("should handle empty templates gracefully", () => {
    const template = "";
    const data = {};

    expect(TemplateEngine.parse(template, data)).toBe("");
  });

  test("should handle templates without interpolations", () => {
    const template = "Hello, World!";
    const data = {};

    expect(TemplateEngine.parse(template, data)).toBe("Hello, World!");
  });

  test("should handle deeply nested object properties", () => {
    const template = "{{ a.b.c.d.e.f }}";
    const data = { a: { b: { c: { d: { e: { f: "Hello" } } } } } };

    expect(TemplateEngine.parse(template, data)).toBe("Hello");
  });
});

describe("TemplateEngine Error Handling", () => {
  test("should handle undefined data gracefully", () => {
    const template = "Hello, {{ name }}!";

    expect(TemplateEngine.parse(template, undefined)).toBe("Hello, !");
    expect(TemplateEngine.parse(template, null)).toBe("Hello, !");
  });
});

describe("TemplateEngine Advanced Features", () => {
  test("should support function calls in expressions", () => {
    const data = {
      greeting: "Hello",
      capitalize: (str: string) => str.toUpperCase(),
    };

    expect(TemplateEngine.evaluate("capitalize(greeting)", data)).toBe("HELLO");
  });

  test("should evaluate conditional expressions", () => {
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

describe("TemplateEngine Performance", () => {
  test("should maintain performance with large templates", () => {
    const items = Array(100)
      .fill(null)
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

    expect(end - start).toBeDefined();
  });

  test("should maintain performance with complex expressions", () => {
    const template = "{{ complex.expression.with.many.operations() }}";
    const data = {
      complex: {
        expression: { with: { many: { operations: () => "Hello" } } },
      },
    };

    const start = performance.now();
    TemplateEngine.parse(template, data);
    const end = performance.now();

    expect(end - start).toBeDefined();
  });
});

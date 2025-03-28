import { TemplateEngine } from "../src/modules/TemplateEngine.js";

describe("TemplateEngine", () => {
  test("parse replaces interpolation expressions", () => {
    const template = "Hello, {{ name }}!";
    const data = { name: "World" };

    expect(TemplateEngine.parse(template, data)).toBe("Hello, World!");
  });

  test("evaluate returns correct result for valid expression", () => {
    const data = { a: 2, b: 3 };

    expect(TemplateEngine.evaluate("a + b", data)).toBe(5);
  });

  test("evaluate returns empty string on error", () => {
    const data = { a: 1 };
    const result = TemplateEngine.evaluate("nonExistentVariable", data);

    expect(result).toBe("");
  });
});

describe("TemplateEngine error handling", () => {
  test("should handle invalid templates", () => {
    // Test for lines 42-47
    const engine = new TemplateEngine();
    const invalidTemplate = "{invalid}";
    expect(() => engine.compile(invalidTemplate)).toThrow();
  });
});

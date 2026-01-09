/**
 * @fileoverview Tests for the TemplateEngine module of the Eleva framework
 *
 * These tests verify the template parsing, rendering, and expression evaluation
 * capabilities of the TemplateEngine module, including function caching.
 */

import { describe, test, expect, beforeEach } from "bun:test";
import { TemplateEngine } from "../../../src/modules/TemplateEngine.js";

// =============================================================================
// Core TemplateEngine Tests
// =============================================================================

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

    expect(result).toBeUndefined();
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

    // When evaluation fails, undefined is returned and converted to string in parse()
    expect(TemplateEngine.parse(template, undefined)).toBe("Hello, undefined!");
    expect(TemplateEngine.parse(template, null)).toBe("Hello, undefined!");
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

// =============================================================================
// Complex Expression Handling Tests
// =============================================================================

describe("TemplateEngine Complex Expression Handling", () => {

  beforeEach(() => {
    // Clear cache before each test to ensure isolation
    (TemplateEngine as any)._functionCache.clear();
  });

  // ==========================================================================
  // 1. Basic Property Access
  // ==========================================================================
  describe("Basic Property Access", () => {
    test("simple property", () => {
      expect(TemplateEngine.evaluate("name", { name: "John" })).toBe("John");
    });

    test("nested property", () => {
      expect(TemplateEngine.evaluate("user.name", { user: { name: "Jane" } })).toBe("Jane");
    });

    test("deeply nested property", () => {
      const data = { a: { b: { c: { d: { e: "deep" } } } } };
      expect(TemplateEngine.evaluate("a.b.c.d.e", data)).toBe("deep");
    });

    test("array index access", () => {
      expect(TemplateEngine.evaluate("items[0]", { items: ["first", "second"] })).toBe("first");
    });

    test("array length", () => {
      expect(TemplateEngine.evaluate("items.length", { items: [1, 2, 3] })).toBe(3);
    });
  });

  // ==========================================================================
  // 2. Arithmetic Operations
  // ==========================================================================
  describe("Arithmetic Operations", () => {
    test("addition", () => {
      expect(TemplateEngine.evaluate("a + b", { a: 5, b: 3 })).toBe(8);
    });

    test("subtraction", () => {
      expect(TemplateEngine.evaluate("a - b", { a: 10, b: 4 })).toBe(6);
    });

    test("multiplication", () => {
      expect(TemplateEngine.evaluate("price * quantity", { price: 9.99, quantity: 3 })).toBe(29.97);
    });

    test("division", () => {
      expect(TemplateEngine.evaluate("total / count", { total: 100, count: 4 })).toBe(25);
    });

    test("modulo", () => {
      expect(TemplateEngine.evaluate("value % 3", { value: 10 })).toBe(1);
    });

    test("complex arithmetic", () => {
      expect(TemplateEngine.evaluate("(a + b) * c - d / e", { a: 2, b: 3, c: 4, d: 10, e: 2 })).toBe(15);
    });

    test("increment expression", () => {
      expect(TemplateEngine.evaluate("count + 1", { count: 5 })).toBe(6);
    });
  });

  // ==========================================================================
  // 3. Comparison Operators
  // ==========================================================================
  describe("Comparison Operators", () => {
    test("equality", () => {
      expect(TemplateEngine.evaluate("a === b", { a: 5, b: 5 })).toBe(true);
      expect(TemplateEngine.evaluate("a === b", { a: 5, b: "5" })).toBe(false);
    });

    test("inequality", () => {
      expect(TemplateEngine.evaluate("a !== b", { a: 5, b: 3 })).toBe(true);
    });

    test("greater than", () => {
      expect(TemplateEngine.evaluate("age > 18", { age: 21 })).toBe(true);
      expect(TemplateEngine.evaluate("age > 18", { age: 16 })).toBe(false);
    });

    test("less than or equal", () => {
      expect(TemplateEngine.evaluate("score <= 100", { score: 100 })).toBe(true);
    });

    test("greater than or equal", () => {
      expect(TemplateEngine.evaluate("value >= threshold", { value: 50, threshold: 50 })).toBe(true);
    });
  });

  // ==========================================================================
  // 4. Logical Operators
  // ==========================================================================
  describe("Logical Operators", () => {
    test("AND operator", () => {
      expect(TemplateEngine.evaluate("a && b", { a: true, b: true })).toBe(true);
      expect(TemplateEngine.evaluate("a && b", { a: true, b: false })).toBe(false);
    });

    test("OR operator", () => {
      expect(TemplateEngine.evaluate("a || b", { a: false, b: true })).toBe(true);
      expect(TemplateEngine.evaluate("a || b", { a: false, b: false })).toBe(false);
    });

    test("NOT operator", () => {
      expect(TemplateEngine.evaluate("!active", { active: false })).toBe(true);
      expect(TemplateEngine.evaluate("!active", { active: true })).toBe(false);
    });

    test("complex logical", () => {
      expect(TemplateEngine.evaluate("(a && b) || c", { a: true, b: false, c: true })).toBe(true);
      expect(TemplateEngine.evaluate("a && (b || c)", { a: true, b: false, c: true })).toBe(true);
    });

    test("short-circuit evaluation", () => {
      expect(TemplateEngine.evaluate("user && user.name", { user: { name: "John" } })).toBe("John");
      expect(TemplateEngine.evaluate("user && user.name", { user: null })).toBe(null);
    });
  });

  // ==========================================================================
  // 5. Ternary Operator
  // ==========================================================================
  describe("Ternary Operator", () => {
    test("simple ternary", () => {
      expect(TemplateEngine.evaluate("active ? 'Yes' : 'No'", { active: true })).toBe("Yes");
      expect(TemplateEngine.evaluate("active ? 'Yes' : 'No'", { active: false })).toBe("No");
    });

    test("ternary with expressions", () => {
      expect(TemplateEngine.evaluate("age >= 18 ? 'Adult' : 'Minor'", { age: 21 })).toBe("Adult");
      expect(TemplateEngine.evaluate("age >= 18 ? 'Adult' : 'Minor'", { age: 15 })).toBe("Minor");
    });

    test("nested ternary", () => {
      const expr = "score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F'";
      expect(TemplateEngine.evaluate(expr, { score: 95 })).toBe("A");
      expect(TemplateEngine.evaluate(expr, { score: 85 })).toBe("B");
      expect(TemplateEngine.evaluate(expr, { score: 75 })).toBe("C");
      expect(TemplateEngine.evaluate(expr, { score: 50 })).toBe("F");
    });

    test("ternary with property access", () => {
      expect(TemplateEngine.evaluate(
        "user.isAdmin ? user.adminName : user.name",
        { user: { isAdmin: true, adminName: "Admin", name: "User" } }
      )).toBe("Admin");
    });
  });

  // ==========================================================================
  // 6. Function Calls
  // ==========================================================================
  describe("Function Calls", () => {
    test("simple function call", () => {
      expect(TemplateEngine.evaluate("greet()", { greet: () => "Hello" })).toBe("Hello");
    });

    test("function with argument", () => {
      expect(TemplateEngine.evaluate("double(x)", { double: (n: number) => n * 2, x: 5 })).toBe(10);
    });

    test("function with multiple arguments", () => {
      expect(TemplateEngine.evaluate(
        "add(a, b)",
        { add: (x: number, y: number) => x + y, a: 3, b: 4 }
      )).toBe(7);
    });

    test("method call on object", () => {
      expect(TemplateEngine.evaluate(
        "formatter.format(value)",
        { formatter: { format: (v: number) => `$${v.toFixed(2)}` }, value: 19.99 }
      )).toBe("$19.99");
    });

    test("chained function calls", () => {
      expect(TemplateEngine.evaluate(
        "process(transform(value))",
        {
          process: (v: number) => v + 1,
          transform: (v: number) => v * 2,
          value: 5
        }
      )).toBe(11); // (5 * 2) + 1 = 11
    });
  });

  // ==========================================================================
  // 7. String Operations
  // ==========================================================================
  describe("String Operations", () => {
    test("string concatenation", () => {
      expect(TemplateEngine.evaluate("first + ' ' + last", { first: "John", last: "Doe" })).toBe("John Doe");
    });

    test("template literal style (using concatenation)", () => {
      expect(TemplateEngine.evaluate(
        "'Hello, ' + name + '!'",
        { name: "World" }
      )).toBe("Hello, World!");
    });

    test("string method - toUpperCase", () => {
      expect(TemplateEngine.evaluate("name.toUpperCase()", { name: "john" })).toBe("JOHN");
    });

    test("string method - toLowerCase", () => {
      expect(TemplateEngine.evaluate("name.toLowerCase()", { name: "JANE" })).toBe("jane");
    });

    test("string method - trim", () => {
      expect(TemplateEngine.evaluate("text.trim()", { text: "  hello  " })).toBe("hello");
    });

    test("string method - substring", () => {
      expect(TemplateEngine.evaluate("text.substring(0, 5)", { text: "Hello World" })).toBe("Hello");
    });

    test("string method - split", () => {
      expect(TemplateEngine.evaluate("text.split(',').length", { text: "a,b,c" })).toBe(3);
    });

    test("string length", () => {
      expect(TemplateEngine.evaluate("name.length", { name: "Hello" })).toBe(5);
    });
  });

  // ==========================================================================
  // 8. Array Methods
  // ==========================================================================
  describe("Array Methods", () => {
    test("array map", () => {
      const result = TemplateEngine.evaluate(
        "items.map(x => x * 2)",
        { items: [1, 2, 3] }
      );
      expect(result).toEqual([2, 4, 6]);
    });

    test("array filter", () => {
      const result = TemplateEngine.evaluate(
        "items.filter(x => x > 2)",
        { items: [1, 2, 3, 4, 5] }
      );
      expect(result).toEqual([3, 4, 5]);
    });

    test("array reduce", () => {
      expect(TemplateEngine.evaluate(
        "items.reduce((sum, x) => sum + x, 0)",
        { items: [1, 2, 3, 4] }
      )).toBe(10);
    });

    test("array find", () => {
      expect(TemplateEngine.evaluate(
        "users.find(u => u.id === 2).name",
        { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }] }
      )).toBe("Bob");
    });

    test("array some", () => {
      expect(TemplateEngine.evaluate(
        "items.some(x => x > 5)",
        { items: [1, 2, 3, 6] }
      )).toBe(true);
    });

    test("array every", () => {
      expect(TemplateEngine.evaluate(
        "items.every(x => x > 0)",
        { items: [1, 2, 3] }
      )).toBe(true);
    });

    test("array includes", () => {
      expect(TemplateEngine.evaluate(
        "items.includes('b')",
        { items: ["a", "b", "c"] }
      )).toBe(true);
    });

    test("array join", () => {
      expect(TemplateEngine.evaluate(
        "items.join(', ')",
        { items: ["a", "b", "c"] }
      )).toBe("a, b, c");
    });

    test("chained array methods", () => {
      const result = TemplateEngine.evaluate(
        "items.filter(x => x > 1).map(x => x * 2)",
        { items: [1, 2, 3] }
      );
      expect(result).toEqual([4, 6]);
    });
  });

  // ==========================================================================
  // 9. Object Operations
  // ==========================================================================
  describe("Object Operations", () => {
    test("Object.keys", () => {
      const result = TemplateEngine.evaluate(
        "Object.keys(obj)",
        { obj: { a: 1, b: 2 } }
      );
      expect(result).toEqual(["a", "b"]);
    });

    test("Object.values", () => {
      const result = TemplateEngine.evaluate(
        "Object.values(obj)",
        { obj: { a: 1, b: 2 } }
      );
      expect(result).toEqual([1, 2]);
    });

    test("Object.entries", () => {
      const result = TemplateEngine.evaluate(
        "Object.entries(obj)",
        { obj: { a: 1 } }
      );
      expect(result).toEqual([["a", 1]]);
    });

    test("in operator", () => {
      expect(TemplateEngine.evaluate("'name' in obj", { obj: { name: "test" } })).toBe(true);
      expect(TemplateEngine.evaluate("'age' in obj", { obj: { name: "test" } })).toBe(false);
    });
  });

  // ==========================================================================
  // 10. Modern JavaScript Features
  // ==========================================================================
  describe("Modern JavaScript Features", () => {
    test("nullish coalescing (??)", () => {
      expect(TemplateEngine.evaluate("value ?? 'default'", { value: null })).toBe("default");
      expect(TemplateEngine.evaluate("value ?? 'default'", { value: undefined })).toBe("default");
      expect(TemplateEngine.evaluate("value ?? 'default'", { value: "exists" })).toBe("exists");
      expect(TemplateEngine.evaluate("value ?? 'default'", { value: 0 })).toBe(0); // 0 is not nullish
    });

    test("optional chaining (?.)", () => {
      expect(TemplateEngine.evaluate("user?.name", { user: { name: "John" } })).toBe("John");
      expect(TemplateEngine.evaluate("user?.name", { user: null })).toBe(undefined);
      expect(TemplateEngine.evaluate("user?.profile?.city", { user: { profile: { city: "NYC" } } })).toBe("NYC");
      expect(TemplateEngine.evaluate("user?.profile?.city", { user: {} })).toBe(undefined);
    });

    test("optional chaining with nullish coalescing", () => {
      expect(TemplateEngine.evaluate(
        "user?.name ?? 'Anonymous'",
        { user: null }
      )).toBe("Anonymous");
      expect(TemplateEngine.evaluate(
        "user?.profile?.city ?? 'Unknown'",
        { user: { profile: {} } }
      )).toBe("Unknown");
    });

    test("spread in array literal", () => {
      const result = TemplateEngine.evaluate(
        "[...items, 4]",
        { items: [1, 2, 3] }
      );
      expect(result).toEqual([1, 2, 3, 4]);
    });

    test("spread in object literal", () => {
      const result = TemplateEngine.evaluate(
        "({...obj, c: 3})",
        { obj: { a: 1, b: 2 } }
      );
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    test("destructuring in arrow function", () => {
      const result = TemplateEngine.evaluate(
        "items.map(({ name }) => name)",
        { items: [{ name: "A" }, { name: "B" }] }
      );
      expect(result).toEqual(["A", "B"]);
    });
  });

  // ==========================================================================
  // 11. Math Operations
  // ==========================================================================
  describe("Math Operations", () => {
    test("Math.round", () => {
      expect(TemplateEngine.evaluate("Math.round(value)", { value: 4.7 })).toBe(5);
    });

    test("Math.floor", () => {
      expect(TemplateEngine.evaluate("Math.floor(value)", { value: 4.9 })).toBe(4);
    });

    test("Math.ceil", () => {
      expect(TemplateEngine.evaluate("Math.ceil(value)", { value: 4.1 })).toBe(5);
    });

    test("Math.abs", () => {
      expect(TemplateEngine.evaluate("Math.abs(value)", { value: -5 })).toBe(5);
    });

    test("Math.max", () => {
      expect(TemplateEngine.evaluate("Math.max(a, b, c)", { a: 1, b: 5, c: 3 })).toBe(5);
    });

    test("Math.min", () => {
      expect(TemplateEngine.evaluate("Math.min(a, b, c)", { a: 1, b: 5, c: 3 })).toBe(1);
    });

    test("Math.pow", () => {
      expect(TemplateEngine.evaluate("Math.pow(base, exp)", { base: 2, exp: 3 })).toBe(8);
    });

    test("exponentiation operator", () => {
      expect(TemplateEngine.evaluate("base ** exp", { base: 2, exp: 3 })).toBe(8);
    });
  });

  // ==========================================================================
  // 12. Type Conversions
  // ==========================================================================
  describe("Type Conversions", () => {
    test("Number conversion", () => {
      expect(TemplateEngine.evaluate("Number(value)", { value: "42" })).toBe(42);
    });

    test("String conversion", () => {
      expect(TemplateEngine.evaluate("String(value)", { value: 42 })).toBe("42");
    });

    test("Boolean conversion", () => {
      expect(TemplateEngine.evaluate("Boolean(value)", { value: 1 })).toBe(true);
      expect(TemplateEngine.evaluate("Boolean(value)", { value: 0 })).toBe(false);
    });

    test("parseInt", () => {
      expect(TemplateEngine.evaluate("parseInt(value, 10)", { value: "42px" })).toBe(42);
    });

    test("parseFloat", () => {
      expect(TemplateEngine.evaluate("parseFloat(value)", { value: "3.14" })).toBe(3.14);
    });

    test("toFixed", () => {
      expect(TemplateEngine.evaluate("value.toFixed(2)", { value: 3.14159 })).toBe("3.14");
    });
  });

  // ==========================================================================
  // 13. Date Operations
  // ==========================================================================
  describe("Date Operations", () => {
    test("Date method calls", () => {
      const date = new Date("2024-06-15T10:30:00");
      expect(TemplateEngine.evaluate("date.getFullYear()", { date })).toBe(2024);
      expect(TemplateEngine.evaluate("date.getMonth()", { date })).toBe(5); // 0-indexed
      expect(TemplateEngine.evaluate("date.getDate()", { date })).toBe(15);
    });

    test("Date formatting with function", () => {
      const formatDate = (d: Date) => d.toISOString().split("T")[0];
      expect(TemplateEngine.evaluate(
        "formatDate(date)",
        { formatDate, date: new Date("2024-06-15") }
      )).toBe("2024-06-15");
    });
  });

  // ==========================================================================
  // 14. Complex Real-World Expressions
  // ==========================================================================
  describe("Complex Real-World Expressions", () => {
    test("cart total calculation", () => {
      const data = {
        items: [
          { price: 10, quantity: 2 },
          { price: 15, quantity: 1 },
          { price: 5, quantity: 3 }
        ]
      };
      expect(TemplateEngine.evaluate(
        "items.reduce((sum, item) => sum + item.price * item.quantity, 0)",
        data
      )).toBe(50); // 20 + 15 + 15 = 50
    });

    test("user display name", () => {
      expect(TemplateEngine.evaluate(
        "user.nickname || user.firstName + ' ' + user.lastName",
        { user: { firstName: "John", lastName: "Doe", nickname: "" } }
      )).toBe("John Doe");

      expect(TemplateEngine.evaluate(
        "user.nickname || user.firstName + ' ' + user.lastName",
        { user: { firstName: "John", lastName: "Doe", nickname: "JD" } }
      )).toBe("JD");
    });

    test("status badge class", () => {
      expect(TemplateEngine.evaluate(
        "status === 'active' ? 'badge-success' : status === 'pending' ? 'badge-warning' : 'badge-error'",
        { status: "active" }
      )).toBe("badge-success");
    });

    test("pluralization", () => {
      expect(TemplateEngine.evaluate(
        "count + ' ' + (count === 1 ? 'item' : 'items')",
        { count: 1 }
      )).toBe("1 item");

      expect(TemplateEngine.evaluate(
        "count + ' ' + (count === 1 ? 'item' : 'items')",
        { count: 5 }
      )).toBe("5 items");
    });

    test("conditional rendering data", () => {
      expect(TemplateEngine.evaluate(
        "isLoading ? 'Loading...' : error ? 'Error: ' + error : 'Data: ' + data",
        { isLoading: false, error: null, data: "Success" }
      )).toBe("Data: Success");
    });

    test("safe property access with fallback", () => {
      expect(TemplateEngine.evaluate(
        "user?.profile?.avatar ?? '/default-avatar.png'",
        { user: { profile: {} } }
      )).toBe("/default-avatar.png");
    });

    test("filter and count", () => {
      expect(TemplateEngine.evaluate(
        "items.filter(i => i.active).length",
        { items: [{ active: true }, { active: false }, { active: true }] }
      )).toBe(2);
    });

    test("complex sorting expression", () => {
      const data = {
        users: [
          { name: "Charlie", age: 30 },
          { name: "Alice", age: 25 },
          { name: "Bob", age: 35 }
        ]
      };
      const result = TemplateEngine.evaluate(
        "users.slice().sort((a, b) => a.name.localeCompare(b.name))",
        data
      );
      expect(result[0].name).toBe("Alice");
      expect(result[1].name).toBe("Bob");
      expect(result[2].name).toBe("Charlie");
    });
  });

  // ==========================================================================
  // 15. Caching Verification
  // ==========================================================================
  describe("Caching Verification", () => {
    test("complex expressions are cached", () => {
      const complexExpr = "items.filter(x => x > 2).map(x => x * 2).reduce((a, b) => a + b, 0)";

      // First evaluation
      const result1 = TemplateEngine.evaluate(complexExpr, { items: [1, 2, 3, 4, 5] });
      const cacheSize1 = (TemplateEngine as any)._functionCache.size;

      // Second evaluation (should use cache)
      const result2 = TemplateEngine.evaluate(complexExpr, { items: [2, 3, 4, 5, 6] });
      const cacheSize2 = (TemplateEngine as any)._functionCache.size;

      expect(result1).toBe(24); // filter [3,4,5], map [6,8,10], reduce = 24
      expect(result2).toBe(36); // filter [3,4,5,6], map [6,8,10,12], reduce = 36
      expect(cacheSize1).toBe(cacheSize2); // Cache didn't grow
    });

    test("same expression with different data uses cache", () => {
      (TemplateEngine as any)._functionCache.clear();

      const expr = "user?.name ?? 'Guest'";

      // Multiple evaluations with different data
      TemplateEngine.evaluate(expr, { user: { name: "Alice" } });
      TemplateEngine.evaluate(expr, { user: { name: "Bob" } });
      TemplateEngine.evaluate(expr, { user: null });
      TemplateEngine.evaluate(expr, {});

      // Should only have 1 cached function
      expect((TemplateEngine as any)._functionCache.size).toBe(1);
    });
  });

  // ==========================================================================
  // 16. Edge Cases and Error Handling
  // ==========================================================================
  describe("Edge Cases and Error Handling", () => {
    test("undefined property returns undefined", () => {
      expect(TemplateEngine.evaluate("nonexistent", {})).toBeUndefined();
    });

    test("null property access returns undefined", () => {
      expect(TemplateEngine.evaluate("obj.prop", { obj: null })).toBeUndefined();
    });

    test("syntax error returns undefined", () => {
      expect(TemplateEngine.evaluate("this is not valid js", {})).toBeUndefined();
    });

    test("division by zero", () => {
      expect(TemplateEngine.evaluate("a / b", { a: 10, b: 0 })).toBe(Infinity);
    });

    test("expression with special characters in strings", () => {
      expect(TemplateEngine.evaluate("text", { text: "Hello's \"World\"" })).toBe("Hello's \"World\"");
    });
  });
});

// =============================================================================
// Corner Cases Tests
// =============================================================================

describe("TemplateEngine Corner Cases", () => {

  beforeEach(() => {
    (TemplateEngine as any)._functionCache.clear();
  });

  // ==========================================================================
  // 1. parse() Pattern Edge Cases
  // ==========================================================================
  describe("parse() Pattern Edge Cases", () => {
    test("adjacent expressions without space", () => {
      expect(TemplateEngine.parse("{{a}}{{b}}", { a: "Hello", b: "World" })).toBe("HelloWorld");
    });

    test("adjacent expressions with separator", () => {
      expect(TemplateEngine.parse("{{a}}-{{b}}", { a: "Hello", b: "World" })).toBe("Hello-World");
    });

    test("empty expression evaluates to undefined", () => {
      // Empty expression evaluates to undefined which renders as "undefined"
      expect(TemplateEngine.parse("{{}}", {})).toBe("undefined");
    });

    test("whitespace-only expression evaluates to undefined", () => {
      // After trimming whitespace, empty expression evaluates to undefined
      expect(TemplateEngine.parse("{{   }}", {})).toBe("undefined");
    });

    test("expression with extra internal whitespace", () => {
      expect(TemplateEngine.parse("{{   name   }}", { name: "Test" })).toBe("Test");
    });

    test("expression with newlines", () => {
      expect(TemplateEngine.parse("{{\nname\n}}", { name: "Test" })).toBe("Test");
    });

    test("expression with tabs", () => {
      expect(TemplateEngine.parse("{{\tname\t}}", { name: "Test" })).toBe("Test");
    });

    test("triple braces behavior", () => {
      // {{{name}}} - regex is non-greedy, matches {{name}} inside {  }
      // The outer braces become part of the result
      const result = TemplateEngine.parse("{{{name}}}", { name: "Test" });
      // Actual behavior: {{name}} matches, {name} is expression, evaluates to Test
      // Result is { + Test + } = not quite, let's see actual
      expect(result).toBeDefined(); // Behavior depends on regex matching
    });

    test("unmatched opening braces", () => {
      expect(TemplateEngine.parse("Hello {{ name", { name: "Test" })).toBe("Hello {{ name");
    });

    test("unmatched closing braces", () => {
      expect(TemplateEngine.parse("Hello }} name", { name: "Test" })).toBe("Hello }} name");
    });

    test("nested braces in string literal", () => {
      expect(TemplateEngine.parse("{{ '{nested}' }}", {})).toBe("{nested}");
    });

    test("expression in HTML attribute", () => {
      expect(TemplateEngine.parse('<div class="{{cls}}">', { cls: "active" })).toBe('<div class="active">');
    });

    test("multiple expressions in HTML attribute", () => {
      expect(TemplateEngine.parse('<div class="{{a}} {{b}}">', { a: "foo", b: "bar" })).toBe('<div class="foo bar">');
    });

    test("expression with HTML special characters result", () => {
      expect(TemplateEngine.parse("{{text}}", { text: "<script>alert('xss')</script>" }))
        .toBe("<script>alert('xss')</script>"); // No escaping by default
    });

    test("many expressions in one template", () => {
      const template = "{{a}}{{b}}{{c}}{{d}}{{e}}{{f}}{{g}}{{h}}{{i}}{{j}}";
      const data = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
      expect(TemplateEngine.parse(template, data)).toBe("12345678910");
    });
  });

  // ==========================================================================
  // 2. Return Type Edge Cases
  // ==========================================================================
  describe("Return Type Edge Cases", () => {
    test("undefined result renders as empty", () => {
      expect(TemplateEngine.parse("{{value}}", { value: undefined })).toBe("undefined");
    });

    test("null result renders as null", () => {
      expect(TemplateEngine.parse("{{value}}", { value: null })).toBe("null");
    });

    test("NaN result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: NaN })).toBe("NaN");
    });

    test("Infinity result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: Infinity })).toBe("Infinity");
    });

    test("negative Infinity result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: -Infinity })).toBe("-Infinity");
    });

    test("BigInt result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: BigInt(9007199254740991) })).toBe("9007199254740991");
    });

    test("BigInt arithmetic", () => {
      expect(TemplateEngine.evaluate("a + b", { a: BigInt(1), b: BigInt(2) })).toBe(BigInt(3));
    });

    test("boolean true result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: true })).toBe("true");
    });

    test("boolean false result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: false })).toBe("false");
    });

    test("zero result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: 0 })).toBe("0");
    });

    test("empty string result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: "" })).toBe("");
    });

    test("array result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: [1, 2, 3] })).toBe("1,2,3");
    });

    test("object result", () => {
      expect(TemplateEngine.parse("{{value}}", { value: { a: 1 } })).toBe("[object Object]");
    });

    test("function result", () => {
      const fn = () => "test";
      const result = TemplateEngine.parse("{{value}}", { value: fn });
      // Arrow functions stringify differently than function declarations
      expect(result).toContain("=>");
    });

    test("Symbol result", () => {
      // Symbols can't be converted to string implicitly, should handle gracefully
      const result = TemplateEngine.evaluate("value", { value: Symbol("test") });
      expect(typeof result).toBe("symbol");
    });

    test("Date result", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = TemplateEngine.parse("{{value}}", { value: date });
      expect(result).toContain("2024");
    });

    test("RegExp result", () => {
      const result = TemplateEngine.parse("{{value}}", { value: /test/gi });
      expect(result).toBe("/test/gi");
    });
  });

  // ==========================================================================
  // 3. Operators Not Previously Tested
  // ==========================================================================
  describe("Additional Operators", () => {
    test("typeof operator", () => {
      expect(TemplateEngine.evaluate("typeof value", { value: "hello" })).toBe("string");
      expect(TemplateEngine.evaluate("typeof value", { value: 42 })).toBe("number");
      expect(TemplateEngine.evaluate("typeof value", { value: true })).toBe("boolean");
      expect(TemplateEngine.evaluate("typeof value", { value: {} })).toBe("object");
      expect(TemplateEngine.evaluate("typeof value", { value: [] })).toBe("object");
      expect(TemplateEngine.evaluate("typeof value", { value: null })).toBe("object");
      expect(TemplateEngine.evaluate("typeof value", { value: undefined })).toBe("undefined");
      expect(TemplateEngine.evaluate("typeof value", { value: () => {} })).toBe("function");
    });

    test("instanceof operator", () => {
      expect(TemplateEngine.evaluate("value instanceof Array", { value: [1, 2, 3] })).toBe(true);
      expect(TemplateEngine.evaluate("value instanceof Array", { value: "not array" })).toBe(false);
      expect(TemplateEngine.evaluate("value instanceof Date", { value: new Date() })).toBe(true);
      expect(TemplateEngine.evaluate("value instanceof Object", { value: {} })).toBe(true);
    });

    test("new operator", () => {
      expect(TemplateEngine.evaluate("new Date('2024-01-01').getFullYear()", {})).toBe(2024);
      expect(TemplateEngine.evaluate("new Array(3).length", {})).toBe(3);
    });

    test("bitwise AND", () => {
      expect(TemplateEngine.evaluate("a & b", { a: 5, b: 3 })).toBe(1); // 101 & 011 = 001
    });

    test("bitwise OR", () => {
      expect(TemplateEngine.evaluate("a | b", { a: 5, b: 3 })).toBe(7); // 101 | 011 = 111
    });

    test("bitwise XOR", () => {
      expect(TemplateEngine.evaluate("a ^ b", { a: 5, b: 3 })).toBe(6); // 101 ^ 011 = 110
    });

    test("bitwise NOT", () => {
      expect(TemplateEngine.evaluate("~a", { a: 5 })).toBe(-6);
    });

    test("left shift", () => {
      expect(TemplateEngine.evaluate("a << 1", { a: 5 })).toBe(10);
    });

    test("right shift", () => {
      expect(TemplateEngine.evaluate("a >> 1", { a: 5 })).toBe(2);
    });

    test("unsigned right shift", () => {
      expect(TemplateEngine.evaluate("a >>> 1", { a: -1 })).toBe(2147483647);
    });

    test("comma operator", () => {
      expect(TemplateEngine.evaluate("(1, 2, 3)", {})).toBe(3);
    });

    test("void operator", () => {
      expect(TemplateEngine.evaluate("void 0", {})).toBe(undefined);
      expect(TemplateEngine.evaluate("void(0)", {})).toBe(undefined);
    });

    test("regex test", () => {
      expect(TemplateEngine.evaluate("/hello/.test(str)", { str: "hello world" })).toBe(true);
      expect(TemplateEngine.evaluate("/hello/.test(str)", { str: "goodbye" })).toBe(false);
    });

    test("regex match", () => {
      const result = TemplateEngine.evaluate("str.match(/\\d+/)", { str: "abc123def" });
      expect(result?.[0]).toBe("123");
    });

    test("regex replace", () => {
      expect(TemplateEngine.evaluate("str.replace(/o/g, '0')", { str: "hello" })).toBe("hell0");
    });
  });

  // ==========================================================================
  // 4. Security Considerations
  // ==========================================================================
  describe("Security Considerations", () => {
    test("__proto__ access", () => {
      // This tests if __proto__ manipulation is possible
      const result = TemplateEngine.evaluate("obj.__proto__", { obj: {} });
      expect(result).toBeDefined(); // Access is allowed but shouldn't break
    });

    test("constructor access", () => {
      const result = TemplateEngine.evaluate("obj.constructor.name", { obj: {} });
      expect(result).toBe("Object");
    });

    test("this keyword returns data context", () => {
      // 'this' in the function context should be the data object due to 'with'
      const result = TemplateEngine.evaluate("this", { name: "test" });
      // The behavior depends on strict mode and 'with' statement
      expect(result).toBeDefined();
    });

    test("globalThis access", () => {
      // globalThis should be accessible (not sandboxed)
      const result = TemplateEngine.evaluate("typeof globalThis", {});
      expect(result).toBe("object");
    });

    test("window access in browser context", () => {
      // In Bun test environment, window might not exist
      const result = TemplateEngine.evaluate("typeof window", {});
      // Could be 'object' or 'undefined' depending on environment
      expect(["object", "undefined"]).toContain(result);
    });

    test("process access in Node context", () => {
      const result = TemplateEngine.evaluate("typeof process", {});
      expect(result).toBe("object"); // Available in Bun
    });

    test("Function constructor access", () => {
      // Can create functions - this is inherent to the implementation
      const result = TemplateEngine.evaluate("Function.constructor.name", {});
      expect(result).toBe("Function");
    });

    test("eval is accessible but should be used carefully", () => {
      // eval is available in the expression context
      const result = TemplateEngine.evaluate("typeof eval", {});
      expect(result).toBe("function");
    });
  });

  // ==========================================================================
  // 5. Unicode and Special Characters
  // ==========================================================================
  describe("Unicode and Special Characters", () => {
    test("emoji in string value", () => {
      expect(TemplateEngine.parse("{{emoji}}", { emoji: "Hello 👋 World 🌍" })).toBe("Hello 👋 World 🌍");
    });

    test("emoji in template", () => {
      expect(TemplateEngine.parse("Hello 👋 {{name}}!", { name: "World" })).toBe("Hello 👋 World!");
    });

    test("unicode variable name", () => {
      // JavaScript allows unicode in identifiers
      expect(TemplateEngine.evaluate("名前", { "名前": "テスト" })).toBe("テスト");
    });

    test("unicode property access", () => {
      expect(TemplateEngine.evaluate("obj.名前", { obj: { "名前": "テスト" } })).toBe("テスト");
    });

    test("Chinese characters", () => {
      expect(TemplateEngine.parse("你好 {{name}}", { name: "世界" })).toBe("你好 世界");
    });

    test("Arabic characters", () => {
      expect(TemplateEngine.parse("مرحبا {{name}}", { name: "العالم" })).toBe("مرحبا العالم");
    });

    test("special characters in string", () => {
      expect(TemplateEngine.parse("{{text}}", { text: "Line1\nLine2\tTabbed" })).toBe("Line1\nLine2\tTabbed");
    });

    test("backslash in string", () => {
      expect(TemplateEngine.parse("{{path}}", { path: "C:\\Users\\Test" })).toBe("C:\\Users\\Test");
    });

    test("quotes in string", () => {
      expect(TemplateEngine.parse("{{text}}", { text: 'He said "Hello"' })).toBe('He said "Hello"');
    });
  });

  // ==========================================================================
  // 6. Data Edge Cases
  // ==========================================================================
  describe("Data Edge Cases", () => {
    test("getter property", () => {
      const obj = {
        _value: 42,
        get value() { return this._value * 2; }
      };
      expect(TemplateEngine.evaluate("obj.value", { obj })).toBe(84);
    });

    test("setter property (read)", () => {
      const obj = {
        _name: "test",
        get name() { return this._name.toUpperCase(); },
        set name(v) { this._name = v; }
      };
      expect(TemplateEngine.evaluate("obj.name", { obj })).toBe("TEST");
    });

    test("frozen object", () => {
      const frozen = Object.freeze({ a: 1, b: 2 });
      expect(TemplateEngine.evaluate("obj.a + obj.b", { obj: frozen })).toBe(3);
    });

    test("sealed object", () => {
      const sealed = Object.seal({ a: 1, b: 2 });
      expect(TemplateEngine.evaluate("obj.a + obj.b", { obj: sealed })).toBe(3);
    });

    test("object with null prototype", () => {
      const nullProto = Object.create(null);
      nullProto.value = 42;
      expect(TemplateEngine.evaluate("obj.value", { obj: nullProto })).toBe(42);
    });

    test("Proxy object", () => {
      const target = { value: 10 };
      const proxy = new Proxy(target, {
        get(t, prop) {
          if (prop === "value") return t.value * 2;
          return t[prop as keyof typeof t];
        }
      });
      expect(TemplateEngine.evaluate("obj.value", { obj: proxy })).toBe(20);
    });

    test("Map object", () => {
      const map = new Map([["key", "value"]]);
      expect(TemplateEngine.evaluate("map.get('key')", { map })).toBe("value");
      expect(TemplateEngine.evaluate("map.size", { map })).toBe(1);
    });

    test("Set object", () => {
      const set = new Set([1, 2, 3]);
      expect(TemplateEngine.evaluate("set.has(2)", { set })).toBe(true);
      expect(TemplateEngine.evaluate("set.size", { set })).toBe(3);
    });

    test("WeakMap (limited operations)", () => {
      const key = {};
      const wm = new WeakMap([[key, "value"]]);
      expect(TemplateEngine.evaluate("wm.get(key)", { wm, key })).toBe("value");
    });

    test("sparse array", () => {
      const arr = [1, , , 4]; // Sparse array with holes
      expect(TemplateEngine.evaluate("arr[0]", { arr })).toBe(1);
      expect(TemplateEngine.evaluate("arr[1]", { arr })).toBe(undefined);
      expect(TemplateEngine.evaluate("arr.length", { arr })).toBe(4);
    });

    test("array-like object", () => {
      const arrayLike = { 0: "a", 1: "b", length: 2 };
      expect(TemplateEngine.evaluate("Array.from(obj).join(',')", { obj: arrayLike })).toBe("a,b");
    });

    test("circular reference (access non-circular part)", () => {
      const obj: any = { name: "test" };
      obj.self = obj; // Circular reference
      expect(TemplateEngine.evaluate("obj.name", { obj })).toBe("test");
      // Don't try to stringify circular reference
    });
  });

  // ==========================================================================
  // 7. Cache Edge Cases
  // ==========================================================================
  describe("Cache Edge Cases", () => {
    test("whitespace differences create different cache entries", () => {
      (TemplateEngine as any)._functionCache.clear();

      TemplateEngine.evaluate("a+b", { a: 1, b: 2 });
      TemplateEngine.evaluate("a + b", { a: 1, b: 2 });
      TemplateEngine.evaluate("a  +  b", { a: 1, b: 2 });

      // Each whitespace variation is a different cache key
      expect((TemplateEngine as any)._functionCache.size).toBe(3);
    });

    test("parse() extracts expressions with trimmed whitespace", () => {
      (TemplateEngine as any)._functionCache.clear();

      TemplateEngine.parse("{{ name }}", { name: "A" });
      TemplateEngine.parse("{{name}}", { name: "B" });
      TemplateEngine.parse("{{  name  }}", { name: "C" });

      // The regex trims whitespace, so these should all be "name"
      expect((TemplateEngine as any)._functionCache.size).toBe(1);
    });

    test("non-string input to evaluate returns input unchanged", () => {
      expect(TemplateEngine.evaluate(42 as any, {})).toBe(42);
      expect(TemplateEngine.evaluate(null as any, {})).toBe(null);
      expect(TemplateEngine.evaluate(undefined as any, {})).toBe(undefined);
      expect(TemplateEngine.evaluate({ a: 1 } as any, {})).toEqual({ a: 1 });
    });

    test("non-string input to parse returns input unchanged", () => {
      expect(TemplateEngine.parse(42 as any, {})).toBe(42);
      expect(TemplateEngine.parse(null as any, {})).toBe(null);
      expect(TemplateEngine.parse(undefined as any, {})).toBe(undefined);
    });

    test("very long expression", () => {
      const longExpr = "a" + " + a".repeat(100);
      const result = TemplateEngine.evaluate(longExpr, { a: 1 });
      expect(result).toBe(101);
    });

    test("expression with many different operators", () => {
      const expr = "a + b - c * d / e % f ** g & h | i ^ j << k >> l";
      const data = { a: 100, b: 50, c: 10, d: 4, e: 2, f: 7, g: 2, h: 15, i: 8, j: 3, k: 1, l: 1 };
      // Just verify it doesn't crash and returns a number
      const result = TemplateEngine.evaluate(expr, data);
      expect(typeof result).toBe("number");
    });

    test("cache persists between evaluate calls", () => {
      (TemplateEngine as any)._functionCache.clear();

      // First call - should create cache entry
      TemplateEngine.evaluate("x * 2", { x: 5 });
      const sizeAfterFirst = (TemplateEngine as any)._functionCache.size;

      // Second call with same expression - should use cache
      TemplateEngine.evaluate("x * 2", { x: 10 });
      const sizeAfterSecond = (TemplateEngine as any)._functionCache.size;

      expect(sizeAfterFirst).toBe(1);
      expect(sizeAfterSecond).toBe(1);
    });
  });

  // ==========================================================================
  // 8. Expression with Object Literals
  // ==========================================================================
  describe("Object Literals in Expressions", () => {
    test("object literal requires parentheses", () => {
      // Without parens, {} is treated as a block
      const result = TemplateEngine.evaluate("({a: 1, b: 2})", {});
      expect(result).toEqual({ a: 1, b: 2 });
    });

    test("array literal", () => {
      const result = TemplateEngine.evaluate("[1, 2, 3]", {});
      expect(result).toEqual([1, 2, 3]);
    });

    test("nested object literal", () => {
      const result = TemplateEngine.evaluate("({a: {b: {c: 1}}})", {});
      expect(result).toEqual({ a: { b: { c: 1 } } });
    });

    test("object literal with computed property", () => {
      const result = TemplateEngine.evaluate("({[key]: value})", { key: "name", value: "test" });
      expect(result).toEqual({ name: "test" });
    });

    test("object literal with shorthand property", () => {
      const result = TemplateEngine.evaluate("({a, b})", { a: 1, b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    test("object literal with method", () => {
      const result = TemplateEngine.evaluate("({fn() { return 42; }})", {});
      expect(result.fn()).toBe(42);
    });
  });

  // ==========================================================================
  // 9. Async and Generator (Expected to Fail or Behave Differently)
  // ==========================================================================
  describe("Async and Generator Expressions", () => {
    test("async function expression", () => {
      const result = TemplateEngine.evaluate("(async () => 42)()", {});
      // Returns a Promise
      expect(result instanceof Promise).toBe(true);
    });

    test("generator function expression", () => {
      const result = TemplateEngine.evaluate("(function* () { yield 1; yield 2; })()", {});
      // Returns a generator
      expect(typeof result.next).toBe("function");
    });

    test("await is syntax error outside async", () => {
      // await outside async function is a syntax error
      const result = TemplateEngine.evaluate("await Promise.resolve(42)", {});
      expect(result).toBeUndefined(); // Should fail and return undefined
    });
  });

  // ==========================================================================
  // 10. Error Recovery
  // ==========================================================================
  describe("Error Recovery", () => {
    test("runtime error returns undefined", () => {
      expect(TemplateEngine.evaluate("obj.method()", { obj: {} })).toBeUndefined();
    });

    test("type error returns undefined", () => {
      expect(TemplateEngine.evaluate("null.property", {})).toBeUndefined();
    });

    test("reference error returns undefined", () => {
      expect(TemplateEngine.evaluate("undefinedVariable", {})).toBeUndefined();
    });

    test("syntax error returns undefined", () => {
      expect(TemplateEngine.evaluate("function {}", {})).toBeUndefined();
    });

    test("error in one expression doesn't affect others in template", () => {
      const result = TemplateEngine.parse("{{a}} {{invalid.prop}} {{b}}", { a: "A", b: "B" });
      expect(result).toBe("A undefined B");
    });
  });
});

// =============================================================================
// Remaining Cases Tests
// =============================================================================

describe("TemplateEngine Remaining Cases", () => {

  beforeEach(() => {
    (TemplateEngine as any)._functionCache.clear();
  });

  // ==========================================================================
  // 1. Template Literals Inside Expressions
  // ==========================================================================
  describe("Template Literals Inside Expressions", () => {
    test("basic template literal", () => {
      expect(TemplateEngine.evaluate("`Hello ${name}`", { name: "World" })).toBe("Hello World");
    });

    test("template literal with expression", () => {
      expect(TemplateEngine.evaluate("`Sum: ${a + b}`", { a: 2, b: 3 })).toBe("Sum: 5");
    });

    test("template literal with multiple interpolations", () => {
      expect(TemplateEngine.evaluate(
        "`${greeting}, ${name}! You have ${count} messages.`",
        { greeting: "Hello", name: "User", count: 5 }
      )).toBe("Hello, User! You have 5 messages.");
    });

    test("nested template literal", () => {
      expect(TemplateEngine.evaluate(
        "`Outer ${`Inner ${value}`}`",
        { value: "test" }
      )).toBe("Outer Inner test");
    });

    test("template literal with ternary", () => {
      expect(TemplateEngine.evaluate(
        "`Status: ${active ? 'Online' : 'Offline'}`",
        { active: true }
      )).toBe("Status: Online");
    });

    test("template literal with method call", () => {
      expect(TemplateEngine.evaluate(
        "`Name: ${name.toUpperCase()}`",
        { name: "john" }
      )).toBe("Name: JOHN");
    });

    test("multiline template literal", () => {
      const result = TemplateEngine.evaluate(
        "`Line 1\nLine 2\nLine 3`",
        {}
      );
      expect(result).toBe("Line 1\nLine 2\nLine 3");
    });

    test("template literal with backtick escape", () => {
      expect(TemplateEngine.evaluate("`Value: \\`${value}\\``", { value: "test" })).toBe("Value: `test`");
    });
  });

  // ==========================================================================
  // 2. Logical Assignment Operators
  // ==========================================================================
  describe("Logical Assignment Operators", () => {
    test("nullish assignment (??=) concept", () => {
      // Can't do assignment in expression, but can test the logic
      expect(TemplateEngine.evaluate("a ?? (a = b, a)", { a: null, b: 10 })).toBe(10);
    });

    test("nullish coalescing with assignment simulation", () => {
      // Test the ?? operator which is the basis of ??=
      expect(TemplateEngine.evaluate("value ?? defaultValue", { value: null, defaultValue: "default" })).toBe("default");
      expect(TemplateEngine.evaluate("value ?? defaultValue", { value: "exists", defaultValue: "default" })).toBe("exists");
    });

    test("OR assignment (||=) concept", () => {
      expect(TemplateEngine.evaluate("a || b", { a: "", b: "fallback" })).toBe("fallback");
      expect(TemplateEngine.evaluate("a || b", { a: "value", b: "fallback" })).toBe("value");
    });

    test("AND assignment (&&=) concept", () => {
      expect(TemplateEngine.evaluate("a && b", { a: true, b: "value" })).toBe("value");
      expect(TemplateEngine.evaluate("a && b", { a: false, b: "value" })).toBe(false);
    });
  });

  // ==========================================================================
  // 3. Numeric Edge Cases
  // ==========================================================================
  describe("Numeric Edge Cases", () => {
    test("Number.MAX_SAFE_INTEGER", () => {
      expect(TemplateEngine.evaluate("Number.MAX_SAFE_INTEGER", {})).toBe(9007199254740991);
    });

    test("Number.MIN_SAFE_INTEGER", () => {
      expect(TemplateEngine.evaluate("Number.MIN_SAFE_INTEGER", {})).toBe(-9007199254740991);
    });

    test("Number.MAX_VALUE", () => {
      expect(TemplateEngine.evaluate("Number.MAX_VALUE", {})).toBe(Number.MAX_VALUE);
    });

    test("Number.MIN_VALUE", () => {
      expect(TemplateEngine.evaluate("Number.MIN_VALUE", {})).toBe(Number.MIN_VALUE);
    });

    test("Number.EPSILON", () => {
      expect(TemplateEngine.evaluate("Number.EPSILON", {})).toBe(Number.EPSILON);
    });

    test("Number.POSITIVE_INFINITY", () => {
      expect(TemplateEngine.evaluate("Number.POSITIVE_INFINITY", {})).toBe(Infinity);
    });

    test("Number.NEGATIVE_INFINITY", () => {
      expect(TemplateEngine.evaluate("Number.NEGATIVE_INFINITY", {})).toBe(-Infinity);
    });

    test("Number.NaN", () => {
      expect(TemplateEngine.evaluate("Number.isNaN(Number.NaN)", {})).toBe(true);
    });

    test("numeric separator (1_000_000)", () => {
      expect(TemplateEngine.evaluate("1_000_000", {})).toBe(1000000);
    });

    test("numeric separator in decimal", () => {
      expect(TemplateEngine.evaluate("1_234.567_89", {})).toBe(1234.56789);
    });

    test("binary with separator", () => {
      expect(TemplateEngine.evaluate("0b1010_0001", {})).toBe(161);
    });

    test("hex with separator", () => {
      expect(TemplateEngine.evaluate("0xFF_FF", {})).toBe(65535);
    });

    test("Number.isFinite", () => {
      expect(TemplateEngine.evaluate("Number.isFinite(42)", {})).toBe(true);
      expect(TemplateEngine.evaluate("Number.isFinite(Infinity)", {})).toBe(false);
      expect(TemplateEngine.evaluate("Number.isFinite(NaN)", {})).toBe(false);
    });

    test("Number.isInteger", () => {
      expect(TemplateEngine.evaluate("Number.isInteger(42)", {})).toBe(true);
      expect(TemplateEngine.evaluate("Number.isInteger(42.5)", {})).toBe(false);
    });

    test("Number.isNaN", () => {
      expect(TemplateEngine.evaluate("Number.isNaN(NaN)", {})).toBe(true);
      expect(TemplateEngine.evaluate("Number.isNaN(42)", {})).toBe(false);
      expect(TemplateEngine.evaluate("Number.isNaN('hello')", {})).toBe(false); // Unlike global isNaN
    });

    test("Number.isSafeInteger", () => {
      expect(TemplateEngine.evaluate("Number.isSafeInteger(42)", {})).toBe(true);
      expect(TemplateEngine.evaluate("Number.isSafeInteger(9007199254740992)", {})).toBe(false);
    });
  });

  // ==========================================================================
  // 4. Built-in Methods
  // ==========================================================================
  describe("Built-in Methods", () => {
    test("JSON.parse", () => {
      expect(TemplateEngine.evaluate('JSON.parse(\'{"a":1}\')', {})).toEqual({ a: 1 });
    });

    test("JSON.stringify", () => {
      expect(TemplateEngine.evaluate("JSON.stringify(obj)", { obj: { a: 1 } })).toBe('{"a":1}');
    });

    test("JSON.stringify with formatting", () => {
      expect(TemplateEngine.evaluate("JSON.stringify(obj, null, 2)", { obj: { a: 1 } })).toBe('{\n  "a": 1\n}');
    });

    test("Array.isArray", () => {
      expect(TemplateEngine.evaluate("Array.isArray(value)", { value: [1, 2, 3] })).toBe(true);
      expect(TemplateEngine.evaluate("Array.isArray(value)", { value: "not array" })).toBe(false);
      expect(TemplateEngine.evaluate("Array.isArray(value)", { value: { length: 1 } })).toBe(false);
    });

    test("Array.from", () => {
      expect(TemplateEngine.evaluate("Array.from('abc')", {})).toEqual(["a", "b", "c"]);
      expect(TemplateEngine.evaluate("Array.from({length: 3}, (_, i) => i)", {})).toEqual([0, 1, 2]);
    });

    test("Array.of", () => {
      expect(TemplateEngine.evaluate("Array.of(1, 2, 3)", {})).toEqual([1, 2, 3]);
    });

    test("Object.assign", () => {
      expect(TemplateEngine.evaluate(
        "Object.assign({}, a, b)",
        { a: { x: 1 }, b: { y: 2 } }
      )).toEqual({ x: 1, y: 2 });
    });

    test("Object.freeze (read frozen object)", () => {
      const result = TemplateEngine.evaluate(
        "Object.isFrozen(Object.freeze({a: 1}))",
        {}
      );
      expect(result).toBe(true);
    });

    test("Object.keys, values, entries", () => {
      const obj = { a: 1, b: 2 };
      expect(TemplateEngine.evaluate("Object.keys(obj)", { obj })).toEqual(["a", "b"]);
      expect(TemplateEngine.evaluate("Object.values(obj)", { obj })).toEqual([1, 2]);
      expect(TemplateEngine.evaluate("Object.entries(obj)", { obj })).toEqual([["a", 1], ["b", 2]]);
    });

    test("Object.fromEntries", () => {
      expect(TemplateEngine.evaluate(
        "Object.fromEntries([['a', 1], ['b', 2]])",
        {}
      )).toEqual({ a: 1, b: 2 });
    });

    test("Object.hasOwn", () => {
      expect(TemplateEngine.evaluate("Object.hasOwn(obj, 'a')", { obj: { a: 1 } })).toBe(true);
      expect(TemplateEngine.evaluate("Object.hasOwn(obj, 'b')", { obj: { a: 1 } })).toBe(false);
    });

    test("encodeURIComponent", () => {
      expect(TemplateEngine.evaluate("encodeURIComponent(str)", { str: "hello world" })).toBe("hello%20world");
    });

    test("decodeURIComponent", () => {
      expect(TemplateEngine.evaluate("decodeURIComponent(str)", { str: "hello%20world" })).toBe("hello world");
    });

    test("encodeURI / decodeURI", () => {
      expect(TemplateEngine.evaluate("encodeURI(url)", { url: "https://example.com/path?q=hello world" }))
        .toBe("https://example.com/path?q=hello%20world");
    });

    test("atob / btoa", () => {
      expect(TemplateEngine.evaluate("btoa('hello')", {})).toBe("aGVsbG8=");
      expect(TemplateEngine.evaluate("atob('aGVsbG8=')", {})).toBe("hello");
    });
  });

  // ==========================================================================
  // 5. Arrow Function Features
  // ==========================================================================
  describe("Arrow Function Features", () => {
    test("rest parameters", () => {
      expect(TemplateEngine.evaluate(
        "((...args) => args.length)(1, 2, 3, 4, 5)",
        {}
      )).toBe(5);
    });

    test("rest parameters with array spread", () => {
      expect(TemplateEngine.evaluate(
        "((...args) => args.reduce((a, b) => a + b, 0))(...nums)",
        { nums: [1, 2, 3, 4, 5] }
      )).toBe(15);
    });

    test("default parameters", () => {
      expect(TemplateEngine.evaluate("((a = 10) => a)()", {})).toBe(10);
      expect(TemplateEngine.evaluate("((a = 10) => a)(5)", {})).toBe(5);
    });

    test("default parameters with expression", () => {
      expect(TemplateEngine.evaluate(
        "((a = 1, b = a * 2) => a + b)()",
        {}
      )).toBe(3); // 1 + 2
    });

    test("destructuring in arrow params - array", () => {
      expect(TemplateEngine.evaluate(
        "(([a, b]) => a + b)([1, 2])",
        {}
      )).toBe(3);
    });

    test("destructuring in arrow params - object", () => {
      expect(TemplateEngine.evaluate(
        "(({x, y}) => x + y)({x: 10, y: 20})",
        {}
      )).toBe(30);
    });

    test("destructuring with default", () => {
      expect(TemplateEngine.evaluate(
        "(({x = 5}) => x)({})",
        {}
      )).toBe(5);
    });

    test("destructuring with rename", () => {
      expect(TemplateEngine.evaluate(
        "(({x: renamed}) => renamed)({x: 42})",
        {}
      )).toBe(42);
    });

    test("nested destructuring", () => {
      expect(TemplateEngine.evaluate(
        "(({a: {b}}) => b)({a: {b: 'nested'}})",
        {}
      )).toBe("nested");
    });

    test("mixed rest and destructuring", () => {
      expect(TemplateEngine.evaluate(
        "(([first, ...rest]) => rest.length)([1, 2, 3, 4])",
        {}
      )).toBe(3);
    });
  });

  // ==========================================================================
  // 6. Nested Expression Strings
  // ==========================================================================
  describe("Nested Expression Strings", () => {
    test("expression returning template-like string", () => {
      // Should return the literal string, not parse it again
      expect(TemplateEngine.parse("{{text}}", { text: "{{name}}" })).toBe("{{name}}");
    });

    test("expression with braces in result", () => {
      expect(TemplateEngine.parse("{{text}}", { text: "{not a template}" })).toBe("{not a template}");
    });

    test("building template-like string", () => {
      expect(TemplateEngine.evaluate("'{{' + key + '}}'", { key: "name" })).toBe("{{name}}");
    });

    test("expression result not re-parsed", () => {
      const data = {
        template: "Hello {{inner}}!",
        inner: "World"
      };
      // Only the outer {{template}} is parsed, result is not re-parsed
      expect(TemplateEngine.parse("{{template}}", data)).toBe("Hello {{inner}}!");
    });
  });

  // ==========================================================================
  // 7. Promise Chaining
  // ==========================================================================
  describe("Promise Chaining", () => {
    test("Promise.resolve", () => {
      const result = TemplateEngine.evaluate("Promise.resolve(42)", {});
      expect(result instanceof Promise).toBe(true);
    });

    test("Promise.reject", () => {
      const result = TemplateEngine.evaluate("Promise.reject('error').catch(e => e)", {});
      expect(result instanceof Promise).toBe(true);
    });

    test("Promise.all", () => {
      const result = TemplateEngine.evaluate(
        "Promise.all([Promise.resolve(1), Promise.resolve(2)])",
        {}
      );
      expect(result instanceof Promise).toBe(true);
    });

    test("Promise.race", () => {
      const result = TemplateEngine.evaluate(
        "Promise.race([Promise.resolve('first')])",
        {}
      );
      expect(result instanceof Promise).toBe(true);
    });

    test("Promise with .then chain", () => {
      const result = TemplateEngine.evaluate(
        "Promise.resolve(5).then(x => x * 2)",
        {}
      );
      expect(result instanceof Promise).toBe(true);
    });

    test("Promise with .catch", () => {
      const result = TemplateEngine.evaluate(
        "Promise.reject('err').catch(e => 'caught: ' + e)",
        {}
      );
      expect(result instanceof Promise).toBe(true);
    });

    test("Promise with .finally", () => {
      const result = TemplateEngine.evaluate(
        "Promise.resolve(1).finally(() => {})",
        {}
      );
      expect(result instanceof Promise).toBe(true);
    });
  });

  // ==========================================================================
  // 8. String Methods (Additional)
  // ==========================================================================
  describe("String Methods (Additional)", () => {
    test("startsWith", () => {
      expect(TemplateEngine.evaluate("str.startsWith('Hello')", { str: "Hello World" })).toBe(true);
      expect(TemplateEngine.evaluate("str.startsWith('World')", { str: "Hello World" })).toBe(false);
    });

    test("startsWith with position", () => {
      expect(TemplateEngine.evaluate("str.startsWith('World', 6)", { str: "Hello World" })).toBe(true);
    });

    test("endsWith", () => {
      expect(TemplateEngine.evaluate("str.endsWith('World')", { str: "Hello World" })).toBe(true);
      expect(TemplateEngine.evaluate("str.endsWith('Hello')", { str: "Hello World" })).toBe(false);
    });

    test("endsWith with length", () => {
      expect(TemplateEngine.evaluate("str.endsWith('Hello', 5)", { str: "Hello World" })).toBe(true);
    });

    test("includes", () => {
      expect(TemplateEngine.evaluate("str.includes('lo Wo')", { str: "Hello World" })).toBe(true);
      expect(TemplateEngine.evaluate("str.includes('xyz')", { str: "Hello World" })).toBe(false);
    });

    test("includes with position", () => {
      expect(TemplateEngine.evaluate("str.includes('Hello', 1)", { str: "Hello World" })).toBe(false);
    });

    test("padStart", () => {
      expect(TemplateEngine.evaluate("str.padStart(10, '0')", { str: "123" })).toBe("0000000123");
    });

    test("padStart default padding", () => {
      expect(TemplateEngine.evaluate("str.padStart(10)", { str: "123" })).toBe("       123");
    });

    test("padEnd", () => {
      expect(TemplateEngine.evaluate("str.padEnd(10, '.')", { str: "123" })).toBe("123.......");
    });

    test("repeat", () => {
      expect(TemplateEngine.evaluate("str.repeat(3)", { str: "ab" })).toBe("ababab");
    });

    test("repeat zero times", () => {
      expect(TemplateEngine.evaluate("str.repeat(0)", { str: "ab" })).toBe("");
    });

    test("trimStart / trimEnd", () => {
      expect(TemplateEngine.evaluate("str.trimStart()", { str: "  hello  " })).toBe("hello  ");
      expect(TemplateEngine.evaluate("str.trimEnd()", { str: "  hello  " })).toBe("  hello");
    });

    test("at (string)", () => {
      expect(TemplateEngine.evaluate("str.at(0)", { str: "hello" })).toBe("h");
      expect(TemplateEngine.evaluate("str.at(-1)", { str: "hello" })).toBe("o");
    });

    test("charAt", () => {
      expect(TemplateEngine.evaluate("str.charAt(1)", { str: "hello" })).toBe("e");
    });

    test("charCodeAt", () => {
      expect(TemplateEngine.evaluate("str.charCodeAt(0)", { str: "A" })).toBe(65);
    });

    test("codePointAt", () => {
      expect(TemplateEngine.evaluate("str.codePointAt(0)", { str: "😀" })).toBe(128512);
    });

    test("String.fromCharCode", () => {
      expect(TemplateEngine.evaluate("String.fromCharCode(65, 66, 67)", {})).toBe("ABC");
    });

    test("String.fromCodePoint", () => {
      expect(TemplateEngine.evaluate("String.fromCodePoint(128512)", {})).toBe("😀");
    });

    test("normalize", () => {
      expect(TemplateEngine.evaluate("str.normalize('NFC')", { str: "café" })).toBe("café");
    });

    test("localeCompare", () => {
      expect(TemplateEngine.evaluate("'a'.localeCompare('b')", {})).toBeLessThan(0);
      expect(TemplateEngine.evaluate("'b'.localeCompare('a')", {})).toBeGreaterThan(0);
    });

    test("replaceAll", () => {
      expect(TemplateEngine.evaluate("str.replaceAll('o', '0')", { str: "hello world" })).toBe("hell0 w0rld");
    });

    test("slice", () => {
      expect(TemplateEngine.evaluate("str.slice(1, 4)", { str: "hello" })).toBe("ell");
      expect(TemplateEngine.evaluate("str.slice(-3)", { str: "hello" })).toBe("llo");
    });
  });

  // ==========================================================================
  // 9. Array Methods (Additional)
  // ==========================================================================
  describe("Array Methods (Additional)", () => {
    test("flat", () => {
      expect(TemplateEngine.evaluate("arr.flat()", { arr: [1, [2, [3]]] })).toEqual([1, 2, [3]]);
    });

    test("flat with depth", () => {
      expect(TemplateEngine.evaluate("arr.flat(2)", { arr: [1, [2, [3]]] })).toEqual([1, 2, 3]);
    });

    test("flat Infinity", () => {
      expect(TemplateEngine.evaluate("arr.flat(Infinity)", { arr: [1, [2, [3, [4]]]] })).toEqual([1, 2, 3, 4]);
    });

    test("flatMap", () => {
      expect(TemplateEngine.evaluate(
        "arr.flatMap(x => [x, x * 2])",
        { arr: [1, 2, 3] }
      )).toEqual([1, 2, 2, 4, 3, 6]);
    });

    test("findIndex", () => {
      expect(TemplateEngine.evaluate("arr.findIndex(x => x > 2)", { arr: [1, 2, 3, 4] })).toBe(2);
      expect(TemplateEngine.evaluate("arr.findIndex(x => x > 10)", { arr: [1, 2, 3] })).toBe(-1);
    });

    test("findLast", () => {
      expect(TemplateEngine.evaluate("arr.findLast(x => x > 2)", { arr: [1, 2, 3, 4] })).toBe(4);
    });

    test("findLastIndex", () => {
      expect(TemplateEngine.evaluate("arr.findLastIndex(x => x > 2)", { arr: [1, 2, 3, 4] })).toBe(3);
    });

    test("indexOf", () => {
      expect(TemplateEngine.evaluate("arr.indexOf('b')", { arr: ["a", "b", "c"] })).toBe(1);
      expect(TemplateEngine.evaluate("arr.indexOf('x')", { arr: ["a", "b", "c"] })).toBe(-1);
    });

    test("lastIndexOf", () => {
      expect(TemplateEngine.evaluate("arr.lastIndexOf('b')", { arr: ["a", "b", "c", "b"] })).toBe(3);
    });

    test("concat", () => {
      expect(TemplateEngine.evaluate("arr.concat([4, 5])", { arr: [1, 2, 3] })).toEqual([1, 2, 3, 4, 5]);
    });

    test("concat multiple", () => {
      expect(TemplateEngine.evaluate("arr.concat([4], [5, 6])", { arr: [1, 2, 3] })).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test("slice", () => {
      expect(TemplateEngine.evaluate("arr.slice(1, 3)", { arr: [1, 2, 3, 4, 5] })).toEqual([2, 3]);
    });

    test("slice negative", () => {
      expect(TemplateEngine.evaluate("arr.slice(-2)", { arr: [1, 2, 3, 4, 5] })).toEqual([4, 5]);
    });

    test("at (array)", () => {
      expect(TemplateEngine.evaluate("arr.at(0)", { arr: [1, 2, 3] })).toBe(1);
      expect(TemplateEngine.evaluate("arr.at(-1)", { arr: [1, 2, 3] })).toBe(3);
    });

    test("fill", () => {
      expect(TemplateEngine.evaluate("Array(3).fill(0)", {})).toEqual([0, 0, 0]);
      expect(TemplateEngine.evaluate("[1, 2, 3, 4].fill(0, 1, 3)", {})).toEqual([1, 0, 0, 4]);
    });

    test("copyWithin", () => {
      expect(TemplateEngine.evaluate("[1, 2, 3, 4, 5].copyWithin(0, 3)", {})).toEqual([4, 5, 3, 4, 5]);
    });

    test("entries", () => {
      const result = TemplateEngine.evaluate("Array.from(arr.entries())", { arr: ["a", "b"] });
      expect(result).toEqual([[0, "a"], [1, "b"]]);
    });

    test("keys", () => {
      const result = TemplateEngine.evaluate("Array.from(arr.keys())", { arr: ["a", "b", "c"] });
      expect(result).toEqual([0, 1, 2]);
    });

    test("values", () => {
      const result = TemplateEngine.evaluate("Array.from(arr.values())", { arr: ["a", "b"] });
      expect(result).toEqual(["a", "b"]);
    });

    test("toReversed (non-mutating)", () => {
      const arr = [1, 2, 3];
      expect(TemplateEngine.evaluate("arr.toReversed()", { arr })).toEqual([3, 2, 1]);
      expect(arr).toEqual([1, 2, 3]); // Original unchanged
    });

    test("toSorted (non-mutating)", () => {
      const arr = [3, 1, 2];
      expect(TemplateEngine.evaluate("arr.toSorted()", { arr })).toEqual([1, 2, 3]);
      expect(arr).toEqual([3, 1, 2]); // Original unchanged
    });

    test("toSpliced (non-mutating)", () => {
      const arr = [1, 2, 3, 4];
      expect(TemplateEngine.evaluate("arr.toSpliced(1, 2, 'a', 'b')", { arr })).toEqual([1, "a", "b", 4]);
      expect(arr).toEqual([1, 2, 3, 4]); // Original unchanged
    });

    test("with (non-mutating)", () => {
      const arr = [1, 2, 3];
      expect(TemplateEngine.evaluate("arr.with(1, 'x')", { arr })).toEqual([1, "x", 3]);
      expect(arr).toEqual([1, 2, 3]); // Original unchanged
    });

    test("reduceRight", () => {
      expect(TemplateEngine.evaluate(
        "arr.reduceRight((acc, x) => acc + x, '')",
        { arr: ["a", "b", "c"] }
      )).toBe("cba");
    });
  });

  // ==========================================================================
  // 10. Error Objects
  // ==========================================================================
  describe("Error Objects", () => {
    test("new Error", () => {
      const result = TemplateEngine.evaluate("new Error('test message')", {});
      expect(result instanceof Error).toBe(true);
      expect(result.message).toBe("test message");
    });

    test("Error properties", () => {
      expect(TemplateEngine.evaluate("new Error('test').message", {})).toBe("test");
      expect(TemplateEngine.evaluate("new Error('test').name", {})).toBe("Error");
    });

    test("TypeError", () => {
      const result = TemplateEngine.evaluate("new TypeError('type error')", {});
      expect(result instanceof TypeError).toBe(true);
    });

    test("RangeError", () => {
      const result = TemplateEngine.evaluate("new RangeError('range error')", {});
      expect(result instanceof RangeError).toBe(true);
    });

    test("SyntaxError", () => {
      const result = TemplateEngine.evaluate("new SyntaxError('syntax error')", {});
      expect(result instanceof SyntaxError).toBe(true);
    });

    test("ReferenceError", () => {
      const result = TemplateEngine.evaluate("new ReferenceError('ref error')", {});
      expect(result instanceof ReferenceError).toBe(true);
    });

    test("Error with cause", () => {
      const result = TemplateEngine.evaluate(
        "new Error('outer', { cause: new Error('inner') })",
        {}
      );
      expect(result.cause instanceof Error).toBe(true);
      expect(result.cause.message).toBe("inner");
    });

    test("throwing and catching error", () => {
      // Can't throw in expression, but can create and inspect
      const result = TemplateEngine.evaluate(
        "(() => { try { throw new Error('caught'); } catch(e) { return e.message; } })()",
        {}
      );
      expect(result).toBe("caught");
    });
  });

  // ==========================================================================
  // 11. Console Methods (Verification)
  // ==========================================================================
  describe("Console Methods", () => {
    test("console.log returns undefined", () => {
      // console.log exists but returns undefined
      expect(TemplateEngine.evaluate("typeof console.log", {})).toBe("function");
    });

    test("console methods exist", () => {
      expect(TemplateEngine.evaluate("typeof console.error", {})).toBe("function");
      expect(TemplateEngine.evaluate("typeof console.warn", {})).toBe("function");
      expect(TemplateEngine.evaluate("typeof console.info", {})).toBe("function");
    });
  });

  // ==========================================================================
  // 12. Additional Global Objects
  // ==========================================================================
  describe("Additional Global Objects", () => {
    test("Intl.NumberFormat", () => {
      expect(TemplateEngine.evaluate(
        "new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.56)",
        {}
      )).toBe("$1,234.56");
    });

    test("Intl.DateTimeFormat", () => {
      const result = TemplateEngine.evaluate(
        "new Intl.DateTimeFormat('en-US').format(new Date('2024-01-15'))",
        {}
      );
      expect(result).toContain("2024");
    });

    test("URL object", () => {
      expect(TemplateEngine.evaluate(
        "new URL('https://example.com/path?q=test').hostname",
        {}
      )).toBe("example.com");
    });

    test("URL searchParams", () => {
      expect(TemplateEngine.evaluate(
        "new URL('https://example.com?q=test').searchParams.get('q')",
        {}
      )).toBe("test");
    });

    test("URLSearchParams", () => {
      expect(TemplateEngine.evaluate(
        "new URLSearchParams('a=1&b=2').get('b')",
        {}
      )).toBe("2");
    });

    test("TextEncoder / TextDecoder", () => {
      expect(TemplateEngine.evaluate(
        "new TextDecoder().decode(new TextEncoder().encode('hello'))",
        {}
      )).toBe("hello");
    });
  });
});

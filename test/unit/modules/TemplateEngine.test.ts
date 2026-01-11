/**
 * @fileoverview Tests for the TemplateEngine module of the Eleva framework
 *
 * These tests verify the expression evaluation capabilities of the TemplateEngine module.
 * TemplateEngine.evaluate() is used for resolving @event handlers and :prop bindings.
 */

import { describe, test, expect, beforeEach } from "bun:test";
import { TemplateEngine } from "../../../src/modules/TemplateEngine.js";

// =============================================================================
// Core TemplateEngine Tests
// =============================================================================

describe("TemplateEngine", () => {
  beforeEach(() => {
    // Clear cache before each test to ensure isolation
    (TemplateEngine as any)._functionCache.clear();
  });

  // ==========================================================================
  // 1. Basic Expression Evaluation
  // ==========================================================================

  test("should evaluate valid expressions correctly", () => {
    const data = { a: 2, b: 3 };
    expect(TemplateEngine.evaluate("a + b", data)).toBe(5);
  });

  test("should handle simple property access", () => {
    expect(TemplateEngine.evaluate("name", { name: "John" })).toBe("John");
  });

  test("should handle nested object properties", () => {
    const data = {
      user: {
        name: "John",
        profile: {
          age: 30,
        },
      },
    };
    expect(TemplateEngine.evaluate("user.name", data)).toBe("John");
    expect(TemplateEngine.evaluate("user.profile.age", data)).toBe(30);
  });

  test("should handle array indexing", () => {
    const data = { items: ["apple", "banana"] };
    expect(TemplateEngine.evaluate("items[0]", data)).toBe("apple");
    expect(TemplateEngine.evaluate("items[1]", data)).toBe("banana");
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

  // ==========================================================================
  // 2. Edge Cases and Error Handling
  // ==========================================================================

  test("should return empty string for invalid expressions", () => {
    const data = { a: 1 };
    const result = TemplateEngine.evaluate("a +* b", data);
    expect(result).toBe("");
  });

  test("should return empty string for empty expressions", () => {
    expect(TemplateEngine.evaluate("", {})).toBe("");
    expect(TemplateEngine.evaluate("   ", {})).toBe("");
  });

  test("should handle deeply nested properties", () => {
    const data = { a: { b: { c: { d: { e: { f: "Hello" } } } } } };
    expect(TemplateEngine.evaluate("a.b.c.d.e.f", data)).toBe("Hello");
  });
});

// =============================================================================
// TemplateEngine Complex Expression Handling
// =============================================================================

describe("TemplateEngine Complex Expression Handling", () => {
  beforeEach(() => {
    (TemplateEngine as any)._functionCache.clear();
  });

  // ==========================================================================
  // 1. Function Evaluation
  // ==========================================================================

  describe("Function Evaluation", () => {
    test("should return function references", () => {
      const handler = () => console.log("clicked");
      const data = { handleClick: handler };
      expect(TemplateEngine.evaluate("handleClick", data)).toBe(handler);
    });

    test("should support function calls in expressions", () => {
      const data = {
        greeting: "Hello",
        capitalize: (str: string) => str.toUpperCase(),
      };
      expect(TemplateEngine.evaluate("capitalize(greeting)", data)).toBe("HELLO");
    });

    test("should handle method calls on objects", () => {
      const data = {
        formatter: { format: (v: number) => `$${v.toFixed(2)}` },
        value: 19.99,
      };
      expect(TemplateEngine.evaluate("formatter.format(value)", data)).toBe(
        "$19.99"
      );
    });

    test("should handle chained function calls", () => {
      const data = {
        process: (v: number) => v + 1,
        transform: (v: number) => v * 2,
        value: 5,
      };
      expect(TemplateEngine.evaluate("process(transform(value))", data)).toBe(11);
    });

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
      expect(
        TemplateEngine.evaluate("price * quantity", { price: 9.99, quantity: 3 })
      ).toBe(29.97);
    });

    test("division", () => {
      expect(
        TemplateEngine.evaluate("total / count", { total: 100, count: 4 })
      ).toBe(25);
    });

    test("modulo", () => {
      expect(TemplateEngine.evaluate("value % 3", { value: 10 })).toBe(1);
    });

    test("complex arithmetic", () => {
      expect(
        TemplateEngine.evaluate("(a + b) * c - d / e", {
          a: 2,
          b: 3,
          c: 4,
          d: 10,
          e: 2,
        })
      ).toBe(15);
    });

    test("increment expression", () => {
      expect(TemplateEngine.evaluate("count + 1", { count: 5 })).toBe(6);
    });

    test("exponentiation operator", () => {
      expect(TemplateEngine.evaluate("base ** exp", { base: 2, exp: 3 })).toBe(8);
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
      expect(TemplateEngine.evaluate("a && b", { a: true, b: false })).toBe(
        false
      );
    });

    test("OR operator", () => {
      expect(TemplateEngine.evaluate("a || b", { a: false, b: true })).toBe(true);
      expect(TemplateEngine.evaluate("a || b", { a: false, b: false })).toBe(
        false
      );
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
      expect(
        TemplateEngine.evaluate("user && user.name", { user: { name: "John" } })
      ).toBe("John");
      expect(TemplateEngine.evaluate("user && user.name", { user: null })).toBe(
        null
      );
    });
  });

  // ==========================================================================
  // 5. Ternary Operator
  // ==========================================================================

  describe("Ternary Operator", () => {
    test("simple ternary", () => {
      expect(
        TemplateEngine.evaluate("active ? 'Yes' : 'No'", { active: true })
      ).toBe("Yes");
      expect(
        TemplateEngine.evaluate("active ? 'Yes' : 'No'", { active: false })
      ).toBe("No");
    });

    test("ternary with expressions", () => {
      expect(
        TemplateEngine.evaluate("age >= 18 ? 'Adult' : 'Minor'", { age: 21 })
      ).toBe("Adult");
    });

    test("nested ternary", () => {
      const expr =
        "score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F'";
      expect(TemplateEngine.evaluate(expr, { score: 95 })).toBe("A");
      expect(TemplateEngine.evaluate(expr, { score: 75 })).toBe("C");
    });

    test("ternary with property access", () => {
      expect(TemplateEngine.evaluate(
        "user.isAdmin ? user.adminName : user.name",
        { user: { isAdmin: true, adminName: "Admin", name: "User" } }
      )).toBe("Admin");
    });
  });

  // ==========================================================================
  // 6. String Operations
  // ==========================================================================

  describe("String Operations", () => {
    test("string concatenation", () => {
      expect(
        TemplateEngine.evaluate("first + ' ' + last", { first: "John", last: "Doe" })
      ).toBe("John Doe");
    });

    test("template literal style (using concatenation)", () => {
      expect(TemplateEngine.evaluate(
        "'Hello, ' + name + '!'",
        { name: "World" }
      )).toBe("Hello, World!");
    });

    test("string method - toUpperCase", () => {
      expect(TemplateEngine.evaluate("name.toUpperCase()", { name: "john" })).toBe(
        "JOHN"
      );
    });

    test("string method - toLowerCase", () => {
      expect(TemplateEngine.evaluate("name.toLowerCase()", { name: "JANE" })).toBe("jane");
    });

    test("string method - trim", () => {
      expect(TemplateEngine.evaluate("text.trim()", { text: "  hello  " })).toBe(
        "hello"
      );
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
  // 7. Array Methods
  // ==========================================================================

  describe("Array Methods", () => {
    test("array map", () => {
      const result = TemplateEngine.evaluate("items.map(x => x * 2)", {
        items: [1, 2, 3],
      });
      expect(result).toEqual([2, 4, 6]);
    });

    test("array filter", () => {
      const result = TemplateEngine.evaluate("items.filter(x => x > 2)", {
        items: [1, 2, 3, 4, 5],
      });
      expect(result).toEqual([3, 4, 5]);
    });

    test("array reduce", () => {
      expect(
        TemplateEngine.evaluate("items.reduce((sum, x) => sum + x, 0)", {
          items: [1, 2, 3, 4],
        })
      ).toBe(10);
    });

    test("array find", () => {
      expect(
        TemplateEngine.evaluate("users.find(u => u.id === 2).name", {
          users: [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
          ],
        })
      ).toBe("Bob");
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
      expect(
        TemplateEngine.evaluate("items.includes('b')", { items: ["a", "b", "c"] })
      ).toBe(true);
    });

    test("array join", () => {
      expect(
        TemplateEngine.evaluate("items.join(', ')", { items: ["a", "b", "c"] })
      ).toBe("a, b, c");
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
  // 8. Modern JavaScript Features
  // ==========================================================================

  describe("Modern JavaScript Features", () => {
    test("nullish coalescing (??)", () => {
      expect(TemplateEngine.evaluate("value ?? 'default'", { value: null })).toBe(
        "default"
      );
      expect(
        TemplateEngine.evaluate("value ?? 'default'", { value: undefined })
      ).toBe("default");
      expect(
        TemplateEngine.evaluate("value ?? 'default'", { value: "exists" })
      ).toBe("exists");
      expect(TemplateEngine.evaluate("value ?? 'default'", { value: 0 })).toBe(0);
    });

    test("optional chaining (?.)", () => {
      expect(
        TemplateEngine.evaluate("user?.name", { user: { name: "John" } })
      ).toBe("John");
      expect(TemplateEngine.evaluate("user?.name", { user: null })).toBe(
        undefined
      );
      expect(
        TemplateEngine.evaluate("user?.profile?.city", {
          user: { profile: { city: "NYC" } },
        })
      ).toBe("NYC");
      expect(TemplateEngine.evaluate("user?.profile?.city", { user: {} })).toBe(
        undefined
      );
    });

    test("optional chaining with nullish coalescing", () => {
      expect(
        TemplateEngine.evaluate("user?.name ?? 'Anonymous'", { user: null })
      ).toBe("Anonymous");
    });

    test("spread in array literal", () => {
      const result = TemplateEngine.evaluate("[...items, 4]", {
        items: [1, 2, 3],
      });
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
  // 9. Object Operations
  // ==========================================================================

  describe("Object Operations", () => {
    test("Object.keys", () => {
      const result = TemplateEngine.evaluate("Object.keys(obj)", {
        obj: { a: 1, b: 2 },
      });
      expect(result).toEqual(["a", "b"]);
    });

    test("Object.values", () => {
      const result = TemplateEngine.evaluate("Object.values(obj)", {
        obj: { a: 1, b: 2 },
      });
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
      expect(
        TemplateEngine.evaluate("'name' in obj", { obj: { name: "test" } })
      ).toBe(true);
      expect(
        TemplateEngine.evaluate("'age' in obj", { obj: { name: "test" } })
      ).toBe(false);
    });
  });

  // ==========================================================================
  // 10. Math Operations
  // ==========================================================================

  describe("Math Operations", () => {
    test("Math.round", () => {
      expect(TemplateEngine.evaluate("Math.round(value)", { value: 4.7 })).toBe(
        5
      );
    });

    test("Math.floor", () => {
      expect(TemplateEngine.evaluate("Math.floor(value)", { value: 4.9 })).toBe(
        4
      );
    });

    test("Math.ceil", () => {
      expect(TemplateEngine.evaluate("Math.ceil(value)", { value: 4.1 })).toBe(5);
    });

    test("Math.abs", () => {
      expect(TemplateEngine.evaluate("Math.abs(value)", { value: -5 })).toBe(5);
    });

    test("Math.max", () => {
      expect(TemplateEngine.evaluate("Math.max(a, b, c)", { a: 1, b: 5, c: 3 })).toBe(
        5
      );
    });

    test("Math.min", () => {
      expect(TemplateEngine.evaluate("Math.min(a, b, c)", { a: 1, b: 5, c: 3 })).toBe(1);
    });

    test("Math.pow", () => {
      expect(TemplateEngine.evaluate("Math.pow(base, exp)", { base: 2, exp: 3 })).toBe(8);
    });
  });

  // ==========================================================================
  // 11. Type Conversions
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
  // 12. Date Operations
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
  // 13. Caching Behavior
  // ==========================================================================

  describe("Caching Behavior", () => {
    test("complex expressions are cached", () => {
      const complexExpr =
        "items.filter(x => x > 2).map(x => x * 2).reduce((a, b) => a + b, 0)";

      // First evaluation
      const result1 = TemplateEngine.evaluate(complexExpr, {
        items: [1, 2, 3, 4, 5],
      });
      const cacheSize1 = (TemplateEngine as any)._functionCache.size;

      // Second evaluation (should use cache)
      const result2 = TemplateEngine.evaluate(complexExpr, {
        items: [2, 3, 4, 5, 6],
      });
      const cacheSize2 = (TemplateEngine as any)._functionCache.size;

      expect(result1).toBe(24);
      expect(result2).toBe(36);
      expect(cacheSize1).toBe(cacheSize2);
    });

    test("same expression with different data uses cache", () => {
      const expr = "user?.name ?? 'Guest'";

      TemplateEngine.evaluate(expr, { user: { name: "Alice" } });
      TemplateEngine.evaluate(expr, { user: { name: "Bob" } });
      TemplateEngine.evaluate(expr, { user: null });
      TemplateEngine.evaluate(expr, {});

      expect((TemplateEngine as any)._functionCache.size).toBe(1);
    });

    test("whitespace differences create different cache entries", () => {
      (TemplateEngine as any)._functionCache.clear();

      TemplateEngine.evaluate("a+b", { a: 1, b: 2 });
      TemplateEngine.evaluate("a + b", { a: 1, b: 2 });
      TemplateEngine.evaluate("a  +  b", { a: 1, b: 2 });

      // Each whitespace variation is a different cache key
      expect((TemplateEngine as any)._functionCache.size).toBe(3);
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
  // 14. Error Handling
  // ==========================================================================

  describe("Error Handling", () => {
    test("undefined property returns empty string", () => {
      expect(TemplateEngine.evaluate("nonexistent", {})).toBe("");
    });

    test("null property access returns empty string", () => {
      expect(TemplateEngine.evaluate("obj.prop", { obj: null })).toBe("");
    });

    test("syntax error returns empty string", () => {
      expect(TemplateEngine.evaluate("this is not valid js", {})).toBe("");
    });

    test("division by zero returns Infinity", () => {
      expect(TemplateEngine.evaluate("a / b", { a: 10, b: 0 })).toBe(Infinity);
    });

    test("runtime error returns empty string", () => {
      expect(TemplateEngine.evaluate("obj.method()", { obj: {} })).toBe("");
    });

    test("type error returns empty string", () => {
      expect(TemplateEngine.evaluate("null.property", {})).toBe("");
    });

    test("reference error returns empty string", () => {
      expect(TemplateEngine.evaluate("undefinedVariable", {})).toBe("");
    });

    test("expression with special characters in strings", () => {
      expect(TemplateEngine.evaluate("text", { text: "Hello's \"World\"" })).toBe("Hello's \"World\"");
    });
  });

  // ==========================================================================
  // 15. Return Types
  // ==========================================================================

  describe("Return Types", () => {
    test("returns actual object (not string)", () => {
      const obj = { name: "John", age: 30 };
      const result = TemplateEngine.evaluate("user", { user: obj });
      expect(result).toBe(obj);
      expect(result.name).toBe("John");
    });

    test("returns actual array (not string)", () => {
      const arr = [1, 2, 3];
      const result = TemplateEngine.evaluate("items", { items: arr });
      expect(result).toBe(arr);
      expect(Array.isArray(result)).toBe(true);
    });

    test("returns actual function (not string)", () => {
      const fn = () => "hello";
      const result = TemplateEngine.evaluate("handler", { handler: fn });
      expect(result).toBe(fn);
      expect(typeof result).toBe("function");
      expect(result()).toBe("hello");
    });

    test("returns numbers as numbers", () => {
      expect(TemplateEngine.evaluate("count", { count: 42 })).toBe(42);
      expect(typeof TemplateEngine.evaluate("count", { count: 42 })).toBe("number");
    });

    test("returns booleans as booleans", () => {
      expect(TemplateEngine.evaluate("active", { active: true })).toBe(true);
      expect(typeof TemplateEngine.evaluate("active", { active: true })).toBe(
        "boolean"
      );
    });

    test("Symbol result", () => {
      const result = TemplateEngine.evaluate("value", { value: Symbol("test") });
      expect(typeof result).toBe("symbol");
    });

    test("Date result", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = TemplateEngine.evaluate("value", { value: date });
      expect(result instanceof Date).toBe(true);
    });

    test("RegExp result", () => {
      const result = TemplateEngine.evaluate("value", { value: /test/gi });
      expect(result instanceof RegExp).toBe(true);
    });

    test("BigInt result", () => {
      expect(TemplateEngine.evaluate("value", { value: BigInt(9007199254740991) })).toBe(BigInt(9007199254740991));
    });

    test("BigInt arithmetic", () => {
      expect(TemplateEngine.evaluate("a + b", { a: BigInt(1), b: BigInt(2) })).toBe(BigInt(3));
    });
  });

  // ==========================================================================
  // 16. Non-String Input
  // ==========================================================================

  describe("Non-String Input", () => {
    test("non-string input to evaluate returns input unchanged", () => {
      expect(TemplateEngine.evaluate(42 as any, {})).toBe(42);
      expect(TemplateEngine.evaluate(null as any, {})).toBe(null);
      expect(TemplateEngine.evaluate(undefined as any, {})).toBe(undefined);
      expect(TemplateEngine.evaluate({ a: 1 } as any, {})).toEqual({ a: 1 });
    });
  });

  // ==========================================================================
  // 17. Real-World Expressions
  // ==========================================================================

  describe("Real-World Expressions", () => {
    test("cart total calculation", () => {
      const data = {
        items: [
          { price: 10, quantity: 2 },
          { price: 15, quantity: 1 },
          { price: 5, quantity: 3 },
        ],
      };
      expect(
        TemplateEngine.evaluate(
          "items.reduce((sum, item) => sum + item.price * item.quantity, 0)",
          data
        )
      ).toBe(50);
    });

    test("user display name", () => {
      expect(
        TemplateEngine.evaluate(
          "user.nickname || user.firstName + ' ' + user.lastName",
          { user: { firstName: "John", lastName: "Doe", nickname: "" } }
        )
      ).toBe("John Doe");

      expect(
        TemplateEngine.evaluate(
          "user.nickname || user.firstName + ' ' + user.lastName",
          { user: { firstName: "John", lastName: "Doe", nickname: "JD" } }
        )
      ).toBe("JD");
    });

    test("status badge class", () => {
      expect(TemplateEngine.evaluate(
        "status === 'active' ? 'badge-success' : status === 'pending' ? 'badge-warning' : 'badge-error'",
        { status: "active" }
      )).toBe("badge-success");
    });

    test("pluralization", () => {
      expect(
        TemplateEngine.evaluate("count + ' ' + (count === 1 ? 'item' : 'items')", {
          count: 1,
        })
      ).toBe("1 item");

      expect(
        TemplateEngine.evaluate("count + ' ' + (count === 1 ? 'item' : 'items')", {
          count: 5,
        })
      ).toBe("5 items");
    });

    test("conditional rendering data", () => {
      expect(TemplateEngine.evaluate(
        "isLoading ? 'Loading...' : error ? 'Error: ' + error : 'Data: ' + data",
        { isLoading: false, error: null, data: "Success" }
      )).toBe("Data: Success");
    });

    test("safe property access with fallback", () => {
      expect(
        TemplateEngine.evaluate("user?.profile?.avatar ?? '/default-avatar.png'", {
          user: { profile: {} },
        })
      ).toBe("/default-avatar.png");
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
});

// =============================================================================
// TemplateEngine Corner Cases
// =============================================================================

describe("TemplateEngine Corner Cases", () => {
  // ==========================================================================
  // 1. Additional Operators
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
      expect(TemplateEngine.evaluate("typeof value", { value: () => { } })).toBe("function");
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
  // 2. Security Considerations
  // ==========================================================================

  describe("Security Considerations", () => {
    test("__proto__ access", () => {
      const result = TemplateEngine.evaluate("obj.__proto__", { obj: {} });
      expect(result).toBeDefined();
    });

    test("constructor access", () => {
      const result = TemplateEngine.evaluate("obj.constructor.name", { obj: {} });
      expect(result).toBe("Object");
    });

    test("this keyword returns data context", () => {
      const result = TemplateEngine.evaluate("this", { name: "test" });
      expect(result).toBeDefined();
    });

    test("globalThis access", () => {
      const result = TemplateEngine.evaluate("typeof globalThis", {});
      expect(result).toBe("object");
    });

    test("window access in browser context", () => {
      const result = TemplateEngine.evaluate("typeof window", {});
      expect(["object", "undefined"]).toContain(result);
    });

    test("process access in Node context", () => {
      const result = TemplateEngine.evaluate("typeof process", {});
      expect(result).toBe("object");
    });

    test("Function constructor access", () => {
      const result = TemplateEngine.evaluate("Function.constructor.name", {});
      expect(result).toBe("Function");
    });

    test("eval is accessible but should be used carefully", () => {
      const result = TemplateEngine.evaluate("typeof eval", {});
      expect(result).toBe("function");
    });
  });

  // ==========================================================================
  // 3. Unicode and Special Characters
  // ==========================================================================

  describe("Unicode and Special Characters", () => {
    test("emoji in string value", () => {
      expect(TemplateEngine.evaluate("emoji", { emoji: "Hello 👋 World 🌍" })).toBe("Hello 👋 World 🌍");
    });

    test("unicode variable name", () => {
      expect(TemplateEngine.evaluate("名前", { "名前": "テスト" })).toBe("テスト");
    });

    test("unicode property access", () => {
      expect(TemplateEngine.evaluate("obj.名前", { obj: { "名前": "テスト" } })).toBe("テスト");
    });

    test("special characters in string", () => {
      expect(TemplateEngine.evaluate("text", { text: "Line1\nLine2\tTabbed" })).toBe("Line1\nLine2\tTabbed");
    });

    test("backslash in string", () => {
      expect(TemplateEngine.evaluate("path", { path: "C:\\Users\\Test" })).toBe("C:\\Users\\Test");
    });

    test("quotes in string", () => {
      expect(TemplateEngine.evaluate("text", { text: 'He said "Hello"' })).toBe('He said "Hello"');
    });
  });

  // ==========================================================================
  // 4. Data Edge Cases
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
    });
  });

  // ==========================================================================
  // 5. Object Literals in Expressions
  // ==========================================================================

  describe("Object Literals in Expressions", () => {
    test("object literal requires parentheses", () => {
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
  // 6. Async and Generator Expressions
  // ==========================================================================

  describe("Async and Generator Expressions", () => {
    test("async function expression", () => {
      const result = TemplateEngine.evaluate("(async () => 42)()", {});
      expect(result instanceof Promise).toBe(true);
    });

    test("generator function expression", () => {
      const result = TemplateEngine.evaluate("(function* () { yield 1; yield 2; })()", {});
      expect(typeof result.next).toBe("function");
    });

    test("await is syntax error outside async", () => {
      const result = TemplateEngine.evaluate("await Promise.resolve(42)", {});
      expect(result).toBe("");
    });
  });

  // ==========================================================================
  // 7. Template Literals Inside Expressions
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
  // 8. Logical Assignment Operators
  // ==========================================================================

  describe("Logical Assignment Operators", () => {
    test("nullish assignment (??=) concept", () => {
      expect(TemplateEngine.evaluate("a ?? (a = b, a)", { a: null, b: 10 })).toBe(10);
    });

    test("nullish coalescing with assignment simulation", () => {
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
});

// =============================================================================
// TemplateEngine Remaining Cases
// =============================================================================

describe("TemplateEngine Remaining Cases", () => {
  // ==========================================================================
  // 1. Numeric Edge Cases
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
      expect(TemplateEngine.evaluate("Number.isNaN('hello')", {})).toBe(false);
    });

    test("Number.isSafeInteger", () => {
      expect(TemplateEngine.evaluate("Number.isSafeInteger(42)", {})).toBe(true);
      expect(TemplateEngine.evaluate("Number.isSafeInteger(9007199254740992)", {})).toBe(false);
    });

    test("NaN result", () => {
      expect(TemplateEngine.evaluate("Number.isNaN(value)", { value: NaN })).toBe(true);
    });

    test("Infinity result", () => {
      expect(TemplateEngine.evaluate("value", { value: Infinity })).toBe(Infinity);
    });

    test("negative Infinity result", () => {
      expect(TemplateEngine.evaluate("value", { value: -Infinity })).toBe(-Infinity);
    });
  });

  // ==========================================================================
  // 2. Built-in Methods
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
  // 3. Arrow Function Features
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
      )).toBe(3);
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
  // 4. Promise Chaining
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
  // 5. String Methods (Additional)
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
  // 6. Array Methods (Additional)
  // ==========================================================================

  describe("Array Methods (Additional)", () => {
    test("array index access", () => {
      expect(TemplateEngine.evaluate("items[0]", { items: ["first", "second"] })).toBe("first");
    });

    test("array length", () => {
      expect(TemplateEngine.evaluate("items.length", { items: [1, 2, 3] })).toBe(3);
    });

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
  // 7. Error Objects
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
      const result = TemplateEngine.evaluate(
        "(() => { try { throw new Error('caught'); } catch(e) { return e.message; } })()",
        {}
      );
      expect(result).toBe("caught");
    });
  });

  // ==========================================================================
  // 8. Console Methods
  // ==========================================================================

  describe("Console Methods", () => {
    test("console.log returns undefined", () => {
      expect(TemplateEngine.evaluate("typeof console.log", {})).toBe("function");
    });

    test("console methods exist", () => {
      expect(TemplateEngine.evaluate("typeof console.error", {})).toBe("function");
      expect(TemplateEngine.evaluate("typeof console.warn", {})).toBe("function");
      expect(TemplateEngine.evaluate("typeof console.info", {})).toBe("function");
    });
  });

  // ==========================================================================
  // 9. Additional Global Objects
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

  // ==========================================================================
  // 10. Expression Edge Cases
  // ==========================================================================

  describe("Expression Edge Cases", () => {
    test("very long expression", () => {
      const longExpr = "a" + " + a".repeat(100);
      const result = TemplateEngine.evaluate(longExpr, { a: 1 });
      expect(result).toBe(101);
    });

    test("expression with many different operators", () => {
      const expr = "a + b - c * d / e % f ** g & h | i ^ j << k >> l";
      const data = { a: 100, b: 50, c: 10, d: 4, e: 2, f: 7, g: 2, h: 15, i: 8, j: 3, k: 1, l: 1 };
      const result = TemplateEngine.evaluate(expr, data);
      expect(typeof result).toBe("number");
    });
  });
});

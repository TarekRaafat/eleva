"use strict";

/**
 * @module eleva/template-engine
 * @fileoverview Expression evaluator for directive attributes and property bindings.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/**
 * Data context object for expression evaluation.
 * @typedef {Record<string, unknown>} ContextData
 * @description Contains variables and functions available during template evaluation.
 */

/**
 * JavaScript expression string to be evaluated.
 * @typedef {string} Expression
 * @description A JavaScript expression evaluated against a ContextData object.
 */

/**
 * Result of evaluating an expression.
 * @typedef {unknown} EvaluationResult
 * @description Can be string, number, boolean, object, function, or any JavaScript value.
 */

// -----------------------------------------------------------------------------
// Function Types
// -----------------------------------------------------------------------------

/**
 * Compiled expression function cached for performance.
 * @typedef {(data: ContextData) => EvaluationResult} CompiledExpressionFunction
 * @description Pre-compiled function that evaluates an expression against context data.
 */

/**
 * @class 🔒 TemplateEngine
 * @classdesc A minimal expression evaluator for Eleva's directive attributes.
 * Evaluates JavaScript expressions against a component's context data.
 * Used internally for `@event` handlers and `:prop` bindings.
 *
 * All methods are static and can be called directly on the class.
 *
 * @example
 * // Property access
 * TemplateEngine.evaluate("user.name", { user: { name: "John" } });
 * // Result: "John"
 *
 * @example
 * // Function reference (for @event handlers)
 * TemplateEngine.evaluate("handleClick", { handleClick: () => console.log("clicked") });
 * // Result: [Function]
 *
 * @example
 * // Signal values (for :prop bindings)
 * TemplateEngine.evaluate("count.value", { count: { value: 42 } });
 * // Result: 42
 *
 * @example
 * // Complex expressions
 * TemplateEngine.evaluate("items.filter(i => i.active)", { items: [{active: true}, {active: false}] });
 * // Result: [{active: true}]
 */
export class TemplateEngine {
  /**
   * Cache for compiled expression functions.
   * Stores compiled Function objects keyed by expression string for O(1) lookup.
   * The cache persists for the application lifetime and is never cleared.
   * This improves performance for repeated evaluations of the same expression.
   *
   * Memory consideration: For applications with highly dynamic expressions
   * (e.g., user-generated), memory usage grows unbounded. This is typically
   * not an issue for static templates where expressions are finite.
   *
   * @static
   * @private
   * @type {Map<string, CompiledExpressionFunction>}
   */
  static _cache = new Map();

  /**
   * Evaluates an expression in the context of the provided data object.
   * Used for resolving `@event` handlers and `:prop` bindings.
   * Non-string expressions are returned as-is.
   *
   * @security CRITICAL SECURITY WARNING
   * This method is NOT sandboxed. It uses `new Function()` and `with` statement,
   * allowing full access to the global scope. Potential attack vectors include:
   * - Code injection via malicious expressions
   * - XSS attacks if user input is used as expressions
   * - Access to sensitive globals (window, document, fetch, etc.)
   *
   * ONLY use with developer-defined template strings.
   * NEVER use with user-provided input or untrusted data.
   *
   * Mitigation strategies:
   * - Always sanitize any user-generated content before rendering in templates
   * - Use Content Security Policy (CSP) headers to restrict script execution
   * - Keep expressions simple (property access, method calls) - avoid complex logic
   *
   * @public
   * @static
   * @param {Expression | unknown} expression - The expression to evaluate.
   * @param {ContextData} data - The data context for evaluation.
   * @returns {EvaluationResult} The result of the evaluation, or empty string if evaluation fails.
   * @note Evaluation failures return an empty string without throwing.
   *
   * @example
   * // Property access
   * TemplateEngine.evaluate("user.name", { user: { name: "John" } });
   * // Result: "John"
   *
   * @example
   * // Function reference
   * TemplateEngine.evaluate("increment", { increment: () => count++ });
   * // Result: [Function]
   *
   * @example
   * // Nested property with Signal
   * TemplateEngine.evaluate("count.value", { count: { value: 42 } });
   * // Result: 42
   *
   * @example
   * // Object reference (no JSON.stringify needed)
   * TemplateEngine.evaluate("user", { user: { name: "John", age: 30 } });
   * // Result: { name: "John", age: 30 }
   *
   * @example
   * // Expressions
   * TemplateEngine.evaluate("items.length > 0", { items: [1, 2, 3] });
   * // Result: true
   *
   * @example
   * // Failed evaluation returns empty string
   * TemplateEngine.evaluate("nonexistent.property", {});
   * // Result: ""
   */
  static evaluate(expression, data) {
    if (typeof expression !== "string") return expression;
    if (!expression.trim()) return "";

    let fn = this._cache.get(expression);
    if (!fn) {
      try {
        fn = new Function("data", `with(data) { return ${expression}; }`);
        this._cache.set(expression, fn);
      } catch {
        return "";
      }
    }
    try {
      return fn(data);
    } catch {
      return "";
    }
  }
}

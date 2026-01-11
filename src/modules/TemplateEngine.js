"use strict";

// ============================================================================
// TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
// ============================================================================

/**
 * @typedef {Record<string, unknown>} ContextData
 *           Data context for expression evaluation
 */

/**
 * @typedef {string} Expression
 *           A JavaScript expression to be evaluated in the data context
 */

/**
 * @typedef {unknown} EvaluationResult
 *           The result of evaluating an expression (string, number, boolean, object, function, etc.)
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
   *
   * @static
   * @private
   * @type {Map<string, Function>}
   */
  static _functionCache = new Map();

  /**
   * Evaluates an expression in the context of the provided data object.
   * Used for resolving `@event` handlers and `:prop` bindings.
   *
   * Note: This does not provide a true sandbox and evaluated expressions may access global scope.
   * The use of the `with` statement is necessary for expression evaluation but has security implications.
   * Only use with trusted templates. User input should never be directly interpolated.
   *
   * @public
   * @static
   * @param {Expression|unknown} expression - The expression to evaluate.
   * @param {ContextData} data - The data context for evaluation.
   * @returns {EvaluationResult} The result of the evaluation, or empty string if evaluation fails.
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

    let fn = this._functionCache.get(expression);
    if (!fn) {
      try {
        fn = new Function("data", `with(data) { return ${expression}; }`);
        this._functionCache.set(expression, fn);
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

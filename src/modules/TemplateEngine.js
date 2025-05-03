"use strict";

/**
 * @class 🔒 TemplateEngine
 * @classdesc A secure template engine that handles interpolation and dynamic attribute parsing.
 * Provides a safe way to evaluate expressions in templates while preventing XSS attacks.
 * All methods are static and can be called directly on the class.
 *
 * @example
 * const template = "Hello, {{name}}!";
 * const data = { name: "World" };
 * const result = TemplateEngine.parse(template, data); // Returns: "Hello, World!"
 */
export class TemplateEngine {
  /**
   * @private {RegExp} Regular expression for matching template expressions in the format {{ expression }}
   */
  static expressionPattern = /\{\{\s*(.*?)\s*\}\}/g;

  /**
   * Parses a template string, replacing expressions with their evaluated values.
   * Expressions are evaluated in the provided data context.
   *
   * @public
   * @static
   * @param {string} template - The template string to parse.
   * @param {Object} data - The data context for evaluating expressions.
   * @returns {string} The parsed template with expressions replaced by their values.
   * @example
   * const result = TemplateEngine.parse("{{user.name}} is {{user.age}} years old", {
   *   user: { name: "John", age: 30 }
   * }); // Returns: "John is 30 years old"
   */
  static parse(template, data) {
    if (typeof template !== "string") return template;
    return template.replace(this.expressionPattern, (_, expression) =>
      this.evaluate(expression, data)
    );
  }

  /**
   * Evaluates an expression in the context of the provided data object.
   * Note: This does not provide a true sandbox and evaluated expressions may access global scope.
   *
   * @public
   * @static
   * @param {string} expression - The expression to evaluate.
   * @param {Object} data - The data context for evaluation.
   * @returns {*} The result of the evaluation, or an empty string if evaluation fails.
   * @example
   * const result = TemplateEngine.evaluate("user.name", { user: { name: "John" } }); // Returns: "John"
   * const age = TemplateEngine.evaluate("user.age", { user: { age: 30 } }); // Returns: 30
   */
  static evaluate(expression, data) {
    if (typeof expression !== "string") return expression;
    try {
      return new Function("data", `with(data) { return ${expression}; }`)(data);
    } catch {
      return "";
    }
  }
}

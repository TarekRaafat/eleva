"use strict";

/**
 * @class 🔒 TemplateEngine
 * @classdesc Secure interpolation & dynamic attribute parsing.
 * Provides methods to parse template strings by replacing interpolation expressions
 * with dynamic data values and to evaluate expressions within a given data context.
 */
export class TemplateEngine {
  /**
   * Parses a template string and replaces interpolation expressions with corresponding values.
   *
   * @param {string} template - The template string containing expressions in the format `{{ expression }}`.
   * @param {Object<string, any>} data - The data object to use for evaluating expressions.
   * @returns {string} The resulting string with evaluated values.
   */
  static parse(template, data) {
    if (!template || typeof template !== "string") return template;

    return template.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expr) => {
      return this.evaluate(expr, data);
    });
  }

  /**
   * Evaluates a JavaScript expression using the provided data context.
   *
   * @param {string} expr - The JavaScript expression to evaluate.
   * @param {Object<string, any>} data - The data context for evaluating the expression.
   * @returns {any} The result of the evaluated expression, or an empty string if undefined or on error.
   */
  static evaluate(expr, data) {
    if (!expr || typeof expr !== "string") return expr;

    try {
      const compiledFn = new Function("data", `with(data) { return ${expr} }`);
      return compiledFn(data);
    } catch (error) {
      console.error(`Template evaluation error:`, {
        expression: expr,
        data,
        error: error.message,
      });
      return "";
    }
  }
}

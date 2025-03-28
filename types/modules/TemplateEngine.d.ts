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
  static parse(
    template: string,
    data: {
      [x: string]: any;
    }
  ): string;
  /**
   * Evaluates a JavaScript expression using the provided data context.
   *
   * @param {string} expr - The JavaScript expression to evaluate.
   * @param {Object<string, any>} data - The data context for evaluating the expression.
   * @returns {any} The result of the evaluated expression, or an empty string if undefined or on error.
   */
  static evaluate(
    expr: string,
    data: {
      [x: string]: any;
    }
  ): any;
}
//# sourceMappingURL=TemplateEngine.d.ts.map

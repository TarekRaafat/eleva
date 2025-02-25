/**
 * 🔒 TemplateEngine: Secure interpolation & dynamic attribute parsing.
 *
 * This class provides methods to parse template strings by replacing
 * interpolation expressions with dynamic data values and to evaluate expressions
 * within a given data context.
 */
export class TemplateEngine {
    /**
     * Parses a template string and replaces interpolation expressions with corresponding values.
     *
     * @param {string} template - The template string containing expressions in the format {{ expression }}.
     * @param {object} data - The data object to use for evaluating expressions.
     * @returns {string} The resulting string with evaluated values.
     */
    static parse(template: string, data: object): string;
    /**
     * Evaluates an expression using the provided data context.
     *
     * @param {string} expr - The JavaScript expression to evaluate.
     * @param {object} data - The data context for evaluating the expression.
     * @returns {*} The result of the evaluated expression, or an empty string if undefined or on error.
     */
    static evaluate(expr: string, data: object): any;
}
//# sourceMappingURL=TemplateEngine.d.ts.map
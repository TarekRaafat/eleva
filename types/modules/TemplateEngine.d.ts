/**
 * @typedef {Record<string, unknown>} TemplateData
 *           Data context for template interpolation
 */
/**
 * @typedef {string} TemplateString
 *           A string containing {{ expression }} interpolation markers
 */
/**
 * @typedef {string} Expression
 *           A JavaScript expression to be evaluated in the data context
 */
/**
 * @typedef {unknown} EvaluationResult
 *           The result of evaluating an expression (string, number, boolean, object, etc.)
 */
/**
 * @class 🔒 TemplateEngine
 * @classdesc A secure template engine that handles interpolation and dynamic attribute parsing.
 * Provides a way to evaluate expressions in templates.
 * All methods are static and can be called directly on the class.
 *
 * Template Syntax:
 * - `{{ expression }}` - Interpolate any JavaScript expression
 * - `{{ variable }}` - Access data properties directly
 * - `{{ object.property }}` - Access nested properties
 * - `{{ condition ? a : b }}` - Ternary expressions
 * - `{{ func(arg) }}` - Call functions from data context
 *
 * @example
 * // Basic interpolation
 * const template = "Hello, {{name}}!";
 * const data = { name: "World" };
 * const result = TemplateEngine.parse(template, data);
 * // Result: "Hello, World!"
 *
 * @example
 * // Nested properties
 * const template = "Welcome, {{user.name}}!";
 * const data = { user: { name: "John" } };
 * const result = TemplateEngine.parse(template, data);
 * // Result: "Welcome, John!"
 *
 * @example
 * // Expressions
 * const template = "Status: {{active ? 'Online' : 'Offline'}}";
 * const data = { active: true };
 * const result = TemplateEngine.parse(template, data);
 * // Result: "Status: Online"
 *
 * @example
 * // With Signal values
 * const template = "Count: {{count.value}}";
 * const data = { count: { value: 42 } };
 * const result = TemplateEngine.parse(template, data);
 * // Result: "Count: 42"
 */
export class TemplateEngine {
    /**
     * Regular expression for matching template expressions in the format {{ expression }}
     * Matches: {{ anything }} with optional whitespace inside braces
     *
     * @static
     * @private
     * @type {RegExp}
     */
    private static expressionPattern;
    /**
     * Cache for compiled expression functions.
     * Stores compiled Function objects keyed by expression string for O(1) lookup.
     *
     * @static
     * @private
     * @type {Map<string, Function>}
     */
    private static _functionCache;
    /**
     * Parses a template string, replacing expressions with their evaluated values.
     * Expressions are evaluated in the provided data context.
     *
     * @public
     * @static
     * @param {TemplateString|unknown} template - The template string to parse.
     * @param {TemplateData} data - The data context for evaluating expressions.
     * @returns {string} The parsed template with expressions replaced by their values.
     *
     * @example
     * // Simple variables
     * TemplateEngine.parse("Hello, {{name}}!", { name: "World" });
     * // Result: "Hello, World!"
     *
     * @example
     * // Nested properties
     * TemplateEngine.parse("{{user.name}} is {{user.age}} years old", {
     *   user: { name: "John", age: 30 }
     * });
     * // Result: "John is 30 years old"
     *
     * @example
     * // Multiple expressions
     * TemplateEngine.parse("{{greeting}}, {{name}}! You have {{count}} messages.", {
     *   greeting: "Hello",
     *   name: "User",
     *   count: 5
     * });
     * // Result: "Hello, User! You have 5 messages."
     *
     * @example
     * // With conditionals
     * TemplateEngine.parse("Status: {{online ? 'Active' : 'Inactive'}}", {
     *   online: true
     * });
     * // Result: "Status: Active"
     */
    public static parse(template: TemplateString | unknown, data: TemplateData): string;
    /**
     * Evaluates an expression in the context of the provided data object.
     *
     * Note: This does not provide a true sandbox and evaluated expressions may access global scope.
     * The use of the `with` statement is necessary for expression evaluation but has security implications.
     * Only use with trusted templates. User input should never be directly interpolated.
     *
     * @public
     * @static
     * @param {Expression|unknown} expression - The expression to evaluate.
     * @param {TemplateData} data - The data context for evaluation.
     * @returns {EvaluationResult} The result of the evaluation, or undefined if evaluation fails.
     *
     * @example
     * // Property access
     * TemplateEngine.evaluate("user.name", { user: { name: "John" } });
     * // Result: "John"
     *
     * @example
     * // Numeric values
     * TemplateEngine.evaluate("user.age", { user: { age: 30 } });
     * // Result: 30
     *
     * @example
     * // Expressions
     * TemplateEngine.evaluate("items.length > 0", { items: [1, 2, 3] });
     * // Result: true
     *
     * @example
     * // Function calls
     * TemplateEngine.evaluate("formatDate(date)", {
     *   date: new Date(),
     *   formatDate: (d) => d.toISOString()
     * });
     * // Result: "2024-01-01T00:00:00.000Z"
     *
     * @example
     * // Failed evaluation returns empty string
     * TemplateEngine.evaluate("nonexistent.property", {});
     * // Result: ""
     */
    public static evaluate(expression: Expression | unknown, data: TemplateData): EvaluationResult;
}
/**
 * Data context for template interpolation
 */
export type TemplateData = Record<string, unknown>;
/**
 * A string containing {{ expression }} interpolation markers
 */
export type TemplateString = string;
/**
 * A JavaScript expression to be evaluated in the data context
 */
export type Expression = string;
/**
 * The result of evaluating an expression (string, number, boolean, object, etc.)
 */
export type EvaluationResult = unknown;
//# sourceMappingURL=TemplateEngine.d.ts.map
"use strict";

/**
 * @class 🎯 PropsPlugin
 * @classdesc A plugin that extends Eleva's props data handling to support any type of data structure
 * with automatic type detection, parsing, and reactive prop updates. This plugin enables seamless
 * passing of complex data types from parent to child components without manual parsing.
 * 
 * Core Features:
 * - Automatic type detection and parsing (strings, numbers, booleans, objects, arrays, dates, etc.)
 * - Support for complex data structures including nested objects and arrays
 * - Reactive props that automatically update when parent data changes
 * - Comprehensive error handling with custom error callbacks
 * - Simple configuration with minimal setup required
 *
 * @example
 * // Install the plugin
 * const app = new Eleva("myApp");
 * app.use(PropsPlugin, {
 *   enableAutoParsing: true,
 *   enableReactivity: true,
 *   onError: (error, value) => {
 *     console.error('Props parsing error:', error, value);
 *   }
 * });
 *
 * // Use complex props in components
 * app.component("UserCard", {
 *   template: (ctx) => `
 *     <div class="user-info-container"
 *          :user='${JSON.stringify(ctx.user.value)}'
 *          :permissions='${JSON.stringify(ctx.permissions.value)}'
 *          :settings='${JSON.stringify(ctx.settings.value)}'>
 *     </div>
 *   `,
 *   children: {
 *     '.user-info-container': 'UserInfo'
 *   }
 * });
 * 
 * app.component("UserInfo", {
 *   setup({ props }) {
 *     return {
 *       user: props.user,        // Automatically parsed object
 *       permissions: props.permissions,  // Automatically parsed array
 *       settings: props.settings  // Automatically parsed object
 *     };
 *   }
 * });
 */
export const PropsPlugin = {
    /**
     * Unique identifier for the plugin
     * @type {string}
     */
    name: "props",

    /**
     * Plugin version
     * @type {string}
     */
    version: "1.0.0-rc.1",

    /**
     * Plugin description
     * @type {string}
     */
    description: "Advanced props data handling for complex data structures with automatic type detection and reactivity",

    /**
     * Installs the plugin into the Eleva instance
     *
     * @param {Object} eleva - The Eleva instance
     * @param {Object} options - Plugin configuration options
     * @param {boolean} [options.enableAutoParsing=true] - Enable automatic type detection and parsing
     * @param {boolean} [options.enableReactivity=true] - Enable reactive prop updates using Eleva's signal system
     * @param {Function} [options.onError=null] - Error handler function called when parsing fails
     * 
     * @example
     * // Basic installation
     * app.use(PropsPlugin);
     * 
     * // Installation with custom options
     * app.use(PropsPlugin, {
     *   enableAutoParsing: true,
     *   enableReactivity: false,
     *   onError: (error, value) => {
     *     console.error('Props parsing error:', error, value);
     *   }
     * });
     */
    install(eleva, options = {}) {
        const {
            enableAutoParsing = true,
            enableReactivity = true,
            onError = null
        } = options;

        /**
         * Detects the type of a given value
         * @private
         * @param {any} value - The value to detect type for
         * @returns {string} The detected type ('string', 'number', 'boolean', 'object', 'array', 'date', 'map', 'set', 'function', 'null', 'undefined', 'unknown')
         * 
         * @example
         * detectType("hello")     // → "string"
         * detectType(42)          // → "number"
         * detectType(true)        // → "boolean"
         * detectType([1, 2, 3])   // → "array"
         * detectType({})          // → "object"
         * detectType(new Date())  // → "date"
         * detectType(null)        // → "null"
         */
        const detectType = (value) => {
            if (value === null) return 'null';
            if (value === undefined) return 'undefined';
            if (typeof value === 'boolean') return 'boolean';
            if (typeof value === 'number') return 'number';
            if (typeof value === 'string') return 'string';
            if (typeof value === 'function') return 'function';
            if (value instanceof Date) return 'date';
            if (value instanceof Map) return 'map';
            if (value instanceof Set) return 'set';
            if (Array.isArray(value)) return 'array';
            if (typeof value === 'object') return 'object';
            return 'unknown';
        };

        /**
         * Parses a prop value with automatic type detection
         * @private
         * @param {any} value - The value to parse
         * @returns {any} The parsed value with appropriate type
         * 
         * @description
         * This function automatically detects and parses different data types from string values:
         * - Special strings: "true" → true, "false" → false, "null" → null, "undefined" → undefined
         * - JSON objects/arrays: '{"key": "value"}' → {key: "value"}, '[1, 2, 3]' → [1, 2, 3]
         * - Boolean-like strings: "1" → true, "0" → false, "" → true
         * - Numeric strings: "42" → 42, "3.14" → 3.14
         * - Date strings: "2023-01-01T00:00:00.000Z" → Date object
         * - Other strings: returned as-is
         * 
         * @example
         * parsePropValue("true")           // → true
         * parsePropValue("42")             // → 42
         * parsePropValue('{"key": "val"}') // → {key: "val"}
         * parsePropValue('[1, 2, 3]')      // → [1, 2, 3]
         * parsePropValue("hello")          // → "hello"
         */
        const parsePropValue = (value) => {
            try {
                // Handle non-string values - return as-is
                if (typeof value !== 'string') {
                    return value;
                }

                // Handle special string patterns first
                if (value === 'true') return true;
                if (value === 'false') return false;
                if (value === 'null') return null;
                if (value === 'undefined') return undefined;

                // Try to parse as JSON (for objects and arrays)
                // This handles complex data structures like objects and arrays
                if (value.startsWith('{') || value.startsWith('[')) {
                    try {
                        return JSON.parse(value);
                    } catch (e) {
                        // Not valid JSON, throw error to trigger error handler
                        throw new Error(`Invalid JSON: ${value}`);
                    }
                }

                // Handle boolean-like strings (including "1" and "0")
                // These are common in HTML attributes and should be treated as booleans
                if (value === '1') return true;
                if (value === '0') return false;
                if (value === '') return true; // Empty string is truthy in HTML attributes

                // Handle numeric strings (after boolean check to avoid conflicts)
                // This ensures "0" is treated as boolean false, not number 0
                if (!isNaN(value) && value !== '' && !isNaN(parseFloat(value))) {
                    return Number(value);
                }

                // Handle date strings (ISO format)
                // Recognizes standard ISO date format and converts to Date object
                if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }

                // Return as string if no other parsing applies
                // This is the fallback for regular text strings
                return value;

            } catch (error) {
                // Call error handler if provided
                if (onError) {
                    onError(error, value);
                }
                // Fallback to original value to prevent breaking the application
                return value;
            }
        };

        /**
         * Enhanced props extraction with automatic type detection
         * @private
         * @param {HTMLElement} element - The DOM element to extract props from
         * @returns {Object} Object containing parsed props with appropriate types
         * 
         * @description
         * Extracts props from DOM element attributes that start with ":" and automatically
         * parses them to their appropriate types. Removes the attributes from the element
         * after extraction.
         * 
         * @example
         * // HTML: <div :name="John" :age="30" :active="true" :data='{"key": "value"}'></div>
         * const props = extractProps(element);
         * // Result: { name: "John", age: 30, active: true, data: {key: "value"} }
         */
        const extractProps = (element) => {
            const props = {};
            const attrs = element.attributes;

            // Iterate through attributes in reverse order to handle removal correctly
            for (let i = attrs.length - 1; i >= 0; i--) {
                const attr = attrs[i];
                // Only process attributes that start with ":" (prop attributes)
                if (attr.name.startsWith(":")) {
                    const propName = attr.name.slice(1); // Remove the ":" prefix
                    // Parse the value if auto-parsing is enabled, otherwise use as-is
                    const parsedValue = enableAutoParsing ? parsePropValue(attr.value) : attr.value;
                    props[propName] = parsedValue;
                    // Remove the attribute from the DOM element after extraction
                    element.removeAttribute(attr.name);
                }
            }

            return props;
        };

        /**
         * Creates reactive props using Eleva's signal system
         * @private
         * @param {Object} props - The props object to make reactive
         * @returns {Object} Object containing reactive props (Eleva signals)
         * 
         * @description
         * Converts regular prop values into Eleva signals for reactive updates.
         * If a value is already a signal, it's passed through unchanged.
         * 
         * @example
         * const props = { name: "John", age: 30, active: true };
         * const reactiveProps = createReactiveProps(props);
         * // Result: { 
         * //   name: Signal("John"), 
         * //   age: Signal(30), 
         * //   active: Signal(true) 
         * // }
         */
        const createReactiveProps = (props) => {
            const reactiveProps = {};

            // Convert each prop value to a reactive signal
            Object.entries(props).forEach(([key, value]) => {
                // Check if value is already a signal (has 'value' and 'watch' properties)
                if (value && typeof value === 'object' && 'value' in value && 'watch' in value) {
                    // Value is already a signal, use it as-is
                    reactiveProps[key] = value;
                } else {
                    // Create new signal for the prop value to make it reactive
                    reactiveProps[key] = new eleva.signal(value);
                }
            });

            return reactiveProps;
        };

        // Override Eleva's internal _extractProps method with our enhanced version
        eleva._extractProps = extractProps;

        // Override Eleva's mount method to apply enhanced prop handling
        const originalMount = eleva.mount;
        eleva.mount = async (container, compName, props = {}) => {
            // Create reactive props if reactivity is enabled
            const enhancedProps = enableReactivity ? createReactiveProps(props) : props;

            // Call the original mount method with enhanced props
            return await originalMount.call(eleva, container, compName, enhancedProps);
        };

        /**
         * Expose utility methods on the Eleva instance
         * @namespace eleva.props
         */
        eleva.props = {
            /**
             * Parse a single value with automatic type detection
             * @param {any} value - The value to parse
             * @returns {any} The parsed value with appropriate type
             * 
             * @example
             * app.props.parse("42")             // → 42
             * app.props.parse("true")           // → true
             * app.props.parse('{"key": "val"}') // → {key: "val"}
             */
            parse: (value) => {
                // Return value as-is if auto parsing is disabled
                if (!enableAutoParsing) {
                    return value;
                }
                // Use our enhanced parsing function
                return parsePropValue(value);
            },

            /**
             * Detect the type of a value
             * @param {any} value - The value to detect type for
             * @returns {string} The detected type
             * 
             * @example
             * app.props.detectType("hello")     // → "string"
             * app.props.detectType(42)          // → "number"
             * app.props.detectType([1, 2, 3])   // → "array"
             */
            detectType
        };

        // Store original methods for uninstall
        eleva._originalExtractProps = eleva._extractProps;
        eleva._originalMount = originalMount;
    },

    /**
     * Uninstalls the plugin from the Eleva instance
     *
     * @param {Object} eleva - The Eleva instance
     * 
     * @description
     * Restores the original Eleva methods and removes all plugin-specific
     * functionality. This method should be called when the plugin is no
     * longer needed.
     * 
     * @example
     * // Uninstall the plugin
     * PropsPlugin.uninstall(app);
     */
    uninstall(eleva) {
        // Restore original _extractProps method
        if (eleva._originalExtractProps) {
            eleva._extractProps = eleva._originalExtractProps;
            delete eleva._originalExtractProps;
        }

        // Restore original mount method
        if (eleva._originalMount) {
            eleva.mount = eleva._originalMount;
            delete eleva._originalMount;
        }

        // Remove plugin utility methods
        if (eleva.props) {
            delete eleva.props;
        }
    }
};
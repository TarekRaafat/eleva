/*! Eleva Props Plugin v1.0.0-rc.2 | MIT License | https://elevajs.com */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ElevaPropsPlugin = {}));
})(this, (function (exports) { 'use strict';

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

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
  class TemplateEngine {
    /**
     * Parses a template string, replacing expressions with their evaluated values.
     * Expressions are evaluated in the provided data context.
     *
     * @public
     * @static
     * @param {string} template - The template string to parse.
     * @param {Record<string, unknown>} data - The data context for evaluating expressions.
     * @returns {string} The parsed template with expressions replaced by their values.
     * @example
     * const result = TemplateEngine.parse("{{user.name}} is {{user.age}} years old", {
     *   user: { name: "John", age: 30 }
     * }); // Returns: "John is 30 years old"
     */
    static parse(template, data) {
      if (typeof template !== "string") return template;
      return template.replace(this.expressionPattern, (_, expression) => this.evaluate(expression, data));
    }

    /**
     * Evaluates an expression in the context of the provided data object.
     * Note: This does not provide a true sandbox and evaluated expressions may access global scope.
     * The use of the `with` statement is necessary for expression evaluation but has security implications.
     * Expressions should be carefully validated before evaluation.
     *
     * @public
     * @static
     * @param {string} expression - The expression to evaluate.
     * @param {Record<string, unknown>} data - The data context for evaluation.
     * @returns {unknown} The result of the evaluation, or an empty string if evaluation fails.
     * @example
     * const result = TemplateEngine.evaluate("user.name", { user: { name: "John" } }); // Returns: "John"
     * const age = TemplateEngine.evaluate("user.age", { user: { age: 30 } }); // Returns: 30
     */
    static evaluate(expression, data) {
      if (typeof expression !== "string") return expression;
      try {
        return new Function("data", `with(data) { return ${expression}; }`)(data);
      } catch (_unused) {
        return "";
      }
    }
  }
  /**
   * @private {RegExp} Regular expression for matching template expressions in the format {{ expression }}
   * @type {RegExp}
   */
  TemplateEngine.expressionPattern = /\{\{\s*(.*?)\s*\}\}/g;

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
  const PropsPlugin = {
    /**
     * Unique identifier for the plugin
     * @type {string}
     */
    name: "props",
    /**
     * Plugin version
     * @type {string}
     */
    version: "1.0.0-rc.2",
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
      const detectType = value => {
        if (value === null) return "null";
        if (value === undefined) return "undefined";
        if (typeof value === "boolean") return "boolean";
        if (typeof value === "number") return "number";
        if (typeof value === "string") return "string";
        if (typeof value === "function") return "function";
        if (value instanceof Date) return "date";
        if (value instanceof Map) return "map";
        if (value instanceof Set) return "set";
        if (Array.isArray(value)) return "array";
        if (typeof value === "object") return "object";
        return "unknown";
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
      const parsePropValue = value => {
        try {
          // Handle non-string values - return as-is
          if (typeof value !== "string") {
            return value;
          }

          // Handle special string patterns first
          if (value === "true") return true;
          if (value === "false") return false;
          if (value === "null") return null;
          if (value === "undefined") return undefined;

          // Try to parse as JSON (for objects and arrays)
          // This handles complex data structures like objects and arrays
          if (value.startsWith("{") || value.startsWith("[")) {
            try {
              return JSON.parse(value);
            } catch (e) {
              // Not valid JSON, throw error to trigger error handler
              throw new Error(`Invalid JSON: ${value}`);
            }
          }

          // Handle boolean-like strings (including "1" and "0")
          // These are common in HTML attributes and should be treated as booleans
          if (value === "1") return true;
          if (value === "0") return false;
          if (value === "") return true; // Empty string is truthy in HTML attributes

          // Handle numeric strings (after boolean check to avoid conflicts)
          // This ensures "0" is treated as boolean false, not number 0
          if (!isNaN(value) && value !== "" && !isNaN(parseFloat(value))) {
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
      const extractProps = element => {
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
      const createReactiveProps = props => {
        const reactiveProps = {};

        // Convert each prop value to a reactive signal
        Object.entries(props).forEach(([key, value]) => {
          // Check if value is already a signal (has 'value' and 'watch' properties)
          if (value && typeof value === "object" && "value" in value && "watch" in value) {
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

      // Override Eleva's _mountComponents method to enable signal reference passing
      const originalMountComponents = eleva._mountComponents;

      // Cache to store parent contexts by container element
      const parentContextCache = new WeakMap();
      // Store child instances that need signal linking
      const pendingSignalLinks = new Set();
      eleva._mountComponents = async (container, children, childInstances) => {
        for (const [selector, component] of Object.entries(children)) {
          if (!selector) continue;
          for (const el of container.querySelectorAll(selector)) {
            if (!(el instanceof HTMLElement)) continue;

            // Extract props from DOM attributes
            const extractedProps = eleva._extractProps(el);

            // Get parent context to check for signal references
            let enhancedProps = extractedProps;

            // Try to find parent context by looking up the DOM tree
            let parentContext = parentContextCache.get(container);
            if (!parentContext) {
              let currentElement = container;
              while (currentElement && !parentContext) {
                if (currentElement._eleva_instance && currentElement._eleva_instance.data) {
                  parentContext = currentElement._eleva_instance.data;
                  // Cache the parent context for future use
                  parentContextCache.set(container, parentContext);
                  break;
                }
                currentElement = currentElement.parentElement;
              }
            }
            if (enableReactivity && parentContext) {
              const signalProps = {};

              // Check each extracted prop to see if there's a matching signal in parent context
              Object.keys(extractedProps).forEach(propName => {
                if (parentContext[propName] && parentContext[propName] instanceof eleva.signal) {
                  // Found a signal in parent context with the same name as the prop
                  // Pass the signal reference instead of creating a new one
                  signalProps[propName] = parentContext[propName];
                }
              });

              // Merge signal props with regular props (signal props take precedence)
              enhancedProps = _extends({}, extractedProps, signalProps);
            }

            // Create reactive props for non-signal props only
            let finalProps = enhancedProps;
            if (enableReactivity) {
              // Only create reactive props for values that aren't already signals
              const nonSignalProps = {};
              Object.entries(enhancedProps).forEach(([key, value]) => {
                if (!(value && typeof value === "object" && "value" in value && "watch" in value)) {
                  // This is not a signal, create a reactive prop for it
                  nonSignalProps[key] = value;
                }
              });

              // Create reactive props only for non-signal values
              const reactiveNonSignalProps = createReactiveProps(nonSignalProps);

              // Merge signal props with reactive non-signal props
              finalProps = _extends({}, reactiveNonSignalProps, enhancedProps);
            }

            /** @type {MountResult} */
            const instance = await eleva.mount(el, component, finalProps);
            if (instance && !childInstances.includes(instance)) {
              childInstances.push(instance);

              // If we have extracted props but no parent context yet, mark for later signal linking
              if (enableReactivity && Object.keys(extractedProps).length > 0 && !parentContext) {
                pendingSignalLinks.add({
                  instance,
                  extractedProps,
                  container,
                  component
                });
              }
            }
          }
        }

        // After mounting all children, try to link signals for pending instances
        if (enableReactivity && pendingSignalLinks.size > 0) {
          for (const pending of pendingSignalLinks) {
            const {
              instance,
              extractedProps,
              container,
              component
            } = pending;

            // Try to find parent context again
            let parentContext = parentContextCache.get(container);
            if (!parentContext) {
              let currentElement = container;
              while (currentElement && !parentContext) {
                if (currentElement._eleva_instance && currentElement._eleva_instance.data) {
                  parentContext = currentElement._eleva_instance.data;
                  parentContextCache.set(container, parentContext);
                  break;
                }
                currentElement = currentElement.parentElement;
              }
            }
            if (parentContext) {
              const signalProps = {};

              // Check each extracted prop to see if there's a matching signal in parent context
              Object.keys(extractedProps).forEach(propName => {
                if (parentContext[propName] && parentContext[propName] instanceof eleva.signal) {
                  signalProps[propName] = parentContext[propName];
                }
              });

              // Update the child instance's data with signal references
              if (Object.keys(signalProps).length > 0) {
                Object.assign(instance.data, signalProps);

                // Set up signal watchers for the newly linked signals
                Object.keys(signalProps).forEach(propName => {
                  const signal = signalProps[propName];
                  if (signal && typeof signal.watch === "function") {
                    signal.watch(newValue => {
                      // Trigger a re-render of the child component when the signal changes
                      const childComponent = eleva._components.get(component) || component;
                      if (childComponent && childComponent.template) {
                        const templateResult = typeof childComponent.template === "function" ? childComponent.template(instance.data) : childComponent.template;
                        const newHtml = TemplateEngine.parse(templateResult, instance.data);
                        eleva.renderer.patchDOM(instance.container, newHtml);
                      }
                    });
                  }
                });

                // Initial re-render to show the correct signal values
                const childComponent = eleva._components.get(component) || component;
                if (childComponent && childComponent.template) {
                  const templateResult = typeof childComponent.template === "function" ? childComponent.template(instance.data) : childComponent.template;
                  const newHtml = TemplateEngine.parse(templateResult, instance.data);
                  eleva.renderer.patchDOM(instance.container, newHtml);
                }
              }

              // Remove from pending list
              pendingSignalLinks.delete(pending);
            }
          }
        }
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
        parse: value => {
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
      eleva._originalMountComponents = originalMountComponents;
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

      // Restore original _mountComponents method
      if (eleva._originalMountComponents) {
        eleva._mountComponents = eleva._originalMountComponents;
        delete eleva._originalMountComponents;
      }

      // Remove plugin utility methods
      if (eleva.props) {
        delete eleva.props;
      }
    }
  };

  exports.PropsPlugin = PropsPlugin;

}));
//# sourceMappingURL=props.umd.js.map

/*! Eleva v1.0.0-rc.10 | MIT License | https://elevajs.com */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Eleva = factory());
})(this, (function () { 'use strict';

  // ============================================================================
  // TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
  // ============================================================================

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
  class TemplateEngine {
    /**
     * Regular expression for matching template expressions in the format {{ expression }}
     * Matches: {{ anything }} with optional whitespace inside braces
     *
     * @static
     * @private
     * @type {RegExp}
     */
    static expressionPattern = /\{\{\s*(.*?)\s*\}\}/g;

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
    static parse(template, data) {
      if (typeof template !== "string") return template;
      return template.replace(this.expressionPattern, (_, expression) => this.evaluate(expression, data));
    }

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
     * @returns {EvaluationResult} The result of the evaluation, or an empty string if evaluation fails.
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
    static evaluate(expression, data) {
      if (typeof expression !== "string") return expression;
      try {
        return new Function("data", `with(data) { return ${expression}; }`)(data);
      } catch {
        return "";
      }
    }
  }

  // ============================================================================
  // TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
  // ============================================================================

  /**
   * @template T
   * @callback SignalWatcher
   * @param {T} value - The new value of the signal
   * @returns {void}
   */

  /**
   * @callback SignalUnsubscribe
   * @returns {boolean} True if the watcher was successfully removed
   */

  /**
   * @template T
   * @typedef {Object} SignalLike
   * @property {T} value - The current value
   * @property {function(SignalWatcher<T>): SignalUnsubscribe} watch - Subscribe to changes
   */

  /**
   * @class ⚡ Signal
   * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
   * Signals notify registered watchers when their value changes, enabling efficient DOM updates
   * through targeted patching rather than full re-renders.
   * Updates are batched using microtasks to prevent multiple synchronous notifications.
   * The class is generic, allowing type-safe handling of any value type T.
   *
   * @template T The type of value held by this signal
   *
   * @example
   * // Basic usage
   * const count = new Signal(0);
   * count.watch((value) => console.log(`Count changed to: ${value}`));
   * count.value = 1; // Logs: "Count changed to: 1"
   *
   * @example
   * // With unsubscribe
   * const name = new Signal("John");
   * const unsubscribe = name.watch((value) => console.log(value));
   * name.value = "Jane"; // Logs: "Jane"
   * unsubscribe(); // Stop watching
   * name.value = "Bob"; // No log output
   *
   * @example
   * // With objects
   * /** @type {Signal<{x: number, y: number}>} *\/
   * const position = new Signal({ x: 0, y: 0 });
   * position.value = { x: 10, y: 20 }; // Triggers watchers
   *
   * @implements {SignalLike<T>}
   */
  class Signal {
    /**
     * Creates a new Signal instance with the specified initial value.
     *
     * @public
     * @param {T} value - The initial value of the signal.
     *
     * @example
     * // Primitive types
     * const count = new Signal(0);        // Signal<number>
     * const name = new Signal("John");    // Signal<string>
     * const active = new Signal(true);    // Signal<boolean>
     *
     * @example
     * // Complex types (use JSDoc for type inference)
     * /** @type {Signal<string[]>} *\/
     * const items = new Signal([]);
     *
     * /** @type {Signal<{id: number, name: string} | null>} *\/
     * const user = new Signal(null);
     */
    constructor(value) {
      /**
       * Internal storage for the signal's current value
       * @private
       * @type {T}
       */
      this._value = value;
      /**
       * Collection of callback functions to be notified when value changes
       * @private
       * @type {Set<SignalWatcher<T>>}
       */
      this._watchers = new Set();
      /**
       * Flag to prevent multiple synchronous watcher notifications
       * @private
       * @type {boolean}
       */
      this._pending = false;
    }

    /**
     * Gets the current value of the signal.
     *
     * @public
     * @returns {T} The current value.
     */
    get value() {
      return this._value;
    }

    /**
     * Sets a new value for the signal and notifies all registered watchers if the value has changed.
     * The notification is batched using microtasks to prevent multiple synchronous updates.
     *
     * @public
     * @param {T} newVal - The new value to set.
     * @returns {void}
     */
    set value(newVal) {
      if (this._value === newVal) return;
      this._value = newVal;
      this._notify();
    }

    /**
     * Registers a watcher function that will be called whenever the signal's value changes.
     * The watcher will receive the new value as its argument.
     *
     * @public
     * @param {SignalWatcher<T>} fn - The callback function to invoke on value change.
     * @returns {SignalUnsubscribe} A function to unsubscribe the watcher.
     *
     * @example
     * // Basic watching
     * const unsubscribe = signal.watch((value) => console.log(value));
     *
     * @example
     * // Stop watching
     * unsubscribe(); // Returns true if watcher was removed
     *
     * @example
     * // Multiple watchers
     * const unsub1 = signal.watch((v) => console.log("Watcher 1:", v));
     * const unsub2 = signal.watch((v) => console.log("Watcher 2:", v));
     * signal.value = "test"; // Both watchers are called
     */
    watch(fn) {
      this._watchers.add(fn);
      return () => this._watchers.delete(fn);
    }

    /**
     * Notifies all registered watchers of a value change using microtask scheduling.
     * Uses a pending flag to batch multiple synchronous updates into a single notification.
     * All watcher callbacks receive the current value when executed.
     *
     * @private
     * @returns {void}
     */
    _notify() {
      if (this._pending) return;
      this._pending = true;
      queueMicrotask(() => {
        /** @type {(fn: (value: T) => void) => void} */
        this._watchers.forEach(fn => fn(this._value));
        this._pending = false;
      });
    }
  }

  // ============================================================================
  // TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
  // ============================================================================

  /**
   * @template T
   * @callback EventHandler
   * @param {...T} args - Event arguments
   * @returns {void|Promise<void>}
   */

  /**
   * @callback EventUnsubscribe
   * @returns {void}
   */

  /**
   * @typedef {`${string}:${string}`} EventName
   *           Event names follow the format 'namespace:action' (e.g., 'user:login', 'cart:update')
   */

  /**
   * @typedef {Object} EmitterLike
   * @property {function(string, EventHandler<unknown>): EventUnsubscribe} on - Subscribe to an event
   * @property {function(string, EventHandler<unknown>=): void} off - Unsubscribe from an event
   * @property {function(string, ...unknown): void} emit - Emit an event
   */

  /**
   * @class 📡 Emitter
   * @classdesc A robust event emitter that enables inter-component communication through a publish-subscribe pattern.
   * Components can emit events and listen for events from other components, facilitating loose coupling
   * and reactive updates across the application.
   * Events are handled synchronously in the order they were registered, with proper cleanup
   * of unsubscribed handlers.
   *
   * Event names should follow the format 'namespace:action' for consistency and organization.
   *
   * @example
   * // Basic usage
   * const emitter = new Emitter();
   * emitter.on('user:login', (user) => console.log(`User logged in: ${user.name}`));
   * emitter.emit('user:login', { name: 'John' }); // Logs: "User logged in: John"
   *
   * @example
   * // With unsubscribe
   * const unsub = emitter.on('cart:update', (items) => {
   *   console.log(`Cart has ${items.length} items`);
   * });
   * emitter.emit('cart:update', [{ id: 1, name: 'Book' }]); // Logs: "Cart has 1 items"
   * unsub(); // Stop listening
   * emitter.emit('cart:update', []); // No log output
   *
   * @example
   * // Multiple arguments
   * emitter.on('order:placed', (orderId, amount, currency) => {
   *   console.log(`Order ${orderId}: ${amount} ${currency}`);
   * });
   * emitter.emit('order:placed', 'ORD-123', 99.99, 'USD');
   *
   * @example
   * // Common event patterns
   * // Lifecycle events
   * emitter.on('component:mount', (component) => {});
   * emitter.on('component:unmount', (component) => {});
   * // State events
   * emitter.on('state:change', (newState, oldState) => {});
   * // Navigation events
   * emitter.on('router:navigate', (to, from) => {});
   *
   * @implements {EmitterLike}
   */
  class Emitter {
    /**
     * Creates a new Emitter instance.
     *
     * @public
     *
     * @example
     * const emitter = new Emitter();
     */
    constructor() {
      /**
       * Map of event names to their registered handler functions
       * @private
       * @type {Map<string, Set<EventHandler<unknown>>>}
       */
      this._events = new Map();
    }

    /**
     * Registers an event handler for the specified event name.
     * The handler will be called with the event data when the event is emitted.
     * Event names should follow the format 'namespace:action' for consistency.
     *
     * @public
     * @template T
     * @param {string} event - The name of the event to listen for (e.g., 'user:login').
     * @param {EventHandler<T>} handler - The callback function to invoke when the event occurs.
     * @returns {EventUnsubscribe} A function to unsubscribe the event handler.
     *
     * @example
     * // Basic subscription
     * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
     *
     * @example
     * // Typed handler
     * emitter.on('user:update', (/** @type {{id: number, name: string}} *\/ user) => {
     *   console.log(`User ${user.id}: ${user.name}`);
     * });
     *
     * @example
     * // Cleanup
     * unsubscribe(); // Stops listening for the event
     */
    on(event, handler) {
      if (!this._events.has(event)) this._events.set(event, new Set());
      this._events.get(event).add(handler);
      return () => this.off(event, handler);
    }

    /**
     * Removes an event handler for the specified event name.
     * If no handler is provided, all handlers for the event are removed.
     * Automatically cleans up empty event sets to prevent memory leaks.
     *
     * @public
     * @template T
     * @param {string} event - The name of the event to remove handlers from.
     * @param {EventHandler<T>} [handler] - The specific handler function to remove.
     * @returns {void}
     *
     * @example
     * // Remove a specific handler
     * const loginHandler = (user) => console.log(user);
     * emitter.on('user:login', loginHandler);
     * emitter.off('user:login', loginHandler);
     *
     * @example
     * // Remove all handlers for an event
     * emitter.off('user:login');
     */
    off(event, handler) {
      if (!this._events.has(event)) return;
      if (handler) {
        const handlers = this._events.get(event);
        handlers.delete(handler);
        // Remove the event if there are no handlers left
        if (handlers.size === 0) this._events.delete(event);
      } else {
        this._events.delete(event);
      }
    }

    /**
     * Emits an event with the specified data to all registered handlers.
     * Handlers are called synchronously in the order they were registered.
     * If no handlers are registered for the event, the emission is silently ignored.
     *
     * @public
     * @template T
     * @param {string} event - The name of the event to emit.
     * @param {...T} args - Optional arguments to pass to the event handlers.
     * @returns {void}
     *
     * @example
     * // Emit an event with data
     * emitter.emit('user:login', { name: 'John', role: 'admin' });
     *
     * @example
     * // Emit an event with multiple arguments
     * emitter.emit('order:placed', 'ORD-123', 99.99, 'USD');
     *
     * @example
     * // Emit without data
     * emitter.emit('app:ready');
     */
    emit(event, ...args) {
      if (!this._events.has(event)) return;
      this._events.get(event).forEach(handler => handler(...args));
    }
  }

  // ============================================================================
  // TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
  // ============================================================================

  /**
   * @typedef {Object} PatchOptions
   * @property {boolean} [preserveStyles=true]
   *           Whether to preserve style elements with data-e-style attribute
   * @property {boolean} [preserveInstances=true]
   *           Whether to preserve elements with _eleva_instance property
   */

  /**
   * @typedef {Map<string, Node>} KeyMap
   *           Map of key attribute values to their corresponding DOM nodes
   */

  /**
   * @typedef {'ELEMENT_NODE'|'TEXT_NODE'|'COMMENT_NODE'|'DOCUMENT_FRAGMENT_NODE'} NodeTypeName
   *           Common DOM node type names
   */

  /**
   * @class 🎨 Renderer
   * @classdesc A high-performance DOM renderer that implements an optimized direct DOM diffing algorithm.
   *
   * Key features:
   * - Single-pass diffing algorithm for efficient DOM updates
   * - Key-based node reconciliation for optimal performance
   * - Intelligent attribute handling for ARIA, data attributes, and boolean properties
   * - Preservation of special Eleva-managed instances and style elements
   * - Memory-efficient with reusable temporary containers
   *
   * The renderer is designed to minimize DOM operations while maintaining
   * exact attribute synchronization and proper node identity preservation.
   * It's particularly optimized for frequent updates and complex DOM structures.
   *
   * @example
   * // Basic usage
   * const renderer = new Renderer();
   * const container = document.getElementById("app");
   * const newHtml = "<div>Updated content</div>";
   * renderer.patchDOM(container, newHtml);
   *
   * @example
   * // With keyed elements for optimal list updates
   * const listHtml = `
   *   <ul>
   *     <li key="item-1">First</li>
   *     <li key="item-2">Second</li>
   *     <li key="item-3">Third</li>
   *   </ul>
   * `;
   * renderer.patchDOM(container, listHtml);
   *
   * @example
   * // The renderer preserves Eleva-managed elements
   * // Elements with _eleva_instance are not replaced during diffing
   * // Style elements with data-e-style are preserved
   */
  class Renderer {
    /**
     * Creates a new Renderer instance.
     *
     * @public
     *
     * @example
     * const renderer = new Renderer();
     */
    constructor() {
      /**
       * A temporary container to hold the new HTML content while diffing.
       * Reused across patch operations to minimize memory allocation.
       * @private
       * @type {HTMLDivElement}
       */
      this._tempContainer = document.createElement("div");
    }

    /**
     * Patches the DOM of the given container with the provided HTML string.
     * Uses an optimized diffing algorithm to minimize DOM operations.
     *
     * @public
     * @param {HTMLElement} container - The container element to patch.
     * @param {string} newHtml - The new HTML string.
     * @returns {void}
     * @throws {TypeError} If container is not an HTMLElement or newHtml is not a string.
     * @throws {Error} If DOM patching fails.
     *
     * @example
     * // Update container content
     * renderer.patchDOM(container, '<div class="updated">New content</div>');
     *
     * @example
     * // Update list with keys for optimal diffing
     * const items = ['a', 'b', 'c'];
     * const html = items.map(item =>
     *   `<li key="${item}">${item}</li>`
     * ).join('');
     * renderer.patchDOM(listContainer, `<ul>${html}</ul>`);
     */
    patchDOM(container, newHtml) {
      if (!(container instanceof HTMLElement)) {
        throw new TypeError("Container must be an HTMLElement");
      }
      if (typeof newHtml !== "string") {
        throw new TypeError("newHtml must be a string");
      }
      try {
        this._tempContainer.innerHTML = newHtml;
        this._diff(container, this._tempContainer);
      } catch (error) {
        throw new Error(`Failed to patch DOM: ${error.message}`);
      }
    }

    /**
     * Performs a diff between two DOM nodes and patches the old node to match the new node.
     *
     * @private
     * @param {HTMLElement} oldParent - The original DOM element.
     * @param {HTMLElement} newParent - The new DOM element.
     * @returns {void}
     */
    _diff(oldParent, newParent) {
      if (oldParent === newParent || oldParent.isEqualNode?.(newParent)) return;
      const oldChildren = Array.from(oldParent.childNodes);
      const newChildren = Array.from(newParent.childNodes);
      let oldStartIdx = 0,
        newStartIdx = 0;
      let oldEndIdx = oldChildren.length - 1;
      let newEndIdx = newChildren.length - 1;
      let oldKeyMap = null;
      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        let oldStartNode = oldChildren[oldStartIdx];
        let newStartNode = newChildren[newStartIdx];
        if (!oldStartNode) {
          oldStartNode = oldChildren[++oldStartIdx];
        } else if (this._isSameNode(oldStartNode, newStartNode)) {
          this._patchNode(oldStartNode, newStartNode);
          oldStartIdx++;
          newStartIdx++;
        } else {
          if (!oldKeyMap) {
            oldKeyMap = this._createKeyMap(oldChildren, oldStartIdx, oldEndIdx);
          }
          const key = this._getNodeKey(newStartNode);
          const oldNodeToMove = key ? oldKeyMap.get(key) : null;
          if (oldNodeToMove) {
            this._patchNode(oldNodeToMove, newStartNode);
            oldParent.insertBefore(oldNodeToMove, oldStartNode);
            oldChildren[oldChildren.indexOf(oldNodeToMove)] = null;
          } else {
            oldParent.insertBefore(newStartNode.cloneNode(true), oldStartNode);
          }
          newStartIdx++;
        }
      }
      if (oldStartIdx > oldEndIdx) {
        const refNode = newChildren[newEndIdx + 1] ? oldChildren[oldStartIdx] : null;
        for (let i = newStartIdx; i <= newEndIdx; i++) {
          if (newChildren[i]) oldParent.insertBefore(newChildren[i].cloneNode(true), refNode);
        }
      } else if (newStartIdx > newEndIdx) {
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
          if (oldChildren[i]) this._removeNode(oldParent, oldChildren[i]);
        }
      }
    }

    /**
     * Patches a single node.
     *
     * @private
     * @param {Node} oldNode - The original DOM node.
     * @param {Node} newNode - The new DOM node.
     * @returns {void}
     */
    _patchNode(oldNode, newNode) {
      if (oldNode?._eleva_instance) return;
      if (!this._isSameNode(oldNode, newNode)) {
        oldNode.replaceWith(newNode.cloneNode(true));
        return;
      }
      if (oldNode.nodeType === Node.ELEMENT_NODE) {
        this._updateAttributes(oldNode, newNode);
        this._diff(oldNode, newNode);
      } else if (oldNode.nodeType === Node.TEXT_NODE && oldNode.nodeValue !== newNode.nodeValue) {
        oldNode.nodeValue = newNode.nodeValue;
      }
    }

    /**
     * Removes a node from its parent.
     *
     * @private
     * @param {HTMLElement} parent - The parent element containing the node to remove.
     * @param {Node} node - The node to remove.
     * @returns {void}
     */
    _removeNode(parent, node) {
      if (node.nodeName === "STYLE" && node.hasAttribute("data-e-style")) return;
      parent.removeChild(node);
    }

    /**
     * Updates the attributes of an element to match a new element's attributes.
     *
     * @private
     * @param {HTMLElement} oldEl - The original element to update.
     * @param {HTMLElement} newEl - The new element to update.
     * @returns {void}
     */
    _updateAttributes(oldEl, newEl) {
      const oldAttrs = oldEl.attributes;
      const newAttrs = newEl.attributes;

      // Process new attributes
      for (let i = 0; i < newAttrs.length; i++) {
        const {
          name,
          value
        } = newAttrs[i];

        // Skip event attributes (handled by event system)
        if (name.startsWith("@")) continue;

        // Skip if attribute hasn't changed
        if (oldEl.getAttribute(name) === value) continue;

        // Basic attribute setting
        oldEl.setAttribute(name, value);
      }

      // Remove old attributes that are no longer present
      for (let i = oldAttrs.length - 1; i >= 0; i--) {
        const name = oldAttrs[i].name;
        if (!newEl.hasAttribute(name)) {
          oldEl.removeAttribute(name);
        }
      }
    }

    /**
     * Determines if two nodes are the same based on their type, name, and key attributes.
     *
     * @private
     * @param {Node} oldNode - The first node to compare.
     * @param {Node} newNode - The second node to compare.
     * @returns {boolean} True if the nodes are considered the same, false otherwise.
     */
    _isSameNode(oldNode, newNode) {
      if (!oldNode || !newNode) return false;
      const oldKey = oldNode.nodeType === Node.ELEMENT_NODE ? oldNode.getAttribute("key") : null;
      const newKey = newNode.nodeType === Node.ELEMENT_NODE ? newNode.getAttribute("key") : null;
      if (oldKey && newKey) return oldKey === newKey;
      return !oldKey && !newKey && oldNode.nodeType === newNode.nodeType && oldNode.nodeName === newNode.nodeName;
    }

    /**
     * Creates a key map for the children of a parent node.
     * Used for efficient O(1) lookup of keyed elements during diffing.
     *
     * @private
     * @param {Array<ChildNode>} children - The children of the parent node.
     * @param {number} start - The start index of the children.
     * @param {number} end - The end index of the children.
     * @returns {KeyMap} A key map for the children.
     */
    _createKeyMap(children, start, end) {
      const map = new Map();
      for (let i = start; i <= end; i++) {
        const child = children[i];
        const key = this._getNodeKey(child);
        if (key) map.set(key, child);
      }
      return map;
    }

    /**
     * Extracts the key attribute from a node if it exists.
     *
     * @private
     * @param {Node} node - The node to extract the key from.
     * @returns {string|null} The key attribute value or null if not found.
     */
    _getNodeKey(node) {
      return node?.nodeType === Node.ELEMENT_NODE ? node.getAttribute("key") : null;
    }
  }

  // ============================================================================
  // TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
  // ============================================================================

  // -----------------------------------------------------------------------------
  // Configuration Types
  // -----------------------------------------------------------------------------

  /**
   * @typedef {Object} ElevaConfig
   * @property {boolean} [debug=false]
   *           Enable debug mode for verbose logging
   * @property {string} [prefix='e']
   *           Prefix for component style scoping
   * @property {boolean} [async=true]
   *           Enable async component setup
   */

  // -----------------------------------------------------------------------------
  // Component Types
  // -----------------------------------------------------------------------------

  /**
   * @typedef {Object} ComponentDefinition
   * @property {SetupFunction} [setup]
   *           Optional setup function that initializes the component's state and returns reactive data
   * @property {TemplateFunction|string} template
   *           Required function or string that defines the component's HTML structure
   * @property {StyleFunction|string} [style]
   *           Optional function or string that provides component-scoped CSS styles
   * @property {ChildrenMap} [children]
   *           Optional object defining nested child components
   */

  /**
   * @callback SetupFunction
   * @param {ComponentContext} ctx - The component context with props, emitter, and signal factory
   * @returns {SetupResult|Promise<SetupResult>} Reactive data and lifecycle hooks
   */

  /**
   * @typedef {Record<string, unknown> & LifecycleHooks} SetupResult
   *           Data returned from setup function, may include lifecycle hooks
   */

  /**
   * @callback TemplateFunction
   * @param {ComponentContext} ctx - The component context
   * @returns {string|Promise<string>} HTML template string
   */

  /**
   * @callback StyleFunction
   * @param {ComponentContext} ctx - The component context
   * @returns {string} CSS styles string
   */

  /**
   * @typedef {Record<string, ComponentDefinition|string>} ChildrenMap
   *           Map of CSS selectors to component definitions or registered component names
   */

  // -----------------------------------------------------------------------------
  // Context Types
  // -----------------------------------------------------------------------------

  /**
   * @typedef {Object} ComponentContext
   * @property {ComponentProps} props
   *           Component properties passed during mounting
   * @property {Emitter} emitter
   *           Event emitter instance for component event handling
   * @property {SignalFactory} signal
   *           Factory function to create reactive Signal instances
   */

  /**
   * @typedef {Record<string, unknown>} ComponentProps
   *           Properties passed to a component during mounting
   */

  /**
   * @callback SignalFactory
   * @template T
   * @param {T} initialValue - The initial value for the signal
   * @returns {Signal<T>} A new Signal instance
   */

  // -----------------------------------------------------------------------------
  // Lifecycle Hook Types
  // -----------------------------------------------------------------------------

  /**
   * @typedef {Object} LifecycleHooks
   * @property {LifecycleHook} [onBeforeMount]
   *           Hook called before component mounting
   * @property {LifecycleHook} [onMount]
   *           Hook called after component mounting
   * @property {LifecycleHook} [onBeforeUpdate]
   *           Hook called before component update
   * @property {LifecycleHook} [onUpdate]
   *           Hook called after component update
   * @property {UnmountHook} [onUnmount]
   *           Hook called during component unmounting
   */

  /**
   * @callback LifecycleHook
   * @param {LifecycleHookContext} ctx - Context with container and component data
   * @returns {void|Promise<void>}
   */

  /**
   * @callback UnmountHook
   * @param {UnmountHookContext} ctx - Context with cleanup resources
   * @returns {void|Promise<void>}
   */

  /**
   * @typedef {Object} LifecycleHookContext
   * @property {HTMLElement} container
   *           The DOM element where the component is mounted
   * @property {ComponentContext & SetupResult} context
   *           The component's reactive state and context data
   */

  /**
   * @typedef {Object} UnmountHookContext
   * @property {HTMLElement} container
   *           The DOM element where the component is mounted
   * @property {ComponentContext & SetupResult} context
   *           The component's reactive state and context data
   * @property {CleanupResources} cleanup
   *           Object containing cleanup functions and instances
   */

  /**
   * @typedef {Object} CleanupResources
   * @property {Array<UnsubscribeFunction>} watchers
   *           Signal watcher cleanup functions
   * @property {Array<UnsubscribeFunction>} listeners
   *           Event listener cleanup functions
   * @property {Array<MountResult>} children
   *           Child component instances
   */

  // -----------------------------------------------------------------------------
  // Mount Result Types
  // -----------------------------------------------------------------------------

  /**
   * @typedef {Object} MountResult
   * @property {HTMLElement} container
   *           The DOM element where the component is mounted
   * @property {ComponentContext & SetupResult} data
   *           The component's reactive state and context data
   * @property {UnmountFunction} unmount
   *           Function to clean up and unmount the component
   */

  /**
   * @callback UnmountFunction
   * @returns {Promise<void>}
   */

  /**
   * @callback UnsubscribeFunction
   * @returns {void|boolean}
   */

  // -----------------------------------------------------------------------------
  // Plugin Types
  // -----------------------------------------------------------------------------

  /**
   * @typedef {Object} ElevaPlugin
   * @property {PluginInstallFunction} install
   *           Function that installs the plugin into the Eleva instance
   * @property {string} name
   *           Unique identifier name for the plugin
   * @property {PluginUninstallFunction} [uninstall]
   *           Optional function to uninstall the plugin
   */

  /**
   * @callback PluginInstallFunction
   * @param {Eleva} eleva - The Eleva instance
   * @param {PluginOptions} options - Plugin configuration options
   * @returns {void|Eleva|unknown} Optionally returns the Eleva instance or plugin result
   */

  /**
   * @callback PluginUninstallFunction
   * @param {Eleva} eleva - The Eleva instance
   * @returns {void}
   */

  /**
   * @typedef {Record<string, unknown>} PluginOptions
   *           Configuration options passed to a plugin during installation
   */

  // -----------------------------------------------------------------------------
  // Event Types
  // -----------------------------------------------------------------------------

  /**
   * @callback EventHandler
   * @param {Event} event - The DOM event object
   * @returns {void}
   */

  /**
   * @typedef {'click'|'submit'|'input'|'change'|'focus'|'blur'|'keydown'|'keyup'|'keypress'|'mouseenter'|'mouseleave'|'mouseover'|'mouseout'|'mousedown'|'mouseup'|'touchstart'|'touchend'|'touchmove'|'scroll'|'resize'|'load'|'error'|string} DOMEventName
   *           Common DOM event names (prefixed with @ in templates)
   */

  /**
   * @class 🧩 Eleva
   * @classdesc A modern, signal-based component runtime framework that provides lifecycle hooks,
   * scoped styles, and plugin support. Eleva manages component registration, plugin integration,
   * event handling, and DOM rendering with a focus on performance and developer experience.
   *
   * @example
   * // Basic component creation and mounting
   * const app = new Eleva("myApp");
   * app.component("myComponent", {
   *   setup: (ctx) => ({ count: ctx.signal(0) }),
   *   template: (ctx) => `<div>Hello ${ctx.props.name}</div>`
   * });
   * app.mount(document.getElementById("app"), "myComponent", { name: "World" });
   *
   * @example
   * // Using lifecycle hooks
   * app.component("lifecycleDemo", {
   *   setup: () => {
   *     return {
   *       onMount: ({ container, context }) => {
   *         console.log('Component mounted!');
   *       }
   *     };
   *   },
   *   template: `<div>Lifecycle Demo</div>`
   * });
   */
  class Eleva {
    /**
     * Creates a new Eleva instance with the specified name and configuration.
     *
     * @public
     * @param {string} name - The unique identifier name for this Eleva instance.
     * @param {Record<string, unknown>} [config={}] - Optional configuration object for the instance.
     *        May include framework-wide settings and default behaviors.
     * @throws {Error} If the name is not provided or is not a string.
     * @returns {Eleva} A new Eleva instance.
     *
     * @example
     * const app = new Eleva("myApp");
     * app.component("myComponent", {
     *   setup: (ctx) => ({ count: ctx.signal(0) }),
     *   template: (ctx) => `<div>Hello ${ctx.props.name}!</div>`
     * });
     * app.mount(document.getElementById("app"), "myComponent", { name: "World" });
     *
     */
    constructor(name, config = {}) {
      /** @public {string} The unique identifier name for this Eleva instance */
      this.name = name;
      /** @public {Object<string, unknown>} Optional configuration object for the Eleva instance */
      this.config = config;
      /** @public {Emitter} Instance of the event emitter for handling component events */
      this.emitter = new Emitter();
      /** @public {typeof Signal} Static reference to the Signal class for creating reactive state */
      this.signal = Signal;
      /** @public {typeof TemplateEngine} Static reference to the TemplateEngine class for template parsing */
      this.templateEngine = TemplateEngine;
      /** @public {Renderer} Instance of the renderer for handling DOM updates and patching */
      this.renderer = new Renderer();

      /** @private {Map<string, ComponentDefinition>} Registry of all component definitions by name */
      this._components = new Map();
      /** @private {Map<string, ElevaPlugin>} Collection of installed plugin instances by name */
      this._plugins = new Map();
      /** @private {number} Counter for generating unique component IDs */
      this._componentCounter = 0;
    }

    /**
     * Integrates a plugin with the Eleva framework.
     * The plugin's install function will be called with the Eleva instance and provided options.
     * After installation, the plugin will be available for use by components.
     *
     * Note: Plugins that wrap core methods (e.g., mount) must be uninstalled in reverse order
     * of installation (LIFO - Last In, First Out) to avoid conflicts.
     *
     * @public
     * @param {ElevaPlugin} plugin - The plugin object which must have an `install` function.
     * @param {Object<string, unknown>} [options={}] - Optional configuration options for the plugin.
     * @returns {Eleva} The Eleva instance (for method chaining).
     * @example
     * app.use(myPlugin, { option1: "value1" });
     *
     * @example
     * // Correct uninstall order (LIFO)
     * app.use(PluginA);
     * app.use(PluginB);
     * // Uninstall in reverse order:
     * PluginB.uninstall(app);
     * PluginA.uninstall(app);
     */
    use(plugin, options = {}) {
      this._plugins.set(plugin.name, plugin);
      const result = plugin.install(this, options);
      return result !== undefined ? result : this;
    }

    /**
     * Registers a new component with the Eleva instance.
     * The component will be available for mounting using its registered name.
     *
     * @public
     * @param {string} name - The unique name of the component to register.
     * @param {ComponentDefinition} definition - The component definition including setup, template, style, and children.
     * @returns {Eleva} The Eleva instance (for method chaining).
     * @throws {Error} If the component name is already registered.
     * @example
     * app.component("myButton", {
     *   template: (ctx) => `<button>${ctx.props.text}</button>`,
     *   style: `button { color: blue; }`
     * });
     */
    component(name, definition) {
      /** @type {Map<string, ComponentDefinition>} */
      this._components.set(name, definition);
      return this;
    }

    /**
     * Mounts a registered component to a DOM element.
     * This will initialize the component, set up its reactive state, and render it to the DOM.
     *
     * @public
     * @param {HTMLElement} container - The DOM element where the component will be mounted.
     * @param {string|ComponentDefinition} compName - The name of the registered component or a direct component definition.
     * @param {Object<string, unknown>} [props={}] - Optional properties to pass to the component.
     * @returns {Promise<MountResult>}
     *          A Promise that resolves to an object containing:
     *          - container: The mounted component's container element
     *          - data: The component's reactive state and context
     *          - unmount: Function to clean up and unmount the component
     * @throws {Error} If the container is not found, or component is not registered.
     * @example
     * const instance = await app.mount(document.getElementById("app"), "myComponent", { text: "Click me" });
     * // Later...
     * instance.unmount();
     */
    async mount(container, compName, props = {}) {
      if (!container) throw new Error(`Container not found: ${container}`);
      if (container._eleva_instance) return container._eleva_instance;

      /** @type {ComponentDefinition} */
      const definition = typeof compName === "string" ? this._components.get(compName) : compName;
      if (!definition) throw new Error(`Component "${compName}" not registered.`);

      /** @type {string} */
      const compId = `c${++this._componentCounter}`;

      /**
       * Destructure the component definition to access core functionality.
       * - setup: Optional function for component initialization and state management
       * - template: Required function or string that returns the component's HTML structure
       * - style: Optional function or string for component-scoped CSS styles
       * - children: Optional object defining nested child components
       */
      const {
        setup,
        template,
        style,
        children
      } = definition;

      /** @type {ComponentContext} */
      const context = {
        props,
        emitter: this.emitter,
        /** @type {(v: unknown) => Signal<unknown>} */
        signal: v => new this.signal(v)
      };

      /**
       * Processes the mounting of the component.
       * This function handles:
       * 1. Merging setup data with the component context
       * 2. Setting up reactive watchers
       * 3. Rendering the component
       * 4. Managing component lifecycle
       *
       * @param {Object<string, unknown>} data - Data returned from the component's setup function
       * @returns {Promise<MountResult>} An object containing:
       *   - container: The mounted component's container element
       *   - data: The component's reactive state and context
       *   - unmount: Function to clean up and unmount the component
       */
      const processMount = async data => {
        /** @type {ComponentContext} */
        const mergedContext = {
          ...context,
          ...data
        };
        /** @type {Array<() => void>} */
        const watchers = [];
        /** @type {Array<MountResult>} */
        const childInstances = [];
        /** @type {Array<() => void>} */
        const listeners = [];
        /** @private {boolean} Local mounted state for this component instance */
        let isMounted = false;

        /**
         * Renders the component by:
         * 1. Executing lifecycle hooks
         * 2. Processing the template
         * 3. Updating the DOM
         * 4. Processing events, injecting styles, and mounting child components.
         */
        const render = async () => {
          // Execute before hooks
          if (!isMounted) {
            await mergedContext.onBeforeMount?.({
              container,
              context: mergedContext
            });
          } else {
            await mergedContext.onBeforeUpdate?.({
              container,
              context: mergedContext
            });
          }
          const templateResult = typeof template === "function" ? await template(mergedContext) : template;
          const newHtml = this.templateEngine.parse(templateResult, mergedContext);
          this.renderer.patchDOM(container, newHtml);
          this._processEvents(container, mergedContext, listeners);
          if (style) this._injectStyles(container, compId, style, mergedContext);
          if (children) await this._mountComponents(container, children, childInstances);

          // Execute after hooks
          if (!isMounted) {
            await mergedContext.onMount?.({
              container,
              context: mergedContext
            });
            isMounted = true;
          } else {
            await mergedContext.onUpdate?.({
              container,
              context: mergedContext
            });
          }
        };

        /**
         * Sets up reactive watchers for all Signal instances in the component's data.
         * When a Signal's value changes, the component will re-render to reflect the updates.
         * Stores unsubscribe functions to clean up watchers when component unmounts.
         */
        for (const val of Object.values(data)) {
          if (val instanceof Signal) watchers.push(val.watch(render));
        }
        await render();
        const instance = {
          container,
          data: mergedContext,
          /**
           * Unmounts the component, cleaning up watchers and listeners, child components, and clearing the container.
           *
           * @returns {void}
           */
          unmount: async () => {
            /** @type {UnmountHookContext} */
            await mergedContext.onUnmount?.({
              container,
              context: mergedContext,
              cleanup: {
                watchers: watchers,
                listeners: listeners,
                children: childInstances
              }
            });
            for (const fn of watchers) fn();
            for (const fn of listeners) fn();
            for (const child of childInstances) await child.unmount();
            container.innerHTML = "";
            delete container._eleva_instance;
          }
        };
        container._eleva_instance = instance;
        return instance;
      };

      // Handle asynchronous setup.
      const setupResult = typeof setup === "function" ? await setup(context) : {};
      return await processMount(setupResult);
    }

    /**
     * Processes DOM elements for event binding based on attributes starting with "@".
     * This method handles the event delegation system and ensures proper cleanup of event listeners.
     *
     * @private
     * @param {HTMLElement} container - The container element in which to search for event attributes.
     * @param {ComponentContext} context - The current component context containing event handler definitions.
     * @param {Array<() => void>} listeners - Array to collect cleanup functions for each event listener.
     * @returns {void}
     */
    _processEvents(container, context, listeners) {
      /** @type {NodeListOf<Element>} */
      const elements = container.querySelectorAll("*");
      for (const el of elements) {
        /** @type {NamedNodeMap} */
        const attrs = el.attributes;
        for (let i = 0; i < attrs.length; i++) {
          /** @type {Attr} */
          const attr = attrs[i];
          if (!attr.name.startsWith("@")) continue;

          /** @type {keyof HTMLElementEventMap} */
          const event = attr.name.slice(1);
          /** @type {string} */
          const handlerName = attr.value;
          /** @type {(event: Event) => void} */
          const handler = context[handlerName] || this.templateEngine.evaluate(handlerName, context);
          if (typeof handler === "function") {
            el.addEventListener(event, handler);
            el.removeAttribute(attr.name);
            listeners.push(() => el.removeEventListener(event, handler));
          }
        }
      }
    }

    /**
     * Injects scoped styles into the component's container.
     * The styles are automatically prefixed to prevent style leakage to other components.
     *
     * @private
     * @param {HTMLElement} container - The container element where styles should be injected.
     * @param {string} compId - The component ID used to identify the style element.
     * @param {(function(ComponentContext): string)|string} styleDef - The component's style definition (function or string).
     * @param {ComponentContext} context - The current component context for style interpolation.
     * @returns {void}
     */
    _injectStyles(container, compId, styleDef, context) {
      /** @type {string} */
      const newStyle = typeof styleDef === "function" ? this.templateEngine.parse(styleDef(context), context) : styleDef;

      /** @type {HTMLStyleElement|null} */
      let styleEl = container.querySelector(`style[data-e-style="${compId}"]`);
      if (styleEl && styleEl.textContent === newStyle) return;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.setAttribute("data-e-style", compId);
        container.appendChild(styleEl);
      }
      styleEl.textContent = newStyle;
    }

    /**
     * Extracts props from an element's attributes that start with the specified prefix.
     * This method is used to collect component properties from DOM elements.
     *
     * @private
     * @param {HTMLElement} element - The DOM element to extract props from
     * @returns {Record<string, string>} An object containing the extracted props
     * @example
     * // For an element with attributes:
     * // <div :name="John" :age="25">
     * // Returns: { name: "John", age: "25" }
     */
    _extractProps(element) {
      if (!element.attributes) return {};
      const props = {};
      const attrs = element.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i];
        if (attr.name.startsWith(":")) {
          const propName = attr.name.slice(1);
          props[propName] = attr.value;
          element.removeAttribute(attr.name);
        }
      }
      return props;
    }

    /**
     * Mounts all components within the parent component's container.
     * This method handles mounting of explicitly defined children components.
     *
     * The mounting process follows these steps:
     * 1. Cleans up any existing component instances
     * 2. Mounts explicitly defined children components
     *
     * @private
     * @param {HTMLElement} container - The container element to mount components in
     * @param {Object<string, ComponentDefinition>} children - Map of selectors to component definitions for explicit children
     * @param {Array<MountResult>} childInstances - Array to store all mounted component instances
     * @returns {Promise<void>}
     *
     * @example
     * // Explicit children mounting:
     * const children = {
     *   'UserProfile': UserProfileComponent,
     *   '#settings-panel': "settings-panel"
     * };
     */
    async _mountComponents(container, children, childInstances) {
      for (const [selector, component] of Object.entries(children)) {
        if (!selector) continue;
        for (const el of container.querySelectorAll(selector)) {
          if (!(el instanceof HTMLElement)) continue;
          /** @type {Record<string, string>} */
          const props = this._extractProps(el);
          /** @type {MountResult} */
          const instance = await this.mount(el, component, props);
          if (instance && !childInstances.includes(instance)) {
            childInstances.push(instance);
          }
        }
      }
    }
  }

  return Eleva;

}));
//# sourceMappingURL=eleva.umd.js.map

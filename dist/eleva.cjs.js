/*! Eleva v1.0.0-rc.12 | MIT License | https://elevajs.com */
'use strict';

// ============================================================================
// TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
// ============================================================================
/**
 * @typedef {Record<string, unknown>} TemplateData
 *           Data context for template interpolation
 */ /**
 * @typedef {string} TemplateString
 *           A string containing {{ expression }} interpolation markers
 */ /**
 * @typedef {string} Expression
 *           A JavaScript expression to be evaluated in the data context
 */ /**
 * @typedef {unknown} EvaluationResult
 *           The result of evaluating an expression (string, number, boolean, object, etc.)
 */ /**
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
 */ class TemplateEngine {
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
   */ static parse(template, data) {
        if (typeof template !== "string") return template;
        return template.replace(this.expressionPattern, (_, expression)=>this.evaluate(expression, data));
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
   * // Failed evaluation returns undefined
   * TemplateEngine.evaluate("nonexistent.property", {});
   * // Result: undefined
   */ static evaluate(expression, data) {
        if (typeof expression !== "string") return expression;
        let fn = this._functionCache.get(expression);
        if (!fn) {
            try {
                fn = new Function("data", `with(data) { return ${expression}; }`);
                this._functionCache.set(expression, fn);
            } catch  {
                return undefined;
            }
        }
        try {
            return fn(data);
        } catch  {
            return undefined;
        }
    }
}
/**
   * Regular expression for matching template expressions in the format {{ expression }}
   * Matches: {{ anything }} with optional whitespace inside braces
   *
   * @static
   * @private
   * @type {RegExp}
   */ TemplateEngine.expressionPattern = /\{\{\s*(.*?)\s*\}\}/g;
/**
   * Cache for compiled expression functions.
   * Stores compiled Function objects keyed by expression string for O(1) lookup.
   *
   * @static
   * @private
   * @type {Map<string, Function>}
   */ TemplateEngine._functionCache = new Map();

// ============================================================================
// TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
// ============================================================================
/**
 * @template T
 * @callback SignalWatcher
 * @param {T} value - The new value of the signal
 * @returns {void}
 */ /**
 * @callback SignalUnsubscribe
 * @returns {boolean} True if the watcher was successfully removed
 */ /**
 * @template T
 * @typedef {Object} SignalLike
 * @property {T} value - The current value
 * @property {function(SignalWatcher<T>): SignalUnsubscribe} watch - Subscribe to changes
 */ /**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers synchronously when their value changes, enabling efficient
 * DOM updates through targeted patching rather than full re-renders.
 * Synchronous notification preserves stack traces and allows immediate value inspection.
 * Render batching is handled at the component level, not the signal level.
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
 */ class Signal {
    /**
   * Gets the current value of the signal.
   *
   * @public
   * @returns {T} The current value.
   */ get value() {
        return this._value;
    }
    /**
   * Sets a new value for the signal and synchronously notifies all registered watchers if the value has changed.
   * Synchronous notification preserves stack traces and ensures immediate value consistency.
   *
   * @public
   * @param {T} newVal - The new value to set.
   * @returns {void}
   */ set value(newVal) {
        if (this._value !== newVal) {
            this._value = newVal;
            this._notify();
        }
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
   */ watch(fn) {
        this._watchers.add(fn);
        return ()=>this._watchers.delete(fn);
    }
    /**
   * Synchronously notifies all registered watchers of the value change.
   * This preserves stack traces for debugging and ensures immediate
   * value consistency. Render batching is handled at the component level.
   *
   * @private
   * @returns {void}
   */ _notify() {
        for (const fn of this._watchers)fn(this._value);
    }
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
   */ constructor(value){
        /**
     * Internal storage for the signal's current value.
     * @private
     * @type {T}
     */ this._value = value;
        /**
     * Collection of callback functions to be notified when value changes.
     * @private
     * @type {Set<SignalWatcher<T>>}
     */ this._watchers = new Set();
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
 */ /**
 * @callback EventUnsubscribe
 * @returns {void}
 */ /**
 * @typedef {`${string}:${string}`} EventName
 *           Event names follow the format 'namespace:action' (e.g., 'user:login', 'cart:update')
 */ /**
 * @typedef {Object} EmitterLike
 * @property {function(string, EventHandler<unknown>): EventUnsubscribe} on - Subscribe to an event
 * @property {function(string, EventHandler<unknown>=): void} off - Unsubscribe from an event
 * @property {function(string, ...unknown): void} emit - Emit an event
 */ /**
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
 */ class Emitter {
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
   */ on(event, handler) {
        let h = this._events.get(event);
        if (!h) this._events.set(event, h = new Set());
        h.add(handler);
        return ()=>this.off(event, handler);
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
   */ off(event, handler) {
        if (!this._events.has(event)) return;
        if (handler) {
            const handlers = this._events.get(event);
            handlers.delete(handler);
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
   */ emit(event, ...args) {
        const handlers = this._events.get(event);
        if (handlers) for (const handler of handlers)handler(...args);
    }
    /**
   * Creates a new Emitter instance.
   *
   * @public
   *
   * @example
   * const emitter = new Emitter();
   */ constructor(){
        /**
     * Map of event names to their registered handler functions
     * @private
     * @type {Map<string, Set<EventHandler<unknown>>>}
     */ this._events = new Map();
    }
}

// ============================================================================
// TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
// ============================================================================
/**
 * @typedef {Map<string, Node>} KeyMap
 *          Map of key attribute values to their corresponding DOM nodes for O(1) lookup
 */ /**
 * @typedef {Object} RendererLike
 * @property {function(HTMLElement, string): void} patchDOM - Patches the DOM with new HTML
 */ /**
 * @class 🎨 Renderer
 * @classdesc A high-performance DOM renderer that implements an optimized two-pointer diffing
 * algorithm with key-based node reconciliation. The renderer efficiently updates the DOM by
 * computing the minimal set of operations needed to transform the current state to the desired state.
 *
 * Key features:
 * - Two-pointer diffing algorithm for efficient DOM updates
 * - Key-based node reconciliation for optimal list performance (O(1) lookup)
 * - Preserves DOM node identity during reordering (maintains event listeners, focus, animations)
 * - Intelligent attribute synchronization (skips Eleva event attributes)
 * - Preservation of Eleva-managed component instances and style elements
 *
 * @example
 * // Basic usage
 * const renderer = new Renderer();
 * renderer.patchDOM(container, '<div>Updated content</div>');
 *
 * @example
 * // With keyed elements for optimal list updates
 * const html = items.map(item => `<li key="${item.id}">${item.name}</li>`).join('');
 * renderer.patchDOM(listContainer, `<ul>${html}</ul>`);
 *
 * @example
 * // Keyed elements preserve DOM identity during reordering
 * // Before: [A, B, C] -> After: [C, A, B]
 * // The actual DOM nodes are moved, not recreated
 * renderer.patchDOM(container, '<div key="C">C</div><div key="A">A</div><div key="B">B</div>');
 *
 * @implements {RendererLike}
 */ class Renderer {
    /**
   * Patches the DOM of the given container with the provided HTML string.
   * Uses an optimized two-pointer diffing algorithm to minimize DOM operations.
   * The algorithm computes the minimal set of insertions, deletions, and updates
   * needed to transform the current DOM state to match the new HTML.
   *
   * @public
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML string to render.
   * @returns {void}
   *
   * @example
   * // Simple content update
   * renderer.patchDOM(container, '<div class="updated">New content</div>');
   *
   * @example
   * // List with keyed items (optimal for reordering)
   * renderer.patchDOM(container, '<ul><li key="1">First</li><li key="2">Second</li></ul>');
   *
   * @example
   * // Empty the container
   * renderer.patchDOM(container, '');
   */ patchDOM(container, newHtml) {
        this._tempContainer.innerHTML = newHtml;
        this._diff(container, this._tempContainer);
    }
    /**
   * Performs a diff between two DOM nodes and patches the old node to match the new node.
   * Uses a two-pointer algorithm with key-based reconciliation for optimal performance.
   *
   * Algorithm overview:
   * 1. Compare children from start using two pointers
   * 2. For mismatches, build a key map lazily for O(1) lookup
   * 3. Move or insert nodes as needed
   * 4. Clean up remaining nodes at the end
   *
   * @private
   * @param {HTMLElement} oldParent - The original DOM element to update.
   * @param {HTMLElement} newParent - The new DOM element with desired state.
   * @returns {void}
   */ _diff(oldParent, newParent) {
        // Early exit for leaf nodes (no children)
        if (!oldParent.firstChild && !newParent.firstChild) return;
        const oldChildren = Array.from(oldParent.childNodes);
        const newChildren = Array.from(newParent.childNodes);
        let oldStart = 0, newStart = 0;
        let oldEnd = oldChildren.length - 1;
        let newEnd = newChildren.length - 1;
        let keyMap = null;
        // Two-pointer algorithm with key-based reconciliation
        while(oldStart <= oldEnd && newStart <= newEnd){
            const oldNode = oldChildren[oldStart];
            const newNode = newChildren[newStart];
            if (!oldNode) {
                oldStart++;
                continue;
            }
            if (this._isSameNode(oldNode, newNode)) {
                this._patchNode(oldNode, newNode);
                oldStart++;
                newStart++;
            } else {
                // Build key map lazily for O(1) lookup
                if (!keyMap) {
                    keyMap = this._createKeyMap(oldChildren, oldStart, oldEnd);
                }
                const key = this._getNodeKey(newNode);
                const matchedNode = key ? keyMap.get(key) : null;
                // Only use matched node if tag also matches
                if (matchedNode && matchedNode.nodeName === newNode.nodeName) {
                    // Move existing keyed node (preserves DOM identity)
                    this._patchNode(matchedNode, newNode);
                    oldParent.insertBefore(matchedNode, oldNode);
                    oldChildren[oldChildren.indexOf(matchedNode)] = null;
                } else {
                    // Insert new node
                    oldParent.insertBefore(newNode.cloneNode(true), oldNode);
                }
                newStart++;
            }
        }
        // Add remaining new nodes
        if (oldStart > oldEnd) {
            const refNode = newChildren[newEnd + 1] ? oldChildren[oldStart] : null;
            for(let i = newStart; i <= newEnd; i++){
                if (newChildren[i]) {
                    oldParent.insertBefore(newChildren[i].cloneNode(true), refNode);
                }
            }
        } else if (newStart > newEnd) {
            for(let i = oldStart; i <= oldEnd; i++){
                if (oldChildren[i]) this._removeNode(oldParent, oldChildren[i]);
            }
        }
    }
    /**
   * Patches a single node, updating its content and attributes to match the new node.
   * Handles text nodes by updating nodeValue, and element nodes by updating attributes
   * and recursively diffing children.
   *
   * Skips nodes that are managed by Eleva component instances to prevent interference
   * with nested component state.
   *
   * @private
   * @param {Node} oldNode - The original DOM node to update.
   * @param {Node} newNode - The new DOM node with desired state.
   * @returns {void}
   */ _patchNode(oldNode, newNode) {
        // Skip nodes managed by Eleva component instances
        if (oldNode._eleva_instance) return;
        if (oldNode.nodeType === 3) {
            if (oldNode.nodeValue !== newNode.nodeValue) {
                oldNode.nodeValue = newNode.nodeValue;
            }
        } else if (oldNode.nodeType === 1) {
            this._updateAttributes(oldNode, newNode);
            this._diff(oldNode, newNode);
        }
    }
    /**
   * Removes a node from its parent, with special handling for Eleva-managed elements.
   * Style elements with the `data-e-style` attribute are preserved to maintain
   * component-scoped styles across re-renders.
   *
   * @private
   * @param {HTMLElement} parent - The parent element containing the node.
   * @param {Node} node - The node to remove.
   * @returns {void}
   */ _removeNode(parent, node) {
        // Preserve Eleva-managed style elements
        if (node.nodeName === "STYLE" && node.hasAttribute("data-e-style")) return;
        parent.removeChild(node);
    }
    /**
   * Updates the attributes of an element to match a new element's attributes.
   * Adds new attributes, updates changed values, and removes attributes no longer present.
   *
   * Event attributes (prefixed with `@`) are skipped as they are handled separately
   * by Eleva's event binding system.
   *
   * @private
   * @param {HTMLElement} oldEl - The original element to update.
   * @param {HTMLElement} newEl - The new element with target attributes.
   * @returns {void}
   */ _updateAttributes(oldEl, newEl) {
        // Add/update attributes from new element
        for (const attr of newEl.attributes){
            // Skip event attributes (handled by Eleva's event system)
            if (attr.name[0] !== "@" && oldEl.getAttribute(attr.name) !== attr.value) {
                oldEl.setAttribute(attr.name, attr.value);
            }
        }
        // Remove attributes no longer present
        for(let i = oldEl.attributes.length - 1; i >= 0; i--){
            if (!newEl.hasAttribute(oldEl.attributes[i].name)) {
                oldEl.removeAttribute(oldEl.attributes[i].name);
            }
        }
    }
    /**
   * Determines if two nodes are the same for reconciliation purposes.
   * Two nodes are considered the same if:
   * - Both have keys: keys match AND tag names match
   * - Neither has keys: node types match AND node names match
   * - One has key, other doesn't: not the same
   *
   * This ensures keyed elements are only reused when both key and tag match,
   * preventing bugs like `<div key="a">` incorrectly matching `<span key="a">`.
   *
   * @private
   * @param {Node} oldNode - The first node to compare.
   * @param {Node} newNode - The second node to compare.
   * @returns {boolean} True if the nodes are considered the same for reconciliation.
   */ _isSameNode(oldNode, newNode) {
        if (!oldNode || !newNode) return false;
        const oldKey = this._getNodeKey(oldNode);
        const newKey = this._getNodeKey(newNode);
        // If both have keys, compare by key AND tag name
        if (oldKey && newKey) {
            return oldKey === newKey && oldNode.nodeName === newNode.nodeName;
        }
        // Otherwise, compare by type and name
        return !oldKey && !newKey && oldNode.nodeType === newNode.nodeType && oldNode.nodeName === newNode.nodeName;
    }
    /**
   * Extracts the key attribute from a node if it exists.
   * Only element nodes (nodeType === 1) can have key attributes.
   *
   * @private
   * @param {Node|null|undefined} node - The node to extract the key from.
   * @returns {string|null} The key attribute value, or null if not an element or no key.
   */ _getNodeKey(node) {
        return node?.nodeType === 1 ? node.getAttribute("key") : null;
    }
    /**
   * Creates a key map for efficient O(1) lookup of keyed elements during diffing.
   * The map is built lazily only when needed (when a mismatch occurs during diffing).
   *
   * @private
   * @param {Array<ChildNode>} children - The array of child nodes to map.
   * @param {number} start - The start index (inclusive) for mapping.
   * @param {number} end - The end index (inclusive) for mapping.
   * @returns {KeyMap} A Map of key strings to their corresponding DOM nodes.
   */ _createKeyMap(children, start, end) {
        const map = new Map();
        for(let i = start; i <= end; i++){
            const key = this._getNodeKey(children[i]);
            if (key) map.set(key, children[i]);
        }
        return map;
    }
    /**
   * Creates a new Renderer instance.
   *
   * @public
   *
   * @example
   * const renderer = new Renderer();
   */ constructor(){
        /**
     * Temporary container for parsing new HTML content.
     * Reused across patch operations to minimize memory allocation.
     * @private
     * @type {HTMLDivElement}
     */ this._tempContainer = document.createElement("div");
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
 */ // -----------------------------------------------------------------------------
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
 */ /**
 * @callback SetupFunction
 * @param {ComponentContext} ctx - The component context with props, emitter, and signal factory
 * @returns {SetupResult|Promise<SetupResult>} Reactive data and lifecycle hooks
 */ /**
 * @typedef {Record<string, unknown> & LifecycleHooks} SetupResult
 *           Data returned from setup function, may include lifecycle hooks
 */ /**
 * @callback TemplateFunction
 * @param {ComponentContext} ctx - The component context
 * @returns {string|Promise<string>} HTML template string
 */ /**
 * @callback StyleFunction
 * @param {ComponentContext} ctx - The component context
 * @returns {string} CSS styles string
 */ /**
 * @typedef {Record<string, ComponentDefinition|string>} ChildrenMap
 *           Map of CSS selectors to component definitions or registered component names
 */ // -----------------------------------------------------------------------------
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
 */ /**
 * @typedef {Record<string, unknown>} ComponentProps
 *           Properties passed to a component during mounting
 */ /**
 * @callback SignalFactory
 * @template T
 * @param {T} initialValue - The initial value for the signal
 * @returns {Signal<T>} A new Signal instance
 */ // -----------------------------------------------------------------------------
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
 */ /**
 * @callback LifecycleHook
 * @param {LifecycleHookContext} ctx - Context with container and component data
 * @returns {void|Promise<void>}
 */ /**
 * @callback UnmountHook
 * @param {UnmountHookContext} ctx - Context with cleanup resources
 * @returns {void|Promise<void>}
 */ /**
 * @typedef {Object} LifecycleHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext & SetupResult} context
 *           The component's reactive state and context data
 */ /**
 * @typedef {Object} UnmountHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext & SetupResult} context
 *           The component's reactive state and context data
 * @property {CleanupResources} cleanup
 *           Object containing cleanup functions and instances
 */ /**
 * @typedef {Object} CleanupResources
 * @property {Array<UnsubscribeFunction>} watchers
 *           Signal watcher cleanup functions
 * @property {Array<UnsubscribeFunction>} listeners
 *           Event listener cleanup functions
 * @property {Array<MountResult>} children
 *           Child component instances
 */ // -----------------------------------------------------------------------------
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
 */ /**
 * @callback UnmountFunction
 * @returns {Promise<void>}
 */ /**
 * @callback UnsubscribeFunction
 * @returns {void|boolean}
 */ // -----------------------------------------------------------------------------
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
 */ /**
 * @callback PluginInstallFunction
 * @param {Eleva} eleva - The Eleva instance
 * @param {PluginOptions} options - Plugin configuration options
 * @returns {void|Eleva|unknown} Optionally returns the Eleva instance or plugin result
 */ /**
 * @callback PluginUninstallFunction
 * @param {Eleva} eleva - The Eleva instance
 * @returns {void}
 */ /**
 * @typedef {Record<string, unknown>} PluginOptions
 *           Configuration options passed to a plugin during installation
 */ // -----------------------------------------------------------------------------
// Event Types
// -----------------------------------------------------------------------------
/**
 * @callback EventHandler
 * @param {Event} event - The DOM event object
 * @returns {void}
 */ /**
 * @typedef {'click'|'submit'|'input'|'change'|'focus'|'blur'|'keydown'|'keyup'|'keypress'|'mouseenter'|'mouseleave'|'mouseover'|'mouseout'|'mousedown'|'mouseup'|'touchstart'|'touchend'|'touchmove'|'scroll'|'resize'|'load'|'error'|string} DOMEventName
 *           Common DOM event names (prefixed with @ in templates)
 */ /**
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
 */ class Eleva {
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
   * @throws {Error} If plugin does not have an install function.
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
   */ use(plugin, options = {}) {
        if (!plugin?.install || typeof plugin.install !== "function") {
            throw new Error("Eleva: plugin must have an install function");
        }
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
   * @throws {Error} If name is not a non-empty string or definition has no template.
   * @example
   * app.component("myButton", {
   *   template: (ctx) => `<button>${ctx.props.text}</button>`,
   *   style: `button { color: blue; }`
   * });
   */ component(name, definition) {
        if (!name || typeof name !== "string") {
            throw new Error("Eleva: component name must be a non-empty string");
        }
        if (!definition?.template) {
            throw new Error(`Eleva: component "${name}" must have a template`);
        }
        /** @type {Map<string, ComponentDefinition>} */ this._components.set(name, definition);
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
   * @throws {Error} If container is not a DOM element or component is not registered.
   * @example
   * const instance = await app.mount(document.getElementById("app"), "myComponent", { text: "Click me" });
   * // Later...
   * instance.unmount();
   */ async mount(container, compName, props = {}) {
        if (!container?.nodeType) {
            throw new Error("Eleva: container must be a DOM element");
        }
        if (container._eleva_instance) return container._eleva_instance;
        /** @type {ComponentDefinition} */ const definition = typeof compName === "string" ? this._components.get(compName) : compName;
        if (!definition) throw new Error(`Component "${compName}" not registered.`);
        /** @type {string} */ const compId = `c${++this._componentCounter}`;
        /**
     * Destructure the component definition to access core functionality.
     * - setup: Optional function for component initialization and state management
     * - template: Required function or string that returns the component's HTML structure
     * - style: Optional function or string for component-scoped CSS styles
     * - children: Optional object defining nested child components
     */ const { setup, template, style, children } = definition;
        /** @type {ComponentContext} */ const context = {
            props,
            emitter: this.emitter,
            /** @type {(v: unknown) => Signal<unknown>} */ signal: (v)=>new this.signal(v)
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
     */ const processMount = async (data)=>{
            /** @type {ComponentContext} */ const mergedContext = {
                ...context,
                ...data
            };
            /** @type {Array<() => void>} */ const watchers = [];
            /** @type {Array<MountResult>} */ const childInstances = [];
            /** @type {Array<() => void>} */ const listeners = [];
            /** @private {boolean} Local mounted state for this component instance */ let isMounted = false;
            // ========================================================================
            // Render Batching
            // ========================================================================
            /** @private {boolean} Flag to prevent concurrent renders */ let renderScheduled = false;
            /**
       * Schedules a render using microtask batching.
       * Since signals now notify watchers synchronously, multiple signal
       * changes in the same synchronous block will each call this function,
       * but only one render will be scheduled via queueMicrotask.
       * This separates concerns: signals handle state, components handle scheduling.
       * @private
       */ const scheduleRender = ()=>{
                if (renderScheduled) return;
                renderScheduled = true;
                queueMicrotask(()=>{
                    render().finally(()=>{
                        renderScheduled = false;
                    });
                });
            };
            /**
       * Renders the component by:
       * 1. Executing lifecycle hooks
       * 2. Processing the template
       * 3. Updating the DOM
       * 4. Processing events, injecting styles, and mounting child components.
       */ const render = async ()=>{
                const templateResult = typeof template === "function" ? await template(mergedContext) : template;
                const html = this.templateEngine.parse(templateResult, mergedContext);
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
                this.renderer.patchDOM(container, html);
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
       * When a Signal's value changes, a batched render is scheduled.
       * Multiple changes within the same frame are collapsed into one render.
       * Stores unsubscribe functions to clean up watchers when component unmounts.
       */ for (const val of Object.values(data)){
                if (val instanceof Signal) watchers.push(val.watch(scheduleRender));
            }
            await render();
            const instance = {
                container,
                data: mergedContext,
                /**
         * Unmounts the component, cleaning up watchers and listeners, child components, and clearing the container.
         *
         * @returns {void}
         */ unmount: async ()=>{
                    /** @type {UnmountHookContext} */ await mergedContext.onUnmount?.({
                        container,
                        context: mergedContext,
                        cleanup: {
                            watchers: watchers,
                            listeners: listeners,
                            children: childInstances
                        }
                    });
                    for (const fn of watchers)fn();
                    for (const fn of listeners)fn();
                    for (const child of childInstances)await child.unmount();
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
   */ _processEvents(container, context, listeners) {
        /** @type {NodeListOf<Element>} */ const elements = container.querySelectorAll("*");
        for (const el of elements){
            /** @type {NamedNodeMap} */ const attrs = el.attributes;
            for(let i = 0; i < attrs.length; i++){
                /** @type {Attr} */ const attr = attrs[i];
                if (!attr.name.startsWith("@")) continue;
                /** @type {keyof HTMLElementEventMap} */ const event = attr.name.slice(1);
                /** @type {string} */ const handlerName = attr.value;
                /** @type {(event: Event) => void} */ const handler = context[handlerName] || this.templateEngine.evaluate(handlerName, context);
                if (typeof handler === "function") {
                    el.addEventListener(event, handler);
                    el.removeAttribute(attr.name);
                    listeners.push(()=>el.removeEventListener(event, handler));
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
   */ _injectStyles(container, compId, styleDef, context) {
        /** @type {string} */ const newStyle = typeof styleDef === "function" ? this.templateEngine.parse(styleDef(context), context) : styleDef;
        /** @type {HTMLStyleElement|null} */ let styleEl = container.querySelector(`style[data-e-style="${compId}"]`);
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
   */ _extractProps(element) {
        if (!element.attributes) return {};
        const props = {};
        const attrs = element.attributes;
        for(let i = attrs.length - 1; i >= 0; i--){
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
   */ async _mountComponents(container, children, childInstances) {
        for (const [selector, component] of Object.entries(children)){
            if (!selector) continue;
            for (const el of container.querySelectorAll(selector)){
                if (!(el instanceof HTMLElement)) continue;
                /** @type {Record<string, string>} */ const props = this._extractProps(el);
                /** @type {MountResult} */ const instance = await this.mount(el, component, props);
                if (instance && !childInstances.includes(instance)) {
                    childInstances.push(instance);
                }
            }
        }
    }
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
   */ constructor(name, config = {}){
        if (!name || typeof name !== "string") {
            throw new Error("Eleva: name must be a non-empty string");
        }
        /** @public {string} The unique identifier name for this Eleva instance */ this.name = name;
        /** @public {Object<string, unknown>} Optional configuration object for the Eleva instance */ this.config = config;
        /** @public {Emitter} Instance of the event emitter for handling component events */ this.emitter = new Emitter();
        /** @public {typeof Signal} Static reference to the Signal class for creating reactive state */ this.signal = Signal;
        /** @public {typeof TemplateEngine} Static reference to the TemplateEngine class for template parsing */ this.templateEngine = TemplateEngine;
        /** @public {Renderer} Instance of the renderer for handling DOM updates and patching */ this.renderer = new Renderer();
        /** @private {Map<string, ComponentDefinition>} Registry of all component definitions by name */ this._components = new Map();
        /** @private {Map<string, ElevaPlugin>} Collection of installed plugin instances by name */ this._plugins = new Map();
        /** @private {number} Counter for generating unique component IDs */ this._componentCounter = 0;
    }
}

module.exports = Eleva;
//# sourceMappingURL=eleva.cjs.js.map

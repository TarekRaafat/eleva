/**
 * @module eleva/emitter
 * @fileoverview Event emitter for publish-subscribe communication between components.
 */
/**
 * Callback function invoked when an event is emitted.
 * @callback EventHandler
 * @param {...any} args
 *        Event arguments passed to the handler.
 * @returns {void | Promise<void>}
 */
/**
 * Function to unsubscribe an event handler.
 * @callback EventUnsubscribe
 * @returns {void}
 */
/**
 * Event name string identifier.
 * @typedef {string} EventName
 * @description
 * Recommended convention: 'namespace:action' (e.g., 'user:login').
 * This pattern prevents naming collisions and improves code readability.
 *
 * Common namespaces:
 * - `user:` - User-related events (login, logout, update)
 * - `component:` - Component lifecycle events (mount, unmount)
 * - `router:` - Navigation events (beforeEach, afterEach)
 * - `store:` - State management events (change, error)
 * @example
 * 'user:login'      // User logged in
 * 'cart:update'     // Shopping cart updated
 * 'component:mount' // Component was mounted
 */
/**
 * Interface describing the public API of an Emitter.
 * @typedef {Object} EmitterLike
 * @property {(event: string, handler: EventHandler) => EventUnsubscribe} on
 *           Subscribe to an event.
 * @property {(event: string, handler?: EventHandler) => void} off
 *           Unsubscribe from an event.
 * @property {(event: string, ...args: unknown[]) => void} emit
 *           Emit an event with arguments.
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
 * // Note: These lifecycle names are conventions; Eleva core does not emit them by default.
 * // State events
 * emitter.on('state:change', (newState, oldState) => {});
 * // Navigation events
 * emitter.on('router:navigate', (to, from) => {});
 *
 * @implements {EmitterLike}
 */
declare class Emitter implements EmitterLike {
    /**
     * Map of event names to their registered handler functions
     * @private
     * @type {Map<string, Set<EventHandler>>}
     */
    private _events;
    /**
     * Registers an event handler for the specified event name.
     * The handler will be called with the event data when the event is emitted.
     * Event names should follow the format 'namespace:action' for consistency.
     *
     * @public
     * @param {string} event - The name of the event to listen for (e.g., 'user:login').
     * @param {EventHandler} handler - The callback function to invoke when the event occurs.
     *        Note: Handlers returning Promises are NOT awaited. For async operations,
     *        handle promise resolution within your handler.
     * @returns {EventUnsubscribe} A function to unsubscribe the event handler.
     *
     * @example
     * // Basic subscription
     * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
     *
     * @example
     * // Handler with typed parameter
     * emitter.on('user:update', (user) => {
     *   console.log(`User ${user.id}: ${user.name}`);
     * });
     *
     * @example
     * // Cleanup
     * unsubscribe(); // Stops listening for the event
     */
    public on(event: string, handler: EventHandler): EventUnsubscribe;
    /**
     * Removes an event handler for the specified event name.
     * Automatically cleans up empty event sets to prevent memory leaks.
     *
     * Behavior varies based on whether handler is provided:
     * - With handler: Removes only that specific handler function (O(1) Set deletion)
     * - Without handler: Removes ALL handlers for the event (O(1) Map deletion)
     *
     * @public
     * @param {string} event - The name of the event to remove handlers from.
     * @param {EventHandler} [handler] - The specific handler to remove. If omitted, all handlers are removed.
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
    public off(event: string, handler?: EventHandler): void;
    /**
     * Emits an event with the specified data to all registered handlers.
     * Handlers are called synchronously in the order they were registered.
     * If no handlers are registered for the event, the emission is silently ignored.
     * Handlers that return promises are not awaited.
     *
     * Error propagation behavior:
     * - If a handler throws synchronously, the error propagates immediately
     * - Remaining handlers in the iteration are NOT called after an error
     * - For error-resilient emission, wrap your emit call in try/catch
     * - Async handler rejections are not caught (fire-and-forget)
     *
     * @public
     * @param {string} event - The name of the event to emit.
     * @param {...any} args - Optional arguments to pass to the event handlers.
     * @returns {void}
     * @throws {Error} If a handler throws synchronously, the error propagates to the caller.
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
    public emit(event: string, ...args: any[]): void;
}
/**
 * Callback function invoked when an event is emitted.
 */
type EventHandler = (...args: any[]) => void | Promise<void>;
/**
 * Function to unsubscribe an event handler.
 */
type EventUnsubscribe = () => void;
/**
 * Interface describing the public API of an Emitter.
 */
type EmitterLike = {
    /**
     *           Subscribe to an event.
     */
    on: (event: string, handler: EventHandler) => EventUnsubscribe;
    /**
     *           Unsubscribe from an event.
     */
    off: (event: string, handler?: EventHandler) => void;
    /**
     *           Emit an event with arguments.
     */
    emit: (event: string, ...args: unknown[]) => void;
};

/**
 * @module eleva/signal
 * @fileoverview Reactive Signal primitive for fine-grained state management and change notification.
 */
/**
 * Callback function invoked when a signal's value changes.
 * @template T The type of value held by the signal.
 * @callback SignalWatcher
 * @param {T} value
 *        The new value of the signal.
 * @returns {void}
 */
/**
 * Function to unsubscribe a watcher from a signal.
 * @callback SignalUnsubscribe
 * @returns {boolean}
 *          True if the watcher was successfully removed, false if already removed.
 *          Safe to call multiple times (idempotent).
 */
/**
 * Interface describing the public API of a Signal.
 * @template T The type of value held by the signal.
 * @typedef {Object} SignalLike
 * @property {T} value
 *           The current value of the signal.
 * @property {function(SignalWatcher<T>): SignalUnsubscribe} watch
 *           Subscribe to value changes.
 */
/**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers synchronously when their value changes, enabling efficient
 * DOM updates through targeted patching rather than full re-renders.
 * Synchronous notification preserves stack traces and allows immediate value inspection.
 * Render batching is handled at the component level, not the signal level.
 * The class is generic, allowing type-safe handling of any value type T.
 *
 * @template T The type of value held by the signal.
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
 * const position = new Signal({ x: 0, y: 0 });
 * position.value = { x: 10, y: 20 }; // Triggers watchers
 *
 * @implements {SignalLike<T>}
 */
declare class Signal<T> implements SignalLike<T> {
    /**
     * Creates a new Signal instance with the specified initial value.
     *
     * @public
     * @constructor
     * @param {T} value - The initial value of the signal.
     *
     * @example
     * // Primitive types
     * const count = new Signal(0);        // Signal<number>
     * const name = new Signal("John");    // Signal<string>
     * const active = new Signal(true);    // Signal<boolean>
     *
     * @example
     * // Complex types
     * const items = new Signal([]);          // Signal holding an array
     * const user = new Signal(null);         // Signal holding nullable object
     */
    constructor(value: T);
    /**
     * Internal storage for the signal's current value.
     * @private
     * @type {T}
     */
    private _value;
    /**
     * Collection of callback functions to be notified when value changes.
     * @private
     * @type {Set<SignalWatcher<T>>}
     */
    private _watchers;
    /**
     * Sets a new value for the signal and synchronously notifies all registered watchers if the value has changed.
     * Synchronous notification preserves stack traces and ensures immediate value consistency.
     *
     * Uses strict equality (===) for comparison. For objects/arrays, watchers are only notified
     * if the reference changes, not if properties are mutated. To trigger updates with objects,
     * assign a new reference: `signal.value = { ...signal.value, updated: true }`.
     *
     * @public
     * @param {T} newVal - The new value to set.
     * @returns {void}
     */
    public set value(newVal: T);
    /**
     * Gets the current value of the signal.
     *
     * @public
     * @returns {T} The current value.
     */
    public get value(): T;
    /**
     * Registers a watcher function that will be called whenever the signal's value changes.
     * The watcher will receive the new value as its argument.
     *
     * @public
     * @param {SignalWatcher<T>} fn - The callback function to invoke on value change.
     * @returns {SignalUnsubscribe} A function to unsubscribe the watcher.
     *          Returns true if watcher was removed, false if it wasn't registered.
     *          Safe to call multiple times (idempotent after first call).
     *
     * @example
     * // Basic watching
     * const unsubscribe = signal.watch((value) => console.log(value));
     *
     * @example
     * // Stop watching
     * unsubscribe(); // Returns true if watcher was removed
     * unsubscribe(); // Returns false (already removed, safe to call again)
     *
     * @example
     * // Multiple watchers
     * const unsub1 = signal.watch((v) => console.log("Watcher 1:", v));
     * const unsub2 = signal.watch((v) => console.log("Watcher 2:", v));
     * signal.value = "test"; // Both watchers are called
     */
    public watch(fn: SignalWatcher<T>): SignalUnsubscribe;
    /**
     * Synchronously notifies all registered watchers of the value change.
     * This preserves stack traces for debugging and ensures immediate
     * value consistency. Render batching is handled at the component level.
     *
     * @note If a watcher throws, subsequent watchers are NOT called.
     * The error propagates to the caller (the setter).
     *
     * @private
     * @returns {void}
     */
    private _notify;
}
/**
 * Callback function invoked when a signal's value changes.
 */
type SignalWatcher<T> = (value: T) => void;
/**
 * Function to unsubscribe a watcher from a signal.
 */
type SignalUnsubscribe = () => boolean;
/**
 * Interface describing the public API of a Signal.
 */
type SignalLike<T> = {
    /**
     *           The current value of the signal.
     */
    value: T;
    /**
     *           Subscribe to value changes.
     */
    watch: (arg0: SignalWatcher<T>) => SignalUnsubscribe;
};

/**
 * @module eleva/template-engine
 * @fileoverview Expression evaluator for directive attributes and property bindings.
 */
/**
 * Data context object for expression evaluation.
 * @typedef {Record<string, unknown>} ContextData
 * @description Contains variables and functions available during template evaluation.
 */
/**
 * JavaScript expression string to be evaluated.
 * @typedef {string} Expression
 * @description A JavaScript expression evaluated against a ContextData object.
 */
/**
 * Result of evaluating an expression.
 * @typedef {unknown} EvaluationResult
 * @description Can be string, number, boolean, object, function, or any JavaScript value.
 */
/**
 * Compiled expression function cached for performance.
 * @typedef {(data: ContextData) => EvaluationResult} CompiledExpressionFunction
 * @description Pre-compiled function that evaluates an expression against context data.
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
declare class TemplateEngine {
    /**
     * Cache for compiled expression functions.
     * Stores compiled Function objects keyed by expression string for O(1) lookup.
     * The cache persists for the application lifetime and is never cleared.
     * This improves performance for repeated evaluations of the same expression.
     *
     * Memory consideration: For applications with highly dynamic expressions
     * (e.g., user-generated), memory usage grows unbounded. This is typically
     * not an issue for static templates where expressions are finite.
     *
     * @static
     * @private
     * @type {Map<string, CompiledExpressionFunction>}
     */
    private static _cache;
    /**
     * Evaluates an expression in the context of the provided data object.
     * Used for resolving `@event` handlers and `:prop` bindings.
     * Non-string expressions are returned as-is.
     *
     * @security CRITICAL SECURITY WARNING
     * This method is NOT sandboxed. It uses `new Function()` and `with` statement,
     * allowing full access to the global scope. Potential attack vectors include:
     * - Code injection via malicious expressions
     * - XSS attacks if user input is used as expressions
     * - Access to sensitive globals (window, document, fetch, etc.)
     *
     * ONLY use with developer-defined template strings.
     * NEVER use with user-provided input or untrusted data.
     *
     * Mitigation strategies:
     * - Always sanitize any user-generated content before rendering in templates
     * - Use Content Security Policy (CSP) headers to restrict script execution
     * - Keep expressions simple (property access, method calls) - avoid complex logic
     *
     * @public
     * @static
     * @param {Expression | unknown} expression - The expression to evaluate.
     * @param {ContextData} data - The data context for evaluation.
     * @returns {EvaluationResult} The result of the evaluation, or empty string if evaluation fails.
     * @note Evaluation failures return an empty string without throwing.
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
    public static evaluate(expression: Expression | unknown, data: ContextData): EvaluationResult;
}
/**
 * Data context object for expression evaluation.
 */
type ContextData = Record<string, unknown>;
/**
 * JavaScript expression string to be evaluated.
 */
type Expression = string;
/**
 * Result of evaluating an expression.
 */
type EvaluationResult = unknown;

/**
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
 */
declare class Renderer implements RendererLike {
    /**
     * Temporary container for parsing new HTML content.
     * Reused across patch operations to minimize memory allocation.
     * @private
     * @type {HTMLDivElement}
     */
    private _tempContainer;
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
     *
     * @see _diff - Low-level diffing algorithm.
     * @see _patchNode - Individual node patching.
     */
    public patchDOM(container: HTMLElement, newHtml: string): void;
    /**
     * Performs a diff between two DOM nodes and patches the old node to match the new node.
     * Uses a two-pointer algorithm with key-based reconciliation for optimal performance.
     * This method modifies oldParent in-place - it is not a pure function.
     *
     * Algorithm details:
     * 1. Early exit if both nodes have no children (O(1) leaf node optimization)
     * 2. Convert NodeLists to arrays for indexed access
     * 3. Initialize two-pointer indices (oldStart/oldEnd, newStart/newEnd)
     * 4. While pointers haven't crossed:
     *    a. Skip null entries (from previous moves)
     *    b. If nodes match (same key+tag or same type+name): patch and advance
     *    c. On mismatch: lazily build key→node map for O(1) lookup
     *    d. If keyed match found: move existing node (preserves DOM identity)
     *    e. Otherwise: clone and insert new node
     * 5. After loop: append remaining new nodes or remove remaining old nodes
     *
     * Complexity: O(n) for most cases, O(n²) worst case with no keys.
     * Non-keyed elements are matched by position and tag name.
     *
     * @private
     * @param {Element} oldParent - The original DOM element to update (modified in-place).
     * @param {Element} newParent - The new DOM element with desired state.
     * @returns {void}
     */
    private _diff;
    /**
     * Patches a single node, updating its content and attributes to match the new node.
     * Handles text nodes (nodeType 3 / Node.TEXT_NODE) by updating nodeValue,
     * and element nodes (nodeType 1 / Node.ELEMENT_NODE) by updating attributes
     * and recursively diffing children.
     *
     * Skips nodes that are managed by Eleva component instances to prevent interference
     * with nested component state.
     *
     * @private
     * @param {Node} oldNode - The original DOM node to update.
     * @param {Node} newNode - The new DOM node with desired state.
     * @returns {void}
     */
    private _patchNode;
    /**
     * Removes a node from its parent, with special handling for Eleva-managed elements.
     * Style elements with the `data-e-style` attribute are preserved to maintain
     * component styles across re-renders. Without this protection, component styles
     * would be removed during DOM diffing and lost until the next full re-render.
     *
     * @note Style tags persist for the component's entire lifecycle. If the template
     * conditionally removes elements that the CSS rules target (e.g., `.foo` elements),
     * the style rules remain but simply have no matching elements. This is expected
     * behavior - styles are cleaned up when the component unmounts, not when individual
     * elements are removed.
     *
     * @private
     * @param {HTMLElement} parent - The parent element containing the node.
     * @param {Node} node - The node to remove.
     * @returns {void}
     * @see _injectStyles - Where data-e-style elements are created.
     */
    private _removeNode;
    /**
     * Updates the attributes of an element to match a new element's attributes.
     * Adds new attributes, updates changed values, and removes attributes no longer present.
     * Also syncs DOM properties that can diverge from attributes after user interaction.
     *
     * Processing order:
     * 1. Iterate new attributes, skip @ prefixed (event) attributes
     * 2. Update attribute if value changed
     * 3. Sync corresponding DOM property if writable (handles boolean conversion)
     * 4. Iterate old attributes in reverse, remove if not in new element
     * 5. Sync SYNC_PROPS (value, checked, selected) from new to old element
     *
     * @private
     * @param {Element} oldEl - The original element to update.
     * @param {Element} newEl - The new element with target attributes.
     * @returns {void}
     */
    private _updateAttributes;
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
     */
    private _isSameNode;
    /**
     * Extracts the key attribute from a node if it exists.
     * Only element nodes (nodeType === 1) can have key attributes.
     * Uses optional chaining for null-safe access.
     *
     * @private
     * @param {Node | null | undefined} node - The node to extract the key from.
     * @returns {string | null} The key attribute value, or null if not an element or no key.
     */
    private _getNodeKey;
    /**
     * Creates a key map for efficient O(1) lookup of keyed elements during diffing.
     * The map is built lazily only when needed (when a mismatch occurs during diffing).
     *
     * @private
     * @param {ChildNode[]} children - The array of child nodes to map.
     * @param {number} start - The start index (inclusive) for mapping.
     * @param {number} end - The end index (inclusive) for mapping.
     * @returns {KeyMap} A Map of key strings to their corresponding DOM nodes.
     */
    private _createKeyMap;
}
/**
 * Interface describing the public API of a Renderer.
 */
type RendererLike = {
    /**
     *           Patches the DOM with new HTML content.
     */
    patchDOM: (arg0: HTMLElement, arg1: string) => void;
};

/**
 * Component definition object.
 * @typedef {Object} ComponentDefinition
 * @property {SetupFunction} [setup]
 *           Optional setup function that initializes the component's state and returns reactive data.
 * @property {TemplateFunction | string} template
 *           Required function or string that defines the component's HTML structure.
 * @property {StyleFunction | string} [style]
 *           Optional function or string that provides CSS styles for the component.
 *           Styles are preserved across DOM diffs via data-e-style markers.
 * @property {ChildrenMap} [children]
 *           Optional object defining nested child components.
 */
/**
 * Setup function that initializes component state.
 * @callback SetupFunction
 * @param {ComponentContext} ctx
 *        The component context with props, emitter, and signal factory.
 * @returns {SetupResult | Promise<SetupResult>}
 *          Reactive data and lifecycle hooks.
 */
/**
 * Data returned from setup function, may include lifecycle hooks.
 * @typedef {Record<string, unknown> & LifecycleHooks} SetupResult
 */
/**
 * Template function that returns HTML markup.
 * @callback TemplateFunction
 * @param {ComponentContext & SetupResult} ctx
 *        The merged component context and setup data.
 * @returns {string | Promise<string>}
 *          HTML template string.
 */
/**
 * Style function that returns CSS styles.
 * @callback StyleFunction
 * @param {ComponentContext & SetupResult} ctx
 *        The merged component context and setup data.
 * @returns {string}
 *          CSS styles string.
 */
/**
 * Map of CSS selectors to component definitions or registered component names.
 * @typedef {Record<string, ComponentDefinition | string>} ChildrenMap
 */
/**
 * Context passed to component setup function.
 * @typedef {Object} ComponentContext
 * @property {ComponentProps} props
 *           Component properties passed during mounting.
 * @property {Emitter} emitter
 *           Event emitter instance for component event handling.
 * @property {SignalFactory} signal
 *           Factory function to create reactive Signal instances.
 * @description
 * Plugins may extend this context with additional properties (e.g., `ctx.router`, `ctx.store`).
 * @see RouterContext - Router plugin injected context.
 * @see StoreApi - Store plugin injected context.
 */
/**
 * Properties passed to a component during mounting.
 * @typedef {Record<string, unknown>} ComponentProps
 */
/**
 * Factory function to create reactive Signal instances.
 * @typedef {<T>(initialValue: T) => Signal<T>} SignalFactory
 */
/**
 * Lifecycle hooks that can be returned from setup function.
 * @typedef {Object} LifecycleHooks
 * @property {LifecycleHook} [onBeforeMount]
 *           Called before component mounting.
 * @property {LifecycleHook} [onMount]
 *           Called after component mounting.
 * @property {LifecycleHook} [onBeforeUpdate]
 *           Called before component update.
 * @property {LifecycleHook} [onUpdate]
 *           Called after component update.
 * @property {UnmountHook} [onUnmount]
 *           Called during component unmounting.
 */
/**
 * Lifecycle hook function.
 * @callback LifecycleHook
 * @param {LifecycleHookContext} ctx
 *        Context with container and component data.
 * @returns {void | Promise<void>}
 */
/**
 * Unmount hook function with cleanup resources.
 * @callback UnmountHook
 * @param {UnmountHookContext} ctx
 *        Context with cleanup resources.
 * @returns {void | Promise<void>}
 */
/**
 * Context passed to lifecycle hooks.
 * @typedef {Object} LifecycleHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted.
 * @property {ComponentContext & SetupResult} context
 *           The component's reactive state and context data.
 */
/**
 * Context passed to unmount hook with cleanup resources.
 * @typedef {Object} UnmountHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted.
 * @property {ComponentContext & SetupResult} context
 *           The component's reactive state and context data.
 * @property {CleanupResources} cleanup
 *           Object containing cleanup functions and instances.
 */
/**
 * Resources available for cleanup during unmount.
 * @typedef {Object} CleanupResources
 * @property {UnsubscribeFunction[]} watchers
 *           Signal watcher cleanup functions.
 * @property {UnsubscribeFunction[]} listeners
 *           Event listener cleanup functions.
 * @property {MountResult[]} children
 *           Child component instances.
 */
/**
 * Result of mounting a component.
 * @typedef {Object} MountResult
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted.
 * @property {ComponentContext & SetupResult} data
 *           The component's reactive state and context data.
 * @property {UnmountFunction} unmount
 *           Function to clean up and unmount the component.
 */
/**
 * Function to unmount a component and clean up resources.
 * @callback UnmountFunction
 * @returns {Promise<void>}
 */
/**
 * Function to unsubscribe from events or watchers.
 * @callback UnsubscribeFunction
 * @returns {void | boolean}
 */
/**
 * Plugin interface for extending Eleva.
 * @typedef {Object} ElevaPlugin
 * @property {string} name
 *           Unique identifier name for the plugin.
 * @property {string} [version]
 *           Optional version string for the plugin.
 * @property {PluginInstallFunction} install
 *           Function that installs the plugin.
 * @property {PluginUninstallFunction} [uninstall]
 *           Optional function to uninstall the plugin.
 */
/**
 * Plugin install function.
 * @callback PluginInstallFunction
 * @param {Eleva} eleva
 *        The Eleva instance.
 * @param {PluginOptions} [options]
 *        Plugin configuration options.
 * @returns {void | Eleva | unknown}
 */
/**
 * Plugin uninstall function.
 * @callback PluginUninstallFunction
 * @param {Eleva} eleva
 *        The Eleva instance.
 * @returns {void | Promise<void>}
 */
/**
 * Configuration options passed to a plugin during installation.
 * @typedef {Record<string, unknown>} PluginOptions
 */
/**
 * Handler function for DOM events (e.g., click, input, submit).
 * @typedef {(event: Event) => void} DOMEventHandler
 */
/**
 * Common DOM event names (prefixed with @ in templates).
 * @typedef {'click'|'submit'|'input'|'change'|'focus'|'blur'|'keydown'|'keyup'|'keypress'|'mouseenter'|'mouseleave'|'mouseover'|'mouseout'|'mousedown'|'mouseup'|'touchstart'|'touchend'|'touchmove'|'scroll'|'resize'|'load'|'error'|string} DOMEventName
 */
/**
 * @class 🧩 Eleva
 * @classdesc A modern, signal-based component runtime framework that provides lifecycle hooks,
 * component styles, and plugin support. Eleva manages component registration, plugin integration,
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
declare class Eleva {
    /**
     * Creates a new Eleva instance with the specified name.
     *
     * @public
     * @constructor
     * @param {string} name - The unique identifier name for this Eleva instance.
     * @throws {Error} If the name is not provided or is not a string.
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
    constructor(name: string);
    /** @public @readonly {string} The unique identifier name for this Eleva instance */
    public readonly name: string;
    /** @public @readonly {Emitter} Event emitter for handling component events */
    public readonly emitter: Emitter;
    /** @public @readonly {typeof Signal} Signal class for creating reactive state */
    public readonly signal: typeof Signal;
    /** @public @readonly {typeof TemplateEngine} TemplateEngine class for template parsing */
    public readonly templateEngine: typeof TemplateEngine;
    /** @public @readonly {Renderer} Renderer for handling DOM updates and patching */
    public readonly renderer: Renderer;
    /** @private {Map<string, ComponentDefinition>} Registry of all component definitions by name */
    private _components;
    /** @private {Map<string, ElevaPlugin>} Collection of installed plugin instances by name */
    private _plugins;
    /** @private {number} Counter for generating unique component IDs */
    private _componentCounter;
    /**
     * Integrates a plugin with the Eleva framework.
     * The plugin's install function will be called with the Eleva instance and provided options.
     * After installation, the plugin will be available for use by components.
     *
     * @note Plugins that wrap core methods (e.g., mount) must be uninstalled in reverse order
     * of installation (LIFO - Last In, First Out) to avoid conflicts.
     *
     * @public
     * @param {ElevaPlugin} plugin - The plugin object which must have an `install` function.
     * @param {PluginOptions} [options={}] - Optional configuration options for the plugin.
     * @returns {Eleva | unknown} The Eleva instance (for method chaining) or the result returned by the plugin.
     * @throws {Error} If plugin does not have an install function.
     * @see component - Register components after installing plugins.
     * @see mount - Mount components to the DOM.
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
    public use(plugin: ElevaPlugin, options?: PluginOptions): Eleva | unknown;
    /**
     * Registers a new component with the Eleva instance.
     * The component will be available for mounting using its registered name.
     *
     * @public
     * @param {string} name - The unique name of the component to register.
     * @param {ComponentDefinition} definition - The component definition including setup, template, style, and children.
     * @returns {Eleva} The Eleva instance (for method chaining).
     * @throws {Error} If name is not a non-empty string or definition has no template.
     * @see mount - Mount this component to the DOM.
     * @example
     * app.component("myButton", {
     *   template: (ctx) => `<button>${ctx.props.text}</button>`,
     *   style: `button { color: blue; }`
     * });
     */
    public component(name: string, definition: ComponentDefinition): Eleva;
    /**
     * Mounts a registered component to a DOM element.
     * This will initialize the component, set up its reactive state, and render it to the DOM.
     * If the container already has a mounted Eleva instance, it is returned as-is.
     * Unmount clears the container contents and removes the internal instance marker.
     *
     * @public
     * @async
     * @param {HTMLElement} container - The DOM element where the component will be mounted.
     * @param {string | ComponentDefinition} compName - The name of the registered component or a direct component definition.
     * @param {ComponentProps} [props={}] - Optional properties to pass to the component.
     * @returns {Promise<MountResult>}
     *          A Promise that resolves to an object containing:
     *          - container: The mounted component's container element
     *          - data: The component's reactive state and context
     *          - unmount: Function to clean up and unmount the component
     * @throws {Error} If container is not a DOM element or component is not registered.
     * @throws {Error} If setup function, template function, or style function throws.
     * @example
     * const instance = await app.mount(document.getElementById("app"), "myComponent", { text: "Click me" });
     * // Later...
     * await instance.unmount();
     */
    public mount(container: HTMLElement, compName: string | ComponentDefinition, props?: ComponentProps): Promise<MountResult>;
    /**
     * Processes DOM elements for event binding based on attributes starting with "@".
     * This method attaches event listeners directly to elements and ensures proper cleanup.
     * Bound `@event` attributes are removed after listeners are attached.
     *
     * Handler resolution order:
     * 1. Direct context property lookup (e.g., context["handleClick"])
     * 2. Template expression evaluation via TemplateEngine (e.g., "increment()")
     *
     * @private
     * @param {HTMLElement} container - The container element in which to search for event attributes.
     * @param {ComponentContext & SetupResult} context - The merged component context and setup data.
     * @param {UnsubscribeFunction[]} listeners - Array to collect cleanup functions for each event listener.
     * @returns {void}
     * @see TemplateEngine.evaluate - Expression evaluation. fallback.
     */
    private _processEvents;
    /**
     * Injects styles into the component's container.
     * Styles are placed in a `<style>` element with a `data-e-style` attribute for identification.
     *
     * @note Styles are not automatically scoped - use unique class names or CSS nesting for isolation.
     *
     * Optimization: Skips DOM update if style content hasn't changed.
     *
     * @private
     * @param {HTMLElement} container - The container element where styles should be injected.
     * @param {string} compId - The component ID used to identify the style element.
     * @param {StyleFunction | string} styleDef - The component's style definition (function or string).
     * @param {ComponentContext & SetupResult} context - The merged component context and setup data.
     * @returns {void}
     */
    private _injectStyles;
    /**
     * Extracts and evaluates props from an element's attributes that start with `:`.
     * Prop values are evaluated as expressions against the component context,
     * allowing direct passing of objects, arrays, and other complex types.
     * Processed attributes are removed from the element after extraction.
     *
     * @private
     * @param {HTMLElement} element - The DOM element to extract props from.
     * @param {ComponentContext & SetupResult} context - The merged component context and setup data.
     * @returns {ComponentProps} An object containing the evaluated props.
     * @see TemplateEngine.evaluate - Expression evaluation.
     * @example
     * // For an element with attributes:
     * // <div :name="user.name" :data="items">
     * // With context: { user: { name: "John" }, items: [1, 2, 3] }
     * // Returns: { name: "John", data: [1, 2, 3] }
     */
    private _extractProps;
    /**
     * Mounts all components within the parent component's container.
     * This method handles mounting of explicitly defined children components.
     *
     * The mounting process follows these steps:
     * 1. Finds matching DOM nodes within the container
     * 2. Mounts explicitly defined children components
     *
     * @private
     * @async
     * @param {HTMLElement} container - The container element to mount components in.
     * @param {ChildrenMap} children - Map of selectors to component definitions for explicit children.
     * @param {MountResult[]} childInstances - Array to store all mounted component instances.
     * @param {ComponentContext & SetupResult} context - The merged component context and setup data.
     * @returns {Promise<void>}
     *
     * @example
     * // Explicit children mounting:
     * const children = {
     *   'user-profile': UserProfileComponent,
     *   '#settings-panel': "settings-panel"
     * };
     */
    private _mountComponents;
}
/**
 * Component definition object.
 */
type ComponentDefinition = {
    /**
     * Optional setup function that initializes the component's state and returns reactive data.
     */
    setup?: SetupFunction | undefined;
    /**
     *           Required function or string that defines the component's HTML structure.
     */
    template: TemplateFunction | string;
    /**
     * Optional function or string that provides CSS styles for the component.
     * Styles are preserved across DOM diffs via data-e-style markers.
     */
    style?: string | StyleFunction | undefined;
    /**
     * Optional object defining nested child components.
     */
    children?: ChildrenMap | undefined;
};
/**
 * Setup function that initializes component state.
 */
type SetupFunction = (ctx: ComponentContext) => SetupResult | Promise<SetupResult>;
/**
 * Data returned from setup function, may include lifecycle hooks.
 */
type SetupResult = Record<string, unknown> & LifecycleHooks;
/**
 * Template function that returns HTML markup.
 */
type TemplateFunction = (ctx: ComponentContext & SetupResult) => string | Promise<string>;
/**
 * Style function that returns CSS styles.
 */
type StyleFunction = (ctx: ComponentContext & SetupResult) => string;
/**
 * Map of CSS selectors to component definitions or registered component names.
 */
type ChildrenMap = Record<string, ComponentDefinition | string>;
/**
 * Context passed to component setup function.
 */
type ComponentContext = {
    /**
     *           Component properties passed during mounting.
     */
    props: ComponentProps;
    /**
     *           Event emitter instance for component event handling.
     */
    emitter: Emitter;
    /**
     *           Factory function to create reactive Signal instances.
     */
    signal: SignalFactory;
};
/**
 * Properties passed to a component during mounting.
 */
type ComponentProps = Record<string, unknown>;
/**
 * Factory function to create reactive Signal instances.
 */
type SignalFactory = <T>(initialValue: T) => Signal<T>;
/**
 * Lifecycle hooks that can be returned from setup function.
 */
type LifecycleHooks = {
    /**
     * Called before component mounting.
     */
    onBeforeMount?: LifecycleHook | undefined;
    /**
     * Called after component mounting.
     */
    onMount?: LifecycleHook | undefined;
    /**
     * Called before component update.
     */
    onBeforeUpdate?: LifecycleHook | undefined;
    /**
     * Called after component update.
     */
    onUpdate?: LifecycleHook | undefined;
    /**
     * Called during component unmounting.
     */
    onUnmount?: UnmountHook | undefined;
};
/**
 * Lifecycle hook function.
 */
type LifecycleHook = (ctx: LifecycleHookContext) => void | Promise<void>;
/**
 * Unmount hook function with cleanup resources.
 */
type UnmountHook = (ctx: UnmountHookContext) => void | Promise<void>;
/**
 * Context passed to lifecycle hooks.
 */
type LifecycleHookContext = {
    /**
     *           The DOM element where the component is mounted.
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data.
     */
    context: ComponentContext & SetupResult;
};
/**
 * Context passed to unmount hook with cleanup resources.
 */
type UnmountHookContext = {
    /**
     *           The DOM element where the component is mounted.
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data.
     */
    context: ComponentContext & SetupResult;
    /**
     *           Object containing cleanup functions and instances.
     */
    cleanup: CleanupResources;
};
/**
 * Resources available for cleanup during unmount.
 */
type CleanupResources = {
    /**
     *           Signal watcher cleanup functions.
     */
    watchers: UnsubscribeFunction[];
    /**
     *           Event listener cleanup functions.
     */
    listeners: UnsubscribeFunction[];
    /**
     *           Child component instances.
     */
    children: MountResult[];
};
/**
 * Result of mounting a component.
 */
type MountResult = {
    /**
     *           The DOM element where the component is mounted.
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data.
     */
    data: ComponentContext & SetupResult;
    /**
     *           Function to clean up and unmount the component.
     */
    unmount: UnmountFunction;
};
/**
 * Function to unmount a component and clean up resources.
 */
type UnmountFunction = () => Promise<void>;
/**
 * Function to unsubscribe from events or watchers.
 */
type UnsubscribeFunction = () => void | boolean;
/**
 * Plugin interface for extending Eleva.
 */
type ElevaPlugin = {
    /**
     *           Unique identifier name for the plugin.
     */
    name: string;
    /**
     * Optional version string for the plugin.
     */
    version?: string | undefined;
    /**
     *           Function that installs the plugin.
     */
    install: PluginInstallFunction;
    /**
     * Optional function to uninstall the plugin.
     */
    uninstall?: PluginUninstallFunction | undefined;
};
/**
 * Plugin install function.
 */
type PluginInstallFunction = (eleva: Eleva, options?: PluginOptions | undefined) => void | Eleva | unknown;
/**
 * Plugin uninstall function.
 */
type PluginUninstallFunction = (eleva: Eleva) => void | Promise<void>;
/**
 * Configuration options passed to a plugin during installation.
 */
type PluginOptions = Record<string, unknown>;
/**
 * Handler function for DOM events (e.g., click, input, submit).
 */
type DOMEventHandler = (event: Event) => void;
/**
 * Common DOM event names (prefixed with @ in templates).
 */
type DOMEventName = "click" | "submit" | "input" | "change" | "focus" | "blur" | "keydown" | "keyup" | "keypress" | "mouseenter" | "mouseleave" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "touchstart" | "touchend" | "touchmove" | "scroll" | "resize" | "load" | "error" | string;

//# sourceMappingURL=index.d.ts.map

export { Eleva, Emitter, Renderer, Signal, TemplateEngine, Eleva as default };
export type { ChildrenMap, CleanupResources, ComponentContext, ComponentDefinition, ComponentProps, DOMEventHandler, DOMEventName, ElevaPlugin, LifecycleHook, LifecycleHookContext, LifecycleHooks, MountResult, PluginInstallFunction, PluginOptions, PluginUninstallFunction, SetupFunction, SetupResult, SignalFactory, StyleFunction, TemplateFunction, UnmountFunction, UnmountHook, UnmountHookContext, UnsubscribeFunction };
//# sourceMappingURL=eleva.d.ts.map

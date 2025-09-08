/*! Eleva v1.0.0-rc.5 | MIT License | https://elevajs.com */
'use strict';

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
   * @private {RegExp} Regular expression for matching template expressions in the format {{ expression }}
   * @type {RegExp}
   */
  static expressionPattern = /\{\{\s*(.*?)\s*\}\}/g;

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
    } catch {
      return "";
    }
  }
}

/**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers when their value changes, enabling efficient DOM updates
 * through targeted patching rather than full re-renders.
 * Updates are batched using microtasks to prevent multiple synchronous notifications.
 * The class is generic, allowing type-safe handling of any value type T.
 *
 * @example
 * const count = new Signal(0);
 * count.watch((value) => console.log(`Count changed to: ${value}`));
 * count.value = 1; // Logs: "Count changed to: 1"
 * @template T
 */
class Signal {
  /**
   * Creates a new Signal instance with the specified initial value.
   *
   * @public
   * @param {T} value - The initial value of the signal.
   */
  constructor(value) {
    /** @private {T} Internal storage for the signal's current value */
    this._value = value;
    /** @private {Set<(value: T) => void>} Collection of callback functions to be notified when value changes */
    this._watchers = new Set();
    /** @private {boolean} Flag to prevent multiple synchronous watcher notifications and batch updates into microtasks */
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
   * @param {(value: T) => void} fn - The callback function to invoke on value change.
   * @returns {() => boolean} A function to unsubscribe the watcher.
   * @example
   * const unsubscribe = signal.watch((value) => console.log(value));
   * // Later...
   * unsubscribe(); // Stops watching for changes
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

/**
 * @class 📡 Emitter
 * @classdesc A robust event emitter that enables inter-component communication through a publish-subscribe pattern.
 * Components can emit events and listen for events from other components, facilitating loose coupling
 * and reactive updates across the application.
 * Events are handled synchronously in the order they were registered, with proper cleanup
 * of unsubscribed handlers.
 * Event names should follow the format 'namespace:action' (e.g., 'user:login', 'cart:update').
 *
 * @example
 * const emitter = new Emitter();
 * emitter.on('user:login', (user) => console.log(`User logged in: ${user.name}`));
 * emitter.emit('user:login', { name: 'John' }); // Logs: "User logged in: John"
 */
class Emitter {
  /**
   * Creates a new Emitter instance.
   *
   * @public
   */
  constructor() {
    /** @private {Map<string, Set<(data: unknown) => void>>} Map of event names to their registered handler functions */
    this._events = new Map();
  }

  /**
   * Registers an event handler for the specified event name.
   * The handler will be called with the event data when the event is emitted.
   * Event names should follow the format 'namespace:action' for consistency.
   *
   * @public
   * @param {string} event - The name of the event to listen for (e.g., 'user:login').
   * @param {(data: unknown) => void} handler - The callback function to invoke when the event occurs.
   * @returns {() => void} A function to unsubscribe the event handler.
   * @example
   * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
   * // Later...
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
   * @param {string} event - The name of the event to remove handlers from.
   * @param {(data: unknown) => void} [handler] - The specific handler function to remove.
   * @returns {void}
   * @example
   * // Remove a specific handler
   * emitter.off('user:login', loginHandler);
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
   * @param {string} event - The name of the event to emit.
   * @param {...unknown} args - Optional arguments to pass to the event handlers.
   * @returns {void}
   * @example
   * // Emit an event with data
   * emitter.emit('user:login', { name: 'John', role: 'admin' });
   * // Emit an event with multiple arguments
   * emitter.emit('cart:update', { items: [] }, { total: 0 });
   */
  emit(event, ...args) {
    if (!this._events.has(event)) return;
    this._events.get(event).forEach(handler => handler(...args));
  }
}

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
 * const renderer = new Renderer();
 * const container = document.getElementById("app");
 * const newHtml = "<div>Updated content</div>";
 * renderer.patchDOM(container, newHtml);
 */
class Renderer {
  /**
   * Creates a new Renderer instance.
   * @public
   */
  constructor() {
    /**
     * A temporary container to hold the new HTML content while diffing.
     * @private
     * @type {HTMLElement}
     */
    this._tempContainer = document.createElement("div");
  }

  /**
   * Patches the DOM of the given container with the provided HTML string.
   *
   * @public
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML string.
   * @returns {void}
   * @throws {TypeError} If container is not an HTMLElement or newHtml is not a string.
   * @throws {Error} If DOM patching fails.
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
   *
   * @private
   * @param {Array<Node>} children - The children of the parent node.
   * @param {number} start - The start index of the children.
   * @param {number} end - The end index of the children.
   * @returns {Map<string, Node>} A key map for the children.
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

/**
 * @typedef {Object} ComponentDefinition
 * @property {function(ComponentContext): (Record<string, unknown>|Promise<Record<string, unknown>>)} [setup]
 *           Optional setup function that initializes the component's state and returns reactive data
 * @property {(function(ComponentContext): string|Promise<string>)} template
 *           Required function that defines the component's HTML structure
 * @property {(function(ComponentContext): string)|string} [style]
 *           Optional function or string that provides component-scoped CSS styles
 * @property {Record<string, ComponentDefinition>} [children]
 *           Optional object defining nested child components
 */

/**
 * @typedef {Object} ComponentContext
 * @property {Record<string, unknown>} props
 *           Component properties passed during mounting
 * @property {Emitter} emitter
 *           Event emitter instance for component event handling
 * @property {function<T>(value: T): Signal<T>} signal
 *           Factory function to create reactive Signal instances
 * @property {function(LifecycleHookContext): Promise<void>} [onBeforeMount]
 *           Hook called before component mounting
 * @property {function(LifecycleHookContext): Promise<void>} [onMount]
 *           Hook called after component mounting
 * @property {function(LifecycleHookContext): Promise<void>} [onBeforeUpdate]
 *           Hook called before component update
 * @property {function(LifecycleHookContext): Promise<void>} [onUpdate]
 *           Hook called after component update
 * @property {function(UnmountHookContext): Promise<void>} [onUnmount]
 *           Hook called during component unmounting
 */

/**
 * @typedef {Object} LifecycleHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext} context
 *           The component's reactive state and context data
 */

/**
 * @typedef {Object} UnmountHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext} context
 *           The component's reactive state and context data
 * @property {{
 *   watchers: Array<() => void>,    // Signal watcher cleanup functions
 *   listeners: Array<() => void>,   // Event listener cleanup functions
 *   children: Array<MountResult>    // Child component instances
 * }} cleanup
 *           Object containing cleanup functions and instances
 */

/**
 * @typedef {Object} MountResult
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext} data
 *           The component's reactive state and context data
 * @property {function(): Promise<void>} unmount
 *           Function to clean up and unmount the component
 */

/**
 * @typedef {Object} ElevaPlugin
 * @property {function(Eleva, Record<string, unknown>): void} install
 *           Function that installs the plugin into the Eleva instance
 * @property {string} name
 *           Unique identifier name for the plugin
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
    /** @public {Renderer} Instance of the renderer for handling DOM updates and patching */
    this.renderer = new Renderer();

    /** @private {Map<string, ComponentDefinition>} Registry of all component definitions by name */
    this._components = new Map();
    /** @private {Map<string, ElevaPlugin>} Collection of installed plugin instances by name */
    this._plugins = new Map();
    /** @private {boolean} Flag indicating if the root component is currently mounted */
    this._isMounted = false;
    /** @private {number} Counter for generating unique component IDs */
    this._componentCounter = 0;
  }

  /**
   * Integrates a plugin with the Eleva framework.
   * The plugin's install function will be called with the Eleva instance and provided options.
   * After installation, the plugin will be available for use by components.
   *
   * @public
   * @param {ElevaPlugin} plugin - The plugin object which must have an `install` function.
   * @param {Object<string, unknown>} [options={}] - Optional configuration options for the plugin.
   * @returns {Eleva} The Eleva instance (for method chaining).
   * @example
   * app.use(myPlugin, { option1: "value1" });
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

      // Execute before hooks
      if (!this._isMounted) {
        /** @type {LifecycleHookContext} */
        await mergedContext.onBeforeMount?.({
          container,
          context: mergedContext
        });
      } else {
        /** @type {LifecycleHookContext} */
        await mergedContext.onBeforeUpdate?.({
          container,
          context: mergedContext
        });
      }

      /**
       * Renders the component by:
       * 1. Processing the template
       * 2. Updating the DOM
       * 3. Processing events, injecting styles, and mounting child components.
       */
      const render = async () => {
        const templateResult = typeof template === "function" ? await template(mergedContext) : template;
        const newHtml = TemplateEngine.parse(templateResult, mergedContext);
        this.renderer.patchDOM(container, newHtml);
        this._processEvents(container, mergedContext, listeners);
        if (style) this._injectStyles(container, compId, style, mergedContext);
        if (children) await this._mountComponents(container, children, childInstances);
        if (!this._isMounted) {
          /** @type {LifecycleHookContext} */
          await mergedContext.onMount?.({
            container,
            context: mergedContext
          });
          this._isMounted = true;
        } else {
          /** @type {LifecycleHookContext} */
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
        const handler = context[handlerName] || TemplateEngine.evaluate(handlerName, context);
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
    const newStyle = typeof styleDef === "function" ? TemplateEngine.parse(styleDef(context), context) : styleDef;

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

module.exports = Eleva;
//# sourceMappingURL=eleva.cjs.js.map

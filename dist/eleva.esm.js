/*! Eleva v1.2.17-beta | MIT License | https://elevajs.com */
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
   */
  static expressionPattern = /\{\{\s*(.*?)\s*\}\}/g;

  /**
   * Parses a template string, replacing expressions with their evaluated values.
   * Expressions are evaluated in the provided data context.
   *
   * @public
   * @static
   * @param {string} template - The template string to parse.
   * @param {Object} data - The data context for evaluating expressions.
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
   *
   * @public
   * @static
   * @param {string} expression - The expression to evaluate.
   * @param {Object} data - The data context for evaluation.
   * @returns {*} The result of the evaluation, or an empty string if evaluation fails.
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
   * @param {*} value - The initial value of the signal.
   */
  constructor(value) {
    /** @private {T} Internal storage for the signal's current value, where T is the type of the initial value */
    this._value = value;
    /** @private {Set<function(T): void>} Collection of callback functions to be notified when value changes, where T is the value type */
    this._watchers = new Set();
    /** @private {boolean} Flag to prevent multiple synchronous watcher notifications and batch updates into microtasks */
    this._pending = false;
  }

  /**
   * Gets the current value of the signal.
   *
   * @public
   * @returns {T} The current value, where T is the type of the initial value.
   */
  get value() {
    return this._value;
  }

  /**
   * Sets a new value for the signal and notifies all registered watchers if the value has changed.
   * The notification is batched using microtasks to prevent multiple synchronous updates.
   *
   * @public
   * @param {T} newVal - The new value to set, where T is the type of the initial value.
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
   * @param {function(T): void} fn - The callback function to invoke on value change, where T is the value type.
   * @returns {function(): boolean} A function to unsubscribe the watcher.
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
    /** @private {Map<string, Set<function(any): void>>} Map of event names to their registered handler functions */
    this._events = new Map();
  }

  /**
   * Registers an event handler for the specified event name.
   * The handler will be called with the event data when the event is emitted.
   *
   * @public
   * @param {string} event - The name of the event to listen for.
   * @param {function(any): void} handler - The callback function to invoke when the event occurs.
   * @returns {function(): void} A function to unsubscribe the event handler.
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
   *
   * @public
   * @param {string} event - The name of the event.
   * @param {function(any): void} [handler] - The specific handler function to remove.
   * @returns {void}
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
   *
   * @public
   * @param {string} event - The name of the event to emit.
   * @param {...any} args - Optional arguments to pass to the event handlers.
   * @returns {void}
   */
  emit(event, ...args) {
    if (!this._events.has(event)) return;
    this._events.get(event).forEach(handler => handler(...args));
  }
}

/**
 * @class 🎨 Renderer
 * @classdesc A DOM renderer that handles efficient DOM updates through patching and diffing.
 * Provides methods for updating the DOM by comparing new and old structures and applying
 * only the necessary changes, minimizing layout thrashing and improving performance.
 *
 * @example
 * const renderer = new Renderer();
 * const container = document.getElementById("app");
 * const newHtml = "<div>Updated content</div>";
 * renderer.patchDOM(container, newHtml);
 */
class Renderer {
  /**
   * Creates a new Renderer instance with a reusable temporary container for parsing HTML.
   * @public
   */
  constructor() {
    /** @private {HTMLElement} Reusable temporary container for parsing new HTML */
    this._tempContainer = document.createElement("div");
  }

  /**
   * Patches the DOM of a container element with new HTML content.
   * Efficiently updates the DOM by parsing new HTML into a reusable container
   * and applying only the necessary changes.
   *
   * @public
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML content to apply.
   * @returns {void}
   * @throws {Error} If container is not an HTMLElement, newHtml is not a string, or patching fails.
   */
  patchDOM(container, newHtml) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("Container must be an HTMLElement");
    }
    if (typeof newHtml !== "string") {
      throw new Error("newHtml must be a string");
    }
    try {
      // Directly set new HTML, replacing any existing content
      this._tempContainer.innerHTML = newHtml;
      this._diff(container, this._tempContainer);
    } catch {
      throw new Error("Failed to patch DOM");
    }
  }

  /**
   * Diffs two DOM trees (old and new) and applies updates to the old DOM.
   * This method recursively compares nodes and their attributes, applying only
   * the necessary changes to minimize DOM operations.
   *
   * @private
   * @param {HTMLElement} oldParent - The original DOM element.
   * @param {HTMLElement} newParent - The new DOM element.
   * @returns {void}
   */
  _diff(oldParent, newParent) {
    if (oldParent.isEqualNode(newParent)) return;
    const oldChildren = oldParent.childNodes;
    const newChildren = newParent.childNodes;
    const maxLength = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLength; i++) {
      const oldNode = oldChildren[i];
      const newNode = newChildren[i];
      if (oldNode?._eleva_instance) {
        continue;
      }
      if (!oldNode && newNode) {
        oldParent.appendChild(newNode.cloneNode(true));
        continue;
      }
      if (oldNode && !newNode) {
        if (oldNode.nodeName === "STYLE" && oldNode.hasAttribute("data-e-style")) {
          continue;
        }
        oldParent.removeChild(oldNode);
        continue;
      }
      const isSameType = oldNode.nodeType === newNode.nodeType && oldNode.nodeName === newNode.nodeName;
      if (!isSameType) {
        oldParent.replaceChild(newNode.cloneNode(true), oldNode);
        continue;
      }
      if (oldNode.nodeType === Node.ELEMENT_NODE) {
        const oldKey = oldNode.getAttribute("key");
        const newKey = newNode.getAttribute("key");
        if (oldKey !== newKey && (oldKey || newKey)) {
          oldParent.replaceChild(newNode.cloneNode(true), oldNode);
          continue;
        }
        this._updateAttributes(oldNode, newNode);
        this._diff(oldNode, newNode);
      } else if (oldNode.nodeType === Node.TEXT_NODE && oldNode.nodeValue !== newNode.nodeValue) {
        oldNode.nodeValue = newNode.nodeValue;
      }
    }
  }

  /**
   * Updates the attributes of an element to match those of a new element.
   * Handles special cases for ARIA attributes, data attributes, and boolean properties.
   *
   * @private
   * @param {HTMLElement} oldEl - The element to update.
   * @param {HTMLElement} newEl - The element providing the updated attributes.
   * @returns {void}
   */
  _updateAttributes(oldEl, newEl) {
    const oldAttrs = oldEl.attributes;
    const newAttrs = newEl.attributes;

    // Update/add new attributes
    for (const {
      name,
      value
    } of newAttrs) {
      if (name.startsWith("@")) continue;
      if (oldEl.getAttribute(name) === value) continue;
      oldEl.setAttribute(name, value);
      if (name.startsWith("aria-")) {
        const prop = "aria" + name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        oldEl[prop] = value;
      } else if (name.startsWith("data-")) {
        oldEl.dataset[name.slice(5)] = value;
      } else {
        const prop = name.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        if (prop in oldEl) {
          const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(oldEl), prop);
          const isBoolean = typeof oldEl[prop] === "boolean" || descriptor?.get && typeof descriptor.get.call(oldEl) === "boolean";
          if (isBoolean) {
            oldEl[prop] = value !== "false" && (value === "" || value === prop || value === "true");
          } else {
            oldEl[prop] = value;
          }
        }
      }
    }

    // Remove old attributes
    for (const {
      name
    } of oldAttrs) {
      if (!newEl.hasAttribute(name)) {
        oldEl.removeAttribute(name);
      }
    }
  }
}

/**
 * @typedef {Object} ComponentDefinition
 * @property {function(Object<string, any>): (Object<string, any>|Promise<Object<string, any>>)} [setup]
 *           Optional setup function that initializes the component's state and returns reactive data
 * @property {(function(Object<string, any>): string|Promise<string>|string)} template
 *           Required function that defines the component's HTML structure
 * @property {(function(Object<string, any>): string)|string} [style]
 *           Optional function or string that provides component-scoped CSS styles
 * @property {Object<string, ComponentDefinition>} [children]
 *           Optional object defining nested child components
 */

/**
 * @typedef {Object} ElevaPlugin
 * @property {function(Eleva, Object<string, any>): void} install
 *           Function that installs the plugin into the Eleva instance
 * @property {string} name
 *           Unique identifier name for the plugin
 */

/**
 * @typedef {Object} MountResult
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {Object<string, any>} data
 *           The component's reactive state and context data
 * @property {function(): void} unmount
 *           Function to clean up and unmount the component
 */

/**
 * @class 🧩 Eleva
 * @classdesc A modern, signal-based component runtime framework that provides lifecycle hooks,
 * scoped styles, and plugin support. Eleva manages component registration, plugin integration,
 * event handling, and DOM rendering with a focus on performance and developer experience.
 *
 * @example
 * const app = new Eleva("myApp");
 * app.component("myComponent", {
 *   template: (ctx) => `<div>Hello ${ctx.props.name}</div>`,
 *   setup: (ctx) => ({ count: new Signal(0) })
 * });
 * app.mount(document.getElementById("app"), "myComponent", { name: "World" });
 */
class Eleva {
  /**
   * Creates a new Eleva instance with the specified name and configuration.
   *
   * @public
   * @param {string} name - The unique identifier name for this Eleva instance.
   * @param {Object<string, any>} [config={}] - Optional configuration object for the instance.
   *        May include framework-wide settings and default behaviors.
   */
  constructor(name, config = {}) {
    /** @public {string} The unique identifier name for this Eleva instance */
    this.name = name;
    /** @public {Object<string, any>} Optional configuration object for the Eleva instance */
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
    /** @private {string[]} Array of lifecycle hook names supported by components */
    this._lifecycleHooks = ["onBeforeMount", "onMount", "onBeforeUpdate", "onUpdate", "onUnmount"];
    /** @private {boolean} Flag indicating if the root component is currently mounted */
    this._isMounted = false;
  }

  /**
   * Integrates a plugin with the Eleva framework.
   * The plugin's install function will be called with the Eleva instance and provided options.
   * After installation, the plugin will be available for use by components.
   *
   * @public
   * @param {ElevaPlugin} plugin - The plugin object which must have an `install` function.
   * @param {Object<string, any>} [options={}] - Optional configuration options for the plugin.
   * @returns {Eleva} The Eleva instance (for method chaining).
   * @example
   * app.use(myPlugin, { option1: "value1" });
   */
  use(plugin, options = {}) {
    plugin.install(this, options);
    this._plugins.set(plugin.name, plugin);
    return this;
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
   * @param {Object<string, any>} [props={}] - Optional properties to pass to the component.
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

    /**
     * Creates the initial context object for the component instance.
     * This context provides core functionality and will be merged with setup data.
     * @type {Object<string, any>}
     * @property {Object<string, any>} props - Component properties passed during mounting
     * @property {Emitter} emitter - Event emitter instance for component event handling
     * @property {function(any): Signal} signal - Factory function to create reactive Signal instances
     * @property {Object<string, function(): void>} ...lifecycleHooks - Prepared lifecycle hook functions
     */
    const context = {
      props,
      emitter: this.emitter,
      /** @type {(v: any) => Signal<any>} */
      signal: v => new this.signal(v),
      ...this._prepareLifecycleHooks()
    };

    /**
     * Processes the mounting of the component.
     * This function handles:
     * 1. Merging setup data with the component context
     * 2. Setting up reactive watchers
     * 3. Rendering the component
     * 4. Managing component lifecycle
     *
     * @param {Object<string, any>} data - Data returned from the component's setup function
     * @returns {Promise<MountResult>} An object containing:
     *   - container: The mounted component's container element
     *   - data: The component's reactive state and context
     *   - unmount: Function to clean up and unmount the component
     */
    const processMount = async data => {
      /** @type {Object<string, any>} */
      const mergedContext = {
        ...context,
        ...data
      };
      /** @type {Array<() => void>} */
      const watcherUnsubscribers = [];
      /** @type {Array<MountResult>} */
      const childInstances = [];
      /** @type {Array<() => void>} */
      const cleanupListeners = [];

      // Execute before hooks
      if (!this._isMounted) {
        mergedContext.onBeforeMount && mergedContext.onBeforeMount();
      } else {
        mergedContext.onBeforeUpdate && mergedContext.onBeforeUpdate();
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
        this._processEvents(container, mergedContext, cleanupListeners);
        if (style) this._injectStyles(container, compName, style, mergedContext);
        if (children) await this._mountComponents(container, children, childInstances);
        if (!this._isMounted) {
          mergedContext.onMount && mergedContext.onMount();
          this._isMounted = true;
        } else {
          mergedContext.onUpdate && mergedContext.onUpdate();
        }
      };

      /**
       * Sets up reactive watchers for all Signal instances in the component's data.
       * When a Signal's value changes, the component will re-render to reflect the updates.
       * Stores unsubscribe functions to clean up watchers when component unmounts.
       */
      for (const val of Object.values(data)) {
        if (val instanceof Signal) watcherUnsubscribers.push(val.watch(render));
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
        unmount: () => {
          for (const fn of watcherUnsubscribers) fn();
          for (const fn of cleanupListeners) fn();
          for (const child of childInstances) child.unmount();
          mergedContext.onUnmount && mergedContext.onUnmount();
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
   * Prepares default no-operation lifecycle hook functions for a component.
   * These hooks will be called at various stages of the component's lifecycle.
   *
   * @private
   * @returns {Object<string, function(): void>} An object mapping lifecycle hook names to empty functions.
   *         The returned object will be merged with the component's context.
   */
  _prepareLifecycleHooks() {
    /** @type {Object<string, () => void>} */
    const hooks = {};
    for (const hook of this._lifecycleHooks) {
      hooks[hook] = () => {};
    }
    return hooks;
  }

  /**
   * Processes DOM elements for event binding based on attributes starting with "@".
   * This method handles the event delegation system and ensures proper cleanup of event listeners.
   *
   * @private
   * @param {HTMLElement} container - The container element in which to search for event attributes.
   * @param {Object<string, any>} context - The current component context containing event handler definitions.
   * @param {Array<Function>} cleanupListeners - Array to collect cleanup functions for each event listener.
   * @returns {void}
   */
  _processEvents(container, context, cleanupListeners) {
    const elements = container.querySelectorAll("*");
    for (const el of elements) {
      const attrs = el.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (!attr.name.startsWith("@")) continue;
        const event = attr.name.slice(1);
        const handlerName = attr.value;
        const handler = context[handlerName] || TemplateEngine.evaluate(handlerName, context);
        if (typeof handler === "function") {
          el.addEventListener(event, handler);
          el.removeAttribute(attr.name);
          cleanupListeners.push(() => el.removeEventListener(event, handler));
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
   * @param {string} compName - The component name used to identify the style element.
   * @param {(function(Object<string, any>): string)|string} styleDef - The component's style definition (function or string).
   * @param {Object<string, any>} context - The current component context for style interpolation.
   * @returns {void}
   */
  _injectStyles(container, compName, styleDef, context) {
    const newStyle = typeof styleDef === "function" ? TemplateEngine.parse(styleDef(context), context) : styleDef;
    let styleEl = container.querySelector(`style[data-e-style="${compName}"]`);
    if (styleEl && styleEl.textContent === newStyle) return;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.setAttribute("data-e-style", compName);
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
   * @param {string} prefix - The prefix to look for in attributes
   * @returns {Object<string, any>} An object containing the extracted props
   * @example
   * // For an element with attributes:
   * // <div :name="John" :age="25">
   * // Returns: { name: "John", age: "25" }
   */
  _extractProps(element, prefix) {
    /** @type {Record<string, string>} */
    const props = {};
    for (const {
      name,
      value
    } of element.attributes) {
      if (name.startsWith(prefix)) {
        props[name.replace(prefix, "")] = value;
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
        const props = this._extractProps(el, ":");
        const instance = await this.mount(el, component, props);
        if (instance && !childInstances.includes(instance)) {
          childInstances.push(instance);
        }
      }
    }
  }
}

export { Eleva as default };
//# sourceMappingURL=eleva.esm.js.map

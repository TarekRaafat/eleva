/**
 * @class 🔒 TemplateEngine
 * @classdesc Secure interpolation & dynamic attribute parsing.
 * Provides methods to parse template strings by replacing interpolation expressions
 * with dynamic data values and to evaluate expressions within a given data context.
 */
class TemplateEngine {
  /**
   * Parses a template string and replaces interpolation expressions with corresponding values.
   *
   * @param {string} template - The template string containing expressions in the format `{{ expression }}`.
   * @param {Object<string, any>} data - The data object to use for evaluating expressions.
   * @returns {string} The resulting string with evaluated values.
   */
  static parse(template, data) {
    if (!template.trim()) return "";
    return template.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expr) => {
      const value = this.evaluate(expr, data);
      return value === undefined ? "" : value;
    });
  }

  /**
   * Evaluates a JavaScript expression using the provided data context.
   *
   * @param {string} expr - The JavaScript expression to evaluate.
   * @param {Object<string, any>} data - The data context for evaluating the expression.
   * @returns {any} The result of the evaluated expression, or an empty string if undefined or on error.
   */
  static evaluate(expr, data) {
    try {
      if (!expr.trim()) return "";
      const keys = Object.keys(data);
      const values = Object.values(data);
      const result = new Function(...keys, `try { return ${expr}; } catch (e) { return ""; }`)(...values);
      return result === undefined ? "" : result;
    } catch (error) {
      console.error(`Template evaluation error:`, {
        expression: expr,
        data,
        error: error.message
      });
      return "";
    }
  }
}

/**
 * @class ⚡ Signal
 * @classdesc Fine-grained reactivity.
 * A reactive data holder that notifies registered watchers when its value changes,
 * enabling fine-grained DOM patching rather than full re-renders.
 */
class Signal {
  /**
   * Creates a new Signal instance.
   *
   * @param {*} value - The initial value of the signal.
   */
  constructor(value) {
    /** @private {*} Internal storage for the signal's current value */
    this._value = value;
    /** @private {Set<function>} Collection of callback functions to be notified when value changes */
    this._watchers = new Set();
    /** @private {boolean} Flag to prevent multiple synchronous watcher notifications and batch updates into microtasks */
    this._pending = false;
  }

  /**
   * Gets the current value of the signal.
   *
   * @returns {*} The current value.
   */
  get value() {
    return this._value;
  }

  /**
   * Sets a new value for the signal and notifies all registered watchers if the value has changed.
   *
   * @param {*} newVal - The new value to set.
   */
  set value(newVal) {
    if (newVal !== this._value) {
      this._value = newVal;
      this._notifyWatchers();
    }
  }

  /**
   * Registers a watcher function that will be called whenever the signal's value changes.
   *
   * @param {function(any): void} fn - The callback function to invoke on value change.
   * @returns {function(): boolean} A function to unsubscribe the watcher.
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
  _notifyWatchers() {
    if (!this._pending) {
      this._pending = true;
      queueMicrotask(() => {
        this._pending = false;
        this._watchers.forEach(fn => fn(this._value));
      });
    }
  }
}

/**
 * @class 🎙️ Emitter
 * @classdesc Robust inter-component communication with event bubbling.
 * Implements a basic publish-subscribe pattern for event handling, allowing components
 * to communicate through custom events.
 */
class Emitter {
  /**
   * Creates a new Emitter instance.
   */
  constructor() {
    /** @type {Object.<string, Function[]>} Storage for event handlers mapped by event name */
    this.events = {};
  }

  /**
   * Registers an event handler for the specified event.
   *
   * @param {string} event - The name of the event.
   * @param {function(...any): void} handler - The function to call when the event is emitted.
   */
  on(event, handler) {
    (this.events[event] || (this.events[event] = [])).push(handler);
  }

  /**
   * Removes a previously registered event handler.
   *
   * @param {string} event - The name of the event.
   * @param {function(...any): void} handler - The handler function to remove.
   */
  off(event, handler) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler);
    }
  }

  /**
   * Emits an event, invoking all handlers registered for that event.
   *
   * @param {string} event - The event name.
   * @param {...any} args - Additional arguments to pass to the event handlers.
   */
  emit(event, ...args) {
    (this.events[event] || []).forEach(handler => handler(...args));
  }
}

/**
 * @class 🎨 Renderer
 * @classdesc Handles DOM patching, diffing, and attribute updates.
 * Provides methods for efficient DOM updates by diffing the new and old DOM structures
 * and applying only the necessary changes.
 */
class Renderer {
  /**
   * Patches the DOM of a container element with new HTML content.
   *
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML content to apply.
   */
  patchDOM(container, newHtml) {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = newHtml;
    this.diff(container, tempContainer);
  }

  /**
   * Diffs two DOM trees (old and new) and applies updates to the old DOM.
   *
   * @param {HTMLElement} oldParent - The original DOM element.
   * @param {HTMLElement} newParent - The new DOM element.
   */
  diff(oldParent, newParent) {
    // Fast path for identical nodes
    if (oldParent.isEqualNode(newParent)) return;
    const oldNodes = oldParent && oldParent.childNodes ? Array.from(oldParent.childNodes) : [];
    const newNodes = newParent && newParent.childNodes ? Array.from(newParent.childNodes) : [];
    const max = Math.max(oldNodes.length, newNodes.length);
    for (let i = 0; i < max; i++) {
      const oldNode = oldNodes[i];
      const newNode = newNodes[i];

      // Case 1: Append new nodes that don't exist in the old tree.
      if (!oldNode && newNode) {
        oldParent.appendChild(newNode.cloneNode(true));
        continue;
      }
      // Case 2: Remove old nodes not present in the new tree.
      if (oldNode && !newNode) {
        oldParent.removeChild(oldNode);
        continue;
      }

      // Case 3: For element nodes, compare keys if available.
      if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
        const oldKey = oldNode.getAttribute("key");
        const newKey = newNode.getAttribute("key");
        if (oldKey || newKey) {
          if (oldKey !== newKey) {
            oldParent.replaceChild(newNode.cloneNode(true), oldNode);
            continue;
          }
        }
      }

      // Case 4: Replace nodes if types or tag names differ.
      if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
        oldParent.replaceChild(newNode.cloneNode(true), oldNode);
        continue;
      }
      // Case 5: For text nodes, update content if different.
      if (oldNode.nodeType === Node.TEXT_NODE) {
        if (oldNode.nodeValue !== newNode.nodeValue) {
          oldNode.nodeValue = newNode.nodeValue;
        }
        continue;
      }
      // Case 6: For element nodes, update attributes and then diff children.
      if (oldNode.nodeType === Node.ELEMENT_NODE) {
        this.updateAttributes(oldNode, newNode);
        this.diff(oldNode, newNode);
      }
    }
  }

  /**
   * Updates the attributes of an element to match those of a new element.
   *
   * @param {HTMLElement} oldEl - The element to update.
   * @param {HTMLElement} newEl - The element providing the updated attributes.
   */
  updateAttributes(oldEl, newEl) {
    const attributeToPropertyMap = {
      value: "value",
      checked: "checked",
      selected: "selected",
      disabled: "disabled"
    };

    // Remove old attributes that no longer exist.
    Array.from(oldEl.attributes).forEach(attr => {
      if (attr.name.startsWith("@")) return;
      if (!newEl.hasAttribute(attr.name)) {
        oldEl.removeAttribute(attr.name);
      }
    });
    // Add or update attributes from newEl.
    Array.from(newEl.attributes).forEach(attr => {
      if (attr.name.startsWith("@")) return;
      if (oldEl.getAttribute(attr.name) !== attr.value) {
        oldEl.setAttribute(attr.name, attr.value);
        if (attributeToPropertyMap[attr.name]) {
          oldEl[attributeToPropertyMap[attr.name]] = attr.value;
        } else if (attr.name in oldEl) {
          oldEl[attr.name] = attr.value;
        }
      }
    });
  }
}

/**
 * Defines the structure and behavior of a component.
 * @typedef {Object} ComponentDefinition
 * @property {function(Object<string, any>): (Object<string, any>|Promise<Object<string, any>>)} [setup]
 *           Optional setup function that initializes the component's reactive state and lifecycle.
 *           Receives props and context as an argument and should return an object containing the component's state.
 *           Can return either a synchronous object or a Promise that resolves to an object for async initialization.
 *
 * @property {function(Object<string, any>): string} template
 *           Required function that defines the component's HTML structure.
 *           Receives the merged context (props + setup data) and must return an HTML template string.
 *           Supports dynamic expressions using {{ }} syntax for reactive data binding.
 *
 * @property {function(Object<string, any>): string} [style]
 *           Optional function that defines component-scoped CSS styles.
 *           Receives the merged context and returns a CSS string that will be automatically scoped to the component.
 *           Styles are injected into the component's container and only affect elements within it.
 *
 * @property {Object<string, ComponentDefinition>} [children]
 *           Optional object that defines nested child components.
 *           Keys are CSS selectors that match elements in the template where child components should be mounted.
 *           Values are ComponentDefinition objects that define the structure and behavior of each child component.
 */

/**
 * @class 🧩 Eleva
 * @classdesc Signal-based component runtime framework with lifecycle hooks, scoped styles, and plugin support.
 * Manages component registration, plugin integration, event handling, and DOM rendering.
 */
class Eleva {
  /**
   * Creates a new Eleva instance.
   *
   * @param {string} name - The name of the Eleva instance.
   * @param {Object<string, any>} [config={}] - Optional configuration for the instance.
   */
  constructor(name, config = {}) {
    /** @type {string} The unique identifier name for this Eleva instance */
    this.name = name;
    /** @type {Object<string, any>} Optional configuration object for the Eleva instance */
    this.config = config;
    /** @type {Object<string, ComponentDefinition>} Object storing registered component definitions by name */
    this._components = {};
    /** @private {Array<Object>} Collection of installed plugin instances */
    this._plugins = [];
    /** @private {string[]} Array of lifecycle hook names supported by the component */
    this._lifecycleHooks = ["onBeforeMount", "onMount", "onBeforeUpdate", "onUpdate", "onUnmount"];
    /** @private {boolean} Flag indicating if component is currently mounted */
    this._isMounted = false;
    /** @private {Emitter} Instance of the event emitter for handling component events */
    this.emitter = new Emitter();
    /** @private {Renderer} Instance of the renderer for handling DOM updates and patching */
    this.renderer = new Renderer();
  }

  /**
   * Integrates a plugin with the Eleva framework.
   *
   * @param {Object} plugin - The plugin object which should have an `install` function.
   * @param {Object<string, any>} [options={}] - Optional options to pass to the plugin.
   * @returns {Eleva} The Eleva instance (for chaining).
   */
  use(plugin, options = {}) {
    if (typeof plugin.install === "function") {
      plugin.install(this, options);
    }
    this._plugins.push(plugin);
    return this;
  }

  /**
   * Registers a component with the Eleva instance.
   *
   * @param {string} name - The name of the component.
   * @param {ComponentDefinition} definition - The component definition including setup, template, style, and children.
   * @returns {Eleva} The Eleva instance (for chaining).
   */
  component(name, definition) {
    this._components[name] = definition;
    return this;
  }

  /**
   * Mounts a registered component to a DOM element.
   *
   * @param {HTMLElement} container - A DOM element where the component will be mounted.
   * @param {string|ComponentDefinition} compName - The name of the component to mount or a component definition.
   * @param {Object<string, any>} [props={}] - Optional properties to pass to the component.
   * @returns {object|Promise<object>} An object representing the mounted component instance, or a Promise that resolves to it for asynchronous setups.
   * @throws {Error} If the container is not found or if the component is not registered.
   */
  mount(container, compName, props = {}) {
    if (!container) throw new Error(`Container not found: ${container}`);
    let definition;
    if (typeof compName === "string") {
      definition = this._components[compName];
      if (!definition) throw new Error(`Component "${compName}" not registered.`);
    } else if (typeof compName === "object") {
      definition = compName;
    } else {
      throw new Error("Invalid component parameter.");
    }

    /**
     * Destructure the component definition to access core functionality.
     * - setup: Optional function for component initialization and state management
     * - template: Required function that returns the component's HTML structure
     * - style: Optional function for component-scoped CSS styles
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
      signal: v => new Signal(v),
      ...this._prepareLifecycleHooks()
    };

    /**
     * Use a local flag so each component instance tracks its own mounted state.
     */
    let isMounted = false;

    /**
     * Processes the mounting of the component.
     *
     * @param {Object<string, any>} data - Data returned from the component's setup function.
     * @returns {object} An object with the container, merged context data, and an unmount function.
     */
    const processMount = data => {
      const mergedContext = {
        ...context,
        ...data
      };
      const watcherUnsubscribers = [];
      const childInstances = [];
      const cleanupListeners = [];
      if (!this._isMounted) {
        mergedContext.onBeforeMount && mergedContext.onBeforeMount();
      } else {
        mergedContext.onBeforeUpdate && mergedContext.onBeforeUpdate();
      }

      /**
       * Renders the component by parsing the template, patching the DOM,
       * processing events, injecting styles, and mounting child components.
       */
      const render = () => {
        const newHtml = TemplateEngine.parse(template(mergedContext), mergedContext);
        this.renderer.patchDOM(container, newHtml);
        this._processEvents(container, mergedContext, cleanupListeners);
        this._injectStyles(container, compName, style, mergedContext);
        this._mountChildren(container, children, childInstances);
        if (!isMounted) {
          mergedContext.onMount && mergedContext.onMount();
          isMounted = true;
        } else {
          mergedContext.onUpdate && mergedContext.onUpdate();
        }
      };

      /**
       * Sets up reactive watchers for all Signal instances in the component's data.
       * When a Signal's value changes, the component will re-render to reflect the updates.
       * Stores unsubscribe functions to clean up watchers when component unmounts.
       */
      Object.values(data).forEach(val => {
        if (val instanceof Signal) watcherUnsubscribers.push(val.watch(render));
      });
      render();
      return {
        container,
        data: mergedContext,
        /**
         * Unmounts the component, cleaning up watchers and listeners, child components, and clearing the container.
         *
         * @returns {void}
         */
        unmount: () => {
          watcherUnsubscribers.forEach(fn => fn());
          cleanupListeners.forEach(fn => fn());
          childInstances.forEach(child => child.unmount());
          mergedContext.onUnmount && mergedContext.onUnmount();
          container.innerHTML = "";
        }
      };
    };

    // Handle asynchronous setup.
    return Promise.resolve(typeof setup === "function" ? setup(context) : {}).then(data => processMount(data));
  }

  /**
   * Prepares default no-operation lifecycle hook functions.
   *
   * @returns {Object<string, function(): void>} An object with keys for lifecycle hooks mapped to empty functions.
   * @private
   */
  _prepareLifecycleHooks() {
    return this._lifecycleHooks.reduce((acc, hook) => {
      acc[hook] = () => {};
      return acc;
    }, {});
  }

  /**
   * Processes DOM elements for event binding based on attributes starting with "@".
   * Tracks listeners for cleanup during unmount.
   *
   * @param {HTMLElement} container - The container element in which to search for events.
   * @param {Object<string, any>} context - The current context containing event handler definitions.
   * @param {Array<Function>} cleanupListeners - Array to collect cleanup functions for each event listener.
   * @private
   */
  _processEvents(container, context, cleanupListeners) {
    container.querySelectorAll("*").forEach(el => {
      [...el.attributes].forEach(({
        name,
        value
      }) => {
        if (name.startsWith("@")) {
          const event = name.slice(1);
          const handler = TemplateEngine.evaluate(value, context);
          if (typeof handler === "function") {
            el.addEventListener(event, handler);
            el.removeAttribute(name);
            cleanupListeners.push(() => el.removeEventListener(event, handler));
          }
        }
      });
    });
  }

  /**
   * Injects scoped styles into the component's container.
   *
   * @param {HTMLElement} container - The container element.
   * @param {string} compName - The component name used to identify the style element.
   * @param {function(Object<string, any>): string} [styleFn] - A function that returns CSS styles as a string.
   * @param {Object<string, any>} context - The current context for style interpolation.
   * @private
   */
  _injectStyles(container, compName, styleFn, context) {
    if (styleFn) {
      let styleEl = container.querySelector(`style[data-eleva-style="${compName}"]`);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.setAttribute("data-eleva-style", compName);
        container.appendChild(styleEl);
      }
      styleEl.textContent = TemplateEngine.parse(styleFn(context), context);
    }
  }

  /**
   * Mounts child components within the parent component's container.
   *
   * @param {HTMLElement} container - The parent container element.
   * @param {Object<string, ComponentDefinition>} [children] - An object mapping child component selectors to their definitions.
   * @param {Array<object>} childInstances - An array to store the mounted child component instances.
   * @private
   */
  _mountChildren(container, children, childInstances) {
    childInstances.forEach(child => child.unmount());
    childInstances.length = 0;
    Object.keys(children || {}).forEach(childSelector => {
      container.querySelectorAll(childSelector).forEach(childEl => {
        const props = {};
        [...childEl.attributes].forEach(({
          name,
          value
        }) => {
          if (name.startsWith("eleva-prop-")) {
            props[name.slice("eleva-prop-".length)] = value;
          }
        });
        const instance = this.mount(childEl, children[childSelector], props);
        childInstances.push(instance);
      });
    });
  }
}

export { Eleva as default };
//# sourceMappingURL=eleva.esm.js.map

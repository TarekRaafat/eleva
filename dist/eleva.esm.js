/**
 * 🔒 TemplateEngine: Secure interpolation & dynamic attribute parsing.
 *
 * This class provides methods to parse template strings by replacing
 * interpolation expressions with dynamic data values and to evaluate expressions
 * within a given data context.
 */
class TemplateEngine {
  /**
   * Parses a template string and replaces interpolation expressions with corresponding values.
   *
   * @param {string} template - The template string containing expressions in the format {{ expression }}.
   * @param {object} data - The data object to use for evaluating expressions.
   * @returns {string} The resulting string with evaluated values.
   */
  static parse(template, data) {
    return template.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expr) => {
      const value = this.evaluate(expr, data);
      return value === undefined ? "" : value;
    });
  }

  /**
   * Evaluates an expression using the provided data context.
   *
   * @param {string} expr - The JavaScript expression to evaluate.
   * @param {object} data - The data context for evaluating the expression.
   * @returns {*} The result of the evaluated expression, or an empty string if undefined or on error.
   */
  static evaluate(expr, data) {
    try {
      const keys = Object.keys(data);
      const values = keys.map(k => data[k]);
      const result = new Function(...keys, `return ${expr}`)(...values);
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
 * ⚡ Signal: Fine-grained reactivity.
 *
 * A reactive data holder that notifies registered watchers when its value changes,
 * allowing for fine-grained DOM patching rather than full re-renders.
 */
class Signal {
  /**
   * Creates a new Signal instance.
   *
   * @param {*} value - The initial value of the signal.
   */
  constructor(value) {
    this._value = value;
    this._watchers = new Set();
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
      this._watchers.forEach(fn => fn(newVal));
    }
  }

  /**
   * Registers a watcher function that will be called whenever the signal's value changes.
   *
   * @param {Function} fn - The callback function to invoke on value change.
   * @returns {Function} A function to unsubscribe the watcher.
   */
  watch(fn) {
    this._watchers.add(fn);
    return () => this._watchers.delete(fn);
  }
}

/**
 * 🎙️ Emitter: Robust inter-component communication with event bubbling.
 *
 * Implements a basic publish-subscribe pattern for event handling,
 * allowing components to communicate through custom events.
 */
class Emitter {
  /**
   * Creates a new Emitter instance.
   */
  constructor() {
    /** @type {Object.<string, Function[]>} */
    this.events = {};
  }

  /**
   * Registers an event handler for the specified event.
   *
   * @param {string} event - The name of the event.
   * @param {Function} handler - The function to call when the event is emitted.
   */
  on(event, handler) {
    (this.events[event] || (this.events[event] = [])).push(handler);
  }

  /**
   * Removes a previously registered event handler.
   *
   * @param {string} event - The name of the event.
   * @param {Function} handler - The handler function to remove.
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
   * @param {...*} args - Additional arguments to pass to the event handlers.
   */
  emit(event, ...args) {
    (this.events[event] || []).forEach(handler => handler(...args));
  }
}

/**
 * 🎨 Renderer: Handles DOM patching, diffing, and attribute updates.
 *
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
    const oldNodes = Array.from(oldParent.childNodes);
    const newNodes = Array.from(newParent.childNodes);
    const max = Math.max(oldNodes.length, newNodes.length);
    for (let i = 0; i < max; i++) {
      const oldNode = oldNodes[i];
      const newNode = newNodes[i];

      // Append new nodes that don't exist in the old tree.
      if (!oldNode && newNode) {
        oldParent.appendChild(newNode.cloneNode(true));
        continue;
      }
      // Remove old nodes not present in the new tree.
      if (oldNode && !newNode) {
        oldParent.removeChild(oldNode);
        continue;
      }

      // For element nodes, compare keys if available.
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

      // Replace nodes if types or tag names differ.
      if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
        oldParent.replaceChild(newNode.cloneNode(true), oldNode);
        continue;
      }
      // For text nodes, update content if different.
      if (oldNode.nodeType === Node.TEXT_NODE) {
        if (oldNode.nodeValue !== newNode.nodeValue) {
          oldNode.nodeValue = newNode.nodeValue;
        }
        continue;
      }
      // For element nodes, update attributes and then diff children.
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
 * 🧩 Eleva Core: Signal-based component runtime framework with lifecycle, scoped styles, and plugins.
 *
 * The Eleva class is the core of the framework. It manages component registration,
 * plugin integration, lifecycle hooks, event handling, and DOM rendering.
 */
class Eleva {
  /**
   * Creates a new Eleva instance.
   *
   * @param {string} name - The name of the Eleva instance.
   * @param {object} [config={}] - Optional configuration for the instance.
   */
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this._components = {};
    this._plugins = [];
    this._lifecycleHooks = ["onBeforeMount", "onMount", "onBeforeUpdate", "onUpdate", "onUnmount"];
    this._isMounted = false;
    this.emitter = new Emitter();
    this.renderer = new Renderer();
  }

  /**
   * Integrates a plugin with the Eleva framework.
   *
   * @param {object} [plugin] - The plugin object which should have an install function.
   * @param {object} [options={}] - Optional options to pass to the plugin.
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
   * @param {object} definition - The component definition including setup, template, style, and children.
   * @returns {Eleva} The Eleva instance (for chaining).
   */
  component(name, definition) {
    this._components[name] = definition;
    return this;
  }

  /**
   * Mounts a registered component to a DOM element.
   *
   * @param {string|HTMLElement} selectorOrElement - A CSS selector string or DOM element where the component will be mounted.
   * @param {string} compName - The name of the component to mount.
   * @param {object} [props={}] - Optional properties to pass to the component.
   * @returns {object|Promise<object>} An object representing the mounted component instance, or a Promise that resolves to it for asynchronous setups.
   * @throws Will throw an error if the container or component is not found.
   */
  mount(selectorOrElement, compName, props = {}) {
    const container = typeof selectorOrElement === "string" ? document.querySelector(selectorOrElement) : selectorOrElement;
    if (!container) throw new Error(`Container not found: ${selectorOrElement}`);
    const definition = this._components[compName];
    if (!definition) throw new Error(`Component "${compName}" not registered.`);
    const {
      setup,
      template,
      style,
      children
    } = definition;
    const context = {
      props,
      emit: this.emitter.emit.bind(this.emitter),
      on: this.emitter.on.bind(this.emitter),
      signal: v => new Signal(v),
      ...this._prepareLifecycleHooks()
    };

    /**
     * Processes the mounting of the component.
     *
     * @param {object} data - Data returned from the component's setup function.
     * @returns {object} An object with the container, merged context data, and an unmount function.
     */
    const processMount = data => {
      const mergedContext = {
        ...context,
        ...data
      };
      const watcherUnsubscribers = [];
      const childInstances = [];
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
        this._processEvents(container, mergedContext);
        this._injectStyles(container, compName, style, mergedContext);
        this._mountChildren(container, children, childInstances);
        if (!this._isMounted) {
          mergedContext.onMount && mergedContext.onMount();
          this._isMounted = true;
        } else {
          mergedContext.onUpdate && mergedContext.onUpdate();
        }
      };
      Object.values(data).forEach(val => {
        if (val instanceof Signal) watcherUnsubscribers.push(val.watch(render));
      });
      render();
      return {
        container,
        data: mergedContext,
        /**
         * Unmounts the component, cleaning up watchers, child components, and clearing the container.
         */
        unmount: () => {
          watcherUnsubscribers.forEach(fn => fn());
          childInstances.forEach(child => child.unmount());
          mergedContext.onUnmount && mergedContext.onUnmount();
          container.innerHTML = "";
        }
      };
    };

    // Handle asynchronous setup if needed.
    const setupResult = setup(context);
    if (setupResult && typeof setupResult.then === "function") {
      return setupResult.then(data => processMount(data));
    } else {
      const data = setupResult || {};
      return processMount(data);
    }
  }

  /**
   * Prepares default no-operation lifecycle hook functions.
   *
   * @returns {object} An object with keys for lifecycle hooks mapped to empty functions.
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
   *
   * @param {HTMLElement} container - The container element in which to search for events.
   * @param {object} context - The current context containing event handler definitions.
   * @private
   */
  _processEvents(container, context) {
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
   * @param {Function} styleFn - A function that returns CSS styles as a string.
   * @param {object} context - The current context for style interpolation.
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
   * @param {object} children - An object mapping child component selectors to their definitions.
   * @param {Array} childInstances - An array to store the mounted child component instances.
   * @private
   */
  _mountChildren(container, children, childInstances) {
    childInstances.forEach(child => child.unmount());
    childInstances.length = 0;
    Object.keys(children || {}).forEach(childName => {
      container.querySelectorAll(childName).forEach(childEl => {
        const props = {};
        [...childEl.attributes].forEach(({
          name,
          value
        }) => {
          if (name.startsWith("eleva-prop-")) {
            props[name.slice("eleva-prop-".length)] = value;
          }
        });
        const instance = this.mount(childEl, childName, props);
        childInstances.push(instance);
      });
    });
  }
}

export { Eleva as default };
//# sourceMappingURL=eleva.esm.js.map

"use strict";

import { TemplateEngine } from "../modules/TemplateEngine.js";
import { Signal } from "../modules/Signal.js";
import { Emitter } from "../modules/Emitter.js";
import { Renderer } from "../modules/Renderer.js";

/**
 * @typedef {Object} ComponentDefinition
 * @property {function(Object<string, any>): (Object<string, any>|Promise<Object<string, any>>)} [setup]
 *           Optional setup function that initializes the component's state and returns reactive data
 * @property {function(Object<string, any>): string|Promise<string>} template
 *           Required function that defines the component's HTML structure
 * @property {function(Object<string, any>): string} [style]
 *           Optional function that provides component-scoped CSS styles
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
export class Eleva {
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
    this._lifecycleHooks = [
      "onBeforeMount",
      "onMount",
      "onBeforeUpdate",
      "onUpdate",
      "onUnmount",
    ];
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
   *   style: () => "button { color: blue; }"
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

    if (container._eleva_instance) {
      return container._eleva_instance;
    }

    /** @type {ComponentDefinition} */
    const definition =
      typeof compName === "string" ? this._components.get(compName) : compName;
    if (!definition) throw new Error(`Component "${compName}" not registered.`);

    if (typeof definition.template !== "function")
      throw new Error("Component template must be a function");

    /**
     * Destructure the component definition to access core functionality.
     * - setup: Optional function for component initialization and state management
     * - template: Required function that returns the component's HTML structure
     * - style: Optional function for component-scoped CSS styles
     * - children: Optional object defining nested child components
     */
    const { setup, template, style, children } = definition;

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
      signal: (v) => new this.signal(v),
      ...this._prepareLifecycleHooks(),
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
    const processMount = async (data) => {
      /** @type {Object<string, any>} */
      const mergedContext = { ...context, ...data };
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
        const templateResult = await template(mergedContext);
        const newHtml = TemplateEngine.parse(templateResult, mergedContext);
        this.renderer.patchDOM(container, newHtml);
        this._processEvents(container, mergedContext, cleanupListeners);
        if (style)
          this._injectStyles(container, compName, style, mergedContext);
        if (children)
          await this._mountComponents(container, children, childInstances);

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
        },
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
        const handler =
          context[handlerName] || TemplateEngine.evaluate(handlerName, context);
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
   * @param {function(Object<string, any>): string} [styleFn] - Optional function that returns CSS styles as a string.
   * @param {Object<string, any>} context - The current component context for style interpolation.
   * @returns {void}
   */
  _injectStyles(container, compName, styleFn, context) {
    let styleEl = container.querySelector(
      `style[data-eleva-style="${compName}"]`
    );
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.setAttribute("data-eleva-style", compName);
      container.appendChild(styleEl);
    }
    styleEl.textContent = TemplateEngine.parse(styleFn(context), context);
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
    for (const { name, value } of element.attributes) {
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

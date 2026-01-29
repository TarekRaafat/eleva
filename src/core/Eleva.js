"use strict";

/**
 * @module eleva
 * @fileoverview Core Eleva framework providing signal-based component lifecycle management,
 * reactive rendering, and plugin architecture.
 */

import { TemplateEngine } from "../modules/TemplateEngine.js";
import { Signal } from "../modules/Signal.js";
import { Emitter } from "../modules/Emitter.js";
import { Renderer } from "../modules/Renderer.js";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// -----------------------------------------------------------------------------
// Configuration Types
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Component Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Context Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Lifecycle Hook Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Mount Result Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Plugin Types
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Event Types
// -----------------------------------------------------------------------------

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
export class Eleva {
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
  constructor(name) {
    if (!name || typeof name !== "string") {
      throw new Error("Eleva: name must be a non-empty string");
    }
    /** @public @readonly {string} The unique identifier name for this Eleva instance */
    this.name = name;
    /** @public @readonly {Emitter} Event emitter for handling component events */
    this.emitter = new Emitter();
    /** @public @readonly {typeof Signal} Signal class for creating reactive state */
    this.signal = Signal;
    /** @public @readonly {typeof TemplateEngine} TemplateEngine class for template parsing */
    this.templateEngine = TemplateEngine;
    /** @public @readonly {Renderer} Renderer for handling DOM updates and patching */
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
  use(plugin, options = {}) {
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
   * @see mount - Mount this component to the DOM.
   * @example
   * app.component("myButton", {
   *   template: (ctx) => `<button>${ctx.props.text}</button>`,
   *   style: `button { color: blue; }`
   * });
   */
  component(name, definition) {
    if (!name || typeof name !== "string") {
      throw new Error("Eleva: component name must be a non-empty string");
    }
    if (!definition?.template) {
      throw new Error(`Eleva: component "${name}" must have a template`);
    }
    /** @type {Map<string, ComponentDefinition>} */
    this._components.set(name, definition);
    return this;
  }

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
  async mount(container, compName, props = {}) {
    if (!container?.nodeType) {
      throw new Error("Eleva: container must be a DOM element");
    }

    if (container._eleva_instance) return container._eleva_instance;

    /** @type {ComponentDefinition} */
    const definition =
      typeof compName === "string" ? this._components.get(compName) : compName;
    if (!definition) throw new Error(`Component "${compName}" not registered.`);

    /** @type {string} */
    const compId = `c${++this._componentCounter}`;

    /**
     * Destructure the component definition to access core functionality.
     * - setup: Optional function for component initialization and state management
     * - template: Required function or string that returns the component's HTML structure
     * - style: Optional function or string for component CSS styles (not auto-scoped)
     * - children: Optional object defining nested child components
     */
    const { setup, template, style, children } = definition;

    /** @type {ComponentContext} */
    const context = {
      props,
      emitter: this.emitter,
      /** @type {SignalFactory} */
      signal: (v) => new this.signal(v),
    };

    /**
     * Processes the mounting of the component.
     * This function handles:
     * 1. Merging setup data with the component context
     * 2. Setting up reactive watchers
     * 3. Rendering the component
     * 4. Managing component lifecycle
     *
     * @inner
     * @param {Record<string, unknown>} data - Data returned from the component's setup function.
     * @returns {Promise<MountResult>} An object containing:
     *   - container: The mounted component's container element
     *   - data: The component's reactive state and context
     *   - unmount: Function to clean up and unmount the component
     */
    const processMount = async (data) => {
      /** @type {ComponentContext & SetupResult} */
      const mergedContext = { ...context, ...data };
      /** @type {UnsubscribeFunction[]} */
      const watchers = [];
      /** @type {MountResult[]} */
      const childInstances = [];
      /** @type {UnsubscribeFunction[]} */
      const listeners = [];
      /** @private {boolean} Local mounted state for this component instance */
      let isMounted = false;

      // ========================================================================
      // Render Batching
      // ========================================================================

      /** @private {boolean} Flag to prevent concurrent renders */
      let renderScheduled = false;

      /**
       * Schedules a render using microtask batching.
       * Since signals now notify watchers synchronously, multiple signal
       * changes in the same synchronous block will each call this function,
       * but only one render will be scheduled via queueMicrotask.
       * This separates concerns: signals handle state, components handle scheduling.
       *
       * @inner
       * @private
       * @returns {void}
       */
      const scheduleRender = () => {
        if (renderScheduled) return;
        renderScheduled = true;
        queueMicrotask(async () => {
          renderScheduled = false;
          await render();
        });
      };

      /**
       * Renders the component by:
       * 1. Executing lifecycle hooks
       * 2. Processing the template
       * 3. Updating the DOM
       * 4. Processing events, injecting styles, and mounting child components.
       *
       * @inner
       * @private
       * @returns {Promise<void>}
       */
      const render = async () => {
        const html =
          typeof template === "function"
            ? await template(mergedContext)
            : template;

        // Execute before hooks
        if (!isMounted) {
          await mergedContext.onBeforeMount?.({
            container,
            context: mergedContext,
          });
        } else {
          await mergedContext.onBeforeUpdate?.({
            container,
            context: mergedContext,
          });
        }

        this.renderer.patchDOM(container, html);

        // Unmount child components whose host elements were removed by patching.
        const childrenToUnmount = [];
        for (let i = childInstances.length - 1; i >= 0; i--) {
          const child = childInstances[i];
          if (!container.contains(child.container)) {
            childInstances.splice(i, 1);
            childrenToUnmount.push(child);
          }
        }
        if (childrenToUnmount.length) {
          await Promise.allSettled(
            childrenToUnmount.map((child) => child.unmount())
          );
        }

        this._processEvents(container, mergedContext, listeners);
        if (style) this._injectStyles(container, compId, style, mergedContext);
        if (children)
          await this._mountComponents(
            container,
            children,
            childInstances,
            mergedContext
          );

        // Execute after hooks
        if (!isMounted) {
          await mergedContext.onMount?.({
            container,
            context: mergedContext,
          });
          isMounted = true;
        } else {
          await mergedContext.onUpdate?.({
            container,
            context: mergedContext,
          });
        }
      };

      /**
       * Sets up reactive watchers for all Signal instances in the component's data.
       * When a Signal's value changes, a batched render is scheduled.
       * Multiple changes within the same frame are collapsed into one render.
       * Stores unsubscribe functions to clean up watchers when component unmounts.
       *
       * @note Signal watchers are invoked synchronously when values change.
       * Render batching is handled at the component level via queueMicrotask,
       * not at the signal level. This preserves stack traces for debugging.
       */
      for (const val of Object.values(data)) {
        if (val instanceof Signal) watchers.push(val.watch(scheduleRender));
      }

      await render();

      const instance = {
        container,
        data: mergedContext,
        /**
         * Unmounts the component, cleaning up watchers and listeners, child components, and clearing the container.
         * Removes the internal instance marker from the container when complete.
         *
         * @returns {Promise<void>}
         */
        unmount: async () => {
          await mergedContext.onUnmount?.({
            container,
            context: mergedContext,
            cleanup: {
              watchers,
              listeners,
              children: childInstances,
            },
          });
          for (const fn of watchers) fn();
          for (const fn of listeners) fn();
          for (const child of childInstances) await child.unmount();
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
  _processEvents(container, context, listeners) {
    /** @type {NodeListOf<Element>} */
    const elements = container.querySelectorAll("*");
    for (const el of elements) {
      /** @type {NamedNodeMap} */
      const attrs = el.attributes;
      // Iterate backwards to safely remove attributes from live collection
      for (let i = attrs.length - 1; i >= 0; i--) {
        /** @type {Attr} */
        const attr = attrs[i];

        if (!attr.name.startsWith("@")) continue;

        /** @type {keyof HTMLElementEventMap} */
        const event = attr.name.slice(1);
        /** @type {string} */
        const handlerName = attr.value;
        /** @type {DOMEventHandler} */
        const handler =
          context[handlerName] ||
          this.templateEngine.evaluate(handlerName, context);
        if (typeof handler === "function") {
          el.addEventListener(event, handler);
          el.removeAttribute(attr.name);
          listeners.push(() => el.removeEventListener(event, handler));
        }
      }
    }
  }

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
  _injectStyles(container, compId, styleDef, context) {
    /** @type {string} */
    const newStyle =
      typeof styleDef === "function" ? styleDef(context) : styleDef;

    /** @type {HTMLStyleElement | null} */
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
  _extractProps(element, context) {
    if (!element.attributes) return {};

    const props = {};
    const attrs = element.attributes;

    for (let i = attrs.length - 1; i >= 0; i--) {
      const attr = attrs[i];
      if (attr.name.startsWith(":")) {
        const propName = attr.name.slice(1);
        props[propName] = this.templateEngine.evaluate(attr.value, context);
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
  async _mountComponents(container, children, childInstances, context) {
    for (const [selector, component] of Object.entries(children)) {
      if (!selector) continue;
      for (const el of container.querySelectorAll(selector)) {
        if (!(el instanceof HTMLElement)) continue;
        /** @type {ComponentProps} */
        const props = this._extractProps(el, context);
        /** @type {MountResult} */
        const instance = await this.mount(el, component, props);
        if (instance && !childInstances.includes(instance)) {
          childInstances.push(instance);
        }
      }
    }
  }
}

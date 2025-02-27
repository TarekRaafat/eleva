"use strict";

import { TemplateEngine } from "../modules/TemplateEngine.js";
import { Signal } from "../modules/Signal.js";
import { Emitter } from "../modules/Emitter.js";
import { Renderer } from "../modules/Renderer.js";

/**
 * @typedef {Object} ComponentDefinition
 * @property {function(Object<string, any>): (Object<string, any>|Promise<Object<string, any>>)} [setup]
 *           A setup function that initializes the component state and returns an object or a promise that resolves to an object.
 * @property {function(Object<string, any>): string} template
 *           A function that returns the HTML template string for the component.
 * @property {function(Object<string, any>): string} [style]
 *           An optional function that returns scoped CSS styles as a string.
 * @property {Object<string, ComponentDefinition>} [children]
 *           An optional mapping of CSS selectors to child component definitions.
 */

/**
 * @class 🧩 Eleva
 * @classdesc Signal-based component runtime framework with lifecycle hooks, scoped styles, and plugin support.
 * Manages component registration, plugin integration, event handling, and DOM rendering.
 */
export class Eleva {
  /**
   * Creates a new Eleva instance.
   *
   * @param {string} name - The name of the Eleva instance.
   * @param {Object<string, any>} [config={}] - Optional configuration for the instance.
   */
  constructor(name, config = {}) {
    /** @type {string} */
    this.name = name;
    /** @type {Object<string, any>} */
    this.config = config;
    /** @type {Object<string, ComponentDefinition>} */
    this._components = {};
    /** @type {Array<Object>} */
    this._plugins = [];
    /** @private */
    this._lifecycleHooks = [
      "onBeforeMount",
      "onMount",
      "onBeforeUpdate",
      "onUpdate",
      "onUnmount",
    ];
    /** @private {boolean} */
    this._isMounted = false;
    this.emitter = new Emitter();
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
      if (!definition)
        throw new Error(`Component "${compName}" not registered.`);
    } else if (typeof compName === "object") {
      definition = compName;
    } else {
      throw new Error("Invalid component parameter.");
    }

    const { setup, template, style, children } = definition;
    const context = {
      props,
      emit: this.emitter.emit.bind(this.emitter),
      on: this.emitter.on.bind(this.emitter),
      signal: (v) => new Signal(v),
      ...this._prepareLifecycleHooks(),
    };

    /**
     * Processes the mounting of the component.
     *
     * @param {Object<string, any>} data - Data returned from the component's setup function.
     * @returns {object} An object with the container, merged context data, and an unmount function.
     */
    const processMount = (data) => {
      const mergedContext = { ...context, ...data };
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
        const newHtml = TemplateEngine.parse(
          template(mergedContext),
          mergedContext
        );
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

      Object.values(data).forEach((val) => {
        if (val instanceof Signal) watcherUnsubscribers.push(val.watch(render));
      });

      render();

      return {
        container,
        data: mergedContext,
        /**
         * Unmounts the component, cleaning up watchers, child components, and clearing the container.
         *
         * @returns {void}
         */
        unmount: () => {
          watcherUnsubscribers.forEach((fn) => fn());
          childInstances.forEach((child) => child.unmount());
          mergedContext.onUnmount && mergedContext.onUnmount();
          container.innerHTML = "";
        },
      };
    };

    // Handle asynchronous setup.
    return Promise.resolve(
      typeof setup === "function" ? setup(context) : {}
    ).then((data) => processMount(data));
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
   *
   * @param {HTMLElement} container - The container element in which to search for events.
   * @param {Object<string, any>} context - The current context containing event handler definitions.
   * @private
   */
  _processEvents(container, context) {
    container.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach(({ name, value }) => {
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
   * @param {function(Object<string, any>): string} [styleFn] - A function that returns CSS styles as a string.
   * @param {Object<string, any>} context - The current context for style interpolation.
   * @private
   */
  _injectStyles(container, compName, styleFn, context) {
    if (styleFn) {
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
    childInstances.forEach((child) => child.unmount());
    childInstances.length = 0;

    Object.keys(children || {}).forEach((childSelector) => {
      container.querySelectorAll(childSelector).forEach((childEl) => {
        const props = {};
        [...childEl.attributes].forEach(({ name, value }) => {
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

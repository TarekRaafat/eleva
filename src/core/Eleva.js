"use strict";

import { TemplateEngine } from "../modules/TemplateEngine.js";
import { Signal } from "../modules/Signal.js";
import { Emitter } from "../modules/Emitter.js";
import { Renderer } from "../modules/Renderer.js";

/**
 * 🧩 Eleva Core: Signal-based component runtime framework with lifecycle, scoped styles, and plugins.
 *
 * The Eleva class is the core of the framework. It manages component registration,
 * plugin integration, lifecycle hooks, event handling, and DOM rendering.
 */
export class Eleva {
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
    this._lifecycleHooks = [
      "onBeforeMount",
      "onMount",
      "onBeforeUpdate",
      "onUpdate",
      "onUnmount",
    ];
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
    const container =
      typeof selectorOrElement === "string"
        ? document.querySelector(selectorOrElement)
        : selectorOrElement;
    if (!container)
      throw new Error(`Container not found: ${selectorOrElement}`);

    const definition = this._components[compName];
    if (!definition) throw new Error(`Component "${compName}" not registered.`);

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
     * @param {object} data - Data returned from the component's setup function.
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
         */
        unmount: () => {
          watcherUnsubscribers.forEach((fn) => fn());
          childInstances.forEach((child) => child.unmount());
          mergedContext.onUnmount && mergedContext.onUnmount();
          container.innerHTML = "";
        },
      };
    };

    // Handle asynchronous setup if needed.
    const setupResult = setup(context);
    if (setupResult && typeof setupResult.then === "function") {
      return setupResult.then((data) => processMount(data));
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
   * @param {Function} styleFn - A function that returns CSS styles as a string.
   * @param {object} context - The current context for style interpolation.
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
   * @param {object} children - An object mapping child component selectors to their definitions.
   * @param {Array} childInstances - An array to store the mounted child component instances.
   * @private
   */
  _mountChildren(container, children, childInstances) {
    childInstances.forEach((child) => child.unmount());
    childInstances.length = 0;

    Object.keys(children || {}).forEach((childName) => {
      container.querySelectorAll(childName).forEach((childEl) => {
        const props = {};
        [...childEl.attributes].forEach(({ name, value }) => {
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

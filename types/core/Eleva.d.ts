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
    constructor(name: string, config?: object);
    name: string;
    config: object;
    _components: {};
    _plugins: any[];
    _lifecycleHooks: string[];
    _isMounted: boolean;
    emitter: Emitter;
    renderer: Renderer;
    /**
     * Integrates a plugin with the Eleva framework.
     *
     * @param {object} [plugin] - The plugin object which should have an install function.
     * @param {object} [options={}] - Optional options to pass to the plugin.
     * @returns {Eleva} The Eleva instance (for chaining).
     */
    use(plugin?: object, options?: object): Eleva;
    /**
     * Registers a component with the Eleva instance.
     *
     * @param {string} name - The name of the component.
     * @param {object} definition - The component definition including setup, template, style, and children.
     * @returns {Eleva} The Eleva instance (for chaining).
     */
    component(name: string, definition: object): Eleva;
    /**
     * Mounts a registered component to a DOM element.
     *
     * @param {string|HTMLElement} selectorOrElement - A CSS selector string or DOM element where the component will be mounted.
     * @param {string} compName - The name of the component to mount.
     * @param {object} [props={}] - Optional properties to pass to the component.
     * @returns {object|Promise<object>} An object representing the mounted component instance, or a Promise that resolves to it for asynchronous setups.
     * @throws Will throw an error if the container or component is not found.
     */
    mount(selectorOrElement: string | HTMLElement, compName: string, props?: object): object | Promise<object>;
    /**
     * Prepares default no-operation lifecycle hook functions.
     *
     * @returns {object} An object with keys for lifecycle hooks mapped to empty functions.
     * @private
     */
    private _prepareLifecycleHooks;
    /**
     * Processes DOM elements for event binding based on attributes starting with "@".
     *
     * @param {HTMLElement} container - The container element in which to search for events.
     * @param {object} context - The current context containing event handler definitions.
     * @private
     */
    private _processEvents;
    /**
     * Injects scoped styles into the component's container.
     *
     * @param {HTMLElement} container - The container element.
     * @param {string} compName - The component name used to identify the style element.
     * @param {Function} styleFn - A function that returns CSS styles as a string.
     * @param {object} context - The current context for style interpolation.
     * @private
     */
    private _injectStyles;
    /**
     * Mounts child components within the parent component's container.
     *
     * @param {HTMLElement} container - The parent container element.
     * @param {object} children - An object mapping child component selectors to their definitions.
     * @param {Array} childInstances - An array to store the mounted child component instances.
     * @private
     */
    private _mountChildren;
}
import { Emitter } from "../modules/Emitter.js";
import { Renderer } from "../modules/Renderer.js";
//# sourceMappingURL=Eleva.d.ts.map
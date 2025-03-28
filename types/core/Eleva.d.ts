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
export class Eleva {
    /**
     * Creates a new Eleva instance.
     *
     * @param {string} name - The name of the Eleva instance.
     * @param {Object<string, any>} [config={}] - Optional configuration for the instance.
     */
    constructor(name: string, config?: {
        [x: string]: any;
    });
    /** @type {string} The unique identifier name for this Eleva instance */
    name: string;
    /** @type {Object<string, any>} Optional configuration object for the Eleva instance */
    config: {
        [x: string]: any;
    };
    /** @type {Object<string, ComponentDefinition>} Object storing registered component definitions by name */
    _components: {
        [x: string]: ComponentDefinition;
    };
    /** @private {Array<Object>} Collection of installed plugin instances */
    private _plugins;
    /** @private {string[]} Array of lifecycle hook names supported by the component */
    private _lifecycleHooks;
    /** @private {boolean} Flag indicating if component is currently mounted */
    private _isMounted;
    /** @private {Emitter} Instance of the event emitter for handling component events */
    private emitter;
    /** @private {Renderer} Instance of the renderer for handling DOM updates and patching */
    private renderer;
    /**
     * Integrates a plugin with the Eleva framework.
     *
     * @param {Object} plugin - The plugin object which should have an `install` function.
     * @param {Object<string, any>} [options={}] - Optional options to pass to the plugin.
     * @returns {Eleva} The Eleva instance (for chaining).
     */
    use(plugin: Object, options?: {
        [x: string]: any;
    }): Eleva;
    /**
     * Registers a component with the Eleva instance.
     *
     * @param {string} name - The name of the component.
     * @param {ComponentDefinition} definition - The component definition including setup, template, style, and children.
     * @returns {Eleva} The Eleva instance (for chaining).
     */
    component(name: string, definition: ComponentDefinition): Eleva;
    /**
     * Mounts a registered component to a DOM element.
     *
     * @param {HTMLElement} container - A DOM element where the component will be mounted.
     * @param {string|ComponentDefinition} compName - The name of the component to mount or a component definition.
     * @param {Object<string, any>} [props={}] - Optional properties to pass to the component.
     * @returns {object|Promise<object>} An object representing the mounted component instance, or a Promise that resolves to it for asynchronous setups.
     * @throws {Error} If the container is not found or if the component is not registered.
     */
    mount(container: HTMLElement, compName: string | ComponentDefinition, props?: {
        [x: string]: any;
    }): object | Promise<object>;
    /**
     * Prepares default no-operation lifecycle hook functions.
     *
     * @returns {Object<string, function(): void>} An object with keys for lifecycle hooks mapped to empty functions.
     * @private
     */
    private _prepareLifecycleHooks;
    /**
     * Processes DOM elements for event binding based on attributes starting with "@".
     * Tracks listeners for cleanup during unmount.
     *
     * @param {HTMLElement} container - The container element in which to search for events.
     * @param {Object<string, any>} context - The current context containing event handler definitions.
     * @param {Array<Function>} cleanupListeners - Array to collect cleanup functions for each event listener.
     * @private
     */
    private _processEvents;
    /**
     * Injects scoped styles into the component's container.
     *
     * @param {HTMLElement} container - The container element.
     * @param {string} compName - The component name used to identify the style element.
     * @param {function(Object<string, any>): string} [styleFn] - A function that returns CSS styles as a string.
     * @param {Object<string, any>} context - The current context for style interpolation.
     * @private
     */
    private _injectStyles;
    /**
     * Mounts child components within the parent component's container.
     *
     * @param {HTMLElement} container - The parent container element.
     * @param {Object<string, ComponentDefinition>} [children] - An object mapping child component selectors to their definitions.
     * @param {Array<object>} childInstances - An array to store the mounted child component instances.
     * @private
     */
    private _mountChildren;
}
/**
 * Defines the structure and behavior of a component.
 */
export type ComponentDefinition = {
    /**
     * Optional setup function that initializes the component's reactive state and lifecycle.
     * Receives props and context as an argument and should return an object containing the component's state.
     * Can return either a synchronous object or a Promise that resolves to an object for async initialization.
     */
    setup?: ((arg0: {
        [x: string]: any;
    }) => ({
        [x: string]: any;
    } | Promise<{
        [x: string]: any;
    }>)) | undefined;
    /**
     *           Required function that defines the component's HTML structure.
     *           Receives the merged context (props + setup data) and must return an HTML template string.
     *           Supports dynamic expressions using {{ }} syntax for reactive data binding.
     */
    template: (arg0: {
        [x: string]: any;
    }) => string;
    /**
     * Optional function that defines component-scoped CSS styles.
     * Receives the merged context and returns a CSS string that will be automatically scoped to the component.
     * Styles are injected into the component's container and only affect elements within it.
     */
    style?: ((arg0: {
        [x: string]: any;
    }) => string) | undefined;
    /**
     * Optional object that defines nested child components.
     * Keys are CSS selectors that match elements in the template where child components should be mounted.
     * Values are ComponentDefinition objects that define the structure and behavior of each child component.
     */
    children?: {
        [x: string]: ComponentDefinition;
    } | undefined;
};
//# sourceMappingURL=Eleva.d.ts.map
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
    constructor(name: string, config?: {
        [x: string]: any;
    });
    /** @public {string} The unique identifier name for this Eleva instance */
    public name: string;
    /** @public {Object<string, any>} Optional configuration object for the Eleva instance */
    public config: {
        [x: string]: any;
    };
    /** @public {Emitter} Instance of the event emitter for handling component events */
    public emitter: Emitter;
    /** @public {typeof Signal} Static reference to the Signal class for creating reactive state */
    public signal: typeof Signal;
    /** @public {Renderer} Instance of the renderer for handling DOM updates and patching */
    public renderer: Renderer;
    /** @private {Map<string, ComponentDefinition>} Registry of all component definitions by name */
    private _components;
    /** @private {Map<string, ElevaPlugin>} Collection of installed plugin instances by name */
    private _plugins;
    /** @private {string[]} Array of lifecycle hook names supported by components */
    private _lifecycleHooks;
    /** @private {boolean} Flag indicating if the root component is currently mounted */
    private _isMounted;
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
    public use(plugin: ElevaPlugin, options?: {
        [x: string]: any;
    }): Eleva;
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
    public component(name: string, definition: ComponentDefinition): Eleva;
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
    public mount(container: HTMLElement, compName: string | ComponentDefinition, props?: {
        [x: string]: any;
    }): Promise<MountResult>;
    /**
     * Prepares default no-operation lifecycle hook functions for a component.
     * These hooks will be called at various stages of the component's lifecycle.
     *
     * @private
     * @returns {Object<string, function(): void>} An object mapping lifecycle hook names to empty functions.
     *         The returned object will be merged with the component's context.
     */
    private _prepareLifecycleHooks;
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
    private _processEvents;
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
    private _injectStyles;
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
    private _extractProps;
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
    private _mountComponents;
}
export type ComponentDefinition = {
    /**
     * Optional setup function that initializes the component's state and returns reactive data
     */
    setup?: ((arg0: {
        [x: string]: any;
    }) => ({
        [x: string]: any;
    } | Promise<{
        [x: string]: any;
    }>)) | undefined;
    /**
     *           Required function that defines the component's HTML structure
     */
    template: (arg0: {
        [x: string]: any;
    }) => string | Promise<string>;
    /**
     * Optional function that provides component-scoped CSS styles
     */
    style?: ((arg0: {
        [x: string]: any;
    }) => string) | undefined;
    /**
     * Optional object defining nested child components
     */
    children?: {
        [x: string]: ComponentDefinition;
    } | undefined;
};
export type ElevaPlugin = {
    /**
     *           Function that installs the plugin into the Eleva instance
     */
    install: (arg0: Eleva, arg1: {
        [x: string]: any;
    }) => void;
    /**
     *           Unique identifier name for the plugin
     */
    name: string;
};
export type MountResult = {
    /**
     *           The DOM element where the component is mounted
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data
     */
    data: {
        [x: string]: any;
    };
    /**
     *           Function to clean up and unmount the component
     */
    unmount: () => void;
};
import { Emitter } from "../modules/Emitter.js";
import { Signal } from "../modules/Signal.js";
import { Renderer } from "../modules/Renderer.js";
//# sourceMappingURL=Eleva.d.ts.map
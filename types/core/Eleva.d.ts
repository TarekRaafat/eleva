/**
 * @typedef {Object} ComponentDefinition
 * @property {function(ComponentContext): (Record<string, unknown>|Promise<Record<string, unknown>>)} [setup]
 *           Optional setup function that initializes the component's state and returns reactive data
 * @property {(function(ComponentContext): string|Promise<string>)} template
 *           Required function that defines the component's HTML structure
 * @property {(function(ComponentContext): string)|string} [style]
 *           Optional function or string that provides component-scoped CSS styles
 * @property {Record<string, ComponentDefinition>} [children]
 *           Optional object defining nested child components
 */
/**
 * @typedef {Object} ComponentContext
 * @property {Record<string, unknown>} props
 *           Component properties passed during mounting
 * @property {Emitter} emitter
 *           Event emitter instance for component event handling
 * @property {function<T>(value: T): Signal<T>} signal
 *           Factory function to create reactive Signal instances
 * @property {function(LifecycleHookContext): Promise<void>} [onBeforeMount]
 *           Hook called before component mounting
 * @property {function(LifecycleHookContext): Promise<void>} [onMount]
 *           Hook called after component mounting
 * @property {function(LifecycleHookContext): Promise<void>} [onBeforeUpdate]
 *           Hook called before component update
 * @property {function(LifecycleHookContext): Promise<void>} [onUpdate]
 *           Hook called after component update
 * @property {function(UnmountHookContext): Promise<void>} [onUnmount]
 *           Hook called during component unmounting
 */
/**
 * @typedef {Object} LifecycleHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext} context
 *           The component's reactive state and context data
 */
/**
 * @typedef {Object} UnmountHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext} context
 *           The component's reactive state and context data
 * @property {{
 *   watchers: Array<() => void>,    // Signal watcher cleanup functions
 *   listeners: Array<() => void>,   // Event listener cleanup functions
 *   children: Array<MountResult>    // Child component instances
 * }} cleanup
 *           Object containing cleanup functions and instances
 */
/**
 * @typedef {Object} MountResult
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext} data
 *           The component's reactive state and context data
 * @property {function(): Promise<void>} unmount
 *           Function to clean up and unmount the component
 */
/**
 * @typedef {Object} ElevaPlugin
 * @property {function(Eleva, Record<string, unknown>): void} install
 *           Function that installs the plugin into the Eleva instance
 * @property {string} name
 *           Unique identifier name for the plugin
 */
/**
 * @class 🧩 Eleva
 * @classdesc A modern, signal-based component runtime framework that provides lifecycle hooks,
 * scoped styles, and plugin support. Eleva manages component registration, plugin integration,
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
     * Creates a new Eleva instance with the specified name and configuration.
     *
     * @public
     * @param {string} name - The unique identifier name for this Eleva instance.
     * @param {Record<string, unknown>} [config={}] - Optional configuration object for the instance.
     *        May include framework-wide settings and default behaviors.
     * @throws {Error} If the name is not provided or is not a string.
     * @returns {Eleva} A new Eleva instance.
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
    constructor(name: string, config?: Record<string, unknown>);
    /** @public {string} The unique identifier name for this Eleva instance */
    public name: string;
    /** @public {Object<string, unknown>} Optional configuration object for the Eleva instance */
    public config: Record<string, unknown>;
    /** @public {Emitter} Instance of the event emitter for handling component events */
    public emitter: Emitter;
    /** @public {typeof Signal} Static reference to the Signal class for creating reactive state */
    public signal: typeof Signal;
    /** @public {typeof TemplateEngine} Static reference to the TemplateEngine class for template parsing */
    public templateEngine: typeof TemplateEngine;
    /** @public {Renderer} Instance of the renderer for handling DOM updates and patching */
    public renderer: Renderer;
    /** @private {Map<string, ComponentDefinition>} Registry of all component definitions by name */
    private _components;
    /** @private {Map<string, ElevaPlugin>} Collection of installed plugin instances by name */
    private _plugins;
    /** @private {number} Counter for generating unique component IDs */
    private _componentCounter;
    /**
     * Integrates a plugin with the Eleva framework.
     * The plugin's install function will be called with the Eleva instance and provided options.
     * After installation, the plugin will be available for use by components.
     *
     * Note: Plugins that wrap core methods (e.g., mount) must be uninstalled in reverse order
     * of installation (LIFO - Last In, First Out) to avoid conflicts.
     *
     * @public
     * @param {ElevaPlugin} plugin - The plugin object which must have an `install` function.
     * @param {Object<string, unknown>} [options={}] - Optional configuration options for the plugin.
     * @returns {Eleva} The Eleva instance (for method chaining).
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
    public use(plugin: ElevaPlugin, options?: {
        [x: string]: unknown;
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
     *   style: `button { color: blue; }`
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
     * @param {Object<string, unknown>} [props={}] - Optional properties to pass to the component.
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
        [x: string]: unknown;
    }): Promise<MountResult>;
    /**
     * Processes DOM elements for event binding based on attributes starting with "@".
     * This method handles the event delegation system and ensures proper cleanup of event listeners.
     *
     * @private
     * @param {HTMLElement} container - The container element in which to search for event attributes.
     * @param {ComponentContext} context - The current component context containing event handler definitions.
     * @param {Array<() => void>} listeners - Array to collect cleanup functions for each event listener.
     * @returns {void}
     */
    private _processEvents;
    /**
     * Injects scoped styles into the component's container.
     * The styles are automatically prefixed to prevent style leakage to other components.
     *
     * @private
     * @param {HTMLElement} container - The container element where styles should be injected.
     * @param {string} compId - The component ID used to identify the style element.
     * @param {(function(ComponentContext): string)|string} styleDef - The component's style definition (function or string).
     * @param {ComponentContext} context - The current component context for style interpolation.
     * @returns {void}
     */
    private _injectStyles;
    /**
     * Extracts props from an element's attributes that start with the specified prefix.
     * This method is used to collect component properties from DOM elements.
     *
     * @private
     * @param {HTMLElement} element - The DOM element to extract props from
     * @returns {Record<string, string>} An object containing the extracted props
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
    setup?: ((arg0: ComponentContext) => (Record<string, unknown> | Promise<Record<string, unknown>>)) | undefined;
    /**
     *           Required function that defines the component's HTML structure
     */
    template: ((arg0: ComponentContext) => string | Promise<string>);
    /**
     * Optional function or string that provides component-scoped CSS styles
     */
    style?: string | ((arg0: ComponentContext) => string) | undefined;
    /**
     * Optional object defining nested child components
     */
    children?: Record<string, ComponentDefinition> | undefined;
};
export type ComponentContext = {
    /**
     *           Component properties passed during mounting
     */
    props: Record<string, unknown>;
    /**
     *           Event emitter instance for component event handling
     */
    emitter: Emitter;
    /**
     * <T>(value: T): Signal<T>} signal
     * Factory function to create reactive Signal instances
     */
    "": Function;
    /**
     * Hook called before component mounting
     */
    onBeforeMount?: ((arg0: LifecycleHookContext) => Promise<void>) | undefined;
    /**
     * Hook called after component mounting
     */
    onMount?: ((arg0: LifecycleHookContext) => Promise<void>) | undefined;
    /**
     * Hook called before component update
     */
    onBeforeUpdate?: ((arg0: LifecycleHookContext) => Promise<void>) | undefined;
    /**
     * Hook called after component update
     */
    onUpdate?: ((arg0: LifecycleHookContext) => Promise<void>) | undefined;
    /**
     * Hook called during component unmounting
     */
    onUnmount?: ((arg0: UnmountHookContext) => Promise<void>) | undefined;
};
export type LifecycleHookContext = {
    /**
     *           The DOM element where the component is mounted
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data
     */
    context: ComponentContext;
};
export type UnmountHookContext = {
    /**
     *           The DOM element where the component is mounted
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data
     */
    context: ComponentContext;
    /**
     *           Object containing cleanup functions and instances
     */
    cleanup: {
        watchers: Array<() => void>;
        listeners: Array<() => void>;
        children: Array<MountResult>;
    };
};
export type MountResult = {
    /**
     *           The DOM element where the component is mounted
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data
     */
    data: ComponentContext;
    /**
     *           Function to clean up and unmount the component
     */
    unmount: () => Promise<void>;
};
export type ElevaPlugin = {
    /**
     *           Function that installs the plugin into the Eleva instance
     */
    install: (arg0: Eleva, arg1: Record<string, unknown>) => void;
    /**
     *           Unique identifier name for the plugin
     */
    name: string;
};
import { Emitter } from "../modules/Emitter.js";
import { Signal } from "../modules/Signal.js";
import { TemplateEngine } from "../modules/TemplateEngine.js";
import { Renderer } from "../modules/Renderer.js";
//# sourceMappingURL=Eleva.d.ts.map
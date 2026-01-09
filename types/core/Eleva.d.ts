/**
 * @typedef {Object} ElevaConfig
 * @property {boolean} [debug=false]
 *           Enable debug mode for verbose logging
 * @property {string} [prefix='e']
 *           Prefix for component style scoping
 * @property {boolean} [async=true]
 *           Enable async component setup
 */
/**
 * @typedef {Object} ComponentDefinition
 * @property {SetupFunction} [setup]
 *           Optional setup function that initializes the component's state and returns reactive data
 * @property {TemplateFunction|string} template
 *           Required function or string that defines the component's HTML structure
 * @property {StyleFunction|string} [style]
 *           Optional function or string that provides component-scoped CSS styles
 * @property {ChildrenMap} [children]
 *           Optional object defining nested child components
 */
/**
 * @callback SetupFunction
 * @param {ComponentContext} ctx - The component context with props, emitter, and signal factory
 * @returns {SetupResult|Promise<SetupResult>} Reactive data and lifecycle hooks
 */
/**
 * @typedef {Record<string, unknown> & LifecycleHooks} SetupResult
 *           Data returned from setup function, may include lifecycle hooks
 */
/**
 * @callback TemplateFunction
 * @param {ComponentContext} ctx - The component context
 * @returns {string|Promise<string>} HTML template string
 */
/**
 * @callback StyleFunction
 * @param {ComponentContext} ctx - The component context
 * @returns {string} CSS styles string
 */
/**
 * @typedef {Record<string, ComponentDefinition|string>} ChildrenMap
 *           Map of CSS selectors to component definitions or registered component names
 */
/**
 * @typedef {Object} ComponentContext
 * @property {ComponentProps} props
 *           Component properties passed during mounting
 * @property {Emitter} emitter
 *           Event emitter instance for component event handling
 * @property {SignalFactory} signal
 *           Factory function to create reactive Signal instances
 */
/**
 * @typedef {Record<string, unknown>} ComponentProps
 *           Properties passed to a component during mounting
 */
/**
 * @callback SignalFactory
 * @template T
 * @param {T} initialValue - The initial value for the signal
 * @returns {Signal<T>} A new Signal instance
 */
/**
 * @typedef {Object} LifecycleHooks
 * @property {LifecycleHook} [onBeforeMount]
 *           Hook called before component mounting
 * @property {LifecycleHook} [onMount]
 *           Hook called after component mounting
 * @property {LifecycleHook} [onBeforeUpdate]
 *           Hook called before component update
 * @property {LifecycleHook} [onUpdate]
 *           Hook called after component update
 * @property {UnmountHook} [onUnmount]
 *           Hook called during component unmounting
 */
/**
 * @callback LifecycleHook
 * @param {LifecycleHookContext} ctx - Context with container and component data
 * @returns {void|Promise<void>}
 */
/**
 * @callback UnmountHook
 * @param {UnmountHookContext} ctx - Context with cleanup resources
 * @returns {void|Promise<void>}
 */
/**
 * @typedef {Object} LifecycleHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext & SetupResult} context
 *           The component's reactive state and context data
 */
/**
 * @typedef {Object} UnmountHookContext
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext & SetupResult} context
 *           The component's reactive state and context data
 * @property {CleanupResources} cleanup
 *           Object containing cleanup functions and instances
 */
/**
 * @typedef {Object} CleanupResources
 * @property {Array<UnsubscribeFunction>} watchers
 *           Signal watcher cleanup functions
 * @property {Array<UnsubscribeFunction>} listeners
 *           Event listener cleanup functions
 * @property {Array<MountResult>} children
 *           Child component instances
 */
/**
 * @typedef {Object} MountResult
 * @property {HTMLElement} container
 *           The DOM element where the component is mounted
 * @property {ComponentContext & SetupResult} data
 *           The component's reactive state and context data
 * @property {UnmountFunction} unmount
 *           Function to clean up and unmount the component
 */
/**
 * @callback UnmountFunction
 * @returns {Promise<void>}
 */
/**
 * @callback UnsubscribeFunction
 * @returns {void|boolean}
 */
/**
 * @typedef {Object} ElevaPlugin
 * @property {PluginInstallFunction} install
 *           Function that installs the plugin into the Eleva instance
 * @property {string} name
 *           Unique identifier name for the plugin
 * @property {PluginUninstallFunction} [uninstall]
 *           Optional function to uninstall the plugin
 */
/**
 * @callback PluginInstallFunction
 * @param {Eleva} eleva - The Eleva instance
 * @param {PluginOptions} options - Plugin configuration options
 * @returns {void|Eleva|unknown} Optionally returns the Eleva instance or plugin result
 */
/**
 * @callback PluginUninstallFunction
 * @param {Eleva} eleva - The Eleva instance
 * @returns {void}
 */
/**
 * @typedef {Record<string, unknown>} PluginOptions
 *           Configuration options passed to a plugin during installation
 */
/**
 * @callback EventHandler
 * @param {Event} event - The DOM event object
 * @returns {void}
 */
/**
 * @typedef {'click'|'submit'|'input'|'change'|'focus'|'blur'|'keydown'|'keyup'|'keypress'|'mouseenter'|'mouseleave'|'mouseover'|'mouseout'|'mousedown'|'mouseup'|'touchstart'|'touchend'|'touchmove'|'scroll'|'resize'|'load'|'error'|string} DOMEventName
 *           Common DOM event names (prefixed with @ in templates)
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
     * @throws {Error} If plugin does not have an install function.
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
     * @throws {Error} If name is not a non-empty string or definition has no template.
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
     * @throws {Error} If container is not a DOM element or component is not registered.
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
export type ElevaConfig = {
    /**
     * Enable debug mode for verbose logging
     */
    debug?: boolean | undefined;
    /**
     * Prefix for component style scoping
     */
    prefix?: string | undefined;
    /**
     * Enable async component setup
     */
    async?: boolean | undefined;
};
export type ComponentDefinition = {
    /**
     * Optional setup function that initializes the component's state and returns reactive data
     */
    setup?: SetupFunction | undefined;
    /**
     *           Required function or string that defines the component's HTML structure
     */
    template: TemplateFunction | string;
    /**
     * Optional function or string that provides component-scoped CSS styles
     */
    style?: string | StyleFunction | undefined;
    /**
     * Optional object defining nested child components
     */
    children?: ChildrenMap | undefined;
};
export type SetupFunction = (ctx: ComponentContext) => SetupResult | Promise<SetupResult>;
/**
 * Data returned from setup function, may include lifecycle hooks
 */
export type SetupResult = Record<string, unknown> & LifecycleHooks;
export type TemplateFunction = (ctx: ComponentContext) => string | Promise<string>;
export type StyleFunction = (ctx: ComponentContext) => string;
/**
 * Map of CSS selectors to component definitions or registered component names
 */
export type ChildrenMap = Record<string, ComponentDefinition | string>;
export type ComponentContext = {
    /**
     *           Component properties passed during mounting
     */
    props: ComponentProps;
    /**
     *           Event emitter instance for component event handling
     */
    emitter: Emitter;
    /**
     *           Factory function to create reactive Signal instances
     */
    signal: SignalFactory;
};
/**
 * Properties passed to a component during mounting
 */
export type ComponentProps = Record<string, unknown>;
export type SignalFactory = () => any;
export type LifecycleHooks = {
    /**
     * Hook called before component mounting
     */
    onBeforeMount?: LifecycleHook | undefined;
    /**
     * Hook called after component mounting
     */
    onMount?: LifecycleHook | undefined;
    /**
     * Hook called before component update
     */
    onBeforeUpdate?: LifecycleHook | undefined;
    /**
     * Hook called after component update
     */
    onUpdate?: LifecycleHook | undefined;
    /**
     * Hook called during component unmounting
     */
    onUnmount?: UnmountHook | undefined;
};
export type LifecycleHook = (ctx: LifecycleHookContext) => void | Promise<void>;
export type UnmountHook = (ctx: UnmountHookContext) => void | Promise<void>;
export type LifecycleHookContext = {
    /**
     *           The DOM element where the component is mounted
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data
     */
    context: ComponentContext & SetupResult;
};
export type UnmountHookContext = {
    /**
     *           The DOM element where the component is mounted
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data
     */
    context: ComponentContext & SetupResult;
    /**
     *           Object containing cleanup functions and instances
     */
    cleanup: CleanupResources;
};
export type CleanupResources = {
    /**
     *           Signal watcher cleanup functions
     */
    watchers: Array<UnsubscribeFunction>;
    /**
     *           Event listener cleanup functions
     */
    listeners: Array<UnsubscribeFunction>;
    /**
     *           Child component instances
     */
    children: Array<MountResult>;
};
export type MountResult = {
    /**
     *           The DOM element where the component is mounted
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data
     */
    data: ComponentContext & SetupResult;
    /**
     *           Function to clean up and unmount the component
     */
    unmount: UnmountFunction;
};
export type UnmountFunction = () => Promise<void>;
export type UnsubscribeFunction = () => void | boolean;
export type ElevaPlugin = {
    /**
     *           Function that installs the plugin into the Eleva instance
     */
    install: PluginInstallFunction;
    /**
     *           Unique identifier name for the plugin
     */
    name: string;
    /**
     * Optional function to uninstall the plugin
     */
    uninstall?: PluginUninstallFunction | undefined;
};
export type PluginInstallFunction = (eleva: Eleva, options: PluginOptions) => void | Eleva | unknown;
export type PluginUninstallFunction = (eleva: Eleva) => void;
/**
 * Configuration options passed to a plugin during installation
 */
export type PluginOptions = Record<string, unknown>;
export type EventHandler = (event: Event) => void;
/**
 * Common DOM event names (prefixed with @ in templates)
 */
export type DOMEventName = "click" | "submit" | "input" | "change" | "focus" | "blur" | "keydown" | "keyup" | "keypress" | "mouseenter" | "mouseleave" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "touchstart" | "touchend" | "touchmove" | "scroll" | "resize" | "load" | "error" | string;
import { Emitter } from "../modules/Emitter.js";
import { Signal } from "../modules/Signal.js";
import { TemplateEngine } from "../modules/TemplateEngine.js";
import { Renderer } from "../modules/Renderer.js";
//# sourceMappingURL=Eleva.d.ts.map
/**
 * Configuration options for the Eleva instance (reserved for future use).
 * @typedef {Record<string, unknown>} ElevaConfig
 */
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
     * Creates a new Eleva instance with the specified name and configuration.
     *
     * @public
     * @constructor
     * @param {string} name - The unique identifier name for this Eleva instance.
     * @param {ElevaConfig} [config={}] - Optional configuration object for the instance.
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
    constructor(name: string, config?: ElevaConfig);
    /** @public @readonly {string} The unique identifier name for this Eleva instance */
    public readonly name: string;
    /** @public @readonly {Record<string, unknown>} Configuration object for the Eleva instance */
    public readonly config: ElevaConfig;
    /** @public @readonly {Emitter} Event emitter for handling component events */
    public readonly emitter: Emitter;
    /** @public @readonly {typeof Signal} Signal class for creating reactive state */
    public readonly signal: typeof Signal;
    /** @public @readonly {typeof TemplateEngine} TemplateEngine class for template parsing */
    public readonly templateEngine: typeof TemplateEngine;
    /** @public @readonly {Renderer} Renderer for handling DOM updates and patching */
    public readonly renderer: Renderer;
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
    public use(plugin: ElevaPlugin, options?: PluginOptions): Eleva | unknown;
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
    public component(name: string, definition: ComponentDefinition): Eleva;
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
    public mount(container: HTMLElement, compName: string | ComponentDefinition, props?: ComponentProps): Promise<MountResult>;
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
    private _processEvents;
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
    private _injectStyles;
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
    private _extractProps;
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
    private _mountComponents;
}
/**
 * Configuration options for the Eleva instance (reserved for future use).
 */
export type ElevaConfig = Record<string, unknown>;
/**
 * Component definition object.
 */
export type ComponentDefinition = {
    /**
     * Optional setup function that initializes the component's state and returns reactive data.
     */
    setup?: SetupFunction | undefined;
    /**
     *           Required function or string that defines the component's HTML structure.
     */
    template: TemplateFunction | string;
    /**
     * Optional function or string that provides CSS styles for the component.
     * Styles are preserved across DOM diffs via data-e-style markers.
     */
    style?: string | StyleFunction | undefined;
    /**
     * Optional object defining nested child components.
     */
    children?: ChildrenMap | undefined;
};
/**
 * Setup function that initializes component state.
 */
export type SetupFunction = (ctx: ComponentContext) => SetupResult | Promise<SetupResult>;
/**
 * Data returned from setup function, may include lifecycle hooks.
 */
export type SetupResult = Record<string, unknown> & LifecycleHooks;
/**
 * Template function that returns HTML markup.
 */
export type TemplateFunction = (ctx: ComponentContext & SetupResult) => string | Promise<string>;
/**
 * Style function that returns CSS styles.
 */
export type StyleFunction = (ctx: ComponentContext & SetupResult) => string;
/**
 * Map of CSS selectors to component definitions or registered component names.
 */
export type ChildrenMap = Record<string, ComponentDefinition | string>;
/**
 * Context passed to component setup function.
 */
export type ComponentContext = {
    /**
     *           Component properties passed during mounting.
     */
    props: ComponentProps;
    /**
     *           Event emitter instance for component event handling.
     */
    emitter: Emitter;
    /**
     *           Factory function to create reactive Signal instances.
     */
    signal: SignalFactory;
};
/**
 * Properties passed to a component during mounting.
 */
export type ComponentProps = Record<string, unknown>;
/**
 * Factory function to create reactive Signal instances.
 */
export type SignalFactory = <T>(initialValue: T) => Signal<T>;
/**
 * Lifecycle hooks that can be returned from setup function.
 */
export type LifecycleHooks = {
    /**
     * Called before component mounting.
     */
    onBeforeMount?: LifecycleHook | undefined;
    /**
     * Called after component mounting.
     */
    onMount?: LifecycleHook | undefined;
    /**
     * Called before component update.
     */
    onBeforeUpdate?: LifecycleHook | undefined;
    /**
     * Called after component update.
     */
    onUpdate?: LifecycleHook | undefined;
    /**
     * Called during component unmounting.
     */
    onUnmount?: UnmountHook | undefined;
};
/**
 * Lifecycle hook function.
 */
export type LifecycleHook = (ctx: LifecycleHookContext) => void | Promise<void>;
/**
 * Unmount hook function with cleanup resources.
 */
export type UnmountHook = (ctx: UnmountHookContext) => void | Promise<void>;
/**
 * Context passed to lifecycle hooks.
 */
export type LifecycleHookContext = {
    /**
     *           The DOM element where the component is mounted.
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data.
     */
    context: ComponentContext & SetupResult;
};
/**
 * Context passed to unmount hook with cleanup resources.
 */
export type UnmountHookContext = {
    /**
     *           The DOM element where the component is mounted.
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data.
     */
    context: ComponentContext & SetupResult;
    /**
     *           Object containing cleanup functions and instances.
     */
    cleanup: CleanupResources;
};
/**
 * Resources available for cleanup during unmount.
 */
export type CleanupResources = {
    /**
     *           Signal watcher cleanup functions.
     */
    watchers: UnsubscribeFunction[];
    /**
     *           Event listener cleanup functions.
     */
    listeners: UnsubscribeFunction[];
    /**
     *           Child component instances.
     */
    children: MountResult[];
};
/**
 * Result of mounting a component.
 */
export type MountResult = {
    /**
     *           The DOM element where the component is mounted.
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data.
     */
    data: ComponentContext & SetupResult;
    /**
     *           Function to clean up and unmount the component.
     */
    unmount: UnmountFunction;
};
/**
 * Function to unmount a component and clean up resources.
 */
export type UnmountFunction = () => Promise<void>;
/**
 * Function to unsubscribe from events or watchers.
 */
export type UnsubscribeFunction = () => void | boolean;
/**
 * Plugin interface for extending Eleva.
 */
export type ElevaPlugin = {
    /**
     *           Unique identifier name for the plugin.
     */
    name: string;
    /**
     * Optional version string for the plugin.
     */
    version?: string | undefined;
    /**
     *           Function that installs the plugin.
     */
    install: PluginInstallFunction;
    /**
     * Optional function to uninstall the plugin.
     */
    uninstall?: PluginUninstallFunction | undefined;
};
/**
 * Plugin install function.
 */
export type PluginInstallFunction = (eleva: Eleva, options?: PluginOptions | undefined) => void | Eleva | unknown;
/**
 * Plugin uninstall function.
 */
export type PluginUninstallFunction = (eleva: Eleva) => void | Promise<void>;
/**
 * Configuration options passed to a plugin during installation.
 */
export type PluginOptions = Record<string, unknown>;
/**
 * Handler function for DOM events (e.g., click, input, submit).
 */
export type DOMEventHandler = (event: Event) => void;
/**
 * Common DOM event names (prefixed with @ in templates).
 */
export type DOMEventName = "click" | "submit" | "input" | "change" | "focus" | "blur" | "keydown" | "keyup" | "keypress" | "mouseenter" | "mouseleave" | "mouseover" | "mouseout" | "mousedown" | "mouseup" | "touchstart" | "touchend" | "touchmove" | "scroll" | "resize" | "load" | "error" | string;
import { Emitter } from "../modules/Emitter.js";
import { Signal } from "../modules/Signal.js";
import { TemplateEngine } from "../modules/TemplateEngine.js";
import { Renderer } from "../modules/Renderer.js";
//# sourceMappingURL=Eleva.d.ts.map
/**
 * @class 📡 Emitter
 * @classdesc A robust event emitter that enables inter-component communication through a publish-subscribe pattern.
 * Components can emit events and listen for events from other components, facilitating loose coupling
 * and reactive updates across the application.
 *
 * @example
 * const emitter = new Emitter();
 * emitter.on('user:login', (user) => console.log(`User logged in: ${user.name}`));
 * emitter.emit('user:login', { name: 'John' }); // Logs: "User logged in: John"
 */
declare class Emitter {
    /** @private {Map<string, Set<function(any): void>>} Map of event names to their registered handler functions */
    private _events;
    /**
     * Registers an event handler for the specified event name.
     * The handler will be called with the event data when the event is emitted.
     *
     * @public
     * @param {string} event - The name of the event to listen for.
     * @param {function(any): void} handler - The callback function to invoke when the event occurs.
     * @returns {function(): boolean} A function to unsubscribe the event handler.
     * @example
     * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
     * // Later...
     * unsubscribe(); // Stops listening for the event
     */
    public on(event: string, handler: (arg0: any) => void): () => boolean;
    /**
     * Removes an event handler for the specified event name.
     * If no handler is provided, all handlers for the event are removed.
     *
     * @public
     * @param {string} event - The name of the event.
     * @param {function(any): void} [handler] - The specific handler function to remove.
     * @returns {void}
     */
    public off(event: string, handler?: (arg0: any) => void): void;
    /**
     * Emits an event with the specified data to all registered handlers.
     * Handlers are called synchronously in the order they were registered.
     *
     * @public
     * @param {string} event - The name of the event to emit.
     * @param {...any} args - Optional arguments to pass to the event handlers.
     * @returns {void}
     */
    public emit(event: string, ...args: any[]): void;
}

/**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers when their value changes, enabling efficient DOM updates
 * through targeted patching rather than full re-renders.
 *
 * @example
 * const count = new Signal(0);
 * count.watch((value) => console.log(`Count changed to: ${value}`));
 * count.value = 1; // Logs: "Count changed to: 1"
 */
declare class Signal {
    /**
     * Creates a new Signal instance with the specified initial value.
     *
     * @public
     * @param {*} value - The initial value of the signal.
     */
    constructor(value: any);
    /** @private {T} Internal storage for the signal's current value, where T is the type of the initial value */
    private _value;
    /** @private {Set<function(T): void>} Collection of callback functions to be notified when value changes, where T is the value type */
    private _watchers;
    /** @private {boolean} Flag to prevent multiple synchronous watcher notifications and batch updates into microtasks */
    private _pending;
    /**
     * Sets a new value for the signal and notifies all registered watchers if the value has changed.
     * The notification is batched using microtasks to prevent multiple synchronous updates.
     *
     * @public
     * @param {T} newVal - The new value to set, where T is the type of the initial value.
     * @returns {void}
     */
    public set value(newVal: T);
    /**
     * Gets the current value of the signal.
     *
     * @public
     * @returns {T} The current value, where T is the type of the initial value.
     */
    public get value(): T;
    /**
     * Registers a watcher function that will be called whenever the signal's value changes.
     * The watcher will receive the new value as its argument.
     *
     * @public
     * @param {function(T): void} fn - The callback function to invoke on value change, where T is the value type.
     * @returns {function(): boolean} A function to unsubscribe the watcher.
     * @example
     * const unsubscribe = signal.watch((value) => console.log(value));
     * // Later...
     * unsubscribe(); // Stops watching for changes
     */
    public watch(fn: (arg0: T) => void): () => boolean;
    /**
     * Notifies all registered watchers of a value change using microtask scheduling.
     * Uses a pending flag to batch multiple synchronous updates into a single notification.
     * All watcher callbacks receive the current value when executed.
     *
     * @private
     * @returns {void}
     */
    private _notifyWatchers;
}

/**
 * @class 🎨 Renderer
 * @classdesc A DOM renderer that handles efficient DOM updates through patching and diffing.
 * Provides methods for updating the DOM by comparing new and old structures and applying
 * only the necessary changes, minimizing layout thrashing and improving performance.
 *
 * @example
 * const renderer = new Renderer();
 * const container = document.getElementById("app");
 * const newHtml = "<div>Updated content</div>";
 * renderer.patchDOM(container, newHtml);
 */
declare class Renderer {
    /**
     * Patches the DOM of a container element with new HTML content.
     * This method efficiently updates the DOM by comparing the new content with the existing
     * content and applying only the necessary changes.
     *
     * @public
     * @param {HTMLElement} container - The container element to patch.
     * @param {string} newHtml - The new HTML content to apply.
     * @returns {void}
     * @throws {Error} If container is not an HTMLElement or newHtml is not a string.
     */
    public patchDOM(container: HTMLElement, newHtml: string): void;
    /**
     * Diffs two DOM trees (old and new) and applies updates to the old DOM.
     * This method recursively compares nodes and their attributes, applying only
     * the necessary changes to minimize DOM operations.
     *
     * @private
     * @param {HTMLElement} oldParent - The original DOM element.
     * @param {HTMLElement} newParent - The new DOM element.
     * @returns {void}
     * @throws {Error} If either parent is not an HTMLElement.
     */
    private diff;
    /**
     * Updates the attributes of an element to match those of a new element.
     * Handles special cases for ARIA attributes, data attributes, and boolean properties.
     *
     * @private
     * @param {HTMLElement} oldEl - The element to update.
     * @param {HTMLElement} newEl - The element providing the updated attributes.
     * @returns {void}
     * @throws {Error} If either element is not an HTMLElement.
     */
    private updateAttributes;
}

/**
 * @typedef {Object} ComponentDefinition
 * @property {function(Object<string, any>): (Object<string, any>|Promise<Object<string, any>>)} [setup]
 *           Optional setup function that initializes the component's state and returns reactive data
 * @property {function(Object<string, any>): string} template
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
declare class Eleva {
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
     * Mounts child components within the parent component's container.
     * This method handles the recursive mounting of nested components.
     *
     * @private
     * @param {HTMLElement} container - The parent container element.
     * @param {Object<string, ComponentDefinition>} [children] - Object mapping of child component selectors to their definitions.
     * @param {Array<MountResult>} childInstances - Array to store the mounted child component instances.
     * @returns {void}
     */
    private _mountChildren;
}
type ComponentDefinition = {
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
    }) => string;
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
type ElevaPlugin = {
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
type MountResult = {
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

//# sourceMappingURL=index.d.ts.map

export { Eleva as default };

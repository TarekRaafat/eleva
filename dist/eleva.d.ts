/**
 * @class 📡 Emitter
 * @classdesc A robust event emitter that enables inter-component communication through a publish-subscribe pattern.
 * Components can emit events and listen for events from other components, facilitating loose coupling
 * and reactive updates across the application.
 * Events are handled synchronously in the order they were registered, with proper cleanup
 * of unsubscribed handlers.
 * Event names should follow the format 'namespace:action' (e.g., 'user:login', 'cart:update').
 *
 * @example
 * const emitter = new Emitter();
 * emitter.on('user:login', (user) => console.log(`User logged in: ${user.name}`));
 * emitter.emit('user:login', { name: 'John' }); // Logs: "User logged in: John"
 */
declare class Emitter {
    /** @private {Map<string, Set<(data: unknown) => void>>} Map of event names to their registered handler functions */
    private _events;
    /**
     * Registers an event handler for the specified event name.
     * The handler will be called with the event data when the event is emitted.
     * Event names should follow the format 'namespace:action' for consistency.
     *
     * @public
     * @param {string} event - The name of the event to listen for (e.g., 'user:login').
     * @param {(data: unknown) => void} handler - The callback function to invoke when the event occurs.
     * @returns {() => void} A function to unsubscribe the event handler.
     * @example
     * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
     * // Later...
     * unsubscribe(); // Stops listening for the event
     */
    public on(event: string, handler: (data: unknown) => void): () => void;
    /**
     * Removes an event handler for the specified event name.
     * If no handler is provided, all handlers for the event are removed.
     * Automatically cleans up empty event sets to prevent memory leaks.
     *
     * @public
     * @param {string} event - The name of the event to remove handlers from.
     * @param {(data: unknown) => void} [handler] - The specific handler function to remove.
     * @returns {void}
     * @example
     * // Remove a specific handler
     * emitter.off('user:login', loginHandler);
     * // Remove all handlers for an event
     * emitter.off('user:login');
     */
    public off(event: string, handler?: (data: unknown) => void): void;
    /**
     * Emits an event with the specified data to all registered handlers.
     * Handlers are called synchronously in the order they were registered.
     * If no handlers are registered for the event, the emission is silently ignored.
     *
     * @public
     * @param {string} event - The name of the event to emit.
     * @param {...unknown} args - Optional arguments to pass to the event handlers.
     * @returns {void}
     * @example
     * // Emit an event with data
     * emitter.emit('user:login', { name: 'John', role: 'admin' });
     * // Emit an event with multiple arguments
     * emitter.emit('cart:update', { items: [] }, { total: 0 });
     */
    public emit(event: string, ...args: unknown[]): void;
}

/**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers when their value changes, enabling efficient DOM updates
 * through targeted patching rather than full re-renders.
 * Updates are batched using microtasks to prevent multiple synchronous notifications.
 * The class is generic, allowing type-safe handling of any value type T.
 *
 * @example
 * const count = new Signal(0);
 * count.watch((value) => console.log(`Count changed to: ${value}`));
 * count.value = 1; // Logs: "Count changed to: 1"
 * @template T
 */
declare class Signal<T> {
    /**
     * Creates a new Signal instance with the specified initial value.
     *
     * @public
     * @param {T} value - The initial value of the signal.
     */
    constructor(value: T);
    /** @private {T} Internal storage for the signal's current value */
    private _value;
    /** @private {Set<(value: T) => void>} Collection of callback functions to be notified when value changes */
    private _watchers;
    /** @private {boolean} Flag to prevent multiple synchronous watcher notifications and batch updates into microtasks */
    private _pending;
    /**
     * Sets a new value for the signal and notifies all registered watchers if the value has changed.
     * The notification is batched using microtasks to prevent multiple synchronous updates.
     *
     * @public
     * @param {T} newVal - The new value to set.
     * @returns {void}
     */
    public set value(newVal: T);
    /**
     * Gets the current value of the signal.
     *
     * @public
     * @returns {T} The current value.
     */
    public get value(): T;
    /**
     * Registers a watcher function that will be called whenever the signal's value changes.
     * The watcher will receive the new value as its argument.
     *
     * @public
     * @param {(value: T) => void} fn - The callback function to invoke on value change.
     * @returns {() => boolean} A function to unsubscribe the watcher.
     * @example
     * const unsubscribe = signal.watch((value) => console.log(value));
     * // Later...
     * unsubscribe(); // Stops watching for changes
     */
    public watch(fn: (value: T) => void): () => boolean;
    /**
     * Notifies all registered watchers of a value change using microtask scheduling.
     * Uses a pending flag to batch multiple synchronous updates into a single notification.
     * All watcher callbacks receive the current value when executed.
     *
     * @private
     * @returns {void}
     */
    private _notify;
}

/**
 * @class 🎨 Renderer
 * @classdesc A high-performance DOM renderer that implements an optimized direct DOM diffing algorithm.
 *
 * Key features:
 * - Single-pass diffing algorithm for efficient DOM updates
 * - Key-based node reconciliation for optimal performance
 * - Intelligent attribute handling for ARIA, data attributes, and boolean properties
 * - Preservation of special Eleva-managed instances and style elements
 * - Memory-efficient with reusable temporary containers
 *
 * The renderer is designed to minimize DOM operations while maintaining
 * exact attribute synchronization and proper node identity preservation.
 * It's particularly optimized for frequent updates and complex DOM structures.
 *
 * @example
 * const renderer = new Renderer();
 * const container = document.getElementById("app");
 * const newHtml = "<div>Updated content</div>";
 * renderer.patchDOM(container, newHtml);
 */
declare class Renderer {
    /**
     * A temporary container to hold the new HTML content while diffing.
     * @private
     * @type {HTMLElement}
     */
    private _tempContainer;
    /**
     * Patches the DOM of the given container with the provided HTML string.
     *
     * @public
     * @param {HTMLElement} container - The container element to patch.
     * @param {string} newHtml - The new HTML string.
     * @returns {void}
     * @throws {TypeError} If container is not an HTMLElement or newHtml is not a string.
     * @throws {Error} If DOM patching fails.
     */
    public patchDOM(container: HTMLElement, newHtml: string): void;
    /**
     * Performs a diff between two DOM nodes and patches the old node to match the new node.
     *
     * @private
     * @param {HTMLElement} oldParent - The original DOM element.
     * @param {HTMLElement} newParent - The new DOM element.
     * @returns {void}
     */
    private _diff;
    /**
     * Patches a single node.
     *
     * @private
     * @param {Node} oldNode - The original DOM node.
     * @param {Node} newNode - The new DOM node.
     * @returns {void}
     */
    private _patchNode;
    /**
     * Removes a node from its parent.
     *
     * @private
     * @param {HTMLElement} parent - The parent element containing the node to remove.
     * @param {Node} node - The node to remove.
     * @returns {void}
     */
    private _removeNode;
    /**
     * Updates the attributes of an element to match a new element's attributes.
     *
     * @private
     * @param {HTMLElement} oldEl - The original element to update.
     * @param {HTMLElement} newEl - The new element to update.
     * @returns {void}
     */
    private _updateAttributes;
    /**
     * Determines if two nodes are the same based on their type, name, and key attributes.
     *
     * @private
     * @param {Node} oldNode - The first node to compare.
     * @param {Node} newNode - The second node to compare.
     * @returns {boolean} True if the nodes are considered the same, false otherwise.
     */
    private _isSameNode;
    /**
     * Creates a key map for the children of a parent node.
     *
     * @private
     * @param {Array<Node>} children - The children of the parent node.
     * @param {number} start - The start index of the children.
     * @param {number} end - The end index of the children.
     * @returns {Map<string, Node>} A key map for the children.
     */
    private _createKeyMap;
    /**
     * Extracts the key attribute from a node if it exists.
     *
     * @private
     * @param {Node} node - The node to extract the key from.
     * @returns {string|null} The key attribute value or null if not found.
     */
    private _getNodeKey;
}

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
declare class Eleva {
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
    /** @public {Renderer} Instance of the renderer for handling DOM updates and patching */
    public renderer: Renderer;
    /** @private {Map<string, ComponentDefinition>} Registry of all component definitions by name */
    private _components;
    /** @private {Map<string, ElevaPlugin>} Collection of installed plugin instances by name */
    private _plugins;
    /** @private {boolean} Flag indicating if the root component is currently mounted */
    private _isMounted;
    /** @private {number} Counter for generating unique component IDs */
    private _componentCounter;
    /**
     * Integrates a plugin with the Eleva framework.
     * The plugin's install function will be called with the Eleva instance and provided options.
     * After installation, the plugin will be available for use by components.
     *
     * @public
     * @param {ElevaPlugin} plugin - The plugin object which must have an `install` function.
     * @param {Object<string, unknown>} [options={}] - Optional configuration options for the plugin.
     * @returns {Eleva} The Eleva instance (for method chaining).
     * @example
     * app.use(myPlugin, { option1: "value1" });
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
type ComponentDefinition = {
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
type ComponentContext = {
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
type LifecycleHookContext = {
    /**
     *           The DOM element where the component is mounted
     */
    container: HTMLElement;
    /**
     *           The component's reactive state and context data
     */
    context: ComponentContext;
};
type UnmountHookContext = {
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
type MountResult = {
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
type ElevaPlugin = {
    /**
     *           Function that installs the plugin into the Eleva instance
     */
    install: (arg0: Eleva, arg1: Record<string, unknown>) => void;
    /**
     *           Unique identifier name for the plugin
     */
    name: string;
};

//# sourceMappingURL=index.d.ts.map

export { Eleva as default };

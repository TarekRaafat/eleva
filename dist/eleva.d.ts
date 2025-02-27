/**
 * @class 🎙️ Emitter
 * @classdesc Robust inter-component communication with event bubbling.
 * Implements a basic publish-subscribe pattern for event handling, allowing components
 * to communicate through custom events.
 */
declare class Emitter {
    /** @type {Object.<string, Function[]>} */
    events: {
        [x: string]: Function[];
    };
    /**
     * Registers an event handler for the specified event.
     *
     * @param {string} event - The name of the event.
     * @param {function(...any): void} handler - The function to call when the event is emitted.
     */
    on(event: string, handler: (...args: any[]) => void): void;
    /**
     * Removes a previously registered event handler.
     *
     * @param {string} event - The name of the event.
     * @param {function(...any): void} handler - The handler function to remove.
     */
    off(event: string, handler: (...args: any[]) => void): void;
    /**
     * Emits an event, invoking all handlers registered for that event.
     *
     * @param {string} event - The event name.
     * @param {...any} args - Additional arguments to pass to the event handlers.
     */
    emit(event: string, ...args: any[]): void;
}

/**
 * @class 🎨 Renderer
 * @classdesc Handles DOM patching, diffing, and attribute updates.
 * Provides methods for efficient DOM updates by diffing the new and old DOM structures
 * and applying only the necessary changes.
 */
declare class Renderer {
    /**
     * Patches the DOM of a container element with new HTML content.
     *
     * @param {HTMLElement} container - The container element to patch.
     * @param {string} newHtml - The new HTML content to apply.
     */
    patchDOM(container: HTMLElement, newHtml: string): void;
    /**
     * Diffs two DOM trees (old and new) and applies updates to the old DOM.
     *
     * @param {HTMLElement} oldParent - The original DOM element.
     * @param {HTMLElement} newParent - The new DOM element.
     */
    diff(oldParent: HTMLElement, newParent: HTMLElement): void;
    /**
     * Updates the attributes of an element to match those of a new element.
     *
     * @param {HTMLElement} oldEl - The element to update.
     * @param {HTMLElement} newEl - The element providing the updated attributes.
     */
    updateAttributes(oldEl: HTMLElement, newEl: HTMLElement): void;
}

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
declare class Eleva {
    /**
     * Creates a new Eleva instance.
     *
     * @param {string} name - The name of the Eleva instance.
     * @param {Object<string, any>} [config={}] - Optional configuration for the instance.
     */
    constructor(name: string, config?: {
        [x: string]: any;
    });
    /** @type {string} */
    name: string;
    /** @type {Object<string, any>} */
    config: {
        [x: string]: any;
    };
    /** @type {Object<string, ComponentDefinition>} */
    _components: {
        [x: string]: ComponentDefinition;
    };
    /** @type {Array<Object>} */
    _plugins: Array<Object>;
    /** @private */
    private _lifecycleHooks;
    /** @private {boolean} */
    private _isMounted;
    emitter: Emitter;
    renderer: Renderer;
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
     *
     * @param {HTMLElement} container - The container element in which to search for events.
     * @param {Object<string, any>} context - The current context containing event handler definitions.
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
type ComponentDefinition = {
    /**
     * A setup function that initializes the component state and returns an object or a promise that resolves to an object.
     */
    setup?: ((arg0: {
        [x: string]: any;
    }) => ({
        [x: string]: any;
    } | Promise<{
        [x: string]: any;
    }>)) | undefined;
    /**
     *           A function that returns the HTML template string for the component.
     */
    template: (arg0: {
        [x: string]: any;
    }) => string;
    /**
     * An optional function that returns scoped CSS styles as a string.
     */
    style?: ((arg0: {
        [x: string]: any;
    }) => string) | undefined;
    /**
     * An optional mapping of CSS selectors to child component definitions.
     */
    children?: {
        [x: string]: ComponentDefinition;
    } | undefined;
};

//# sourceMappingURL=index.d.ts.map

export { Eleva as default };

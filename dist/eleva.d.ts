/**
 * 🎙️ Emitter: Robust inter-component communication with event bubbling.
 *
 * Implements a basic publish-subscribe pattern for event handling,
 * allowing components to communicate through custom events.
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
     * @param {Function} handler - The function to call when the event is emitted.
     */
    on(event: string, handler: Function): void;
    /**
     * Removes a previously registered event handler.
     *
     * @param {string} event - The name of the event.
     * @param {Function} handler - The handler function to remove.
     */
    off(event: string, handler: Function): void;
    /**
     * Emits an event, invoking all handlers registered for that event.
     *
     * @param {string} event - The event name.
     * @param {...*} args - Additional arguments to pass to the event handlers.
     */
    emit(event: string, ...args: any[]): void;
}

/**
 * 🎨 Renderer: Handles DOM patching, diffing, and attribute updates.
 *
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
 * 🧩 Eleva Core: Signal-based component runtime framework with lifecycle, scoped styles, and plugins.
 *
 * The Eleva class is the core of the framework. It manages component registration,
 * plugin integration, lifecycle hooks, event handling, and DOM rendering.
 */
declare class Eleva {
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

//# sourceMappingURL=index.d.ts.map

export { Eleva as default };

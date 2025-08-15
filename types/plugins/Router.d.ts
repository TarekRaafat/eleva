export type RouterPlugin = {
    /**
     * - The plugin name.
     */
    name: string;
    /**
     * - The plugin version.
     */
    version?: string | undefined;
    /**
     * - The install function that receives the router instance.
     */
    install: Function;
    /**
     * - Optional cleanup function called when the router is destroyed.
     */
    destroy?: Function | undefined;
};
export namespace RouterPlugin {
    let name: string;
    let version: string;
    let description: string;
    /**
     * Installs the RouterPlugin into an Eleva instance.
     *
     * @param {Eleva} eleva - The Eleva instance
     * @param {RouterOptions} options - Router configuration options
     * @param {string} options.mount - A CSS selector for the main element where the app is mounted
     * @param {RouteDefinition[]} options.routes - An array of route definitions
     * @param {'hash' | 'query' | 'history'} [options.mode='hash'] - The routing mode
     * @param {string} [options.queryParam='page'] - The query parameter to use in 'query' mode
     * @param {string} [options.viewSelector='view'] - The selector for the view element within a layout
     * @param {boolean} [options.autoStart=true] - Whether to start the router automatically
     * @param {NavigationGuard} [options.onBeforeEach] - A global guard executed before every navigation
     * @param {string | ComponentDefinition | (() => Promise<{default: ComponentDefinition}>)} [options.globalLayout] - A global layout for all routes
     *
     * @example
     * // main.js
     * import Eleva from './eleva.js';
     * import { RouterPlugin } from './plugins/RouterPlugin.js';
     *
     * const app = new Eleva('myApp');
     *
     * const HomePage = { template: () => `<h1>Home</h1>` };
     * const AboutPage = { template: () => `<h1>About Us</h1>` };
     *
     * app.use(RouterPlugin, {
     *  mount: '#app',
     *  routes: [
     *    { path: '/', component: HomePage },
     *    { path: '/about', component: AboutPage }
     *  ]
     * });
     */
    function install(eleva: Eleva, options?: RouterOptions): Router;
    /**
     * Uninstalls the plugin from the Eleva instance
     *
     * @param {Eleva} eleva - The Eleva instance
     */
    function uninstall(eleva: Eleva): Promise<void>;
}
export type Eleva = any;
export type Signal = any;
export type ComponentDefinition = any;
export type RouteLocation = {
    /**
     * - The path of the route (e.g., '/users/123').
     */
    path: string;
    /**
     * - An object representing the query parameters.
     */
    query: {
        [x: string]: string;
    };
    /**
     * - The complete URL including hash, path, and query string.
     */
    fullUrl: string;
    /**
     * - An object containing dynamic route parameters.
     */
    params: {
        [x: string]: string;
    };
    /**
     * - The meta object associated with the matched route.
     */
    meta: {
        [x: string]: any;
    };
    /**
     * - The optional name of the matched route.
     */
    name?: string | undefined;
    /**
     * - The raw route definition object that was matched.
     */
    matched: RouteDefinition;
};
/**
 * A function that acts as a guard for navigation. It runs *before* the navigation is confirmed.
 * It can return:
 * - `true` or `undefined`: to allow navigation.
 * - `false`: to abort the navigation.
 * - a `string` (path) or a `location object`: to redirect to a new route.
 */
export type NavigationGuard = (to: RouteLocation, from: RouteLocation | null) => boolean | string | {
    path: string;
} | void | Promise<boolean | string | {
    path: string;
} | void>;
/**
 * A function that acts as a lifecycle hook, typically for side effects. It does not affect navigation flow.
 */
export type NavigationHook = (...args: any[]) => void | Promise<void>;
export type RouteDefinition = {
    /**
     * - The URL path pattern (e.g., '/', '/about', '/users/:id', '*').
     */
    path: string;
    /**
     * - The component to render. Can be a registered name, a definition object, or an async import function.
     */
    component: string | ComponentDefinition | (() => Promise<{
        default: ComponentDefinition;
    }>);
    /**
     * - An optional layout component to wrap the route's component.
     */
    layout?: string | ComponentDefinition | (() => Promise<{
        default: ComponentDefinition;
    }>);
    /**
     * - An optional name for the route.
     */
    name?: string | undefined;
    /**
     * - Optional metadata for the route (e.g., for titles, auth flags).
     */
    meta?: {
        [x: string]: any;
    } | undefined;
    /**
     * - A route-specific guard executed before entering the route.
     */
    beforeEnter?: NavigationGuard | undefined;
    /**
     * - A hook executed *after* the route has been entered and the new component is mounted.
     */
    afterEnter?: NavigationHook | undefined;
    /**
     * - A guard executed *before* leaving the current route.
     */
    beforeLeave?: NavigationGuard | undefined;
    /**
     * - A hook executed *after* leaving the current route and its component has been unmounted.
     */
    afterLeave?: NavigationHook | undefined;
};
export type RouterOptions = {
    /**
     * - A CSS selector for the main element where the app is mounted.
     */
    mount: string;
    /**
     * - An array of route definitions.
     */
    routes: RouteDefinition[];
    /**
     * - The routing mode.
     */
    mode?: "hash" | "query" | "history" | undefined;
    /**
     * - The query parameter to use in 'query' mode.
     */
    queryParam?: string | undefined;
    /**
     * - The selector for the view element within a layout.
     */
    viewSelector?: string | undefined;
    /**
     * - Whether to start the router automatically.
     */
    autoStart?: boolean | undefined;
    /**
     * - A global guard executed before every navigation.
     */
    onBeforeEach?: NavigationGuard | undefined;
    /**
     * - A global layout for all routes. Can be overridden by a route's specific layout.
     */
    globalLayout?: string | ComponentDefinition | (() => Promise<{
        default: ComponentDefinition;
    }>);
};
/**
 * @typedef {Object} RouteLocation
 * @property {string} path - The path of the route (e.g., '/users/123').
 * @property {Object<string, string>} query - An object representing the query parameters.
 * @property {string} fullUrl - The complete URL including hash, path, and query string.
 * @property {Object<string, string>} params - An object containing dynamic route parameters.
 * @property {Object<string, any>} meta - The meta object associated with the matched route.
 * @property {string} [name] - The optional name of the matched route.
 * @property {RouteDefinition} matched - The raw route definition object that was matched.
 */
/**
 * @typedef {(to: RouteLocation, from: RouteLocation | null) => boolean | string | {path: string} | void | Promise<boolean | string | {path: string} | void>} NavigationGuard
 * A function that acts as a guard for navigation. It runs *before* the navigation is confirmed.
 * It can return:
 * - `true` or `undefined`: to allow navigation.
 * - `false`: to abort the navigation.
 * - a `string` (path) or a `location object`: to redirect to a new route.
 */
/**
 * @typedef {(...args: any[]) => void | Promise<void>} NavigationHook
 * A function that acts as a lifecycle hook, typically for side effects. It does not affect navigation flow.
 */
/**
 * @typedef {Object} RouterPlugin
 * @property {string} name - The plugin name.
 * @property {string} [version] - The plugin version.
 * @property {Function} install - The install function that receives the router instance.
 * @property {Function} [destroy] - Optional cleanup function called when the router is destroyed.
 */
/**
 * @typedef {Object} RouteDefinition
 * @property {string} path - The URL path pattern (e.g., '/', '/about', '/users/:id', '*').
 * @property {string | ComponentDefinition | (() => Promise<{default: ComponentDefinition}>)} component - The component to render. Can be a registered name, a definition object, or an async import function.
 * @property {string | ComponentDefinition | (() => Promise<{default: ComponentDefinition}>)} [layout] - An optional layout component to wrap the route's component.
 * @property {string} [name] - An optional name for the route.
 * @property {Object<string, any>} [meta] - Optional metadata for the route (e.g., for titles, auth flags).
 * @property {NavigationGuard} [beforeEnter] - A route-specific guard executed before entering the route.
 * @property {NavigationHook} [afterEnter] - A hook executed *after* the route has been entered and the new component is mounted.
 * @property {NavigationGuard} [beforeLeave] - A guard executed *before* leaving the current route.
 * @property {NavigationHook} [afterLeave] - A hook executed *after* leaving the current route and its component has been unmounted.
 */
/**
 * @class Router
 * @classdesc A powerful, reactive, and flexible Router Plugin for Eleva.js.
 * This class manages all routing logic, including state, navigation, and rendering.
 * @private
 */
declare class Router {
    /**
     * Creates an instance of the Router.
     * @param {Eleva} eleva - The Eleva framework instance.
     * @param {RouterOptions} options - The configuration options for the router.
     */
    constructor(eleva: Eleva, options?: RouterOptions);
    /** @type {Eleva} The Eleva framework instance. */
    eleva: Eleva;
    /** @type {RouterOptions} The merged router options. */
    options: RouterOptions;
    /** @private @type {RouteDefinition[]} The processed list of route definitions. */
    private routes;
    /** @private @type {import('eleva').Emitter} The shared Eleva event emitter for global hooks. */
    private emitter;
    /** @private @type {boolean} A flag indicating if the router has been started. */
    private isStarted;
    /** @private @type {boolean} A flag to prevent navigation loops from history events. */
    private _isNavigating;
    /** @private @type {Array<() => void>} A collection of cleanup functions for event listeners. */
    private eventListeners;
    /** @type {Signal<RouteLocation | null>} A reactive signal holding the current route's information. */
    currentRoute: Signal<RouteLocation | null>;
    /** @type {Signal<RouteLocation | null>} A reactive signal holding the previous route's information. */
    previousRoute: Signal<RouteLocation | null>;
    /** @type {Signal<Object<string, string>>} A reactive signal holding the current route's parameters. */
    currentParams: Signal<{
        [x: string]: string;
    }>;
    /** @type {Signal<Object<string, string>>} A reactive signal holding the current route's query parameters. */
    currentQuery: Signal<{
        [x: string]: string;
    }>;
    /** @type {Signal<import('eleva').MountResult | null>} A reactive signal for the currently mounted layout instance. */
    currentLayout: Signal<any | null>;
    /** @type {Signal<import('eleva').MountResult | null>} A reactive signal for the currently mounted view (page) instance. */
    currentView: Signal<any | null>;
    /** @private @type {Map<string, RouterPlugin>} Map of registered plugins by name. */
    private plugins;
    /** @type {Object} The error handler instance. Can be overridden by plugins. */
    errorHandler: Object;
    /**
     * Validates the provided router options.
     * @private
     * @throws {Error} If the routing mode is invalid.
     */
    private _validateOptions;
    /**
     * Pre-processes route definitions to parse their path segments for efficient matching.
     * @private
     * @param {RouteDefinition[]} routes - The raw route definitions.
     * @returns {RouteDefinition[]} The processed routes.
     */
    private _processRoutes;
    /**
     * Parses a route path string into an array of static and parameter segments.
     * @private
     * @param {string} path - The path pattern to parse.
     * @returns {Array<{type: 'static' | 'param', value?: string, name?: string}>} An array of segment objects.
     * @throws {Error} If the route path is not a valid string.
     */
    private _parsePathIntoSegments;
    /**
     * Finds the view element within a container using multiple selector strategies.
     * @private
     * @param {HTMLElement} container - The parent element to search within.
     * @returns {HTMLElement} The found view element or the container itself as a fallback.
     */
    private _findViewElement;
    /**
     * Starts the router, initializes event listeners, and performs the initial navigation.
     * @returns {Promise<void>}
     */
    start(): Promise<void>;
    /**
     * Stops the router and cleans up all event listeners and mounted components.
     * @returns {Promise<void>}
     */
    destroy(): Promise<void>;
    /**
     * Programmatically navigates to a new route.
     * @param {string | {path: string, query?: object, params?: object, replace?: boolean, state?: object}} location - The target location as a string or object.
     * @param {object} [params] - Optional route parameters (for string-based location).
     * @returns {Promise<void>}
     */
    navigate(location: string | {
        path: string;
        query?: object;
        params?: object;
        replace?: boolean;
        state?: object;
    }, params?: object): Promise<void>;
    /**
     * Builds a URL for query mode.
     * @private
     * @param {string} path - The path to set as the query parameter.
     * @returns {string} The full URL with the updated query string.
     */
    private _buildQueryUrl;
    /**
     * Checks if the target route is identical to the current route.
     * @private
     * @param {string} path - The target path with query string.
     * @param {object} params - The target params.
     * @param {object} query - The target query.
     * @returns {boolean} - True if the routes are the same.
     */
    private _isSameRoute;
    /**
     * Injects dynamic parameters into a path string.
     * @private
     */
    private _buildPath;
    /**
     * The handler for browser-initiated route changes (e.g., back/forward buttons).
     * @private
     */
    private _handleRouteChange;
    /**
     * Manages the core navigation lifecycle. Runs guards before committing changes.
     * @private
     * @param {string} fullPath - The full path (e.g., '/users/123?foo=bar') to navigate to.
     * @returns {Promise<boolean>} - `true` if navigation succeeded, `false` if aborted.
     */
    private _proceedWithNavigation;
    /**
     * Executes all applicable navigation guards for a transition in order.
     * @private
     * @returns {Promise<boolean>} - `false` if navigation should be aborted.
     */
    private _runGuards;
    /**
     * Resolves a string component definition to a component object.
     * @private
     * @param {string} def - The component name to resolve.
     * @returns {ComponentDefinition} The resolved component.
     * @throws {Error} If the component is not registered.
     */
    private _resolveStringComponent;
    /**
     * Resolves a function component definition to a component object.
     * @private
     * @param {Function} def - The function to resolve.
     * @returns {Promise<ComponentDefinition>} The resolved component.
     * @throws {Error} If the function fails to load the component.
     */
    private _resolveFunctionComponent;
    /**
     * Validates a component definition object.
     * @private
     * @param {any} def - The component definition to validate.
     * @returns {ComponentDefinition} The validated component.
     * @throws {Error} If the component definition is invalid.
     */
    private _validateComponentDefinition;
    /**
     * Resolves a component definition to a component object.
     * @private
     * @param {any} def - The component definition to resolve.
     * @returns {Promise<ComponentDefinition | null>} The resolved component or null.
     */
    private _resolveComponent;
    /**
     * Asynchronously resolves the layout and page components for a route.
     * @private
     * @param {RouteDefinition} route - The route to resolve components for.
     * @returns {Promise<{layoutComponent: ComponentDefinition | null, pageComponent: ComponentDefinition}>}
     */
    private _resolveComponents;
    /**
     * Renders the components for the current route into the DOM.
     * @private
     * @param {ComponentDefinition | null} layoutComponent - The pre-loaded layout component.
     * @param {ComponentDefinition} pageComponent - The pre-loaded page component.
     */
    private _render;
    /**
     * Creates a getter function for router context properties.
     * @private
     * @param {string} property - The property name to access.
     * @param {any} defaultValue - The default value if property is undefined.
     * @returns {Function} A getter function.
     */
    private _createRouteGetter;
    /**
     * Wraps a component definition to inject router-specific context into its setup function.
     * @private
     * @param {ComponentDefinition} component - The component to wrap.
     * @returns {ComponentDefinition} The wrapped component definition.
     */
    private _wrapComponent;
    /**
     * Recursively wraps all child components to ensure they have access to router context.
     * @private
     * @param {ComponentDefinition} component - The component to wrap.
     * @returns {ComponentDefinition} The wrapped component definition.
     */
    private _wrapComponentWithChildren;
    /**
     * Gets the current location information from the browser's window object.
     * @private
     * @returns {Omit<RouteLocation, 'params' | 'meta' | 'name' | 'matched'>}
     */
    private _getCurrentLocation;
    /**
     * Parses a query string into a key-value object.
     * @private
     */
    private _parseQuery;
    /**
     * Matches a given path against the registered routes.
     * @private
     * @param {string} path - The path to match.
     * @returns {{route: RouteDefinition, params: Object<string, string>} | null} The matched route and its params, or null.
     */
    private _matchRoute;
    /** Registers a global pre-navigation guard. */
    onBeforeEach(guard: any): void;
    /** Registers a global hook that runs after a new route component has been mounted *if* the route has an `afterEnter` hook. */
    onAfterEnter(hook: any): void;
    /** Registers a global hook that runs after a route component has been unmounted *if* the route has an `afterLeave` hook. */
    onAfterLeave(hook: any): void;
    /** Registers a global hook that runs after a navigation has been confirmed and all hooks have completed. */
    onAfterEach(hook: any): void;
    /** Registers a global error handler for navigation. */
    onError(handler: any): void;
    /**
     * Registers a plugin with the router.
     * @param {RouterPlugin} plugin - The plugin to register.
     */
    use(plugin: RouterPlugin, options?: {}): void;
    /**
     * Gets all registered plugins.
     * @returns {RouterPlugin[]} Array of registered plugins.
     */
    getPlugins(): RouterPlugin[];
    /**
     * Gets a plugin by name.
     * @param {string} name - The plugin name.
     * @returns {RouterPlugin | undefined} The plugin or undefined.
     */
    getPlugin(name: string): RouterPlugin | undefined;
    /**
     * Removes a plugin from the router.
     * @param {string} name - The plugin name.
     * @returns {boolean} True if the plugin was removed.
     */
    removePlugin(name: string): boolean;
    /**
     * Sets a custom error handler. Used by error handling plugins.
     * @param {Object} errorHandler - The error handler object with handle, warn, and log methods.
     */
    setErrorHandler(errorHandler: Object): void;
}
export {};
//# sourceMappingURL=Router.d.ts.map
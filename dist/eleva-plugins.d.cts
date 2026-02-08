import * as eleva from 'eleva';

declare namespace AttrPlugin {
    let name: string;
    let version: string;
    let description: string;
    /**
     * Installs the plugin into the Eleva instance.
     *
     * @public
     * Method wrapping behavior:
     * - Stores original `_patchNode` in `renderer._originalPatchNode`
     * - Overrides `renderer._patchNode` to use enhanced attribute handling
     * - Adds `renderer.updateAttributes` and `eleva.updateElementAttributes` helpers
     * - Call `uninstall()` to restore original behavior
     *
     * @param {Eleva} eleva - The Eleva instance to enhance.
     * @param {AttrPluginOptions} options - Plugin configuration options.
     * @param {boolean} [options.enableAria=true] - Enable ARIA attribute handling.
     *        Maps aria-* attributes to DOM properties (e.g., aria-expanded → ariaExpanded).
     * @param {boolean} [options.enableData=true] - Enable data attribute handling.
     *        Syncs data-* attributes with element.dataset for consistent access.
     * @param {boolean} [options.enableBoolean=true] - Enable boolean attribute handling.
     *        Treats empty strings and attribute names as true, "false" string as false.
     * @param {boolean} [options.enableDynamic=true] - Enable dynamic property detection.
     *        Searches element prototype chain for property matches (useful for custom elements).
     * @returns {void}
     * @example
     * // Basic installation with defaults
     * app.use(AttrPlugin);
     *
     * @example
     * // Custom configuration
     * app.use(AttrPlugin, {
     *   enableAria: true,
     *   enableData: true,
     *   enableBoolean: true,
     *   enableDynamic: false  // Disable for performance
     * });
     *
     * @example
     * // Using ARIA attributes in templates
     * template: (ctx) => `
     *   <div role="dialog" aria-modal="true" aria-labelledby="title">
     *     <h2 id="title">Modal Title</h2>
     *     <button aria-expanded="${ctx.isOpen.value}">Toggle</button>
     *   </div>
     * `
     * @see uninstall - Remove the plugin and restore original behavior.
     */
    function install(eleva: Eleva$3, options?: AttrPluginOptions): void;
    /**
     * Uninstalls the plugin from the Eleva instance.
     *
     * @public
     * @param {Eleva} eleva - The Eleva instance.
     * @returns {void}
     * @description
     * Restores the original renderer patching behavior and removes
     * `eleva.updateElementAttributes`.
     * @example
     * // Uninstall the plugin
     * AttrPlugin.uninstall(app);
     * @see install - Install the plugin.
     */
    function uninstall(eleva: Eleva$3): void;
}

/**
 * Type imports from the Eleva core library.
 */
type Eleva$3 = eleva.Eleva;
/**
 * Configuration options for the AttrPlugin.
 */
type AttrPluginOptions = {
    /**
     * Enable ARIA attribute handling.
     */
    enableAria?: boolean | undefined;
    /**
     * Enable data attribute handling.
     */
    enableData?: boolean | undefined;
    /**
     * Enable boolean attribute handling.
     */
    enableBoolean?: boolean | undefined;
    /**
     * Enable dynamic property detection.
     */
    enableDynamic?: boolean | undefined;
};

/**
 * Interface for router plugins.
 */
type RouterPlugin = {
    /**
     *           Unique plugin identifier.
     */
    name: string;
    /**
     * Plugin version (recommended to match router version).
     */
    version?: string | undefined;
    /**
     *           Installation function.
     */
    install: (router: Router, options?: Record<string, unknown>) => void;
    /**
     * Cleanup function called on router.destroy().
     */
    destroy?: ((router: Router) => void | Promise<void>) | undefined;
};
declare namespace RouterPlugin {
    let name: string;
    let version: string;
    let description: string;
    /**
     * Installs the RouterPlugin into an Eleva instance.
     *
     * @public
     * @param {Eleva} eleva - The Eleva instance.
     * @param {RouterOptions} options - Router configuration options.
     * @param {string} options.mount - A CSS selector for the main element where the app is mounted.
     * @param {RouteDefinition[]} options.routes - An array of route definitions.
     * @param {'hash' | 'query' | 'history'} [options.mode='hash'] - The routing mode.
     * @param {string} [options.queryParam='view'] - The query parameter to use in 'query' mode.
     * @param {string} [options.viewSelector='view'] - Base selector for the view element (matched as #id, .class, [data-*], or raw selector).
     * @param {boolean} [options.autoStart=true] - Whether to start the router automatically.
     * @param {NavigationGuard} [options.onBeforeEach] - A global guard executed before every navigation.
     * @param {RouteComponent} [options.globalLayout] - A global layout for all routes.
     * @returns {Router} The created router instance.
     * @throws {Error} If 'mount' option is not provided.
     * @throws {Error} If 'routes' option is not an array.
     * @throws {Error} If component registration fails during route processing.
     * @description
     * Registers route/layout components, sets `eleva.router`, and adds helpers
     * (`eleva.navigate`, `eleva.getCurrentRoute`, `eleva.getRouteParams`, `eleva.getRouteQuery`).
     * When `autoStart` is enabled, startup is scheduled via microtask.
     *
     * @example
     * // main.js
     * import Eleva from 'eleva';
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
    function install(eleva: Eleva$2, options?: RouterOptions): Router;
    /**
     * Uninstalls the plugin from the Eleva instance.
     *
     * @public
     * @async
     * @param {Eleva} eleva - The Eleva instance.
     * @returns {Promise<void>}
     * @description
     * Destroys the router instance, removes `eleva.router`, and deletes helper methods
     * (`eleva.navigate`, `eleva.getCurrentRoute`, `eleva.getRouteParams`, `eleva.getRouteQuery`).
     */
    function uninstall(eleva: Eleva$2): Promise<void>;
}

/**
 * Type imports from the Eleva core library.
 */
type Eleva$2 = eleva.Eleva;
/**
 * Type imports from the Eleva core library.
 */
type ComponentDefinition = eleva.ComponentDefinition;
/**
 * Type imports from the Eleva core library.
 */
type MountResult = eleva.MountResult;
/**
 * Generic type import.
 */
type Signal$2<T> = eleva.Signal<T>;
/**
 * The routing mode determines how the router manages URL state.
 * - `hash`: Uses URL hash (e.g., `/#/path`) - works without server config
 * - `history`: Uses HTML5 History API (e.g., `/path`) - requires server config
 * - `query`: Uses query parameters (e.g., `?view=/path`) - useful for embedded apps
 */
type RouterMode = "hash" | "history" | "query";
/**
 * Route parameters extracted from the URL path.
 */
type RouteParams = Record<string, string>;
/**
 * Query parameters from the URL query string.
 */
type QueryParams = Record<string, string>;
/**
 * Navigation input parameters supporting multiple value types.
 */
type NavigationParams = Record<string, string | number | boolean>;
/**
 * Router configuration options.
 */
type RouterOptions = {
    /**
     * The routing mode to use.
     */
    mode?: RouterMode | undefined;
    /**
     * Query parameter name for 'query' mode.
     */
    queryParam?: string | undefined;
    /**
     * Base selector for the view element.
     */
    viewSelector?: string | undefined;
    /**
     *           CSS selector for the mount point element.
     */
    mount: string;
    /**
     *           Array of route definitions.
     */
    routes: RouteDefinition[];
    /**
     * Default layout for all routes.
     */
    globalLayout?: RouteComponent | undefined;
    /**
     * Global navigation guard.
     */
    onBeforeEach?: NavigationGuard | undefined;
    /**
     * Whether to start the router automatically.
     */
    autoStart?: boolean | undefined;
};
/**
 * Object describing a navigation target for `router.navigate()`.
 */
type NavigationTarget = {
    /**
     *           The target path (can include params like '/users/:id').
     */
    path: string;
    /**
     * Route parameters to inject.
     */
    params?: NavigationParams | undefined;
    /**
     * Query parameters to append.
     */
    query?: NavigationParams | undefined;
    /**
     * Whether to replace current history entry.
     */
    replace?: boolean | undefined;
    /**
     * History state to pass.
     */
    state?: unknown;
};
/**
 * Internal representation of a parsed route path segment.
 */
type RouteSegment = {
    /**
     *           The segment type.
     */
    type: "static" | "param";
    /**
     * The segment value (static segments).
     */
    value?: string | undefined;
    /**
     * The parameter name (param segments).
     */
    name?: string | undefined;
};
/**
 * Arbitrary metadata attached to routes for use in guards and components.
 */
type RouteMeta = Record<string, unknown>;
/**
 * Interface for the router's error handling system.
 */
type RouterErrorHandler = {
    /**
     *           Throws a formatted error.
     */
    handle: (error: Error, context: string, details?: Record<string, unknown>) => void;
    /**
     *           Logs a warning.
     */
    warn: (message: string, details?: Record<string, unknown>) => void;
    /**
     *           Logs an error without throwing.
     */
    log: (message: string, error: Error, details?: Record<string, unknown>) => void;
};
/**
 * Represents the current or target location in the router.
 */
type RouteLocation = {
    /**
     *           The path of the route (e.g., '/users/123').
     */
    path: string;
    /**
     *           Query parameters as key-value pairs.
     */
    query: QueryParams;
    /**
     *           The routed URL string (path plus query).
     */
    fullUrl: string;
    /**
     *           Dynamic route parameters.
     */
    params: RouteParams;
    /**
     *           Metadata associated with the matched route.
     */
    meta: RouteMeta;
    /**
     * The optional name of the matched route.
     */
    name?: string | undefined;
    /**
     *           The raw route definition that was matched.
     */
    matched: RouteDefinition;
};
/**
 * Return value of a navigation guard.
 * - `true` or `undefined/void`: Allow navigation
 * - `false`: Abort navigation
 * - `string`: Redirect to path
 * - `NavigationTarget`: Redirect with options
 */
type NavigationGuardResult = boolean | string | NavigationTarget | void;
/**
 * Navigation guard function that controls navigation flow.
 */
type NavigationGuard = (to: RouteLocation, from: RouteLocation | null) => NavigationGuardResult | Promise<NavigationGuardResult>;
/**
 * Navigation hook for side effects. Does not affect navigation flow.
 */
type NavigationHook = (to: RouteLocation, from: RouteLocation | null) => void | Promise<void>;
/**
 * A component that can be rendered for a route.
 * - `string`: Name of a registered component
 * - `ComponentDefinition`: Inline component definition
 * - `() => ComponentDefinition`: Factory function returning a component
 * - `() => Promise<ComponentDefinition>`: Async factory function
 * - `() => Promise<{default: ComponentDefinition}>`: Lazy-loaded module (e.g., `() => import('./Page.js')`)
 */
type RouteComponent = string | ComponentDefinition | (() => ComponentDefinition | Promise<ComponentDefinition | {
    default: ComponentDefinition;
}>);
/**
 * Defines a route in the application.
 */
type RouteDefinition = {
    /**
     *           URL path pattern. Supports:
     *           - Static: '/about'
     *           - Dynamic params: '/users/:id'
     *           - Wildcard: '*' (catch-all, conventionally last)
     */
    path: string;
    /**
     *           The component to render for this route.
     */
    component: RouteComponent;
    /**
     * Optional layout component to wrap the route component.
     */
    layout?: RouteComponent | undefined;
    /**
     * Optional route name for programmatic navigation.
     */
    name?: string | undefined;
    /**
     * Optional metadata (auth flags, titles, etc.).
     */
    meta?: RouteMeta | undefined;
    /**
     * Route-specific guard before entering.
     */
    beforeEnter?: NavigationGuard | undefined;
    /**
     * Hook after entering and component is mounted.
     */
    afterEnter?: NavigationHook | undefined;
    /**
     * Guard before leaving this route.
     */
    beforeLeave?: NavigationGuard | undefined;
    /**
     * Hook after leaving and component is unmounted.
     */
    afterLeave?: NavigationHook | undefined;
    /**
     * Internal: parsed path segments (added by router).
     */
    segments?: RouteSegment[] | undefined;
};
/**
 * Represents the current or target location in the router.
 * @typedef {Object} RouteLocation
 * @property {string} path
 *           The path of the route (e.g., '/users/123').
 * @property {QueryParams} query
 *           Query parameters as key-value pairs.
 * @property {string} fullUrl
 *           The routed URL string (path plus query).
 * @property {RouteParams} params
 *           Dynamic route parameters.
 * @property {RouteMeta} meta
 *           Metadata associated with the matched route.
 * @property {string} [name]
 *           The optional name of the matched route.
 * @property {RouteDefinition} matched
 *           The raw route definition that was matched.
 * @description Represents the current or target location in the router.
 */
/**
 * Return value of a navigation guard.
 * - `true` or `undefined/void`: Allow navigation
 * - `false`: Abort navigation
 * - `string`: Redirect to path
 * - `NavigationTarget`: Redirect with options
 * @typedef {boolean | string | NavigationTarget | void} NavigationGuardResult
 */
/**
 * Navigation guard function that controls navigation flow.
 * @callback NavigationGuard
 * @param {RouteLocation} to
 *        The target route location.
 * @param {RouteLocation | null} from
 *        The source route location (null on initial).
 * @returns {NavigationGuardResult | Promise<NavigationGuardResult>}
 * @description A function that controls navigation flow. Runs before navigation is confirmed.
 * @example
 * // Simple auth guard
 * const authGuard = (to, from) => {
 *   if (to.meta.requiresAuth && !isLoggedIn()) {
 *     return '/login'; // Redirect
 *   }
 *   // Allow navigation (implicit return undefined)
 * };
 */
/**
 * Navigation hook for side effects. Does not affect navigation flow.
 * @callback NavigationHook
 * @param {RouteLocation} to
 *        The target route location.
 * @param {RouteLocation | null} from
 *        The source route location.
 * @returns {void | Promise<void>}
 * @description A lifecycle hook for side effects. Does not affect navigation flow.
 * @example
 * // Analytics hook
 * const analyticsHook = (to, from) => {
 *   analytics.trackPageView(to.path);
 * };
 */
/**
 * Interface for router plugins.
 * @typedef {Object} RouterPlugin
 * @property {string} name
 *           Unique plugin identifier.
 * @property {string} [version]
 *           Plugin version (recommended to match router version).
 * @property {(router: Router, options?: Record<string, unknown>) => void} install
 *           Installation function.
 * @property {(router: Router) => void | Promise<void>} [destroy]
 *           Cleanup function called on router.destroy().
 * @description Interface for router plugins. Plugins can extend router functionality.
 * @example
 * const AnalyticsPlugin = {
 *   name: 'analytics',
 *   version: '1.0.0',
 *   install(router, options) {
 *     router.emitter.on('router:afterEach', (to, from) => {
 *       analytics.track(to.path);
 *     });
 *   }
 * };
 */
/**
 * Context object for navigation events that plugins can modify.
 * @typedef {Object} NavigationContext
 * @property {RouteLocation} to
 *           The target route location.
 * @property {RouteLocation | null} from
 *           The source route location.
 * @property {boolean} cancelled
 *           Whether navigation has been cancelled.
 * @property {string | NavigationTarget | null} redirectTo
 *           Redirect target if set.
 * @description Passed to navigation events. Plugins can modify to control navigation flow.
 */
/**
 * Context object for component resolution events.
 * @typedef {Object} ResolveContext
 * @property {RouteLocation} to
 *           The target route location.
 * @property {RouteLocation | null} from
 *           The source route location.
 * @property {RouteDefinition} route
 *           The matched route definition.
 * @property {ComponentDefinition | null} layoutComponent
 *           The resolved layout component (available in afterResolve).
 * @property {ComponentDefinition | null} pageComponent
 *           The resolved page component (available in afterResolve).
 * @property {boolean} cancelled
 *           Whether navigation has been cancelled.
 * @property {string | NavigationTarget | null} redirectTo
 *           Redirect target if set.
 * @description Passed to component resolution events.
 */
/**
 * Context object for render events.
 * @typedef {Object} RenderContext
 * @property {RouteLocation} to
 *           The target route location.
 * @property {RouteLocation | null} from
 *           The source route location.
 * @property {ComponentDefinition | null} layoutComponent
 *           The layout component being rendered.
 * @property {ComponentDefinition} pageComponent
 *           The page component being rendered.
 * @description Passed to render events.
 */
/**
 * Context object for scroll events.
 * @typedef {Object} ScrollContext
 * @property {RouteLocation} to
 *           The target route location.
 * @property {RouteLocation | null} from
 *           The source route location.
 * @property {{x: number, y: number} | null} savedPosition
 *           Saved position (back/forward nav).
 * @description Passed to scroll events for plugins to handle scroll behavior.
 */
/**
 * A component that can be rendered for a route.
 * - `string`: Name of a registered component
 * - `ComponentDefinition`: Inline component definition
 * - `() => ComponentDefinition`: Factory function returning a component
 * - `() => Promise<ComponentDefinition>`: Async factory function
 * - `() => Promise<{default: ComponentDefinition}>`: Lazy-loaded module (e.g., `() => import('./Page.js')`)
 * @typedef {string | ComponentDefinition | (() => ComponentDefinition | Promise<ComponentDefinition | {default: ComponentDefinition}>)} RouteComponent
 */
/**
 * Defines a route in the application.
 * @typedef {Object} RouteDefinition
 * @property {string} path
 *           URL path pattern. Supports:
 *           - Static: '/about'
 *           - Dynamic params: '/users/:id'
 *           - Wildcard: '*' (catch-all, conventionally last)
 * @property {RouteComponent} component
 *           The component to render for this route.
 * @property {RouteComponent} [layout]
 *           Optional layout component to wrap the route component.
 * @property {string} [name]
 *           Optional route name for programmatic navigation.
 * @property {RouteMeta} [meta]
 *           Optional metadata (auth flags, titles, etc.).
 * @property {NavigationGuard} [beforeEnter]
 *           Route-specific guard before entering.
 * @property {NavigationHook} [afterEnter]
 *           Hook after entering and component is mounted.
 * @property {NavigationGuard} [beforeLeave]
 *           Guard before leaving this route.
 * @property {NavigationHook} [afterLeave]
 *           Hook after leaving and component is unmounted.
 * @property {RouteSegment[]} [segments]
 *           Internal: parsed path segments (added by router).
 * @description Defines a route in the application.
 * @note Nested routes are not supported. Use shared layouts with flat routes instead.
 * @example
 * // Static route
 * { path: '/about', component: AboutPage }
 *
 * // Dynamic route with params
 * { path: '/users/:id', component: UserPage, meta: { requiresAuth: true } }
 *
 * // Lazy-loaded route with layout
 * {
 *   path: '/dashboard',
 *   component: () => import('./Dashboard.js'),
 *   layout: DashboardLayout,
 *   beforeEnter: (to, from) => isLoggedIn() || '/login'
 * }
 *
 * // Catch-all 404 route (conventionally last)
 * { path: '*', component: NotFoundPage }
 */
/**
 * @class 🛤️ Router
 * @classdesc A powerful, reactive, and flexible Router Plugin for Eleva.
 * This class manages all routing logic, including state, navigation, and rendering.
 *
 * ## Features
 * - Multiple routing modes (hash, history, query)
 * - Reactive route state via Signals
 * - Navigation guards and lifecycle hooks
 * - Lazy-loaded components
 * - Layout system
 * - Plugin architecture
 * - Scroll position management
 *
 * ## Events Reference
 * | Event | Callback Type | Can Block | Description |
 * |-------|--------------|-----------|-------------|
 * | `router:ready` | {@link RouterReadyCallback} | No | Router initialized |
 * | `router:beforeEach` | {@link NavigationContextCallback} | Yes | Before guards run |
 * | `router:beforeResolve` | {@link ResolveContextCallback} | Yes | Before component loading |
 * | `router:afterResolve` | {@link ResolveContextCallback} | No | After components loaded |
 * | `router:afterLeave` | {@link RouteChangeCallback} | No | After leaving route |
 * | `router:beforeRender` | {@link RenderContextCallback} | No | Before DOM update |
 * | `router:afterRender` | {@link RenderContextCallback} | No | After DOM update |
 * | `router:scroll` | {@link ScrollContextCallback} | No | For scroll behavior |
 * | `router:afterEnter` | {@link RouteChangeCallback} | No | After entering route |
 * | `router:afterEach` | {@link RouteChangeCallback} | No | Navigation complete |
 * | `router:error` | {@link RouterErrorCallback} | No | Navigation error |
 * | `router:routeAdded` | {@link RouteAddedCallback} | No | Dynamic route added |
 * | `router:routeRemoved` | {@link RouteRemovedCallback} | No | Dynamic route removed |
 *
 * ## Reactive Signals
 * - `currentRoute: Signal<RouteLocation | null>` - Current route info
 * - `previousRoute: Signal<RouteLocation | null>` - Previous route info
 * - `currentParams: Signal<RouteParams>` - Current route params
 * - `currentQuery: Signal<QueryParams>` - Current query params
 * - `currentLayout: Signal<MountResult | null>` - Mounted layout instance
 * - `currentView: Signal<MountResult | null>` - Mounted view instance
 * - `isReady: Signal<boolean>` - Router readiness state
 *
 * @note Internal API Access Policy:
 * As a core Eleva plugin, the Router may access internal Eleva APIs (prefixed with _)
 * such as `eleva._components`. This is intentional and these internal APIs are
 * considered stable for official plugins. Third-party plugins should avoid
 * accessing internal APIs as they may change without notice.
 *
 * @example
 * // Basic setup
 * const router = new Router(eleva, {
 *   mode: 'hash',
 *   mount: '#app',
 *   routes: [
 *     { path: '/', component: HomePage },
 *     { path: '/users/:id', component: UserPage },
 *     { path: '*', component: NotFoundPage }
 *   ]
 * });
 *
 * // Start router
 * await router.start();
 *
 * // Navigate programmatically
 * const success = await router.navigate('/users/123');
 *
 * // Watch for route changes
 * router.currentRoute.watch((route) => {
 *   document.title = route?.meta?.title || 'My App';
 * });
 *
 * @private
 */
declare class Router {
    /**
     * Creates an instance of the Router.
     * @param {Eleva} eleva - The Eleva framework instance.
     * @param {RouterOptions} options - The configuration options for the router.
     * @throws {Error} If the routing mode is invalid.
     */
    constructor(eleva: Eleva$2, options?: RouterOptions);
    /** @type {Eleva} The Eleva framework instance. */
    eleva: Eleva$2;
    /** @type {RouterOptions} The merged router options. */
    options: RouterOptions;
    /** @private @type {RouteDefinition[]} The processed list of route definitions. */
    private routes;
    /** @private @type {Emitter} The shared Eleva event emitter for global hooks. */
    private emitter;
    /** @private @type {boolean} A flag indicating if the router has been started. */
    private isStarted;
    /** @private @type {boolean} A flag to prevent navigation loops from history events. */
    private _isNavigating;
    /** @private @type {number} Counter for tracking navigation operations to prevent race conditions. */
    private _navigationId;
    /** @private @type {UnsubscribeFunction[]} A collection of cleanup functions for event listeners. */
    private eventListeners;
    /** @type {Signal<RouteLocation | null>} A reactive signal holding the current route's information. */
    currentRoute: Signal$2<RouteLocation | null>;
    /** @type {Signal<RouteLocation | null>} A reactive signal holding the previous route's information. */
    previousRoute: Signal$2<RouteLocation | null>;
    /** @type {Signal<RouteParams>} A reactive signal holding the current route's parameters. */
    currentParams: Signal$2<RouteParams>;
    /** @type {Signal<QueryParams>} A reactive signal holding the current route's query parameters. */
    currentQuery: Signal$2<QueryParams>;
    /** @type {Signal<MountResult | null>} A reactive signal for the currently mounted layout instance. */
    currentLayout: Signal$2<MountResult | null>;
    /** @type {Signal<MountResult | null>} A reactive signal for the currently mounted view (page) instance. */
    currentView: Signal$2<MountResult | null>;
    /** @type {Signal<boolean>} A reactive signal indicating if the router is ready (started and initial navigation complete). */
    isReady: Signal$2<boolean>;
    /** @private @type {Map<string, RouterPlugin>} Map of registered plugins by name. */
    private plugins;
    /** @private @type {NavigationGuard[]} Array of global before-each navigation guards. */
    private _beforeEachGuards;
    /** @type {RouterErrorHandler} The error handler instance. Can be overridden by plugins. */
    errorHandler: RouterErrorHandler;
    /** @private @type {Map<string, {x: number, y: number}>} Saved scroll positions by route path. */
    private _scrollPositions;
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
     * @returns {{type: 'static' | 'param', value?: string, name?: string}[]} An array of segment objects.
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
     * @returns {Promise<Router>} The router instance for method chaining.
     * @listens window:hashchange In hash mode, triggers route changes.
     * @listens window:popstate In history/query mode, triggers route changes.
     * @emits router:ready When initialization completes successfully.
     * @see destroy - Stop the router and clean up listeners.
     * @see navigate - Programmatically navigate to a route.
     *
     * @example
     * // Basic usage
     * await router.start();
     *
     * // Method chaining
     * await router.start().then(r => r.navigate('/home'));
     *
     * // Reactive readiness
     * router.isReady.watch((ready) => {
     *   if (ready) console.log('Router is ready!');
     * });
     */
    start(): Promise<Router>;
    /**
     * Stops the router and cleans up event listeners.
     * Unmounts the current layout instance if present.
     * @async
     * @returns {Promise<void>}
     * @see start - Restart the router after destroying.
     */
    destroy(): Promise<void>;
    /**
     * Alias for destroy(). Stops the router and cleans up all resources.
     * Provided for semantic consistency (start/stop pattern).
     * @async
     * @returns {Promise<void>}
     *
     * @example
     * await router.start();
     * // ... later
     * await router.stop();
     */
    stop(): Promise<void>;
    /**
     * Programmatically navigates to a new route.
     * @async
     * @param {string | NavigationTarget} location - The target location as a path string or navigation target object.
     * @param {NavigationParams} [params] - Route parameters (only used when location is a string).
     * @returns {Promise<boolean>} True if navigation succeeded, false if blocked by guards or failed.
     * @emits router:error When navigation fails due to an exception.
     * @see start - Initialize the router before navigating.
     * @see currentRoute - Access the current route after navigation.
     *
     * @example
     * // Basic navigation
     * await router.navigate('/users/123');
     *
     * // Check if navigation succeeded
     * const success = await router.navigate('/protected');
     * if (!success) {
     *   console.log('Navigation was blocked by a guard');
     * }
     *
     * // Navigate with options
     * await router.navigate({
     *   path: '/users/:id',
     *   params: { id: '123' },
     *   query: { tab: 'profile' },
     *   replace: true
     * });
     */
    navigate(location: string | NavigationTarget, params?: NavigationParams): Promise<boolean>;
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
     * @returns {boolean} True if the routes are the same.
     */
    private _isSameRoute;
    /**
     * Injects dynamic parameters into a path string.
     * Replaces `:param` placeholders with URL-encoded values from the params object.
     *
     * @private
     * @param {string} path - The path pattern containing `:param` placeholders.
     * @param {RouteParams} params - Key-value pairs to inject into the path.
     * @returns {string} The path with all parameters replaced.
     *
     * @example
     * this._buildPath('/users/:id/posts/:postId', { id: '123', postId: '456' });
     * // Returns: '/users/123/posts/456'
     */
    private _buildPath;
    /**
     * The handler for browser-initiated route changes (e.g., back/forward buttons).
     *
     * @private
     * @async
     * @param {boolean} [isPopState=true] - Whether this is a popstate event (back/forward navigation).
     * @returns {Promise<void>}
     * @emits router:error When route change handling fails.
     */
    private _handleRouteChange;
    /**
     * Manages the core navigation lifecycle. Runs guards before committing changes.
     *
     * @private
     * @async
     * @param {string} fullPath - The full path (e.g., '/users/123?foo=bar') to navigate to.
     * @param {boolean} [isPopState=false] - Whether this navigation was triggered by popstate (back/forward).
     * @returns {Promise<boolean>} `true` if navigation succeeded, `false` if aborted.
     * @emits router:error When no matching route is found (and no catch-all route exists),
     * or when an error occurs during navigation.
     * @emits router:beforeResolve Before component resolution (can block/redirect).
     * @emits router:afterResolve After components are resolved.
     * @emits router:afterLeave After leaving the previous route.
     * @emits router:beforeRender Before DOM rendering.
     * @emits router:afterRender After DOM rendering completes.
     * @emits router:scroll After render, for scroll behavior handling.
     * @emits router:afterEnter After entering the new route.
     * @emits router:afterEach After navigation completes successfully.
     * @see _runGuards - Guard execution.
     * @see _resolveComponents - Component resolution.
     * @see _render - DOM rendering.
     */
    private _proceedWithNavigation;
    /**
     * Executes all applicable navigation guards for a transition in order.
     * Guards are executed in the following order:
     * 1. Global beforeEach event (emitter-based, can block via context)
     * 2. Global beforeEach guards (registered via onBeforeEach)
     * 3. Route-specific beforeLeave guard (from the route being left)
     * 4. Route-specific beforeEnter guard (from the route being entered)
     *
     * @private
     * @param {RouteLocation} to - The target route location.
     * @param {RouteLocation | null} from - The current route location (null on initial navigation).
     * @param {RouteDefinition} route - The matched route definition.
     * @returns {Promise<boolean>} `false` if navigation should be aborted.
     * @emits router:beforeEach Before guards run (can block/redirect via context).
     */
    private _runGuards;
    /**
     * Resolves a string component definition to a component object.
     * @private
     * @param {string} def - The component name to resolve.
     * @returns {ComponentDefinition} The resolved component.
     * @throws {Error} If the component is not registered.
     *
     * @note Core plugins (Router, Attr, Store) may access eleva._components
     * directly. This is intentional and stable for official Eleva plugins shipped
     * with the framework. Third-party plugins should use eleva.component() for
     * registration and avoid direct access to internal APIs.
     */
    private _resolveStringComponent;
    /**
     * Resolves a function component definition to a component object.
     * @private
     * @async
     * @param {() => ComponentDefinition | Promise<ComponentDefinition | { default: ComponentDefinition }>} def - The function to resolve.
     * @returns {Promise<ComponentDefinition>} The resolved component.
     * @throws {Error} If the function fails to load the component.
     */
    private _resolveFunctionComponent;
    /**
     * Validates a component definition object.
     * @private
     * @param {unknown} def - The component definition to validate.
     * @returns {ComponentDefinition} The validated component.
     * @throws {Error} If the component definition is invalid.
     */
    private _validateComponentDefinition;
    /**
     * Resolves a component definition to a component object.
     * @private
     * @param {unknown} def - The component definition to resolve.
     * @returns {Promise<ComponentDefinition | null>} The resolved component or null.
     */
    private _resolveComponent;
    /**
     * Asynchronously resolves the layout and page components for a route.
     * @private
     * @async
     * @param {RouteDefinition} route - The route to resolve components for.
     * @returns {Promise<{layoutComponent: ComponentDefinition | null, pageComponent: ComponentDefinition}>}
     * @throws {Error} If page component cannot be resolved.
     */
    private _resolveComponents;
    /**
     * Renders the components for the current route into the DOM.
     *
     * Rendering algorithm:
     * 1. Find the mount element using options.mount selector
     * 2. If layoutComponent exists:
     *    a. Mount layout to mount element
     *    b. Find view element within layout (using viewSelector)
     *    c. Mount page component to view element
     * 3. If no layoutComponent:
     *    a. Mount page component directly to mount element
     *    b. Set currentLayout to null
     *
     * @private
     * @async
     * @param {ComponentDefinition | null} layoutComponent - The pre-loaded layout component.
     * @param {ComponentDefinition} pageComponent - The pre-loaded page component.
     * @returns {Promise<void>}
     * @throws {Error} If mount element is not found in the DOM.
     * @throws {Error} If component mounting fails (propagated from eleva.mount).
     */
    private _render;
    /**
     * Creates a getter function for router context properties.
     * @private
     * @param {string} property - The property name to access.
     * @param {unknown} defaultValue - The default value if property is undefined.
     * @returns {() => unknown} A getter function.
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
     * String component references are returned as-is (context injected during mount).
     * Objects are wrapped with router context and their children are recursively wrapped.
     *
     * @private
     * @param {ComponentDefinition | string} component - The component to wrap (can be a definition object or a registered component name).
     * @returns {ComponentDefinition | string} The wrapped component definition or the original string reference.
     * @see _wrapComponent - Single component wrapping.
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
     * Uses URLSearchParams for robust parsing of encoded values.
     *
     * @private
     * @param {string} queryString - The query string to parse (without leading '?').
     * @returns {QueryParams} Key-value pairs from the query string.
     *
     * @example
     * this._parseQuery('foo=bar&baz=qux');
     * // Returns: { foo: 'bar', baz: 'qux' }
     */
    private _parseQuery;
    /**
     * Matches a given path against the registered routes.
     * @private
     * @param {string} path - The path to match.
     * @returns {{route: RouteDefinition, params: Object<string, string>} | null} The matched route and its params, or null.
     */
    private _matchRoute;
    /**
     * Adds a new route dynamically at runtime.
     * The route will be processed and available for navigation immediately.
     * Routes are inserted before the wildcard (*) route if one exists.
     *
     * @param {RouteDefinition} route - The route definition to add.
     * @param {RouteDefinition} [parentRoute] - Optional parent route to add as a child (not yet implemented).
     * @returns {() => void} A function to remove the added route (returns no-op if route was invalid).
     * @emits router:routeAdded When a route is successfully added.
     *
     * @example
     * // Add a route dynamically
     * const removeRoute = router.addRoute({
     *   path: '/dynamic',
     *   component: DynamicPage,
     *   meta: { title: 'Dynamic Page' }
     * });
     *
     * // Later, remove the route
     * removeRoute();
     */
    addRoute(route: RouteDefinition, parentRoute?: RouteDefinition): () => void;
    /**
     * Removes a route by its path.
     *
     * @param {string} path - The path of the route to remove.
     * @returns {boolean} True if the route was removed, false if not found.
     * @emits router:routeRemoved When a route is successfully removed.
     *
     * @example
     * router.removeRoute('/dynamic');
     */
    removeRoute(path: string): boolean;
    /**
     * Checks if a route with the given path exists.
     *
     * @param {string} path - The path to check.
     * @returns {boolean} True if the route exists.
     *
     * @example
     * if (router.hasRoute('/users/:id')) {
     *   console.log('User route exists');
     * }
     */
    hasRoute(path: string): boolean;
    /**
     * Gets all registered routes.
     *
     * @returns {RouteDefinition[]} A copy of the routes array.
     *
     * @example
     * const routes = router.getRoutes();
     * console.log('Available routes:', routes.map(r => r.path));
     */
    getRoutes(): RouteDefinition[];
    /**
     * Gets a route by its path.
     *
     * @param {string} path - The path of the route to get.
     * @returns {RouteDefinition | undefined} The route definition or undefined.
     *
     * @example
     * const route = router.getRoute('/users/:id');
     * if (route) {
     *   console.log('Route meta:', route.meta);
     * }
     */
    getRoute(path: string): RouteDefinition | undefined;
    /**
     * Registers a global pre-navigation guard.
     * Multiple guards can be registered and will be executed in order.
     * Guards can also be registered via the emitter using `router:beforeEach` event.
     *
     * @param {NavigationGuard} guard - The guard function to register.
     * @returns {() => void} A function to unregister the guard.
     *
     * @example
     * // Register a guard
     * const unregister = router.onBeforeEach((to, from) => {
     *   if (to.meta.requiresAuth && !isAuthenticated()) {
     *     return '/login';
     *   }
     * });
     *
     * // Later, unregister the guard
     * unregister();
     */
    onBeforeEach(guard: NavigationGuard): () => void;
    /**
     * Registers a global hook that runs after a new route component has been mounted.
     * @param {NavigationHook} hook - The hook function to register.
     * @returns {() => void} A function to unregister the hook.
     * @listens router:afterEnter
     */
    onAfterEnter(hook: NavigationHook): () => void;
    /**
     * Registers a global hook that runs after a route component has been unmounted.
     * @param {NavigationHook} hook - The hook function to register.
     * @returns {() => void} A function to unregister the hook.
     * @listens router:afterLeave
     */
    onAfterLeave(hook: NavigationHook): () => void;
    /**
     * Registers a global hook that runs after a navigation has been confirmed and all hooks have completed.
     * @param {NavigationHook} hook - The hook function to register.
     * @returns {() => void} A function to unregister the hook.
     * @listens router:afterEach
     */
    onAfterEach(hook: NavigationHook): () => void;
    /**
     * Registers a global error handler for navigation errors.
     * @param {(error: Error, to?: RouteLocation, from?: RouteLocation) => void} handler - The error handler function.
     * @returns {() => void} A function to unregister the handler.
     * @listens router:error
     */
    onError(handler: (error: Error, to?: RouteLocation, from?: RouteLocation) => void): () => void;
    /**
     * Registers a plugin with the router.
     * Logs a warning if the plugin is already registered.
     *
     * @param {RouterPlugin} plugin - The plugin to register (must have install method).
     * @param {Record<string, unknown>} [options={}] - Options to pass to plugin.install().
     * @returns {void}
     * @throws {Error} If plugin does not have an install method.
     */
    use(plugin: RouterPlugin, options?: Record<string, unknown>): void;
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
     * Logs a warning if the provided handler is invalid (missing required methods).
     * @param {RouterErrorHandler} errorHandler - The error handler object with handle, warn, and log methods.
     * @returns {void}
     */
    setErrorHandler(errorHandler: RouterErrorHandler): void;
}

declare namespace StorePlugin {
    let name: string;
    let version: string;
    let description: string;
    /**
     * Installs the plugin into the Eleva instance.
     *
     * @public
     * @param {Eleva} eleva - The Eleva instance.
     * @param {StoreOptions} options - Plugin configuration options.
     * @param {Record<string, unknown>} [options.state={}] - Initial state object.
     * @param {Record<string, ActionFunction>} [options.actions={}] - Action functions for state mutations.
     * @param {Record<string, StoreModule>} [options.namespaces={}] - Namespaced modules for organizing store.
     * @param {StorePersistenceOptions} [options.persistence] - Persistence configuration.
     * @param {boolean} [options.persistence.enabled=false] - Enable state persistence.
     * @param {string} [options.persistence.key="eleva-store"] - Storage key.
     * @param {'localStorage' | 'sessionStorage'} [options.persistence.storage="localStorage"] - Storage type.
     * @param {string[]} [options.persistence.include] - Dot-path prefixes to persist (e.g., "auth.user")
     * @param {string[]} [options.persistence.exclude] - Dot-path prefixes to exclude (applies when include is empty).
     * @param {boolean} [options.devTools=false] - Enable development tools integration.
     * @param {(error: Error, context: string) => void} [options.onError=null] - Error handler function.
     * @returns {void}
     * @description
     * Installs the store and injects `store` into component setup context by wrapping
     * `eleva.mount` and `eleva._mountComponents`. Also exposes `eleva.store` and
     * helper methods (`eleva.dispatch`, `eleva.getState`, `eleva.subscribe`, `eleva.createAction`).
     * Uninstall restores the originals.
     *
     * @example
     * // Basic installation
     * app.use(StorePlugin, {
     *   state: { count: 0, user: null },
     *   actions: {
     *     increment: (state) => state.count.value++,
     *     setUser: (state, user) => state.user.value = user
     *   }
     * });
     *
     * // Advanced installation with persistence and namespaces
     * app.use(StorePlugin, {
     *   state: { theme: "light" },
     *   namespaces: {
     *     auth: {
     *       state: { user: null, token: null },
     *       actions: {
     *         login: (state, { user, token }) => {
     *           state.auth.user.value = user;
     *           state.auth.token.value = token;
     *         },
     *         logout: (state) => {
     *           state.auth.user.value = null;
     *           state.auth.token.value = null;
     *         }
     *       }
     *     }
     *   },
     *   persistence: {
     *     enabled: true,
     *     include: ["theme", "auth.user"]
     *   }
     * });
     */
    function install(eleva: Eleva$1, options?: StoreOptions): void;
    /**
     * Uninstalls the plugin from the Eleva instance.
     *
     * @public
     * @param {Eleva} eleva - The Eleva instance.
     * @returns {void}
     * @description
     * Restores the original Eleva methods and removes all plugin-specific
     * functionality. This method should be called when the plugin is no
     * longer needed.
     * Also removes `eleva.store` and top-level helpers (`eleva.dispatch`,
     * `eleva.getState`, `eleva.subscribe`, `eleva.createAction`).
     *
     * @example
     * // Uninstall the plugin
     * StorePlugin.uninstall(app);
     */
    function uninstall(eleva: Eleva$1): void;
}

/**
 * Type imports from the Eleva core library.
 */
type Eleva$1 = eleva.Eleva;
/**
 * Generic type import.
 */
type Signal$1<T> = eleva.Signal<T>;
/**
 * Store configuration options.
 */
type StoreOptions = {
    /**
     * Initial state object.
     */
    state?: Record<string, unknown> | undefined;
    /**
     * Action functions for state mutations.
     */
    actions?: Record<string, ActionFunction> | undefined;
    /**
     * Namespaced modules for organizing store.
     */
    namespaces?: Record<string, StoreModule> | undefined;
    /**
     * Persistence configuration.
     */
    persistence?: StorePersistenceOptions | undefined;
    /**
     * Enable development tools integration.
     */
    devTools?: boolean | undefined;
    /**
     * Error handler function.
     */
    onError?: StoreErrorHandler | undefined;
};
/**
 * Namespaced store module definition.
 */
type StoreModule = {
    /**
     *           Module state.
     */
    state: Record<string, unknown>;
    /**
     * Module actions.
     */
    actions?: Record<string, ActionFunction> | undefined;
};
/**
 * Store persistence configuration.
 */
type StorePersistenceOptions = {
    /**
     * Enable state persistence.
     */
    enabled?: boolean | undefined;
    /**
     * Storage key (default: "eleva-store").
     */
    key?: string | undefined;
    /**
     * Storage type.
     */
    storage?: "localStorage" | "sessionStorage" | undefined;
    /**
     * Dot-path prefixes to persist (e.g., "auth.user").
     */
    include?: string[] | undefined;
    /**
     * Dot-path prefixes to exclude.
     */
    exclude?: string[] | undefined;
};
/**
 * Store error handler callback.
 */
type StoreErrorHandler = (error: Error, context: string) => void;
/**
 * Reactive state tree containing signals and nested namespaces.
 */
type StoreState = Record<string, Signal$1<unknown> | Record<string, unknown>>;
/**
 * Action function signature for store actions.
 */
type ActionFunction = (state: StoreState, payload?: unknown) => unknown;

/**
 * @module eleva/signal
 * @fileoverview Reactive Signal primitive for fine-grained state management and change notification.
 */
/**
 * Callback function invoked when a signal's value changes.
 * @template T The type of value held by the signal.
 * @callback SignalWatcher
 * @param {T} value
 *        The new value of the signal.
 * @returns {void}
 */
/**
 * Function to unsubscribe a watcher from a signal.
 * @callback SignalUnsubscribe
 * @returns {boolean}
 *          True if the watcher was successfully removed, false if already removed.
 *          Safe to call multiple times (idempotent).
 */
/**
 * Interface describing the public API of a Signal.
 * @template T The type of value held by the signal.
 * @typedef {Object} SignalLike
 * @property {T} value
 *           The current value of the signal.
 * @property {function(SignalWatcher<T>): SignalUnsubscribe} watch
 *           Subscribe to value changes.
 */
/**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers synchronously when their value changes, enabling efficient
 * DOM updates through targeted patching rather than full re-renders.
 * Synchronous notification preserves stack traces and allows immediate value inspection.
 * Render batching is handled at the component level, not the signal level.
 * The class is generic, allowing type-safe handling of any value type T.
 *
 * @template T The type of value held by the signal.
 *
 * @example
 * // Basic usage
 * const count = new Signal(0);
 * count.watch((value) => console.log(`Count changed to: ${value}`));
 * count.value = 1; // Logs: "Count changed to: 1"
 *
 * @example
 * // With unsubscribe
 * const name = new Signal("John");
 * const unsubscribe = name.watch((value) => console.log(value));
 * name.value = "Jane"; // Logs: "Jane"
 * unsubscribe(); // Stop watching
 * name.value = "Bob"; // No log output
 *
 * @example
 * // With objects
 * const position = new Signal({ x: 0, y: 0 });
 * position.value = { x: 10, y: 20 }; // Triggers watchers
 *
 * @implements {SignalLike<T>}
 */
declare class Signal<T> implements SignalLike<T> {
    /**
     * Creates a new Signal instance with the specified initial value.
     *
     * @public
     * @constructor
     * @param {T} value - The initial value of the signal.
     *
     * @example
     * // Primitive types
     * const count = new Signal(0);        // Signal<number>
     * const name = new Signal("John");    // Signal<string>
     * const active = new Signal(true);    // Signal<boolean>
     *
     * @example
     * // Complex types
     * const items = new Signal([]);          // Signal holding an array
     * const user = new Signal(null);         // Signal holding nullable object
     */
    constructor(value: T);
    /**
     * Internal storage for the signal's current value.
     * @private
     * @type {T}
     */
    private _value;
    /**
     * Collection of callback functions to be notified when value changes.
     * @private
     * @type {Set<SignalWatcher<T>>}
     */
    private _watchers;
    /**
     * Sets a new value for the signal and synchronously notifies all registered watchers if the value has changed.
     * Synchronous notification preserves stack traces and ensures immediate value consistency.
     *
     * Uses strict equality (===) for comparison. For objects/arrays, watchers are only notified
     * if the reference changes, not if properties are mutated. To trigger updates with objects,
     * assign a new reference: `signal.value = { ...signal.value, updated: true }`.
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
     * @param {SignalWatcher<T>} fn - The callback function to invoke on value change.
     * @returns {SignalUnsubscribe} A function to unsubscribe the watcher.
     *          Returns true if watcher was removed, false if it wasn't registered.
     *          Safe to call multiple times (idempotent after first call).
     *
     * @example
     * // Basic watching
     * const unsubscribe = signal.watch((value) => console.log(value));
     *
     * @example
     * // Stop watching
     * unsubscribe(); // Returns true if watcher was removed
     * unsubscribe(); // Returns false (already removed, safe to call again)
     *
     * @example
     * // Multiple watchers
     * const unsub1 = signal.watch((v) => console.log("Watcher 1:", v));
     * const unsub2 = signal.watch((v) => console.log("Watcher 2:", v));
     * signal.value = "test"; // Both watchers are called
     */
    public watch(fn: SignalWatcher<T>): SignalUnsubscribe;
    /**
     * Synchronously notifies all registered watchers of the value change.
     * This preserves stack traces for debugging and ensures immediate
     * value consistency. Render batching is handled at the component level.
     *
     * @note If a watcher throws, subsequent watchers are NOT called.
     * The error propagates to the caller (the setter).
     *
     * @private
     * @returns {void}
     */
    private _notify;
}
/**
 * Callback function invoked when a signal's value changes.
 */
type SignalWatcher<T> = (value: T) => void;
/**
 * Function to unsubscribe a watcher from a signal.
 */
type SignalUnsubscribe = () => boolean;
/**
 * Interface describing the public API of a Signal.
 */
type SignalLike<T> = {
    /**
     *           The current value of the signal.
     */
    value: T;
    /**
     *           Subscribe to value changes.
     */
    watch: (arg0: SignalWatcher<T>) => SignalUnsubscribe;
};

declare namespace AgentPlugin {
    let name: string;
    let version: string;
    let description: string;
    /**
     * Installs the Agent plugin into the Eleva instance.
     *
     * @public
     * @param {Eleva} eleva - The Eleva instance.
     * @param {AgentOptions} options - Plugin configuration options.
     * @returns {void}
     * @description
     * Creates an internal Agent instance and wraps `eleva.mount` and
     * `eleva._mountComponents` to inject `ctx.agent` into every component's
     * setup function. Hooks into `eleva.emitter` for cross-plugin audit log
     * capture. Exposes the agent instance and convenience methods on the
     * Eleva instance.
     *
     * @example
     * // Basic installation
     * app.use(AgentPlugin);
     *
     * // With options
     * app.use(AgentPlugin, {
     *   maxLogSize: 200,
     *   enableInspection: true,
     *   onError: (err, ctx) => console.error(ctx, err),
     *   actions: { ping: () => "pong" },
     *   permissions: { "my-agent": { actions: ["ping"] } },
     *   emitterEvents: ["store:", "router:"]
     * });
     */
    function install(eleva: Eleva, options?: AgentOptions): void;
    /**
     * Uninstalls the Agent plugin from the Eleva instance.
     *
     * @public
     * @param {Eleva} eleva - The Eleva instance.
     * @returns {void}
     * @description
     * Restores the original Eleva methods, emitter hooks, and removes all
     * plugin-specific functionality including the agent instance and
     * convenience methods.
     *
     * @example
     * AgentPlugin.uninstall(app);
     */
    function uninstall(eleva: Eleva): void;
}

/**
 * Type imports from the Eleva core library.
 */
type Eleva = eleva.Eleva;
/**
 * Audit log entry recorded for actions, commands, and emitter events.
 */
type AgentLogEntry = {
    /**
     *           The category of the log entry.
     */
    type: "action" | "command" | "event";
    /**
     *           The action name, command type, or emitter event name.
     */
    action: string;
    /**
     *           The data associated with the entry.
     */
    payload: unknown;
    /**
     *           Unix timestamp of when the entry was recorded.
     */
    timestamp: number;
    /**
     *           The originating context (e.g., "global").
     */
    source: string;
    /**
     * The value returned by the handler (action entries only).
     * Absent on command/event entries and when the handler throws.
     */
    result?: unknown;
    /**
     * The error message if the handler threw (action/command entries).
     * Absent when the handler succeeds and on event entries.
     */
    error?: string | undefined;
    /**
     * Wall-clock execution time in milliseconds (action/command entries).
     * Absent on event entries.
     */
    durationMs?: number | undefined;
};
/**
 * Filter options for querying the audit log.
 */
type AgentLogFilter = {
    /**
     * Filter by log entry type.
     */
    type?: "action" | "command" | "event" | undefined;
    /**
     * Filter entries after this timestamp.
     */
    since?: number | undefined;
    /**
     * Filter by action/event name.
     */
    action?: string | undefined;
    /**
     * Filter by outcome: "ok" = entries without error, "error" = entries with error.
     */
    status?: "error" | "ok" | undefined;
};
/**
 * Action schema describing the contract for a registered action.
 */
type AgentActionSchema = {
    /**
     * Expected input payload shape (key -> type name).
     */
    input?: Record<string, string> | undefined;
    /**
     * Expected return type name.
     */
    output?: string | undefined;
    /**
     * Known error codes this action can produce.
     */
    errors?: string[] | undefined;
};
/**
 * Permission rules for capability-based access control.
 */
type AgentPermissionRule = {
    /**
     * Allowed action names.
     */
    actions?: string[] | undefined;
    /**
     * Allowed command types.
     */
    commands?: string[] | undefined;
};
/**
 * Agent plugin configuration options.
 */
type AgentOptions = {
    /**
     * Maximum number of audit log entries (default: 100).
     */
    maxLogSize?: number | undefined;
    /**
     * Enable component tree inspection (default: true).
     */
    enableInspection?: boolean | undefined;
    /**
     * Custom error handler function.
     */
    onError?: AgentErrorHandler | undefined;
    /**
     * Pre-registered action handlers.
     */
    actions?: Record<string, Function> | undefined;
    /**
     * Capability-based access control per scope.
     */
    permissions?: Record<string, AgentPermissionRule> | undefined;
    /**
     * Emitter event prefixes to capture in the audit log
     * (e.g., ["store:", "router:"]). Empty array disables capture.
     */
    emitterEvents?: string[] | undefined;
    /**
     * When true, scope is mandatory for execute/dispatch and calls
     * without a scope are denied. Default: false (scope is optional
     * and calls without it are unrestricted).
     */
    strictPermissions?: boolean | undefined;
    /**
     * When true, `execute()` validates the payload against the action's
     * schema before calling the handler. Missing required input fields
     * throw a schema violation error. Default: false.
     */
    validateSchemas?: boolean | undefined;
};
/**
 * Custom error handler for the agent plugin.
 */
type AgentErrorHandler = (error: Error, context: AgentErrorContext) => void;
/**
 * Structured error context passed to the onError callback.
 */
type AgentErrorContext = {
    /**
     *           The method that generated the error. Only "execute" and "dispatch" call onError.
     */
    method: "execute" | "dispatch";
    /**
     *           Machine-readable error code (e.g., "AGENT_PERMISSION_DENIED").
     */
    code: string;
    /**
     * The action name involved (if applicable).
     */
    action?: string | undefined;
    /**
     * The scope involved (if applicable).
     */
    scope?: string | undefined;
    /**
     * The command type involved (if applicable).
     */
    commandType?: string | undefined;
};
/**
 * Capability manifest describing all available agent features for a given scope.
 * Returned by `agent.describe(scope?)`.
 */
type AgentCapabilityManifest = {
    /**
     *           All registered actions with their schemas and scope-based access.
     */
    actions: Array<{
        name: string;
        schema: AgentActionSchema | null;
        allowed: boolean;
    }>;
    /**
     *           All registered command types.
     */
    commands: string[];
    /**
     *           The resolved permission rules for the requested scope, or null if no scope.
     */
    permissions: {
        scope: string | null;
        actions: string[];
        commands: string[];
    } | null;
    /**
     *           Current agent configuration.
     */
    config: {
        strictPermissions: boolean;
        maxLogSize: number;
        inspectionEnabled: boolean;
        validateSchemas: boolean;
    };
};
/**
 * Command object dispatched through the command bus.
 */
type AgentCommand = {
    /**
     *           The command type identifier.
     */
    type: string;
    /**
     * Optional target component or agent.
     */
    target?: string | undefined;
    /**
     * Optional data payload.
     */
    payload?: unknown;
};
/**
 * Snapshot of the current application state.
 */
type AgentSnapshot = {
    /**
     *           When the snapshot was taken.
     */
    timestamp: number;
    /**
     *           Registered component information.
     */
    components: Array<{
        name: string;
        hasSetup: boolean;
        hasChildren: boolean;
    }>;
    /**
     *           Installed plugin names.
     */
    plugins: string[];
};
/**
 * Diff result comparing two snapshots.
 */
type AgentDiffResult = {
    /**
     *           Component names present in snapshot B but not A.
     */
    added: string[];
    /**
     *           Component names present in snapshot A but not B.
     */
    removed: string[];
};
/**
 * Descriptor returned by describeAction for agent introspection.
 */
type AgentActionDescriptor = {
    /**
     *           The action name.
     */
    name: string;
    /**
     *           The action's contract schema, or null if none was provided.
     */
    schema: AgentActionSchema | null;
};
/**
 * Result returned by `agent.inspect()` describing the component registry.
 */
type AgentInspectResult = {
    /**
     *           Registered component information with setup, template, children, and style flags.
     */
    components: Array<{
        name: string;
        hasSetup: boolean;
        hasTemplate: boolean;
        hasChildren: boolean;
        hasStyle: boolean;
    }>;
};
/**
 * The public API surface exposed as ctx.agent in components.
 */
type AgentApi = {
    register: (name: string, handler: Function, schema?: AgentActionSchema) => void;
    unregister: (name: string) => void;
    execute: (name: string, payload?: unknown, scope?: string) => Promise<unknown>;
    executeBatch: (actions: Array<{
        action: string;
        payload?: unknown;
    }>, scope?: string) => Promise<unknown[]>;
    executeSequence: (actions: Array<{
        action: string;
        payload?: unknown;
    }>, scope?: string) => Promise<unknown>;
    hasAction: (name: string) => boolean;
    describeAction: (name: string) => AgentActionDescriptor | null;
    listActions: () => AgentActionDescriptor[];
    describe: (scope?: string) => AgentCapabilityManifest;
    dispatch: (command: AgentCommand, scope?: string) => Promise<void>;
    onCommand: (type: string, handler: Function) => () => void;
    getLog: (filter?: AgentLogFilter) => AgentLogEntry[];
    clearLog: () => void;
    actionCount: Signal<number>;
    lastActivity: Signal<AgentLogEntry | null>;
    inspect?: (() => AgentInspectResult) | undefined;
    snapshot?: (() => AgentSnapshot) | undefined;
    diff?: ((a: AgentSnapshot, b: AgentSnapshot) => AgentDiffResult) | undefined;
};
// ---------------------------------------------------------------------------
// Module augmentation (hand-maintained, appended by scripts/augment-agent-types.js)
// When the Agent plugin is installed, these properties are added at runtime.
// ---------------------------------------------------------------------------

declare module "eleva" {
  interface Eleva {
    /** Agent instance exposed after `app.use(AgentPlugin)`. Undefined before install / after uninstall. */
    agent?: AgentApi;
    /** Convenience shortcut for `app.agent.execute()`. Undefined before install / after uninstall. */
    agentExecute?: (name: string, payload?: unknown, scope?: string) => Promise<unknown>;
    /** Convenience shortcut for `app.agent.dispatch()`. Undefined before install / after uninstall. */
    agentDispatch?: (command: AgentCommand, scope?: string) => Promise<void>;
  }

  interface ComponentContext {
    /** Agent API injected by the Agent plugin into component setup. */
    agent?: AgentApi;
  }
}

export { AgentPlugin as Agent, AttrPlugin as Attr, RouterPlugin as Router, StorePlugin as Store };
//# sourceMappingURL=eleva-plugins.d.cts.map

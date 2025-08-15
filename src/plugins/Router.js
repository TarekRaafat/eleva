"use strict";

/**
 * @typedef {import('eleva').Eleva} Eleva
 * @typedef {import('eleva').Signal} Signal
 * @typedef {import('eleva').ComponentDefinition} ComponentDefinition
 */

/**
 * Simple error handler for the core router.
 * Can be overridden by error handling plugins.
 * Provides consistent error formatting and logging for router operations.
 * @private
 */
const CoreErrorHandler = {
    /**
     * Handles router errors with basic formatting.
     * @param {Error} error - The error to handle.
     * @param {string} context - The context where the error occurred.
     * @param {Object} details - Additional error details.
     * @throws {Error} The formatted error.
     */
    handle(error, context, details = {}) {
        const message = `[ElevaRouter] ${context}: ${error.message}`;
        const formattedError = new Error(message);

        // Preserve original error details
        formattedError.originalError = error;
        formattedError.context = context;
        formattedError.details = details;

        console.error(message, { error, context, details });
        throw formattedError;
    },

    /**
     * Logs a warning without throwing an error.
     * @param {string} message - The warning message.
     * @param {Object} details - Additional warning details.
     */
    warn(message, details = {}) {
        console.warn(`[ElevaRouter] ${message}`, details);
    },

    /**
     * Logs an error without throwing.
     * @param {string} message - The error message.
     * @param {Error} error - The original error.
     * @param {Object} details - Additional error details.
     */
    log(message, error, details = {}) {
        console.error(`[ElevaRouter] ${message}`, { error, details });
    }
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
class Router {
    /**
     * Creates an instance of the Router.
     * @param {Eleva} eleva - The Eleva framework instance.
     * @param {RouterOptions} options - The configuration options for the router.
     */
    constructor(eleva, options = {}) {
        /** @type {Eleva} The Eleva framework instance. */
        this.eleva = eleva;

        /** @type {RouterOptions} The merged router options. */
        this.options = {
            mode: "hash",
            queryParam: "view",
            viewSelector: "root",
            ...options,
        };

        /** @private @type {RouteDefinition[]} The processed list of route definitions. */
        this.routes = this._processRoutes(options.routes || []);

        /** @private @type {import('eleva').Emitter} The shared Eleva event emitter for global hooks. */
        this.emitter = this.eleva.emitter;

        /** @private @type {boolean} A flag indicating if the router has been started. */
        this.isStarted = false;

        /** @private @type {boolean} A flag to prevent navigation loops from history events. */
        this._isNavigating = false;

        /** @private @type {Array<() => void>} A collection of cleanup functions for event listeners. */
        this.eventListeners = [];

        /** @type {Signal<RouteLocation | null>} A reactive signal holding the current route's information. */
        this.currentRoute = new this.eleva.signal(null);

        /** @type {Signal<RouteLocation | null>} A reactive signal holding the previous route's information. */
        this.previousRoute = new this.eleva.signal(null);

        /** @type {Signal<Object<string, string>>} A reactive signal holding the current route's parameters. */
        this.currentParams = new this.eleva.signal({});

        /** @type {Signal<Object<string, string>>} A reactive signal holding the current route's query parameters. */
        this.currentQuery = new this.eleva.signal({});

        /** @type {Signal<import('eleva').MountResult | null>} A reactive signal for the currently mounted layout instance. */
        this.currentLayout = new this.eleva.signal(null);

        /** @type {Signal<import('eleva').MountResult | null>} A reactive signal for the currently mounted view (page) instance. */
        this.currentView = new this.eleva.signal(null);

        /** @private @type {Map<string, RouterPlugin>} Map of registered plugins by name. */
        this.plugins = new Map();

        /** @type {Object} The error handler instance. Can be overridden by plugins. */
        this.errorHandler = CoreErrorHandler;

        this._validateOptions();
    }

    /**
     * Validates the provided router options.
     * @private
     * @throws {Error} If the routing mode is invalid.
     */
    _validateOptions() {
        if (!["hash", "query", "history"].includes(this.options.mode)) {
            this.errorHandler.handle(
                new Error(`Invalid routing mode: ${this.options.mode}. Must be "hash", "query", or "history".`),
                "Configuration validation failed"
            );
        }
    }

    /**
     * Pre-processes route definitions to parse their path segments for efficient matching.
     * @private
     * @param {RouteDefinition[]} routes - The raw route definitions.
     * @returns {RouteDefinition[]} The processed routes.
     */
    _processRoutes(routes) {
        const processedRoutes = [];
        for (const route of routes) {
            try {
                processedRoutes.push({
                    ...route,
                    segments: this._parsePathIntoSegments(route.path),
                });
            } catch (error) {
                this.errorHandler.warn(
                    `Invalid path in route definition "${route.path || "undefined"}": ${error.message}`,
                    { route, error }
                );
            }
        }
        return processedRoutes;
    }

    /**
     * Parses a route path string into an array of static and parameter segments.
     * @private
     * @param {string} path - The path pattern to parse.
     * @returns {Array<{type: 'static' | 'param', value?: string, name?: string}>} An array of segment objects.
     * @throws {Error} If the route path is not a valid string.
     */
    _parsePathIntoSegments(path) {
        if (!path || typeof path !== "string") {
            this.errorHandler.handle(
                new Error("Route path must be a non-empty string"),
                "Path parsing failed",
                { path }
            );
        }

        const normalizedPath = path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";

        if (normalizedPath === "/") {
            return [];
        }

        return normalizedPath
            .split("/")
            .filter(Boolean)
            .map((segment) => {
                if (segment.startsWith(":")) {
                    const paramName = segment.substring(1);
                    if (!paramName) {
                        this.errorHandler.handle(
                            new Error(`Invalid parameter segment: ${segment}`),
                            "Path parsing failed",
                            { segment, path }
                        );
                    }
                    return { type: "param", name: paramName };
                }
                return { type: "static", value: segment };
            });
    }

    /**
     * Finds the view element within a container using multiple selector strategies.
     * @private
     * @param {HTMLElement} container - The parent element to search within.
     * @returns {HTMLElement} The found view element or the container itself as a fallback.
     */
    _findViewElement(container) {
        const selector = this.options.viewSelector;
        return (
            container.querySelector(`#${selector}`) ||
            container.querySelector(`.${selector}`) ||
            container.querySelector(`[data-${selector}]`) ||
            container.querySelector(selector) ||
            container
        );
    }

    /**
     * Starts the router, initializes event listeners, and performs the initial navigation.
     * @returns {Promise<void>}
     */
    async start() {
        if (this.isStarted) {
            this.errorHandler.warn("Router is already started");
            return;
        }
        if (typeof window === "undefined") {
            this.errorHandler.warn(
                "Router start skipped: `window` object not available (SSR environment)"
            );
            return;
        }
        if (
            typeof document !== "undefined" &&
            !document.querySelector(this.options.mount)
        ) {
            this.errorHandler.warn(
                `Mount element "${this.options.mount}" was not found in the DOM. The router will not start.`,
                { mountSelector: this.options.mount }
            );
            return;
        }
        const handler = () => this._handleRouteChange();
        if (this.options.mode === "hash") {
            window.addEventListener("hashchange", handler);
            this.eventListeners.push(() =>
                window.removeEventListener("hashchange", handler)
            );
        } else {
            window.addEventListener("popstate", handler);
            this.eventListeners.push(() =>
                window.removeEventListener("popstate", handler)
            );
        }
        this.isStarted = true;
        await this._handleRouteChange();
    }

    /**
     * Stops the router and cleans up all event listeners and mounted components.
     * @returns {Promise<void>}
     */
    async destroy() {
        if (!this.isStarted) return;

        // Clean up plugins
        for (const plugin of this.plugins.values()) {
            if (typeof plugin.destroy === 'function') {
                try {
                    await plugin.destroy(this);
                } catch (error) {
                    this.errorHandler.log(`Plugin ${plugin.name} destroy failed`, error);
                }
            }
        }

        this.eventListeners.forEach((cleanup) => cleanup());
        this.eventListeners = [];
        if (this.currentLayout.value) {
            await this.currentLayout.value.unmount();
        }
        this.isStarted = false;
    }

    /**
     * Programmatically navigates to a new route.
     * @param {string | {path: string, query?: object, params?: object, replace?: boolean, state?: object}} location - The target location as a string or object.
     * @param {object} [params] - Optional route parameters (for string-based location).
     * @returns {Promise<void>}
     */
    async navigate(location, params = {}) {
        try {
            const target =
                typeof location === "string" ? { path: location, params } : location;
            let path = this._buildPath(target.path, target.params || {});
            const query = target.query || {};

            if (Object.keys(query).length > 0) {
                const queryString = new URLSearchParams(query).toString();
                if (queryString) path += `?${queryString}`;
            }

            if (this._isSameRoute(path, target.params, query)) {
                return;
            }

            const navigationSuccessful = await this._proceedWithNavigation(path);

            if (navigationSuccessful) {
                this._isNavigating = true;
                const state = target.state || {};
                const replace = target.replace || false;
                const historyMethod = replace ? "replaceState" : "pushState";

                if (this.options.mode === "hash") {
                    if (replace) {
                        const newUrl = `${window.location.pathname}${window.location.search}#${path}`;
                        window.history.replaceState(state, "", newUrl);
                    } else {
                        window.location.hash = path;
                    }
                } else {
                    const url =
                        this.options.mode === "query" ? this._buildQueryUrl(path) : path;
                    history[historyMethod](state, "", url);
                }
                queueMicrotask(() => {
                    this._isNavigating = false;
                });
            }
        } catch (error) {
            this.errorHandler.log("Navigation failed", error);
            await this.emitter.emit("router:onError", error);
        }
    }

    /**
     * Builds a URL for query mode.
     * @private
     * @param {string} path - The path to set as the query parameter.
     * @returns {string} The full URL with the updated query string.
     */
    _buildQueryUrl(path) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set(this.options.queryParam, path.split("?")[0]);
        return `${window.location.pathname}?${urlParams.toString()}`;
    }

    /**
     * Checks if the target route is identical to the current route.
     * @private
     * @param {string} path - The target path with query string.
     * @param {object} params - The target params.
     * @param {object} query - The target query.
     * @returns {boolean} - True if the routes are the same.
     */
    _isSameRoute(path, params, query) {
        const current = this.currentRoute.value;
        if (!current) return false;
        const [targetPath, queryString] = path.split("?");
        const targetQuery = query || this._parseQuery(queryString || "");
        return (
            current.path === targetPath &&
            JSON.stringify(current.params) === JSON.stringify(params || {}) &&
            JSON.stringify(current.query) === JSON.stringify(targetQuery)
        );
    }

    /**
     * Injects dynamic parameters into a path string.
     * @private
     */
    _buildPath(path, params) {
        let result = path;
        for (const [key, value] of Object.entries(params)) {
            // Fix: Handle special characters and ensure proper encoding
            const encodedValue = encodeURIComponent(String(value));
            result = result.replace(new RegExp(`:${key}\\b`, "g"), encodedValue);
        }
        return result;
    }

    /**
     * The handler for browser-initiated route changes (e.g., back/forward buttons).
     * @private
     */
    async _handleRouteChange() {
        if (this._isNavigating) return;
        const from = this.currentRoute.value;
        const toLocation = this._getCurrentLocation();

        const navigationSuccessful = await this._proceedWithNavigation(
            toLocation.fullUrl
        );

        // If navigation was blocked by a guard, revert the URL change
        if (!navigationSuccessful && from) {
            this.navigate({ path: from.path, query: from.query, replace: true });
        }
    }

    /**
     * Manages the core navigation lifecycle. Runs guards before committing changes.
     * @private
     * @param {string} fullPath - The full path (e.g., '/users/123?foo=bar') to navigate to.
     * @returns {Promise<boolean>} - `true` if navigation succeeded, `false` if aborted.
     */
    async _proceedWithNavigation(fullPath) {
        const from = this.currentRoute.value;
        const [path, queryString] = (fullPath || "/").split("?");
        const toLocation = {
            path: path.startsWith("/") ? path : `/${path}`,
            query: this._parseQuery(queryString),
            fullUrl: fullPath,
        };

        let toMatch = this._matchRoute(toLocation.path);

        if (!toMatch) {
            const notFoundRoute = this.routes.find((route) => route.path === "*");
            if (notFoundRoute) {
                toMatch = {
                    route: notFoundRoute,
                    params: { pathMatch: toLocation.path.substring(1) },
                };
            } else {
                await this.emitter.emit(
                    "router:onError",
                    new Error(`Route not found: ${toLocation.path}`),
                    toLocation,
                    from
                );
                return false;
            }
        }

        const to = {
            ...toLocation,
            params: toMatch.params,
            meta: toMatch.route.meta || {},
            name: toMatch.route.name,
            matched: toMatch.route,
        };

        try {
            // 1. Run all *pre-navigation* guards.
            const canNavigate = await this._runGuards(to, from, toMatch.route);
            if (!canNavigate) return false;

            // 2. Resolve async components *before* touching the DOM.
            const { layoutComponent, pageComponent } = await this._resolveComponents(
                toMatch.route
            );

            // 3. Unmount the previous view/layout.
            if (from) {
                const toLayout = toMatch.route.layout || this.options.globalLayout;
                const fromLayout = from.matched.layout || this.options.globalLayout;

                const tryUnmount = async (instance) => {
                    if (!instance) return;

                    try {
                        await instance.unmount();
                    } catch (error) {
                        this.errorHandler.warn("Error during component unmount", { error, instance });
                    }
                };

                if (toLayout !== fromLayout) {
                    await tryUnmount(this.currentLayout.value);
                    this.currentLayout.value = null;
                } else {
                    await tryUnmount(this.currentView.value);
                    this.currentView.value = null;
                }

                // 4. Call `afterLeave` hook *after* the old component has been unmounted.
                if (from.matched.afterLeave) {
                    await from.matched.afterLeave(to, from);
                    await this.emitter.emit("router:afterLeave", to, from);
                }
            }

            // 5. Update reactive state.
            this.previousRoute.value = from;
            this.currentRoute.value = to;
            this.currentParams.value = to.params || {};
            this.currentQuery.value = to.query || {};

            // 6. Render the new components.
            await this._render(layoutComponent, pageComponent, to);

            // 7. Run post-navigation hooks.
            if (toMatch.route.afterEnter) {
                await toMatch.route.afterEnter(to, from);
                await this.emitter.emit("router:afterEnter", to, from);
            }
            await this.emitter.emit("router:afterEach", to, from);

            return true;
        } catch (error) {
            this.errorHandler.log("Error during navigation", error, { to, from });
            await this.emitter.emit("router:onError", error, to, from);
            return false;
        }
    }

    /**
     * Executes all applicable navigation guards for a transition in order.
     * @private
     * @returns {Promise<boolean>} - `false` if navigation should be aborted.
     */
    async _runGuards(to, from, route) {
        const guards = [
            ...(this.options.onBeforeEach ? [this.options.onBeforeEach] : []),
            ...(from && from.matched.beforeLeave ? [from.matched.beforeLeave] : []),
            ...(route.beforeEnter ? [route.beforeEnter] : []),
        ];
        for (const guard of guards) {
            const result = await guard(to, from);
            if (result === false) return false;
            if (typeof result === "string" || typeof result === "object") {
                this.navigate(result);
                return false;
            }
        }
        return true;
    }

    /**
     * Resolves a string component definition to a component object.
     * @private
     * @param {string} def - The component name to resolve.
     * @returns {ComponentDefinition} The resolved component.
     * @throws {Error} If the component is not registered.
     */
    _resolveStringComponent(def) {
        const componentDef = this.eleva._components.get(def);
        if (!componentDef) {
            this.errorHandler.handle(
                new Error(`Component "${def}" not registered.`),
                "Component resolution failed",
                { componentName: def, availableComponents: Array.from(this.eleva._components.keys()) }
            );
        }
        return componentDef;
    }

    /**
     * Resolves a function component definition to a component object.
     * @private
     * @param {Function} def - The function to resolve.
     * @returns {Promise<ComponentDefinition>} The resolved component.
     * @throws {Error} If the function fails to load the component.
     */
    async _resolveFunctionComponent(def) {
        try {
            const funcStr = def.toString();
            const isAsyncImport = funcStr.includes("import(") || funcStr.startsWith("() =>");

            const result = await def();
            return isAsyncImport ? (result.default || result) : result;
        } catch (error) {
            this.errorHandler.handle(
                new Error(`Failed to load async component: ${error.message}`),
                "Component resolution failed",
                { function: def.toString(), error }
            );
        }
    }

    /**
     * Validates a component definition object.
     * @private
     * @param {any} def - The component definition to validate.
     * @returns {ComponentDefinition} The validated component.
     * @throws {Error} If the component definition is invalid.
     */
    _validateComponentDefinition(def) {
        if (!def || typeof def !== "object") {
            this.errorHandler.handle(
                new Error(`Invalid component definition: ${typeof def}`),
                "Component validation failed",
                { definition: def }
            );
        }

        if (typeof def.template !== "function" && typeof def.template !== "string") {
            this.errorHandler.handle(
                new Error("Component missing template property"),
                "Component validation failed",
                { definition: def }
            );
        }

        return def;
    }

    /**
     * Resolves a component definition to a component object.
     * @private
     * @param {any} def - The component definition to resolve.
     * @returns {Promise<ComponentDefinition | null>} The resolved component or null.
     */
    async _resolveComponent(def) {
        if (def === null || def === undefined) {
            return null;
        }

        if (typeof def === "string") {
            return this._resolveStringComponent(def);
        }

        if (typeof def === "function") {
            return await this._resolveFunctionComponent(def);
        }

        if (def && typeof def === "object") {
            return this._validateComponentDefinition(def);
        }

        this.errorHandler.handle(
            new Error(`Invalid component definition: ${typeof def}`),
            "Component resolution failed",
            { definition: def }
        );
    }

    /**
     * Asynchronously resolves the layout and page components for a route.
     * @private
     * @param {RouteDefinition} route - The route to resolve components for.
     * @returns {Promise<{layoutComponent: ComponentDefinition | null, pageComponent: ComponentDefinition}>}
     */
    async _resolveComponents(route) {
        const effectiveLayout = route.layout || this.options.globalLayout;

        try {
            const [layoutComponent, pageComponent] = await Promise.all([
                this._resolveComponent(effectiveLayout),
                this._resolveComponent(route.component),
            ]);

            if (!pageComponent) {
                this.errorHandler.handle(
                    new Error(`Page component is null or undefined for route: ${route.path}`),
                    "Component resolution failed",
                    { route: route.path }
                );
            }

            return { layoutComponent, pageComponent };
        } catch (error) {
            this.errorHandler.log(
                `Error resolving components for route ${route.path}`,
                error,
                { route: route.path }
            );
            throw error;
        }
    }

    /**
     * Renders the components for the current route into the DOM.
     * @private
     * @param {ComponentDefinition | null} layoutComponent - The pre-loaded layout component.
     * @param {ComponentDefinition} pageComponent - The pre-loaded page component.
     */
    async _render(layoutComponent, pageComponent) {
        const mountEl = document.querySelector(this.options.mount);
        if (!mountEl) {
            this.errorHandler.handle(
                new Error(`Mount element "${this.options.mount}" not found.`),
                { mountSelector: this.options.mount }
            );
        }

        if (layoutComponent) {
            const layoutInstance = await this.eleva.mount(
                mountEl,
                this._wrapComponentWithChildren(layoutComponent)
            );
            this.currentLayout.value = layoutInstance;
            const viewEl = this._findViewElement(layoutInstance.container);
            const viewInstance = await this.eleva.mount(
                viewEl,
                this._wrapComponentWithChildren(pageComponent)
            );
            this.currentView.value = viewInstance;
        } else {
            const viewInstance = await this.eleva.mount(
                mountEl,
                this._wrapComponentWithChildren(pageComponent)
            );
            this.currentView.value = viewInstance;
            this.currentLayout.value = null;
        }
    }

    /**
     * Creates a getter function for router context properties.
     * @private
     * @param {string} property - The property name to access.
     * @param {any} defaultValue - The default value if property is undefined.
     * @returns {Function} A getter function.
     */
    _createRouteGetter(property, defaultValue) {
        return () => this.currentRoute.value?.[property] ?? defaultValue;
    }

    /**
     * Wraps a component definition to inject router-specific context into its setup function.
     * @private
     * @param {ComponentDefinition} component - The component to wrap.
     * @returns {ComponentDefinition} The wrapped component definition.
     */
    _wrapComponent(component) {
        const originalSetup = component.setup;
        const self = this;

        return {
            ...component,
            async setup(ctx) {
                ctx.router = {
                    navigate: self.navigate.bind(self),
                    current: self.currentRoute,
                    previous: self.previousRoute,

                    // Route property getters
                    get params() { return self._createRouteGetter('params', {})(); },
                    get query() { return self._createRouteGetter('query', {})(); },
                    get path() { return self._createRouteGetter('path', '/')(); },
                    get fullUrl() { return self._createRouteGetter('fullUrl', window.location.href)(); },
                    get meta() { return self._createRouteGetter('meta', {})(); }
                };

                return originalSetup ? await originalSetup(ctx) : {};
            },
        };
    }

    /**
     * Recursively wraps all child components to ensure they have access to router context.
     * @private
     * @param {ComponentDefinition} component - The component to wrap.
     * @returns {ComponentDefinition} The wrapped component definition.
     */
    _wrapComponentWithChildren(component) {
        const wrappedComponent = this._wrapComponent(component);

        // If the component has children, wrap them too
        if (
            wrappedComponent.children &&
            typeof wrappedComponent.children === "object"
        ) {
            const wrappedChildren = {};
            for (const [selector, childComponent] of Object.entries(
                wrappedComponent.children
            )) {
                wrappedChildren[selector] =
                    this._wrapComponentWithChildren(childComponent);
            }
            wrappedComponent.children = wrappedChildren;
        }

        return wrappedComponent;
    }

    /**
     * Gets the current location information from the browser's window object.
     * @private
     * @returns {Omit<RouteLocation, 'params' | 'meta' | 'name' | 'matched'>}
     */
    _getCurrentLocation() {
        if (typeof window === "undefined")
            return { path: "/", query: {}, fullUrl: "" };
        let path, queryString, fullUrl;
        switch (this.options.mode) {
            case "hash":
                fullUrl = window.location.hash.slice(1) || "/";
                [path, queryString] = fullUrl.split("?");
                break;
            case "query":
                const urlParams = new URLSearchParams(window.location.search);
                path = urlParams.get(this.options.queryParam) || "/";
                queryString = window.location.search.slice(1);
                fullUrl = path;
                break;
            default: // 'history' mode
                path = window.location.pathname || "/";
                queryString = window.location.search.slice(1);
                fullUrl = `${path}${queryString ? "?" + queryString : ""}`;
        }
        return {
            path: path.startsWith("/") ? path : `/${path}`,
            query: this._parseQuery(queryString),
            fullUrl,
        };
    }

    /**
     * Parses a query string into a key-value object.
     * @private
     */
    _parseQuery(queryString) {
        const query = {};
        if (queryString) {
            new URLSearchParams(queryString).forEach((value, key) => {
                query[key] = value;
            });
        }
        return query;
    }

    /**
     * Matches a given path against the registered routes.
     * @private
     * @param {string} path - The path to match.
     * @returns {{route: RouteDefinition, params: Object<string, string>} | null} The matched route and its params, or null.
     */
    _matchRoute(path) {
        const pathSegments = path.split("/").filter(Boolean);

        for (const route of this.routes) {
            // Handle the root path as a special case.
            if (route.path === "/") {
                if (pathSegments.length === 0) return { route, params: {} };
                continue;
            }

            if (route.segments.length !== pathSegments.length) continue;

            const params = {};
            let isMatch = true;
            for (let i = 0; i < route.segments.length; i++) {
                const routeSegment = route.segments[i];
                const pathSegment = pathSegments[i];
                if (routeSegment.type === "param") {
                    params[routeSegment.name] = decodeURIComponent(pathSegment);
                } else if (routeSegment.value !== pathSegment) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return { route, params };
        }
        return null;
    }

    /** Registers a global pre-navigation guard. */
    onBeforeEach(guard) {
        this.options.onBeforeEach = guard;
    }
    /** Registers a global hook that runs after a new route component has been mounted *if* the route has an `afterEnter` hook. */
    onAfterEnter(hook) {
        this.emitter.on("router:afterEnter", hook);
    }
    /** Registers a global hook that runs after a route component has been unmounted *if* the route has an `afterLeave` hook. */
    onAfterLeave(hook) {
        this.emitter.on("router:afterLeave", hook);
    }
    /** Registers a global hook that runs after a navigation has been confirmed and all hooks have completed. */
    onAfterEach(hook) {
        this.emitter.on("router:afterEach", hook);
    }
    /** Registers a global error handler for navigation. */
    onError(handler) {
        this.emitter.on("router:onError", handler);
    }

    /**
     * Registers a plugin with the router.
     * @param {RouterPlugin} plugin - The plugin to register.
     */
    use(plugin, options = {}) {
        if (typeof plugin.install !== 'function') {
            this.errorHandler.handle(
                new Error('Plugin must have an install method'),
                'Plugin registration failed',
                { plugin }
            );
        }

        // Check if plugin is already registered
        if (this.plugins.has(plugin.name)) {
            this.errorHandler.warn(
                `Plugin "${plugin.name}" is already registered`,
                { existingPlugin: this.plugins.get(plugin.name) }
            );
            return;
        }

        this.plugins.set(plugin.name, plugin);
        plugin.install(this, options);
    }

    /**
     * Gets all registered plugins.
     * @returns {RouterPlugin[]} Array of registered plugins.
     */
    getPlugins() {
        return Array.from(this.plugins.values());
    }

    /**
     * Gets a plugin by name.
     * @param {string} name - The plugin name.
     * @returns {RouterPlugin | undefined} The plugin or undefined.
     */
    getPlugin(name) {
        return this.plugins.get(name);
    }

    /**
     * Removes a plugin from the router.
     * @param {string} name - The plugin name.
     * @returns {boolean} True if the plugin was removed.
     */
    removePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) return false;

        // Call destroy if available
        if (typeof plugin.destroy === 'function') {
            try {
                plugin.destroy(this);
            } catch (error) {
                this.errorHandler.log(`Plugin ${name} destroy failed`, error);
            }
        }

        return this.plugins.delete(name);
    }

    /**
     * Sets a custom error handler. Used by error handling plugins.
     * @param {Object} errorHandler - The error handler object with handle, warn, and log methods.
     */
    setErrorHandler(errorHandler) {
        if (errorHandler &&
            typeof errorHandler.handle === 'function' &&
            typeof errorHandler.warn === 'function' &&
            typeof errorHandler.log === 'function') {
            this.errorHandler = errorHandler;
        } else {
            console.warn('[ElevaRouter] Invalid error handler provided. Must have handle, warn, and log methods.');
        }
    }
}

/**
 * @typedef {Object} RouterOptions
 * @property {string} mount - A CSS selector for the main element where the app is mounted.
 * @property {RouteDefinition[]} routes - An array of route definitions.
 * @property {'hash' | 'query' | 'history'} [mode='hash'] - The routing mode.
 * @property {string} [queryParam='page'] - The query parameter to use in 'query' mode.
 * @property {string} [viewSelector='view'] - The selector for the view element within a layout.
 * @property {boolean} [autoStart=true] - Whether to start the router automatically.
 * @property {NavigationGuard} [onBeforeEach] - A global guard executed before every navigation.
 * @property {string | ComponentDefinition | (() => Promise<{default: ComponentDefinition}>)} [globalLayout] - A global layout for all routes. Can be overridden by a route's specific layout.
 */

/**
 * @class 🚀 RouterPlugin
 * @classdesc A powerful, reactive, and flexible Router Plugin for Eleva.js applications.
 * This plugin provides comprehensive client-side routing functionality including:
 * - Multiple routing modes (hash, history, query)
 * - Navigation guards and lifecycle hooks
 * - Reactive state management
 * - Component resolution and lazy loading
 * - Layout and page component separation
 * - Plugin system for extensibility
 * - Advanced error handling
 *
 * @example
 * // Install the plugin
 * const app = new Eleva("myApp");
 * 
 * const HomePage = { template: () => `<h1>Home</h1>` };
 * const AboutPage = { template: () => `<h1>About Us</h1>` };
 * const UserPage = { 
 *   template: (ctx) => `<h1>User: ${ctx.router.params.id}</h1>` 
 * };
 * 
 * app.use(RouterPlugin, {
 *   mount: '#app',
 *   mode: 'hash',
 *   routes: [
 *     { path: '/', component: HomePage },
 *     { path: '/about', component: AboutPage },
 *     { path: '/users/:id', component: UserPage }
 *   ]
 * });
 */
export const RouterPlugin = {
    /**
     * Unique identifier for the plugin
     * @type {string}
     */
    name: "router",

    /**
     * Plugin version
     * @type {string}
     */
    version: "1.0.0-rc.1",

    /**
     * Plugin description
     * @type {string}
     */
    description: "Client-side routing for Eleva applications",

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
    install(eleva, options = {}) {
        if (!options.mount) {
            throw new Error("[RouterPlugin] 'mount' option is required");
        }

        if (!options.routes || !Array.isArray(options.routes)) {
            throw new Error("[RouterPlugin] 'routes' option must be an array");
        }

        /**
         * Registers a component definition with the Eleva instance.
         * This method handles both inline component objects and pre-registered component names.
         * 
         * @param {any} def - The component definition to register
         * @param {string} type - The type of component for naming (e.g., "Route", "Layout")
         * @returns {string | null} The registered component name or null if no definition provided
         */
        const register = (def, type) => {
            if (!def) return null;

            if (typeof def === "object" && def !== null && !def.name) {
                const name = `Eleva${type}Component_${Math.random()
                    .toString(36)
                    .slice(2, 11)}`;

                try {
                    eleva.component(name, def);
                    return name;
                } catch (error) {
                    throw new Error(`[RouterPlugin] Failed to register ${type} component: ${error.message}`);
                }
            }
            return def;
        };

        if (options.globalLayout) {
            options.globalLayout = register(options.globalLayout, "GlobalLayout");
        }

        (options.routes || []).forEach((route) => {
            route.component = register(route.component, "Route");
            if (route.layout) {
                route.layout = register(route.layout, "RouteLayout");
            }
        });

        const router = new Router(eleva, options);
        eleva.router = router;

        if (options.autoStart !== false) {
            queueMicrotask(() => router.start());
        }

        // Add plugin metadata to the Eleva instance
        if (!eleva.plugins) {
            eleva.plugins = new Map();
        }
        eleva.plugins.set(this.name, {
            name: this.name,
            version: this.version,
            description: this.description,
            options
        });

        // Add utility methods for manual router access
        eleva.navigate = router.navigate.bind(router);
        eleva.getCurrentRoute = () => router.currentRoute.value;
        eleva.getRouteParams = () => router.currentParams.value;
        eleva.getRouteQuery = () => router.currentQuery.value;

        return router;
    },

    /**
     * Uninstalls the plugin from the Eleva instance
     * 
     * @param {Eleva} eleva - The Eleva instance
     */
    async uninstall(eleva) {
        if (eleva.router) {
            await eleva.router.destroy();
            delete eleva.router;
        }

        // Remove plugin metadata
        if (eleva.plugins) {
            eleva.plugins.delete(this.name);
        }

        // Remove utility methods
        delete eleva.navigate;
        delete eleva.getCurrentRoute;
        delete eleva.getRouteParams;
        delete eleva.getRouteQuery;
    }
};

/*! Eleva Plugins v1.1.1 | MIT License | https://elevajs.com */
'use strict';

/**
 * @module eleva/plugins/attr
 * @fileoverview Attribute plugin providing ARIA, data, boolean, and dynamic attribute handling.
 */ // ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// -----------------------------------------------------------------------------
// External Type Imports
// -----------------------------------------------------------------------------
/**
 * Type imports from the Eleva core library.
 * @typedef {import('eleva').Eleva} Eleva
 */ // -----------------------------------------------------------------------------
// Attr Type Definitions
// -----------------------------------------------------------------------------
/**
 * Configuration options for the AttrPlugin.
 * @typedef {Object} AttrPluginOptions
 * @property {boolean} [enableAria=true]
 *           Enable ARIA attribute handling.
 * @property {boolean} [enableData=true]
 *           Enable data attribute handling.
 * @property {boolean} [enableBoolean=true]
 *           Enable boolean attribute handling.
 * @property {boolean} [enableDynamic=true]
 *           Enable dynamic property detection.
 * @description Configuration options passed to AttrPlugin.install().
 */ /**
 * Function signature for attribute update operations.
 * @typedef {(oldEl: HTMLElement, newEl: HTMLElement) => void} AttributeUpdateFunction
 * @description Updates attributes on oldEl to match newEl's attributes.
 */ /**
 * A regular expression to match hyphenated lowercase letters.
 * @private
 * @type {RegExp}
 */ const CAMEL_RE = /-([a-z])/g;
/**
 * @class 🎯 AttrPlugin
 * @classdesc A plugin that provides advanced attribute handling for Eleva components.
 * This plugin extends the renderer with sophisticated attribute processing including:
 * - ARIA attribute handling with proper property mapping
 * - Data attribute management
 * - Boolean attribute processing
 * - Dynamic property detection and mapping
 * - Attribute cleanup and removal
 *
 * @example
 * // Install the plugin
 * const app = new Eleva("myApp");
 * app.use(AttrPlugin);
 *
 * // Use advanced attributes in components
 * app.component("myComponent", {
 *   template: (ctx) => `
 *     <button
 *       aria-expanded="${ctx.isExpanded.value}"
 *       data-user-id="${ctx.userId.value}"
 *       disabled="${ctx.isLoading.value}"
 *       class="btn ${ctx.variant.value}"
 *     >
 *       ${ctx.text.value}
 *     </button>
 *   `
 * });
 */ const AttrPlugin = {
    /**
   * Unique identifier for the plugin
   * @type {string}
   */ name: "attr",
    /**
   * Plugin version
   * @type {string}
   */ version: "1.1.1",
    /**
   * Plugin description
   * @type {string}
   */ description: "Advanced attribute handling for Eleva components",
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
   */ install (eleva, options = {}) {
        const { enableAria = true, enableData = true, enableBoolean = true, enableDynamic = true } = options;
        /**
     * Updates the attributes of an element to match a new element's attributes.
     *
     * Processing order:
     * 1. Skip event attributes (@click, @input) - handled by Eleva's event system
     * 2. Skip unchanged attributes - optimization
     * 3. ARIA attributes (aria-*): Map to DOM properties (aria-expanded → ariaExpanded)
     * 4. Data attributes (data-*): Update both dataset and attribute
     * 5. Boolean attributes: Handle empty string as true, "false" as false
     * 6. Other attributes: Map to properties with dynamic detection for custom elements
     * 7. Remove old attributes not present in new element
     *
     * Dynamic property detection (when enableDynamic=true):
     * - Checks if property exists directly on element
     * - Searches element's prototype chain for case-insensitive matches
     * - Enables compatibility with custom elements and Web Components
     *
     * @inner
     * @param {HTMLElement} oldEl - The original element to update (modified in-place).
     * @param {HTMLElement} newEl - The reference element with desired attributes.
     * @returns {void}
     */ const updateAttributes = (oldEl, newEl)=>{
            const oldAttrs = oldEl.attributes;
            const newAttrs = newEl.attributes;
            // Process new attributes
            for(let i = 0; i < newAttrs.length; i++){
                const { name, value } = newAttrs[i];
                // Skip event attributes (handled by event system)
                if (name.startsWith("@")) continue;
                // Skip if attribute hasn't changed
                if (oldEl.getAttribute(name) === value) continue;
                // Handle ARIA attributes
                if (enableAria && name.startsWith("aria-")) {
                    const prop = "aria" + name.slice(5).replace(CAMEL_RE, (_, l)=>l.toUpperCase());
                    oldEl[prop] = value;
                    oldEl.setAttribute(name, value);
                } else if (enableData && name.startsWith("data-")) {
                    oldEl.dataset[name.slice(5)] = value;
                    oldEl.setAttribute(name, value);
                } else {
                    let prop = name.replace(CAMEL_RE, (_, l)=>l.toUpperCase());
                    // Dynamic property detection
                    if (enableDynamic && !(prop in oldEl) && !Object.getOwnPropertyDescriptor(Object.getPrototypeOf(oldEl), prop)) {
                        const elementProps = Object.getOwnPropertyNames(Object.getPrototypeOf(oldEl));
                        const matchingProp = elementProps.find((p)=>p.toLowerCase() === name.toLowerCase() || p.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.toLowerCase()));
                        if (matchingProp) {
                            prop = matchingProp;
                        }
                    }
                    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(oldEl), prop);
                    const hasProperty = prop in oldEl || descriptor;
                    if (hasProperty) {
                        // Boolean attribute handling
                        if (enableBoolean) {
                            const isBoolean = typeof oldEl[prop] === "boolean" || descriptor?.get && typeof descriptor.get.call(oldEl) === "boolean";
                            if (isBoolean) {
                                const boolValue = value !== "false" && (value === "" || value === prop || value === "true");
                                oldEl[prop] = boolValue;
                                if (boolValue) {
                                    oldEl.setAttribute(name, "");
                                } else {
                                    oldEl.removeAttribute(name);
                                }
                            } else {
                                oldEl[prop] = value;
                                oldEl.setAttribute(name, value);
                            }
                        } else {
                            oldEl[prop] = value;
                            oldEl.setAttribute(name, value);
                        }
                    } else {
                        oldEl.setAttribute(name, value);
                    }
                }
            }
            // Remove old attributes that are no longer present
            for(let i = oldAttrs.length - 1; i >= 0; i--){
                const name = oldAttrs[i].name;
                if (!newEl.hasAttribute(name)) {
                    oldEl.removeAttribute(name);
                }
            }
        };
        // Extend the renderer with the advanced attribute handler
        if (eleva.renderer) {
            eleva.renderer.updateAttributes = updateAttributes;
            // Store the original _patchNode method
            const originalPatchNode = eleva.renderer._patchNode;
            eleva.renderer._originalPatchNode = originalPatchNode;
            /**
       * Overridden _patchNode method that uses enhanced attribute handling.
       * Delegates to `updateAttributes` instead of the basic `_updateAttributes`.
       *
       * @param {Node} oldNode - The original DOM node to update.
       * @param {Node} newNode - The new DOM node with desired state.
       * @returns {void}
       */ eleva.renderer._patchNode = function(oldNode, newNode) {
                if (oldNode?._eleva_instance) return;
                if (oldNode.nodeType === Node.TEXT_NODE) {
                    if (oldNode.nodeValue !== newNode.nodeValue) {
                        oldNode.nodeValue = newNode.nodeValue;
                    }
                } else if (oldNode.nodeType === Node.ELEMENT_NODE) {
                    // Use advanced attribute handler instead of basic _updateAttributes
                    updateAttributes(oldNode, newNode);
                    this._diff(oldNode, newNode);
                }
            };
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
        // Add utility methods for manual attribute updates
        /** @type {AttributeUpdateFunction} */ eleva.updateElementAttributes = updateAttributes;
    },
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
   */ uninstall (eleva) {
        // Restore original _patchNode method if it exists
        if (eleva.renderer && eleva.renderer._originalPatchNode) {
            eleva.renderer._patchNode = eleva.renderer._originalPatchNode;
            delete eleva.renderer._originalPatchNode;
        }
        // Remove plugin metadata
        if (eleva.plugins) {
            eleva.plugins.delete(this.name);
        }
        // Remove utility methods
        delete eleva.updateElementAttributes;
    }
};

/**
 * @module eleva/plugins/router
 * @fileoverview Client-side router plugin with hash, history, and query modes,
 * navigation guards, and lifecycle hooks.
 */ // ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// -----------------------------------------------------------------------------
// External Type Imports
// -----------------------------------------------------------------------------
/**
 * Type imports from the Eleva core library.
 * @typedef {import('eleva').Eleva} Eleva
 * @typedef {import('eleva').ComponentDefinition} ComponentDefinition
 * @typedef {import('eleva').Emitter} Emitter
 * @typedef {import('eleva').MountResult} MountResult
 * @typedef {import('eleva').UnsubscribeFunction} UnsubscribeFunction
 */ /**
 * Generic type import.
 * @template T
 * @typedef {import('eleva').Signal<T>} Signal
 */ // -----------------------------------------------------------------------------
// Router Events
// -----------------------------------------------------------------------------
/**
 * Fired when the router initialization completes successfully.
 * @event router:ready
 * @type {Router}
 */ /**
 * Fired when an error occurs during navigation or route handling, including
 * when no matching route is found and no catch-all (`*`) route exists.
 * @event router:error
 * @type {Error}
 */ /**
 * Fired before guards run, allowing plugins to block or redirect navigation.
 * @event router:beforeEach
 * @type {NavigationContext}
 */ /**
 * Fired before component resolution, allowing plugins to modify the resolve context.
 * @event router:beforeResolve
 * @type {ResolveContext}
 */ /**
 * Fired after components are resolved successfully.
 * @event router:afterResolve
 * @type {ResolveContext}
 */ /**
 * Fired after leaving the previous route.
 * @event router:afterLeave
 * @type {{to: RouteLocation, from: RouteLocation}}
 */ /**
 * Fired before DOM rendering begins.
 * @event router:beforeRender
 * @type {RenderContext}
 */ /**
 * Fired after DOM rendering completes.
 * @event router:afterRender
 * @type {RenderContext}
 */ /**
 * Fired after render for scroll behavior handling.
 * @event router:scroll
 * @type {ScrollContext}
 */ /**
 * Fired after entering the new route.
 * @event router:afterEnter
 * @type {{to: RouteLocation, from: RouteLocation | null}}
 */ /**
 * Fired after navigation completes successfully.
 * @event router:afterEach
 * @type {{to: RouteLocation, from: RouteLocation | null}}
 */ /**
 * Fired when a route is dynamically added.
 * @event router:routeAdded
 * @type {RouteDefinition}
 */ /**
 * Fired when a route is dynamically removed.
 * @event router:routeRemoved
 * @type {RouteDefinition}
 */ // -----------------------------------------------------------------------------
// Router Data Types
// -----------------------------------------------------------------------------
/**
 * The routing mode determines how the router manages URL state.
 * - `hash`: Uses URL hash (e.g., `/#/path`) - works without server config
 * - `history`: Uses HTML5 History API (e.g., `/path`) - requires server config
 * - `query`: Uses query parameters (e.g., `?view=/path`) - useful for embedded apps
 * @typedef {'hash' | 'history' | 'query'} RouterMode
 */ /**
 * Route parameters extracted from the URL path.
 * @typedef {Record<string, string>} RouteParams
 * @description Key-value pairs extracted from dynamic route segments (e.g., `/users/:id` → `{ id: '123' }`).
 */ /**
 * Query parameters from the URL query string.
 * @typedef {Record<string, string>} QueryParams
 * @description Key-value pairs from the URL query string (e.g., `?page=1&sort=name`).
 */ /**
 * Navigation input parameters supporting multiple value types.
 * @typedef {Record<string, string | number | boolean>} NavigationParams
 * @description Parameters passed to navigation functions, automatically converted to strings in URLs.
 */ /**
 * Function signature for programmatic navigation.
 * @typedef {(location: string | NavigationTarget, params?: NavigationParams) => Promise<boolean>} NavigateFunction
 * @description Returns true if navigation succeeded, false if blocked by a guard.
 */ /**
 * Router configuration options.
 * @typedef {Object} RouterOptions
 * @property {RouterMode} [mode='hash']
 *           The routing mode to use.
 * @property {string} [queryParam='view']
 *           Query parameter name for 'query' mode.
 * @property {string} [viewSelector='view']
 *           Base selector for the view element.
 * @property {string} mount
 *           CSS selector for the mount point element.
 * @property {RouteDefinition[]} routes
 *           Array of route definitions.
 * @property {RouteComponent} [globalLayout]
 *           Default layout for all routes.
 * @property {NavigationGuard} [onBeforeEach]
 *           Global navigation guard.
 * @property {boolean} [autoStart=true]
 *           Whether to start the router automatically.
 * @description Configuration options for the Router plugin.
 */ /**
 * Object describing a navigation target for `router.navigate()`.
 * @typedef {Object} NavigationTarget
 * @property {string} path
 *           The target path (can include params like '/users/:id').
 * @property {NavigationParams} [params]
 *           Route parameters to inject.
 * @property {NavigationParams} [query]
 *           Query parameters to append.
 * @property {boolean} [replace=false]
 *           Whether to replace current history entry.
 * @property {unknown} [state]
 *           History state to pass.
 * @description Object describing a navigation target for `router.navigate()`.
 */ /**
 * Saved scroll position.
 * @typedef {Object} ScrollPosition
 * @property {number} x
 *           Horizontal scroll position.
 * @property {number} y
 *           Vertical scroll position.
 * @description Represents a saved scroll position.
 */ /**
 * Internal representation of a parsed route path segment.
 * @typedef {Object} RouteSegment
 * @property {'static' | 'param'} type
 *           The segment type.
 * @property {string} [value]
 *           The segment value (static segments).
 * @property {string} [name]
 *           The parameter name (param segments).
 * @description Internal representation of a parsed route path segment.
 * @private
 */ /**
 * Result of matching a path against route definitions.
 * @typedef {Object} RouteMatch
 * @property {RouteDefinition} route
 *           The matched route definition.
 * @property {RouteParams} params
 *           The extracted route parameters.
 * @description Result of matching a path against route definitions.
 * @private
 */ /**
 * Arbitrary metadata attached to routes for use in guards and components.
 * @typedef {Record<string, unknown>} RouteMeta
 * @description Common properties include:
 * - `requiresAuth: boolean` - Whether the route requires authentication
 * - `title: string` - Page title for the route
 * - `roles: string[]` - Required user roles
 * @example
 * {
 *   path: '/admin',
 *   component: AdminPage,
 *   meta: { requiresAuth: true, roles: ['admin'], title: 'Admin Dashboard' }
 * }
 */ /**
 * Interface for the router's error handling system.
 * @typedef {Object} RouterErrorHandler
 * @property {(error: Error, context: string, details?: Record<string, unknown>) => void} handle
 *           Throws a formatted error.
 * @property {(message: string, details?: Record<string, unknown>) => void} warn
 *           Logs a warning.
 * @property {(message: string, error: Error, details?: Record<string, unknown>) => void} log
 *           Logs an error without throwing.
 * @description Interface for the router's error handling system.
 */ // -----------------------------------------------------------------------------
// Event Callback Types
// -----------------------------------------------------------------------------
/**
 * Callback for `router:beforeEach` event.
 * @callback NavigationContextCallback
 * @param {NavigationContext} context
 *        The navigation context (can be modified to block/redirect).
 * @returns {void | Promise<void>}
 * @description Modify context to control navigation flow.
 */ /**
 * Callback for `router:beforeResolve` and `router:afterResolve` events.
 * @callback ResolveContextCallback
 * @param {ResolveContext} context
 *        The resolve context (can be modified to block/redirect).
 * @returns {void | Promise<void>}
 * @description Callback for `router:beforeResolve` and `router:afterResolve` events.
 */ /**
 * Callback for `router:beforeRender` and `router:afterRender` events.
 * @callback RenderContextCallback
 * @param {RenderContext} context
 *        The render context.
 * @returns {void | Promise<void>}
 * @description Callback for `router:beforeRender` and `router:afterRender` events.
 */ /**
 * Callback for `router:scroll` event.
 * @callback ScrollContextCallback
 * @param {ScrollContext} context
 *        The scroll context with saved position info.
 * @returns {void | Promise<void>}
 * @description Use to implement custom scroll behavior.
 */ /**
 * Callback for `router:afterEnter`, `router:afterLeave`, `router:afterEach` events.
 * @callback RouteChangeCallback
 * @param {RouteLocation} to
 *        The target route location.
 * @param {RouteLocation | null} from
 *        The source route location.
 * @returns {void | Promise<void>}
 * @description Callback for `router:afterEnter`, `router:afterLeave`, `router:afterEach` events.
 */ /**
 * Router context injected into component setup as `ctx.router`.
 * @typedef {Object} RouterContext
 * @property {NavigateFunction} navigate
 *           Programmatic navigation function.
 * @property {Signal<RouteLocation | null>} current
 *           Reactive signal for current route.
 * @property {Signal<RouteLocation | null>} previous
 *           Reactive signal for previous route.
 * @property {RouteParams} params
 *           Current route params (getter).
 * @property {QueryParams} query
 *           Current route query (getter).
 * @property {string} path
 *           Current route path (getter).
 * @property {string} fullUrl
 *           Current routed URL string (getter).
 * @property {RouteMeta} meta
 *           Current route meta (getter).
 * @description Injected into component setup as `ctx.router`.
 */ /**
 * Callback for `router:error` event.
 * @callback RouterErrorCallback
 * @param {Error} error
 *        The error that occurred.
 * @param {RouteLocation} [to]
 *        The target route (if available).
 * @param {RouteLocation | null} [from]
 *        The source route (if available).
 * @returns {void | Promise<void>}
 * @description Callback for `router:error` event.
 */ /**
 * Callback for `router:ready` event.
 * @callback RouterReadyCallback
 * @param {Router} router
 *        The router instance.
 * @returns {void | Promise<void>}
 * @description Callback for `router:ready` event.
 */ /**
 * Callback for `router:routeAdded` event.
 * @callback RouteAddedCallback
 * @param {RouteDefinition} route
 *        The added route definition.
 * @returns {void | Promise<void>}
 * @description Callback for `router:routeAdded` event.
 */ /**
 * Callback for `router:routeRemoved` event.
 * @callback RouteRemovedCallback
 * @param {RouteDefinition} route
 *        The removed route definition.
 * @returns {void | Promise<void>}
 * @description Callback for `router:routeRemoved` event.
 */ // ============================================================================
// CORE IMPLEMENTATION
// ============================================================================
/**
 * Simple error handler for the core router.
 * @private
 */ const CoreErrorHandler = {
    /**
   * Handles router errors with basic formatting.
   * @param {Error} error - The error to handle.
   * @param {string} context - The context where the error occurred.
   * @param {Record<string, unknown>} details - Additional error details.
   * @throws {Error} The formatted error.
   */ handle (error, context, details = {}) {
        const message = `[ElevaRouter] ${context}: ${error.message}`;
        const formattedError = new Error(message);
        // Preserve original error details
        formattedError.originalError = error;
        formattedError.context = context;
        formattedError.details = details;
        console.error(message, {
            error,
            context,
            details
        });
        throw formattedError;
    },
    /**
   * Logs a warning without throwing an error.
   * @param {string} message - The warning message.
   * @param {Record<string, unknown>} details - Additional warning details.
   */ warn (message, details = {}) {
        console.warn(`[ElevaRouter] ${message}`, details);
    },
    /**
   * Logs an error without throwing.
   * @param {string} message - The error message.
   * @param {Error} error - The original error.
   * @param {Record<string, unknown>} details - Additional error details.
   */ log (message, error, details = {}) {
        console.error(`[ElevaRouter] ${message}`, {
            error,
            details
        });
    }
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
 */ /**
 * Return value of a navigation guard.
 * - `true` or `undefined/void`: Allow navigation
 * - `false`: Abort navigation
 * - `string`: Redirect to path
 * - `NavigationTarget`: Redirect with options
 * @typedef {boolean | string | NavigationTarget | void} NavigationGuardResult
 */ /**
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
 */ /**
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
 */ /**
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
 */ /**
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
 */ /**
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
 */ /**
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
 */ /**
 * Context object for scroll events.
 * @typedef {Object} ScrollContext
 * @property {RouteLocation} to
 *           The target route location.
 * @property {RouteLocation | null} from
 *           The source route location.
 * @property {{x: number, y: number} | null} savedPosition
 *           Saved position (back/forward nav).
 * @description Passed to scroll events for plugins to handle scroll behavior.
 */ /**
 * A component that can be rendered for a route.
 * - `string`: Name of a registered component
 * - `ComponentDefinition`: Inline component definition
 * - `() => ComponentDefinition`: Factory function returning a component
 * - `() => Promise<ComponentDefinition>`: Async factory function
 * - `() => Promise<{default: ComponentDefinition}>`: Lazy-loaded module (e.g., `() => import('./Page.js')`)
 * @typedef {string | ComponentDefinition | (() => ComponentDefinition | Promise<ComponentDefinition | {default: ComponentDefinition}>)} RouteComponent
 */ /**
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
 */ /**
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
 */ class Router {
    /**
   * Validates the provided router options.
   * @private
   * @throws {Error} If the routing mode is invalid.
   */ _validateOptions() {
        if (![
            "hash",
            "query",
            "history"
        ].includes(this.options.mode)) {
            this.errorHandler.handle(new Error(`Invalid routing mode: ${this.options.mode}. Must be "hash", "query", or "history".`), "Configuration validation failed");
        }
    }
    /**
   * Pre-processes route definitions to parse their path segments for efficient matching.
   * @private
   * @param {RouteDefinition[]} routes - The raw route definitions.
   * @returns {RouteDefinition[]} The processed routes.
   */ _processRoutes(routes) {
        const processedRoutes = [];
        for (const route of routes){
            try {
                processedRoutes.push({
                    ...route,
                    segments: this._parsePathIntoSegments(route.path)
                });
            } catch (error) {
                this.errorHandler.warn(`Invalid path in route definition "${route.path || "undefined"}": ${error.message}`, {
                    route,
                    error
                });
            }
        }
        return processedRoutes;
    }
    /**
   * Parses a route path string into an array of static and parameter segments.
   * @private
   * @param {string} path - The path pattern to parse.
   * @returns {{type: 'static' | 'param', value?: string, name?: string}[]} An array of segment objects.
   * @throws {Error} If the route path is not a valid string.
   */ _parsePathIntoSegments(path) {
        if (!path || typeof path !== "string") {
            this.errorHandler.handle(new Error("Route path must be a non-empty string"), "Path parsing failed", {
                path
            });
        }
        const normalizedPath = path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
        if (normalizedPath === "/") {
            return [];
        }
        return normalizedPath.split("/").filter(Boolean).map((segment)=>{
            if (segment.startsWith(":")) {
                const paramName = segment.substring(1);
                if (!paramName) {
                    this.errorHandler.handle(new Error(`Invalid parameter segment: ${segment}`), "Path parsing failed", {
                        segment,
                        path
                    });
                }
                return {
                    type: "param",
                    name: paramName
                };
            }
            return {
                type: "static",
                value: segment
            };
        });
    }
    /**
   * Finds the view element within a container using multiple selector strategies.
   * @private
   * @param {HTMLElement} container - The parent element to search within.
   * @returns {HTMLElement} The found view element or the container itself as a fallback.
   */ _findViewElement(container) {
        const selector = this.options.viewSelector;
        return container.querySelector(`#${selector}`) || container.querySelector(`.${selector}`) || container.querySelector(`[data-${selector}]`) || container.querySelector(selector) || container;
    }
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
   */ async start() {
        if (this.isStarted) {
            this.errorHandler.warn("Router is already started");
            return this;
        }
        if (typeof window === "undefined") {
            this.errorHandler.warn("Router start skipped: `window` object not available (SSR environment)");
            return this;
        }
        if (typeof document !== "undefined" && !document.querySelector(this.options.mount)) {
            this.errorHandler.warn(`Mount element "${this.options.mount}" was not found in the DOM. The router will not start.`, {
                mountSelector: this.options.mount
            });
            return this;
        }
        const handler = ()=>this._handleRouteChange();
        if (this.options.mode === "hash") {
            window.addEventListener("hashchange", handler);
            this.eventListeners.push(()=>window.removeEventListener("hashchange", handler));
        } else {
            window.addEventListener("popstate", handler);
            this.eventListeners.push(()=>window.removeEventListener("popstate", handler));
        }
        this.isStarted = true;
        // Initial navigation is not a popstate event
        await this._handleRouteChange(false);
        // Set isReady to true after initial navigation completes
        this.isReady.value = true;
        await this.emitter.emit("router:ready", this);
        return this;
    }
    /**
   * Stops the router and cleans up event listeners.
   * Unmounts the current layout instance if present.
   * @async
   * @returns {Promise<void>}
   * @see start - Restart the router after destroying.
   */ async destroy() {
        if (!this.isStarted) return;
        // Clean up plugins
        for (const plugin of this.plugins.values()){
            if (typeof plugin.destroy === "function") {
                try {
                    await plugin.destroy(this);
                } catch (error) {
                    this.errorHandler.log(`Plugin ${plugin.name} destroy failed`, error);
                }
            }
        }
        this.eventListeners.forEach((cleanup)=>cleanup());
        this.eventListeners = [];
        if (this.currentLayout.value) {
            await this.currentLayout.value.unmount();
        }
        this.isStarted = false;
        this.isReady.value = false;
    }
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
   */ async stop() {
        return this.destroy();
    }
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
   */ async navigate(location, params = {}) {
        try {
            const target = typeof location === "string" ? {
                path: location,
                params
            } : location;
            let path = this._buildPath(target.path, target.params || {});
            const query = target.query || {};
            if (Object.keys(query).length > 0) {
                const queryString = new URLSearchParams(query).toString();
                if (queryString) path += `?${queryString}`;
            }
            if (this._isSameRoute(path, target.params, query)) {
                return true; // Already at this route, consider it successful
            }
            const navigationSuccessful = await this._proceedWithNavigation(path);
            if (navigationSuccessful) {
                // Increment navigation ID and capture it for this navigation
                const currentNavId = ++this._navigationId;
                this._isNavigating = true;
                try {
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
                        const url = this.options.mode === "query" ? this._buildQueryUrl(path) : path;
                        history[historyMethod](state, "", url);
                    }
                } finally{
                    // Always reset the flag via microtask, even if history manipulation throws
                    // Only reset if no newer navigation has started
                    queueMicrotask(()=>{
                        if (this._navigationId === currentNavId) {
                            this._isNavigating = false;
                        }
                    });
                }
            }
            return navigationSuccessful;
        } catch (error) {
            this.errorHandler.log("Navigation failed", error);
            await this.emitter.emit("router:error", error);
            return false;
        }
    }
    /**
   * Builds a URL for query mode.
   * @private
   * @param {string} path - The path to set as the query parameter.
   * @returns {string} The full URL with the updated query string.
   */ _buildQueryUrl(path) {
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
   * @returns {boolean} True if the routes are the same.
   */ _isSameRoute(path, params, query) {
        const current = this.currentRoute.value;
        if (!current) return false;
        const [targetPath, queryString] = path.split("?");
        const targetQuery = query || this._parseQuery(queryString || "");
        return current.path === targetPath && JSON.stringify(current.params) === JSON.stringify(params || {}) && JSON.stringify(current.query) === JSON.stringify(targetQuery);
    }
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
   */ _buildPath(path, params) {
        let result = path;
        for (const [key, value] of Object.entries(params)){
            // Fix: Handle special characters and ensure proper encoding
            const encodedValue = encodeURIComponent(String(value));
            result = result.replace(new RegExp(`:${key}\\b`, "g"), encodedValue);
        }
        return result;
    }
    /**
   * The handler for browser-initiated route changes (e.g., back/forward buttons).
   *
   * @private
   * @async
   * @param {boolean} [isPopState=true] - Whether this is a popstate event (back/forward navigation).
   * @returns {Promise<void>}
   * @emits router:error When route change handling fails.
   */ async _handleRouteChange(isPopState = true) {
        if (this._isNavigating) return;
        try {
            const from = this.currentRoute.value;
            const toLocation = this._getCurrentLocation();
            const navigationSuccessful = await this._proceedWithNavigation(toLocation.fullUrl, isPopState);
            // If navigation was blocked by a guard, revert the URL change
            if (!navigationSuccessful && from) {
                this.navigate({
                    path: from.path,
                    query: from.query,
                    replace: true
                });
            }
        } catch (error) {
            this.errorHandler.log("Route change handling failed", error, {
                currentUrl: typeof window !== "undefined" ? window.location.href : ""
            });
            await this.emitter.emit("router:error", error);
        }
    }
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
   */ async _proceedWithNavigation(fullPath, isPopState = false) {
        const from = this.currentRoute.value;
        const [path, queryString] = (fullPath || "/").split("?");
        const toLocation = {
            path: path.startsWith("/") ? path : `/${path}`,
            query: this._parseQuery(queryString),
            fullUrl: fullPath
        };
        let toMatch = this._matchRoute(toLocation.path);
        if (!toMatch) {
            const notFoundRoute = this.routes.find((route)=>route.path === "*");
            if (notFoundRoute) {
                toMatch = {
                    route: notFoundRoute,
                    params: {
                        pathMatch: decodeURIComponent(toLocation.path.substring(1))
                    }
                };
            } else {
                await this.emitter.emit("router:error", new Error(`Route not found: ${toLocation.path}`), toLocation, from);
                return false;
            }
        }
        const to = {
            ...toLocation,
            params: toMatch.params,
            meta: toMatch.route.meta || {},
            name: toMatch.route.name,
            matched: toMatch.route
        };
        try {
            // 1. Run all *pre-navigation* guards.
            const canNavigate = await this._runGuards(to, from, toMatch.route);
            if (!canNavigate) return false;
            // 2. Save current scroll position before navigating away
            if (from && typeof window !== "undefined") {
                this._scrollPositions.set(from.path, {
                    x: window.scrollX || window.pageXOffset || 0,
                    y: window.scrollY || window.pageYOffset || 0
                });
            }
            // 3. Emit beforeResolve event - plugins can show loading indicators
            /** @type {ResolveContext} */ const resolveContext = {
                to,
                from,
                route: toMatch.route,
                layoutComponent: null,
                pageComponent: null,
                cancelled: false,
                redirectTo: null
            };
            await this.emitter.emit("router:beforeResolve", resolveContext);
            // Check if resolution was cancelled or redirected
            if (resolveContext.cancelled) return false;
            if (resolveContext.redirectTo) {
                this.navigate(resolveContext.redirectTo);
                return false;
            }
            // 4. Resolve async components *before* touching the DOM.
            const { layoutComponent, pageComponent } = await this._resolveComponents(toMatch.route);
            // 5. Emit afterResolve event - plugins can hide loading indicators
            resolveContext.layoutComponent = layoutComponent;
            resolveContext.pageComponent = pageComponent;
            await this.emitter.emit("router:afterResolve", resolveContext);
            // 6. Unmount the previous view/layout.
            if (from) {
                const toLayout = toMatch.route.layout || this.options.globalLayout;
                const fromLayout = from.matched.layout || this.options.globalLayout;
                const tryUnmount = async (instance)=>{
                    if (!instance) return;
                    try {
                        await instance.unmount();
                    } catch (error) {
                        this.errorHandler.warn("Error during component unmount", {
                            error,
                            instance
                        });
                    }
                };
                if (toLayout !== fromLayout) {
                    await tryUnmount(this.currentLayout.value);
                    this.currentLayout.value = null;
                } else {
                    await tryUnmount(this.currentView.value);
                    this.currentView.value = null;
                }
                // Call `afterLeave` hook *after* the old component has been unmounted.
                if (from.matched.afterLeave) {
                    await from.matched.afterLeave(to, from);
                }
                await this.emitter.emit("router:afterLeave", to, from);
            }
            // 7. Update reactive state.
            this.previousRoute.value = from;
            this.currentRoute.value = to;
            this.currentParams.value = to.params || {};
            this.currentQuery.value = to.query || {};
            // 8. Emit beforeRender event - plugins can add transitions
            /** @type {RenderContext} */ const renderContext = {
                to,
                from,
                layoutComponent,
                pageComponent
            };
            await this.emitter.emit("router:beforeRender", renderContext);
            // 9. Render the new components.
            await this._render(layoutComponent, pageComponent);
            // 10. Emit afterRender event - plugins can trigger animations
            await this.emitter.emit("router:afterRender", renderContext);
            // 11. Emit scroll event - plugins can handle scroll restoration
            /** @type {ScrollContext} */ const scrollContext = {
                to,
                from,
                savedPosition: isPopState ? this._scrollPositions.get(to.path) || null : null
            };
            await this.emitter.emit("router:scroll", scrollContext);
            // 12. Run post-navigation hooks.
            if (toMatch.route.afterEnter) {
                await toMatch.route.afterEnter(to, from);
            }
            await this.emitter.emit("router:afterEnter", to, from);
            await this.emitter.emit("router:afterEach", to, from);
            return true;
        } catch (error) {
            this.errorHandler.log("Error during navigation", error, {
                to,
                from
            });
            await this.emitter.emit("router:error", error, to, from);
            return false;
        }
    }
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
   */ async _runGuards(to, from, route) {
        // Create navigation context that plugins can modify to block navigation
        /** @type {NavigationContext} */ const navContext = {
            to,
            from,
            cancelled: false,
            redirectTo: null
        };
        // Emit beforeEach event with context - plugins can block by modifying context
        await this.emitter.emit("router:beforeEach", navContext);
        // Check if navigation was cancelled or redirected by event listeners
        if (navContext.cancelled) return false;
        if (navContext.redirectTo) {
            this.navigate(navContext.redirectTo);
            return false;
        }
        // Collect all guards in execution order
        const guards = [
            ...this._beforeEachGuards,
            ...from && from.matched.beforeLeave ? [
                from.matched.beforeLeave
            ] : [],
            ...route.beforeEnter ? [
                route.beforeEnter
            ] : []
        ];
        for (const guard of guards){
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
   *
   * @note Core plugins (Router, Attr, Store) may access eleva._components
   * directly. This is intentional and stable for official Eleva plugins shipped
   * with the framework. Third-party plugins should use eleva.component() for
   * registration and avoid direct access to internal APIs.
   */ _resolveStringComponent(def) {
        const componentDef = this.eleva._components.get(def);
        if (!componentDef) {
            this.errorHandler.handle(new Error(`Component "${def}" not registered.`), "Component resolution failed", {
                componentName: def,
                availableComponents: Array.from(this.eleva._components.keys())
            });
        }
        return componentDef;
    }
    /**
   * Resolves a function component definition to a component object.
   * @private
   * @async
   * @param {() => ComponentDefinition | Promise<ComponentDefinition | { default: ComponentDefinition }>} def - The function to resolve.
   * @returns {Promise<ComponentDefinition>} The resolved component.
   * @throws {Error} If the function fails to load the component.
   */ async _resolveFunctionComponent(def) {
        try {
            const funcStr = def.toString();
            const isAsyncImport = funcStr.includes("import(") || funcStr.startsWith("() =>");
            const result = await def();
            return isAsyncImport ? result.default || result : result;
        } catch (error) {
            this.errorHandler.handle(new Error(`Failed to load async component: ${error.message}`), "Component resolution failed", {
                function: def.toString(),
                error
            });
        }
    }
    /**
   * Validates a component definition object.
   * @private
   * @param {unknown} def - The component definition to validate.
   * @returns {ComponentDefinition} The validated component.
   * @throws {Error} If the component definition is invalid.
   */ _validateComponentDefinition(def) {
        if (!def || typeof def !== "object") {
            this.errorHandler.handle(new Error(`Invalid component definition: ${typeof def}`), "Component validation failed", {
                definition: def
            });
        }
        if (typeof def.template !== "function" && typeof def.template !== "string") {
            this.errorHandler.handle(new Error("Component missing template property"), "Component validation failed", {
                definition: def
            });
        }
        return def;
    }
    /**
   * Resolves a component definition to a component object.
   * @private
   * @param {unknown} def - The component definition to resolve.
   * @returns {Promise<ComponentDefinition | null>} The resolved component or null.
   */ async _resolveComponent(def) {
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
        this.errorHandler.handle(new Error(`Invalid component definition: ${typeof def}`), "Component resolution failed", {
            definition: def
        });
    }
    /**
   * Asynchronously resolves the layout and page components for a route.
   * @private
   * @async
   * @param {RouteDefinition} route - The route to resolve components for.
   * @returns {Promise<{layoutComponent: ComponentDefinition | null, pageComponent: ComponentDefinition}>}
   * @throws {Error} If page component cannot be resolved.
   */ async _resolveComponents(route) {
        const effectiveLayout = route.layout || this.options.globalLayout;
        try {
            const [layoutComponent, pageComponent] = await Promise.all([
                this._resolveComponent(effectiveLayout),
                this._resolveComponent(route.component)
            ]);
            if (!pageComponent) {
                this.errorHandler.handle(new Error(`Page component is null or undefined for route: ${route.path}`), "Component resolution failed", {
                    route: route.path
                });
            }
            return {
                layoutComponent,
                pageComponent
            };
        } catch (error) {
            this.errorHandler.log(`Error resolving components for route ${route.path}`, error, {
                route: route.path
            });
            throw error;
        }
    }
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
   */ async _render(layoutComponent, pageComponent) {
        const mountEl = document.querySelector(this.options.mount);
        if (!mountEl) {
            this.errorHandler.handle(new Error(`Mount element "${this.options.mount}" not found.`), {
                mountSelector: this.options.mount
            });
        }
        if (layoutComponent) {
            const layoutInstance = await this.eleva.mount(mountEl, this._wrapComponentWithChildren(layoutComponent));
            this.currentLayout.value = layoutInstance;
            const viewEl = this._findViewElement(layoutInstance.container);
            const viewInstance = await this.eleva.mount(viewEl, this._wrapComponentWithChildren(pageComponent));
            this.currentView.value = viewInstance;
        } else {
            const viewInstance = await this.eleva.mount(mountEl, this._wrapComponentWithChildren(pageComponent));
            this.currentView.value = viewInstance;
            this.currentLayout.value = null;
        }
    }
    /**
   * Creates a getter function for router context properties.
   * @private
   * @param {string} property - The property name to access.
   * @param {unknown} defaultValue - The default value if property is undefined.
   * @returns {() => unknown} A getter function.
   */ _createRouteGetter(property, defaultValue) {
        return ()=>this.currentRoute.value?.[property] ?? defaultValue;
    }
    /**
   * Wraps a component definition to inject router-specific context into its setup function.
   * @private
   * @param {ComponentDefinition} component - The component to wrap.
   * @returns {ComponentDefinition} The wrapped component definition.
   */ _wrapComponent(component) {
        const originalSetup = component.setup;
        const self = this;
        return {
            ...component,
            async setup (ctx) {
                /** @type {RouterContext} */ ctx.router = {
                    navigate: self.navigate.bind(self),
                    current: self.currentRoute,
                    previous: self.previousRoute,
                    // Route property getters
                    get params () {
                        return self._createRouteGetter("params", {})();
                    },
                    get query () {
                        return self._createRouteGetter("query", {})();
                    },
                    get path () {
                        return self._createRouteGetter("path", "/")();
                    },
                    get fullUrl () {
                        return self._createRouteGetter("fullUrl", window.location.href)();
                    },
                    get meta () {
                        return self._createRouteGetter("meta", {})();
                    }
                };
                return originalSetup ? await originalSetup(ctx) : {};
            }
        };
    }
    /**
   * Recursively wraps all child components to ensure they have access to router context.
   * String component references are returned as-is (context injected during mount).
   * Objects are wrapped with router context and their children are recursively wrapped.
   *
   * @private
   * @param {ComponentDefinition | string} component - The component to wrap (can be a definition object or a registered component name).
   * @returns {ComponentDefinition | string} The wrapped component definition or the original string reference.
   * @see _wrapComponent - Single component wrapping.
   */ _wrapComponentWithChildren(component) {
        // If the component is a string (registered component name), return as-is
        // The router context will be injected when the component is resolved during mounting
        if (typeof component === "string") {
            return component;
        }
        // If not a valid component object, return as-is
        if (!component || typeof component !== "object") {
            return component;
        }
        const wrappedComponent = this._wrapComponent(component);
        // If the component has children, wrap them too
        if (wrappedComponent.children && typeof wrappedComponent.children === "object") {
            const wrappedChildren = {};
            for (const [selector, childComponent] of Object.entries(wrappedComponent.children)){
                wrappedChildren[selector] = this._wrapComponentWithChildren(childComponent);
            }
            wrappedComponent.children = wrappedChildren;
        }
        return wrappedComponent;
    }
    /**
   * Gets the current location information from the browser's window object.
   * @private
   * @returns {Omit<RouteLocation, 'params' | 'meta' | 'name' | 'matched'>}
   */ _getCurrentLocation() {
        if (typeof window === "undefined") return {
            path: "/",
            query: {},
            fullUrl: ""
        };
        let path, queryString, fullUrl;
        switch(this.options.mode){
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
            default:
                path = window.location.pathname || "/";
                queryString = window.location.search.slice(1);
                fullUrl = `${path}${queryString ? "?" + queryString : ""}`;
        }
        return {
            path: path.startsWith("/") ? path : `/${path}`,
            query: this._parseQuery(queryString),
            fullUrl
        };
    }
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
   */ _parseQuery(queryString) {
        const query = {};
        if (queryString) {
            new URLSearchParams(queryString).forEach((value, key)=>{
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
   */ _matchRoute(path) {
        const pathSegments = path.split("/").filter(Boolean);
        for (const route of this.routes){
            // Handle the root path as a special case.
            if (route.path === "/") {
                if (pathSegments.length === 0) return {
                    route,
                    params: {}
                };
                continue;
            }
            if (route.segments.length !== pathSegments.length) continue;
            const params = {};
            let isMatch = true;
            for(let i = 0; i < route.segments.length; i++){
                const routeSegment = route.segments[i];
                const pathSegment = pathSegments[i];
                if (routeSegment.type === "param") {
                    params[routeSegment.name] = decodeURIComponent(pathSegment);
                } else if (routeSegment.value !== pathSegment) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) return {
                route,
                params
            };
        }
        return null;
    }
    // ============================================
    // Dynamic Route Management API
    // ============================================
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
   */ addRoute(route, parentRoute = null) {
        if (!route || !route.path) {
            this.errorHandler.warn("Invalid route definition: missing path", {
                route
            });
            return ()=>{};
        }
        // Check if route already exists
        if (this.hasRoute(route.path)) {
            this.errorHandler.warn(`Route "${route.path}" already exists`, {
                route
            });
            return ()=>{};
        }
        // Process the route (parse segments)
        const processedRoute = {
            ...route,
            segments: this._parsePathIntoSegments(route.path)
        };
        // Add to routes array (before wildcard if exists)
        const wildcardIndex = this.routes.findIndex((r)=>r.path === "*");
        if (wildcardIndex !== -1) {
            this.routes.splice(wildcardIndex, 0, processedRoute);
        } else {
            this.routes.push(processedRoute);
        }
        // Emit event for plugins
        this.emitter.emit("router:routeAdded", processedRoute);
        // Return removal function
        return ()=>this.removeRoute(route.path);
    }
    /**
   * Removes a route by its path.
   *
   * @param {string} path - The path of the route to remove.
   * @returns {boolean} True if the route was removed, false if not found.
   * @emits router:routeRemoved When a route is successfully removed.
   *
   * @example
   * router.removeRoute('/dynamic');
   */ removeRoute(path) {
        const index = this.routes.findIndex((r)=>r.path === path);
        if (index === -1) {
            return false;
        }
        const [removedRoute] = this.routes.splice(index, 1);
        // Emit event for plugins
        this.emitter.emit("router:routeRemoved", removedRoute);
        return true;
    }
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
   */ hasRoute(path) {
        return this.routes.some((r)=>r.path === path);
    }
    /**
   * Gets all registered routes.
   *
   * @returns {RouteDefinition[]} A copy of the routes array.
   *
   * @example
   * const routes = router.getRoutes();
   * console.log('Available routes:', routes.map(r => r.path));
   */ getRoutes() {
        return [
            ...this.routes
        ];
    }
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
   */ getRoute(path) {
        return this.routes.find((r)=>r.path === path);
    }
    // ============================================
    // Hook Registration Methods
    // ============================================
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
   */ onBeforeEach(guard) {
        this._beforeEachGuards.push(guard);
        return ()=>{
            const index = this._beforeEachGuards.indexOf(guard);
            if (index > -1) {
                this._beforeEachGuards.splice(index, 1);
            }
        };
    }
    /**
   * Registers a global hook that runs after a new route component has been mounted.
   * @param {NavigationHook} hook - The hook function to register.
   * @returns {() => void} A function to unregister the hook.
   * @listens router:afterEnter
   */ onAfterEnter(hook) {
        return this.emitter.on("router:afterEnter", hook);
    }
    /**
   * Registers a global hook that runs after a route component has been unmounted.
   * @param {NavigationHook} hook - The hook function to register.
   * @returns {() => void} A function to unregister the hook.
   * @listens router:afterLeave
   */ onAfterLeave(hook) {
        return this.emitter.on("router:afterLeave", hook);
    }
    /**
   * Registers a global hook that runs after a navigation has been confirmed and all hooks have completed.
   * @param {NavigationHook} hook - The hook function to register.
   * @returns {() => void} A function to unregister the hook.
   * @listens router:afterEach
   */ onAfterEach(hook) {
        return this.emitter.on("router:afterEach", hook);
    }
    /**
   * Registers a global error handler for navigation errors.
   * @param {(error: Error, to?: RouteLocation, from?: RouteLocation) => void} handler - The error handler function.
   * @returns {() => void} A function to unregister the handler.
   * @listens router:error
   */ onError(handler) {
        return this.emitter.on("router:error", handler);
    }
    /**
   * Registers a plugin with the router.
   * Logs a warning if the plugin is already registered.
   *
   * @param {RouterPlugin} plugin - The plugin to register (must have install method).
   * @param {Record<string, unknown>} [options={}] - Options to pass to plugin.install().
   * @returns {void}
   * @throws {Error} If plugin does not have an install method.
   */ use(plugin, options = {}) {
        if (typeof plugin.install !== "function") {
            this.errorHandler.handle(new Error("Plugin must have an install method"), "Plugin registration failed", {
                plugin
            });
        }
        // Check if plugin is already registered
        if (this.plugins.has(plugin.name)) {
            this.errorHandler.warn(`Plugin "${plugin.name}" is already registered`, {
                existingPlugin: this.plugins.get(plugin.name)
            });
            return;
        }
        this.plugins.set(plugin.name, plugin);
        plugin.install(this, options);
    }
    /**
   * Gets all registered plugins.
   * @returns {RouterPlugin[]} Array of registered plugins.
   */ getPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
   * Gets a plugin by name.
   * @param {string} name - The plugin name.
   * @returns {RouterPlugin | undefined} The plugin or undefined.
   */ getPlugin(name) {
        return this.plugins.get(name);
    }
    /**
   * Removes a plugin from the router.
   * @param {string} name - The plugin name.
   * @returns {boolean} True if the plugin was removed.
   */ removePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) return false;
        // Call destroy if available
        if (typeof plugin.destroy === "function") {
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
   * Logs a warning if the provided handler is invalid (missing required methods).
   * @param {RouterErrorHandler} errorHandler - The error handler object with handle, warn, and log methods.
   * @returns {void}
   */ setErrorHandler(errorHandler) {
        if (errorHandler && typeof errorHandler.handle === "function" && typeof errorHandler.warn === "function" && typeof errorHandler.log === "function") {
            this.errorHandler = errorHandler;
        } else {
            console.warn("[ElevaRouter] Invalid error handler provided. Must have handle, warn, and log methods.");
        }
    }
    /**
   * Creates an instance of the Router.
   * @param {Eleva} eleva - The Eleva framework instance.
   * @param {RouterOptions} options - The configuration options for the router.
   * @throws {Error} If the routing mode is invalid.
   */ constructor(eleva, options = {}){
        /** @type {Eleva} The Eleva framework instance. */ this.eleva = eleva;
        /** @type {RouterOptions} The merged router options. */ this.options = {
            mode: "hash",
            queryParam: "view",
            viewSelector: "view",
            ...options
        };
        /** @private @type {RouteDefinition[]} The processed list of route definitions. */ this.routes = this._processRoutes(options.routes || []);
        /** @private @type {Emitter} The shared Eleva event emitter for global hooks. */ this.emitter = this.eleva.emitter;
        /** @private @type {boolean} A flag indicating if the router has been started. */ this.isStarted = false;
        /** @private @type {boolean} A flag to prevent navigation loops from history events. */ this._isNavigating = false;
        /** @private @type {number} Counter for tracking navigation operations to prevent race conditions. */ this._navigationId = 0;
        /** @private @type {UnsubscribeFunction[]} A collection of cleanup functions for event listeners. */ this.eventListeners = [];
        /** @type {Signal<RouteLocation | null>} A reactive signal holding the current route's information. */ this.currentRoute = new this.eleva.signal(null);
        /** @type {Signal<RouteLocation | null>} A reactive signal holding the previous route's information. */ this.previousRoute = new this.eleva.signal(null);
        /** @type {Signal<RouteParams>} A reactive signal holding the current route's parameters. */ this.currentParams = new this.eleva.signal({});
        /** @type {Signal<QueryParams>} A reactive signal holding the current route's query parameters. */ this.currentQuery = new this.eleva.signal({});
        /** @type {Signal<MountResult | null>} A reactive signal for the currently mounted layout instance. */ this.currentLayout = new this.eleva.signal(null);
        /** @type {Signal<MountResult | null>} A reactive signal for the currently mounted view (page) instance. */ this.currentView = new this.eleva.signal(null);
        /** @type {Signal<boolean>} A reactive signal indicating if the router is ready (started and initial navigation complete). */ this.isReady = new this.eleva.signal(false);
        /** @private @type {Map<string, RouterPlugin>} Map of registered plugins by name. */ this.plugins = new Map();
        /** @private @type {NavigationGuard[]} Array of global before-each navigation guards. */ this._beforeEachGuards = [];
        // If onBeforeEach was provided in options, add it to the guards array
        if (options.onBeforeEach) {
            this._beforeEachGuards.push(options.onBeforeEach);
        }
        /** @type {RouterErrorHandler} The error handler instance. Can be overridden by plugins. */ this.errorHandler = CoreErrorHandler;
        /** @private @type {Map<string, {x: number, y: number}>} Saved scroll positions by route path. */ this._scrollPositions = new Map();
        this._validateOptions();
    }
}
/**
 * @class 🚀 RouterPlugin
 * @classdesc A powerful, reactive, and flexible Router Plugin for Eleva applications.
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
 */ const RouterPlugin = {
    /**
   * Unique identifier for the plugin
   * @type {string}
   */ name: "router",
    /**
   * Plugin version
   * @type {string}
   */ version: "1.1.1",
    /**
   * Plugin description
   * @type {string}
   */ description: "Client-side routing for Eleva applications",
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
   */ install (eleva, options = {}) {
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
     * @inner
     * @param {unknown} def - The component definition to register.
     * @param {string} type - The type of component for naming (e.g., "Route", "Layout").
     * @returns {string | null} The registered component name or null if no definition provided.
     */ const register = (def, type)=>{
            if (!def) return null;
            if (typeof def === "object" && def !== null && !def.name) {
                const name = `Eleva${type}Component_${Math.random().toString(36).slice(2, 11)}`;
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
        (options.routes || []).forEach((route)=>{
            route.component = register(route.component, "Route");
            if (route.layout) {
                route.layout = register(route.layout, "RouteLayout");
            }
        });
        const router = new Router(eleva, options);
        /** @type {Router} */ eleva.router = router;
        if (options.autoStart !== false) {
            queueMicrotask(()=>router.start());
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
        /** @type {NavigateFunction} */ eleva.navigate = router.navigate.bind(router);
        /** @type {() => RouteLocation | null} */ eleva.getCurrentRoute = ()=>router.currentRoute.value;
        /** @type {() => RouteParams} */ eleva.getRouteParams = ()=>router.currentParams.value;
        /** @type {() => QueryParams} */ eleva.getRouteQuery = ()=>router.currentQuery.value;
        return router;
    },
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
   */ async uninstall (eleva) {
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

/**
 * @module eleva/plugins/store
 * @fileoverview Reactive state management plugin with namespaced modules,
 * persistence, and subscription system.
 */ // ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// -----------------------------------------------------------------------------
// External Type Imports
// -----------------------------------------------------------------------------
/**
 * Type imports from the Eleva core library.
 * @typedef {import('eleva').Eleva} Eleva
 * @typedef {import('eleva').ComponentDefinition} ComponentDefinition
 * @typedef {import('eleva').ComponentContext} ComponentContext
 * @typedef {import('eleva').SetupResult} SetupResult
 * @typedef {import('eleva').ComponentProps} ComponentProps
 * @typedef {import('eleva').ChildrenMap} ChildrenMap
 * @typedef {import('eleva').MountResult} MountResult
 */ /**
 * Generic type import.
 * @template T
 * @typedef {import('eleva').Signal<T>} Signal
 */ // -----------------------------------------------------------------------------
// Store Type Definitions
// -----------------------------------------------------------------------------
/**
 * Mutation record emitted to subscribers.
 * @typedef {Object} StoreMutation
 * @property {string} type
 *           The action name that was dispatched.
 * @property {unknown} payload
 *           The payload passed to the action.
 * @property {number} timestamp
 *           Unix timestamp of when the mutation occurred.
 * @description Record passed to subscribers when state changes via dispatch.
 * @example
 * store.subscribe((mutation, state) => {
 *   console.log(`Action: ${mutation.type}`);
 *   console.log(`Payload: ${mutation.payload}`);
 *   console.log(`Time: ${new Date(mutation.timestamp)}`);
 * });
 */ /**
 * Store configuration options.
 * @typedef {Object} StoreOptions
 * @property {Record<string, unknown>} [state]
 *           Initial state object.
 * @property {Record<string, ActionFunction>} [actions]
 *           Action functions for state mutations.
 * @property {Record<string, StoreModule>} [namespaces]
 *           Namespaced modules for organizing store.
 * @property {StorePersistenceOptions} [persistence]
 *           Persistence configuration.
 * @property {boolean} [devTools]
 *           Enable development tools integration.
 * @property {StoreErrorHandler} [onError]
 *           Error handler function.
 * @description Configuration options passed to StorePlugin.install().
 * @example
 * app.use(StorePlugin, {
 *   state: { count: 0, user: null },
 *   actions: {
 *     increment: (state) => state.count.value++,
 *     setUser: (state, user) => state.user.value = user
 *   },
 *   persistence: { enabled: true, key: 'my-app' }
 * });
 */ /**
 * Namespaced store module definition.
 * @typedef {Object} StoreModule
 * @property {Record<string, unknown>} state
 *           Module state.
 * @property {Record<string, ActionFunction>} [actions]
 *           Module actions.
 * @description Defines a namespaced module for organizing related state and actions.
 * @example
 * // Define a module
 * const authModule = {
 *   state: { user: null, token: null },
 *   actions: {
 *     login: (state, { user, token }) => {
 *       state.auth.user.value = user;
 *       state.auth.token.value = token;
 *     }
 *   }
 * };
 *
 * // Register dynamically
 * store.registerModule('auth', authModule);
 */ /**
 * Store persistence configuration.
 * @typedef {Object} StorePersistenceOptions
 * @property {boolean} [enabled]
 *           Enable state persistence.
 * @property {string} [key]
 *           Storage key (default: "eleva-store").
 * @property {'localStorage' | 'sessionStorage'} [storage]
 *           Storage type.
 * @property {string[]} [include]
 *           Dot-path prefixes to persist (e.g., "auth.user").
 * @property {string[]} [exclude]
 *           Dot-path prefixes to exclude.
 * @description Configuration for persisting store state to localStorage or sessionStorage.
 * @example
 * // Persist only specific state paths
 * persistence: {
 *   enabled: true,
 *   key: 'my-app-store',
 *   storage: 'localStorage',
 *   include: ['user', 'settings.theme']
 * }
 *
 * @example
 * // Exclude sensitive data
 * persistence: {
 *   enabled: true,
 *   exclude: ['auth.token', 'temp']
 * }
 */ /**
 * Store error handler callback.
 * @typedef {(error: Error, context: string) => void} StoreErrorHandler
 * @description Custom error handler for store operations.
 * @example
 * app.use(StorePlugin, {
 *   onError: (error, context) => {
 *     console.error(`Store error in ${context}:`, error);
 *     // Send to error tracking service
 *     errorTracker.capture(error, { context });
 *   }
 * });
 */ /**
 * Reactive state tree containing signals and nested namespaces.
 * @typedef {Record<string, Signal<unknown> | Record<string, unknown>>} StoreState
 * @description Represents the store's reactive state structure with support for nested modules.
 */ /**
 * Action function signature for store actions.
 * @typedef {(state: StoreState, payload?: unknown) => unknown} ActionFunction
 * @description Function that receives state and optional payload, returns action result.
 */ /**
 * Dispatch function signature for triggering actions.
 * @typedef {(actionName: string, payload?: unknown) => Promise<unknown>} DispatchFunction
 * @description Dispatches an action by name with optional payload, returns action result.
 */ /**
 * Subscribe callback signature for mutation listeners.
 * @typedef {(mutation: StoreMutation, state: StoreState) => void} SubscribeCallback
 * @description Called after each successful action dispatch with mutation details and current state.
 */ /**
 * Store API exposed to components via ctx.store.
 * @typedef {Object} StoreApi
 * @property {StoreState} state
 *           Reactive state signals (supports nested modules).
 * @property {DispatchFunction} dispatch
 *           Dispatch an action by name with optional payload.
 * @property {(callback: SubscribeCallback) => () => void} subscribe
 *           Subscribe to state mutations. Returns unsubscribe function.
 * @property {() => Record<string, unknown>} getState
 *           Get a snapshot of current state values.
 * @property {(namespace: string, module: StoreModule) => void} registerModule
 *           Register a namespaced module dynamically.
 * @property {(namespace: string) => void} unregisterModule
 *           Unregister a namespaced module.
 * @property {(key: string, initialValue: unknown) => Signal<unknown>} createState
 *           Create a new state signal dynamically.
 * @property {(name: string, actionFn: ActionFunction) => void} createAction
 *           Register a new action dynamically.
 * @property {new <T>(value: T) => Signal<T>} signal
 *           Signal class constructor for manual state creation.
 * @description The store API injected into component setup as `ctx.store`.
 * @example
 * app.component('Counter', {
 *   setup({ store }) {
 *     // Access reactive state
 *     const count = store.state.count;
 *
 *     // Dispatch actions
 *     const increment = () => store.dispatch('increment');
 *
 *     // Subscribe to changes
 *     const unsub = store.subscribe((mutation) => {
 *       console.log('State changed:', mutation.type);
 *     });
 *
 *     return { count, increment, onUnmount: () => unsub() };
 *   },
 *   template: (ctx) => `<button @click="increment">${ctx.count.value}</button>`
 * });
 * @see StoreMutation - Mutation record structure.
 * @see StoreModule - Module definition for namespaces.
 */ /**
 * @class 🏪 StorePlugin
 * @classdesc A powerful reactive state management plugin for Eleva that enables sharing
 * reactive data across the entire application. The Store plugin provides a centralized,
 * reactive data store that can be accessed from any component's setup function.
 *
 * Core Features:
 * - Centralized reactive state management using Eleva's signal system
 * - Global state accessibility through component setup functions
 * - Namespace support for organizing store modules
 * - Built-in persistence with localStorage/sessionStorage support
 * - Action-based state mutations with validation
 * - Subscription system for reactive updates
 * - DevTools integration for debugging
 * - Plugin architecture for extensibility
 *
 * @example
 * // Install the plugin
 * const app = new Eleva("myApp");
 * app.use(StorePlugin, {
 *   state: {
 *     user: { name: "John", email: "john@example.com" },
 *     counter: 0,
 *     todos: []
 *   },
 *   actions: {
 *     increment: (state) => state.counter.value++,
 *     addTodo: (state, todo) => state.todos.value = [...state.todos.value, todo],
 *     setUser: (state, user) => state.user.value = user
 *   },
 *   persistence: {
 *     enabled: true,
 *     key: "myApp-store",
 *     storage: "localStorage"
 *   }
 * });
 *
 * // Use store in components
 * app.component("Counter", {
 *   setup({ store }) {
 *     return {
 *       count: store.state.counter,
 *       increment: () => store.dispatch("increment"),
 *       user: store.state.user
 *     };
 *   },
 *   template: (ctx) => `
 *     <div>
 *       <p>Hello ${ctx.user.value.name}!</p>
 *       <p>Count: ${ctx.count.value}</p>
 *       <button @click="increment">+</button>
 *     </div>
 *   `
 * });
 */ const StorePlugin = {
    /**
   * Unique identifier for the plugin
   * @type {string}
   */ name: "store",
    /**
   * Plugin version
   * @type {string}
   */ version: "1.1.1",
    /**
   * Plugin description
   * @type {string}
   */ description: "Reactive state management for sharing data across the entire Eleva application",
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
   */ install (eleva, options = {}) {
        const { state = {}, actions = {}, namespaces = {}, persistence = {}, devTools = false, onError = null } = options;
        /**
     * @class Store
     * @classdesc Store instance that manages all state and provides the API.
     * @private
     */ class Store {
            /**
       * Initializes the root state and actions.
       * Creates reactive signals for each state property and copies actions.
       *
       * @private
       * @param {Record<string, unknown>} initialState - The initial state key-value pairs.
       * @param {Record<string, ActionFunction>} initialActions - The action functions to register.
       * @returns {void}
       */ _initializeState(initialState, initialActions) {
                // Create reactive signals for each state property
                Object.entries(initialState).forEach(([key, value])=>{
                    this.state[key] = new eleva.signal(value);
                });
                // Set up actions
                this.actions = {
                    ...initialActions
                };
            }
            /**
       * Initializes namespaced modules.
       * Creates namespace objects and populates them with state signals and actions.
       *
       * @private
       * @param {Record<string, StoreModule>} namespaces - Map of namespace names to module definitions.
       * @returns {void}
       */ _initializeNamespaces(namespaces) {
                Object.entries(namespaces).forEach(([namespace, module])=>{
                    const { state: moduleState = {}, actions: moduleActions = {} } = module;
                    // Create namespace object if it doesn't exist
                    if (!this.state[namespace]) {
                        this.state[namespace] = {};
                    }
                    if (!this.actions[namespace]) {
                        this.actions[namespace] = {};
                    }
                    // Initialize namespaced state
                    Object.entries(moduleState).forEach(([key, value])=>{
                        this.state[namespace][key] = new eleva.signal(value);
                    });
                    // Set up namespaced actions
                    this.actions[namespace] = {
                        ...moduleActions
                    };
                });
            }
            /**
       * Loads persisted state from storage.
       * Reads from localStorage/sessionStorage and applies values to state signals.
       * Does nothing if persistence is disabled or running in SSR environment.
       *
       * @private
       * @returns {void}
       */ _loadPersistedState() {
                if (!this.persistence.enabled || typeof window === "undefined") {
                    return;
                }
                try {
                    const storage = window[this.persistence.storage];
                    const persistedData = storage.getItem(this.persistence.key);
                    if (persistedData) {
                        const data = JSON.parse(persistedData);
                        this._applyPersistedData(data);
                    }
                } catch (error) {
                    if (this.onError) {
                        this.onError(error, "Failed to load persisted state");
                    } else {
                        console.warn("[StorePlugin] Failed to load persisted state:", error);
                    }
                }
            }
            /**
       * Applies persisted data to the current state.
       * Recursively updates signal values for paths that should be persisted.
       *
       * @private
       * @param {Record<string, unknown>} data - The persisted data object to apply.
       * @param {Record<string, unknown>} [currentState=this.state] - The current state object to update.
       * @param {string} [path=""] - The current dot-notation path (for include/exclude filtering).
       * @returns {void}
       */ _applyPersistedData(data, currentState = this.state, path = "") {
                Object.entries(data).forEach(([key, value])=>{
                    const fullPath = path ? `${path}.${key}` : key;
                    if (this._shouldPersist(fullPath)) {
                        if (currentState[key] && typeof currentState[key] === "object" && "value" in currentState[key]) {
                            // This is a signal, update its value
                            currentState[key].value = value;
                        } else if (typeof value === "object" && value !== null && currentState[key]) {
                            // This is a nested object, recurse
                            this._applyPersistedData(value, currentState[key], fullPath);
                        }
                    }
                });
            }
            /**
       * Determines if a state path should be persisted.
       * Checks against include/exclude filters configured in persistence options.
       *
       * @private
       * @param {string} path - The dot-notation path to check (e.g., "auth.user").
       * @returns {boolean} True if the path should be persisted, false otherwise.
       */ _shouldPersist(path) {
                const { include, exclude } = this.persistence;
                if (include && include.length > 0) {
                    return include.some((includePath)=>path.startsWith(includePath));
                }
                if (exclude && exclude.length > 0) {
                    return !exclude.some((excludePath)=>path.startsWith(excludePath));
                }
                return true;
            }
            /**
       * Saves current state to storage.
       * Extracts persistable data and writes to localStorage/sessionStorage.
       * Does nothing if persistence is disabled or running in SSR environment.
       *
       * @private
       * @returns {void}
       */ _saveState() {
                if (!this.persistence.enabled || typeof window === "undefined") {
                    return;
                }
                try {
                    const storage = window[this.persistence.storage];
                    const dataToSave = this._extractPersistedData();
                    storage.setItem(this.persistence.key, JSON.stringify(dataToSave));
                } catch (error) {
                    if (this.onError) {
                        this.onError(error, "Failed to save state");
                    } else {
                        console.warn("[StorePlugin] Failed to save state:", error);
                    }
                }
            }
            /**
       * Extracts data that should be persisted.
       * Recursively extracts signal values for paths that pass persistence filters.
       *
       * @private
       * @param {Record<string, unknown>} [currentState=this.state] - The state object to extract from.
       * @param {string} [path=""] - The current dot-notation path (for include/exclude filtering).
       * @returns {Record<string, unknown>} The extracted data object with raw values (not signals).
       */ _extractPersistedData(currentState = this.state, path = "") {
                const result = {};
                Object.entries(currentState).forEach(([key, value])=>{
                    const fullPath = path ? `${path}.${key}` : key;
                    if (this._shouldPersist(fullPath)) {
                        if (value && typeof value === "object" && "value" in value) {
                            // This is a signal, extract its value
                            result[key] = value.value;
                        } else if (typeof value === "object" && value !== null) {
                            // This is a nested object, recurse
                            const nestedData = this._extractPersistedData(value, fullPath);
                            if (Object.keys(nestedData).length > 0) {
                                result[key] = nestedData;
                            }
                        }
                    }
                });
                return result;
            }
            /**
       * Sets up development tools integration.
       * Registers the store with Eleva DevTools if available and enabled.
       * Does nothing if devTools is disabled, running in SSR, or DevTools not installed.
       *
       * @private
       * @returns {void}
       */ _setupDevTools() {
                if (!this.devTools || typeof window === "undefined" || !window.__ELEVA_DEVTOOLS__) {
                    return;
                }
                window.__ELEVA_DEVTOOLS__.registerStore(this);
            }
            /**
       * Dispatches an action to mutate the state.
       *
       * Execution flow:
       * 1. Retrieves the action function (supports namespaced actions like "auth.login")
       * 2. Records mutation for devtools/history (keeps last 100 mutations)
       * 3. Executes action with await (actions can be sync or async)
       * 4. Saves state if persistence is enabled
       * 5. Notifies all subscribers with (mutation, state)
       * 6. Notifies devtools if enabled
       *
       * @note Always returns a Promise regardless of whether the action is sync or async.
       * Subscriber callbacks that throw are caught and passed to onError handler.
       *
       * @async
       * @param {string} actionName - The name of the action to dispatch (supports dot notation for namespaces).
       * @param {unknown} payload - The payload to pass to the action.
       * @returns {Promise<unknown>} The result of the action (undefined if action returns nothing).
       * @throws {Error} If action is not found or action function throws.
       * @see subscribe - Listen for mutations triggered by dispatch.
       * @see getState - Get current state values.
       */ async dispatch(actionName, payload) {
                try {
                    const action = this._getAction(actionName);
                    if (!action) {
                        const error = new Error(`Action "${actionName}" not found`);
                        if (this.onError) {
                            this.onError(error, actionName);
                        }
                        throw error;
                    }
                    const mutation = {
                        type: actionName,
                        payload,
                        timestamp: Date.now()
                    };
                    // Record mutation for devtools
                    this.mutations.push(mutation);
                    if (this.mutations.length > 100) {
                        this.mutations.shift(); // Keep only last 100 mutations
                    }
                    // Execute the action
                    const result = await action.call(null, this.state, payload);
                    // Save state if persistence is enabled
                    this._saveState();
                    // Notify subscribers
                    this.subscribers.forEach((callback)=>{
                        try {
                            callback(mutation, this.state);
                        } catch (error) {
                            if (this.onError) {
                                this.onError(error, "Subscriber callback failed");
                            }
                        }
                    });
                    // Notify devtools
                    if (this.devTools && typeof window !== "undefined" && window.__ELEVA_DEVTOOLS__) {
                        window.__ELEVA_DEVTOOLS__.notifyMutation(mutation, this.state);
                    }
                    return result;
                } catch (error) {
                    if (this.onError) {
                        this.onError(error, `Action dispatch failed: ${actionName}`);
                    }
                    throw error;
                }
            }
            /**
       * Gets an action by name (supports namespaced actions).
       * Traverses the actions object using dot-notation path segments.
       *
       * @private
       * @param {string} actionName - The action name, supports dot notation for namespaces (e.g., "auth.login").
       * @returns {ActionFunction | null} The action function if found and is a function, null otherwise.
       */ _getAction(actionName) {
                const parts = actionName.split(".");
                let current = this.actions;
                for (const part of parts){
                    if (current[part] === undefined) {
                        return null;
                    }
                    current = current[part];
                }
                return typeof current === "function" ? current : null;
            }
            /**
       * Subscribes to store mutations.
       * Callback is invoked after every successful action dispatch.
       *
       * @param {SubscribeCallback} callback
       *        Called after each mutation with:
       *        - mutation.type: The action name that was dispatched
       *        - mutation.payload: The payload passed to the action
       *        - mutation.timestamp: When the mutation occurred (Date.now())
       *        - state: The current state object (contains Signals)
       * @returns {() => void} Unsubscribe function. Call to stop receiving notifications.
       * @throws {Error} If callback is not a function.
       * @see dispatch - Triggers mutations that notify subscribers.
       */ subscribe(callback) {
                if (typeof callback !== "function") {
                    throw new Error("Subscribe callback must be a function");
                }
                this.subscribers.add(callback);
                // Return unsubscribe function
                return ()=>{
                    this.subscribers.delete(callback);
                };
            }
            /**
       * Gets current state values (not signals).
       *
       * @note When persistence include/exclude filters are configured,
       * this returns only the filtered subset of state.
       * @returns {Record<string, unknown>} The current state values (filtered by persistence config if set).
       * @see replaceState - Set state values.
       * @see subscribe - Listen for state changes.
       */ getState() {
                return this._extractPersistedData();
            }
            /**
       * Replaces state values (useful for testing or state hydration).
       *
       * @note When persistence include/exclude filters are configured,
       * this only updates the filtered subset of state.
       * @param {Record<string, unknown>} newState - The new state object.
       * @returns {void}
       * @see getState - Get current state values.
       */ replaceState(newState) {
                this._applyPersistedData(newState);
                this._saveState();
            }
            /**
       * Clears persisted state from storage.
       * Does nothing if persistence is disabled or running in SSR.
       * @returns {void}
       */ clearPersistedState() {
                if (!this.persistence.enabled || typeof window === "undefined") {
                    return;
                }
                try {
                    const storage = window[this.persistence.storage];
                    storage.removeItem(this.persistence.key);
                } catch (error) {
                    if (this.onError) {
                        this.onError(error, "Failed to clear persisted state");
                    }
                }
            }
            /**
       * Registers a new namespaced module at runtime.
       * Logs a warning if the namespace already exists.
       * Module state is nested under `state[namespace]` and actions under `actions[namespace]`.
       * @param {string} namespace - The namespace for the module.
       * @param {StoreModule} module - The module definition.
       * @param {Record<string, unknown>} module.state - The module's initial state.
       * @param {Record<string, ActionFunction>} module.actions - The module's actions.
       * @returns {void}
       */ registerModule(namespace, module) {
                if (this.state[namespace] || this.actions[namespace]) {
                    console.warn(`[StorePlugin] Module "${namespace}" already exists`);
                    return;
                }
                // Initialize the module
                this.state[namespace] = {};
                this.actions[namespace] = {};
                const namespaces = {
                    [namespace]: module
                };
                this._initializeNamespaces(namespaces);
                this._saveState();
            }
            /**
       * Unregisters a namespaced module.
       * Logs a warning if the namespace doesn't exist.
       * Removes both state and actions under the namespace.
       * @param {string} namespace - The namespace to unregister.
       * @returns {void}
       */ unregisterModule(namespace) {
                if (!this.state[namespace] && !this.actions[namespace]) {
                    console.warn(`[StorePlugin] Module "${namespace}" does not exist`);
                    return;
                }
                delete this.state[namespace];
                delete this.actions[namespace];
                this._saveState();
            }
            /**
       * Creates a new reactive state property at runtime.
       *
       * @param {string} key - The state key.
       * @param {*} initialValue - The initial value.
       * @returns {Signal} The created signal, or existing signal if key exists.
       */ createState(key, initialValue) {
                if (this.state[key]) {
                    return this.state[key]; // Return existing state
                }
                this.state[key] = new eleva.signal(initialValue);
                this._saveState();
                return this.state[key];
            }
            /**
       * Creates a new action at runtime.
       * Overwrites existing action if name already exists.
       * Supports dot-notation for namespaced actions (e.g., "auth.login").
       * @param {string} name - The action name (supports dot notation for namespaces).
       * @param {ActionFunction} actionFn - The action function (receives state and payload).
       * @returns {void}
       * @throws {Error} If actionFn is not a function.
       * @example
       * // Root-level action
       * store.createAction("increment", (state) => state.count.value++);
       *
       * // Namespaced action
       * store.createAction("auth.login", async (state, credentials) => {
       *   // ... login logic
       * });
       */ createAction(name, actionFn) {
                if (typeof actionFn !== "function") {
                    throw new Error("Action must be a function");
                }
                // Fast path: no dot means simple action (avoids array allocation)
                if (name.indexOf(".") === -1) {
                    this.actions[name] = actionFn;
                    return;
                }
                // Namespaced action, traverse/create nested structure
                const parts = name.split(".");
                const lastIndex = parts.length - 1;
                let current = this.actions;
                for(let i = 0; i < lastIndex; i++){
                    current = current[parts[i]] || (current[parts[i]] = {});
                }
                current[parts[lastIndex]] = actionFn;
            }
            /**
       * Creates a new Store instance.
       * Initializes state signals, actions, persistence, and devtools integration.
       *
       * @constructor
       */ constructor(){
                /** @type {Record<string, Signal | Record<string, unknown>>} */ this.state = {};
                /** @type {Record<string, ActionFunction | Record<string, ActionFunction>>} */ this.actions = {};
                /** @type {Set<SubscribeCallback>} */ this.subscribers = new Set();
                /** @type {StoreMutation[]} */ this.mutations = [];
                /** @type {{enabled: boolean, key: string, storage: string, include: string[]|null, exclude: string[]|null}} */ this.persistence = {
                    enabled: false,
                    key: "eleva-store",
                    storage: "localStorage",
                    include: null,
                    exclude: null,
                    ...persistence
                };
                /** @type {boolean} */ this.devTools = devTools;
                /** @type {((error: Error, context: string) => void)|null} */ this.onError = onError;
                this._initializeState(state, actions);
                this._initializeNamespaces(namespaces);
                this._loadPersistedState();
                this._setupDevTools();
            }
        }
        // Create the store instance
        const store = new Store();
        // Store the original mount method to override it
        const originalMount = eleva.mount;
        /**
     * Overridden mount method that injects store context into components.
     * Wraps the original mount to add `ctx.store` to the component's setup context.
     *
     * @param {HTMLElement} container - The DOM element where the component will be mounted.
     * @param {string | ComponentDefinition} compName - Component name or definition.
     * @param {ComponentProps} [props={}] - Optional properties to pass to the component.
     * @returns {Promise<MountResult>} The mount result.
     */ eleva.mount = async (container, compName, props = {})=>{
            // Get the component definition
            const componentDef = typeof compName === "string" ? eleva._components.get(compName) || compName : compName;
            if (!componentDef) {
                return await originalMount.call(eleva, container, compName, props);
            }
            // Create a wrapped component that injects store into setup
            const wrappedComponent = {
                ...componentDef,
                async setup (ctx) {
                    /** @type {StoreApi} */ ctx.store = {
                        // Core store functionality
                        state: store.state,
                        dispatch: store.dispatch.bind(store),
                        subscribe: store.subscribe.bind(store),
                        getState: store.getState.bind(store),
                        // Module management
                        registerModule: store.registerModule.bind(store),
                        unregisterModule: store.unregisterModule.bind(store),
                        // Utilities for dynamic state/action creation
                        createState: store.createState.bind(store),
                        createAction: store.createAction.bind(store),
                        // Access to signal constructor for manual state creation
                        signal: eleva.signal
                    };
                    // Call original setup if it exists
                    const originalSetup = componentDef.setup;
                    const result = originalSetup ? await originalSetup(ctx) : {};
                    return result;
                }
            };
            // Call original mount with wrapped component
            return await originalMount.call(eleva, container, wrappedComponent, props);
        };
        // Override _mountComponents to ensure child components also get store context
        const originalMountComponents = eleva._mountComponents;
        /**
     * Overridden _mountComponents method that injects store context into child components.
     * Wraps each child component's setup function to add `ctx.store` before mounting.
     *
     * @param {HTMLElement} container - The parent container element.
     * @param {ChildrenMap} children - Map of selectors to component definitions.
     * @param {MountResult[]} childInstances - Array to store mounted instances.
     * @param {ComponentContext & SetupResult} context - Parent component context.
     * @returns {Promise<void>}
     */ eleva._mountComponents = async (container, children, childInstances, context)=>{
            // Create wrapped children with store injection
            const wrappedChildren = {};
            for (const [selector, childComponent] of Object.entries(children)){
                const componentDef = typeof childComponent === "string" ? eleva._components.get(childComponent) || childComponent : childComponent;
                if (componentDef && typeof componentDef === "object") {
                    wrappedChildren[selector] = {
                        ...componentDef,
                        async setup (ctx) {
                            /** @type {StoreApi} */ ctx.store = {
                                // Core store functionality
                                state: store.state,
                                dispatch: store.dispatch.bind(store),
                                subscribe: store.subscribe.bind(store),
                                getState: store.getState.bind(store),
                                // Module management
                                registerModule: store.registerModule.bind(store),
                                unregisterModule: store.unregisterModule.bind(store),
                                // Utilities for dynamic state/action creation
                                createState: store.createState.bind(store),
                                createAction: store.createAction.bind(store),
                                // Access to signal constructor for manual state creation
                                signal: eleva.signal
                            };
                            // Call original setup if it exists
                            const originalSetup = componentDef.setup;
                            const result = originalSetup ? await originalSetup(ctx) : {};
                            return result;
                        }
                    };
                } else {
                    wrappedChildren[selector] = childComponent;
                }
            }
            // Call original _mountComponents with wrapped children
            return await originalMountComponents.call(eleva, container, wrappedChildren, childInstances, context);
        };
        // Expose store instance and utilities on the Eleva instance
        /** @type {StoreApi} */ eleva.store = store;
        /**
     * Expose utility methods on the Eleva instance.
     * These are top-level helpers (e.g., `eleva.dispatch`) in addition to `eleva.store`.
     */ /** @type {(name: string, actionFn: ActionFunction) => void} */ eleva.createAction = (name, actionFn)=>{
            store.createAction(name, actionFn);
        };
        /** @type {DispatchFunction} */ eleva.dispatch = (actionName, payload)=>{
            return store.dispatch(actionName, payload);
        };
        /** @type {() => Record<string, unknown>} */ eleva.getState = ()=>{
            return store.getState();
        };
        /** @type {(callback: SubscribeCallback) => () => void} */ eleva.subscribe = (callback)=>{
            return store.subscribe(callback);
        };
        // Store original methods for cleanup
        eleva._originalMount = originalMount;
        eleva._originalMountComponents = originalMountComponents;
    },
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
   */ uninstall (eleva) {
        // Restore original mount method
        if (eleva._originalMount) {
            eleva.mount = eleva._originalMount;
            delete eleva._originalMount;
        }
        // Restore original _mountComponents method
        if (eleva._originalMountComponents) {
            eleva._mountComponents = eleva._originalMountComponents;
            delete eleva._originalMountComponents;
        }
        // Remove store instance and utility methods
        if (eleva.store) {
            delete eleva.store;
        }
        if (eleva.createAction) {
            delete eleva.createAction;
        }
        if (eleva.dispatch) {
            delete eleva.dispatch;
        }
        if (eleva.getState) {
            delete eleva.getState;
        }
        if (eleva.subscribe) {
            delete eleva.subscribe;
        }
    }
};

exports.Attr = AttrPlugin;
exports.Router = RouterPlugin;
exports.Store = StorePlugin;
//# sourceMappingURL=eleva-plugins.cjs.map

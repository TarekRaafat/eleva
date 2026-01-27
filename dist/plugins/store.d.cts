import * as eleva from 'eleva';

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
    function install(eleva: Eleva, options?: StoreOptions): void;
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
    function uninstall(eleva: Eleva): void;
}

/**
 * Type imports from the Eleva core library.
 */
type Eleva = eleva.Eleva;
/**
 * Type imports from the Eleva core library.
 */
type ComponentDefinition = eleva.ComponentDefinition;
/**
 * Type imports from the Eleva core library.
 */
type ComponentContext = eleva.ComponentContext;
/**
 * Type imports from the Eleva core library.
 */
type SetupResult = eleva.SetupResult;
/**
 * Type imports from the Eleva core library.
 */
type ComponentProps = eleva.ComponentProps;
/**
 * Type imports from the Eleva core library.
 */
type ChildrenMap = eleva.ChildrenMap;
/**
 * Type imports from the Eleva core library.
 */
type MountResult = eleva.MountResult;
/**
 * Generic type import.
 */
type Signal<T> = eleva.Signal<T>;
/**
 * Mutation record emitted to subscribers.
 */
type StoreMutation = {
    /**
     *           The action name that was dispatched.
     */
    type: string;
    /**
     *           The payload passed to the action.
     */
    payload: unknown;
    /**
     *           Unix timestamp of when the mutation occurred.
     */
    timestamp: number;
};
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
type StoreState = Record<string, Signal<unknown> | Record<string, unknown>>;
/**
 * Action function signature for store actions.
 */
type ActionFunction = (state: StoreState, payload?: unknown) => unknown;
/**
 * Dispatch function signature for triggering actions.
 */
type DispatchFunction = (actionName: string, payload?: unknown) => Promise<unknown>;
/**
 * Subscribe callback signature for mutation listeners.
 */
type SubscribeCallback = (mutation: StoreMutation, state: StoreState) => void;
/**
 * Store API exposed to components via ctx.store.
 */
type StoreApi = {
    /**
     *           Reactive state signals (supports nested modules).
     */
    state: StoreState;
    /**
     *           Dispatch an action by name with optional payload.
     */
    dispatch: DispatchFunction;
    /**
     *           Subscribe to state mutations. Returns unsubscribe function.
     */
    subscribe: (callback: SubscribeCallback) => () => void;
    /**
     *           Get a snapshot of current state values.
     */
    getState: () => Record<string, unknown>;
    /**
     *           Register a namespaced module dynamically.
     */
    registerModule: (namespace: string, module: StoreModule) => void;
    /**
     *           Unregister a namespaced module.
     */
    unregisterModule: (namespace: string) => void;
    /**
     *           Create a new state signal dynamically.
     */
    createState: (key: string, initialValue: unknown) => Signal<unknown>;
    /**
     *           Register a new action dynamically.
     */
    createAction: (name: string, actionFn: ActionFunction) => void;
    /**
     *           Signal class constructor for manual state creation.
     */
    signal: new <T>(value: T) => Signal<T>;
};

export { StorePlugin as Store, StorePlugin };
export type { ActionFunction, ChildrenMap, ComponentContext, ComponentDefinition, ComponentProps, DispatchFunction, Eleva, MountResult, SetupResult, Signal, StoreApi, StoreErrorHandler, StoreModule, StoreMutation, StoreOptions, StorePersistenceOptions, StoreState, SubscribeCallback };
//# sourceMappingURL=store.d.cts.map

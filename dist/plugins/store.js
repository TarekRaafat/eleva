/*! Eleva Store Plugin v1.1.0 | MIT License | https://elevajs.com */
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
   */ version: "1.1.0",
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

export { StorePlugin as Store, StorePlugin };
//# sourceMappingURL=store.js.map

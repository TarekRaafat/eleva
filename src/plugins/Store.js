"use strict";

/**
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
 *     addTodo: (state, todo) => state.todos.value.push(todo),
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
 *       <button onclick="ctx.increment()">+</button>
 *     </div>
 *   `
 * });
 */
export const StorePlugin = {
  /**
   * Unique identifier for the plugin
   * @type {string}
   */
  name: "store",

  /**
   * Plugin version
   * @type {string}
   */
  version: "1.0.0-rc.11",

  /**
   * Plugin description
   * @type {string}
   */
  description:
    "Reactive state management for sharing data across the entire Eleva application",

  /**
   * Installs the plugin into the Eleva instance
   *
   * @param {Object} eleva - The Eleva instance
   * @param {Object} options - Plugin configuration options
   * @param {Object} [options.state={}] - Initial state object
   * @param {Object} [options.actions={}] - Action functions for state mutations
   * @param {Object} [options.namespaces={}] - Namespaced modules for organizing store
   * @param {Object} [options.persistence] - Persistence configuration
   * @param {boolean} [options.persistence.enabled=false] - Enable state persistence
   * @param {string} [options.persistence.key="eleva-store"] - Storage key
   * @param {"localStorage" | "sessionStorage"} [options.persistence.storage="localStorage"] - Storage type
   * @param {Array<string>} [options.persistence.include] - State keys to persist (if not provided, all state is persisted)
   * @param {Array<string>} [options.persistence.exclude] - State keys to exclude from persistence
   * @param {boolean} [options.devTools=false] - Enable development tools integration
   * @param {Function} [options.onError=null] - Error handler function
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
   *           state.user.value = user;
   *           state.token.value = token;
   *         },
   *         logout: (state) => {
   *           state.user.value = null;
   *           state.token.value = null;
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
  install(eleva, options = {}) {
    const {
      state = {},
      actions = {},
      namespaces = {},
      persistence = {},
      devTools = false,
      onError = null,
    } = options;

    /**
     * Store instance that manages all state and provides the API
     * @private
     */
    class Store {
      constructor() {
        this.state = {};
        this.actions = {};
        this.subscribers = new Set();
        this.mutations = [];
        this.persistence = {
          enabled: false,
          key: "eleva-store",
          storage: "localStorage",
          include: null,
          exclude: null,
          ...persistence,
        };
        this.devTools = devTools;
        this.onError = onError;

        this._initializeState(state, actions);
        this._initializeNamespaces(namespaces);
        this._loadPersistedState();
        this._setupDevTools();
      }

      /**
       * Initializes the root state and actions
       * @private
       */
      _initializeState(initialState, initialActions) {
        // Create reactive signals for each state property
        Object.entries(initialState).forEach(([key, value]) => {
          this.state[key] = new eleva.signal(value);
        });

        // Set up actions
        this.actions = { ...initialActions };
      }

      /**
       * Initializes namespaced modules
       * @private
       */
      _initializeNamespaces(namespaces) {
        Object.entries(namespaces).forEach(([namespace, module]) => {
          const { state: moduleState = {}, actions: moduleActions = {} } =
            module;

          // Create namespace object if it doesn't exist
          if (!this.state[namespace]) {
            this.state[namespace] = {};
          }
          if (!this.actions[namespace]) {
            this.actions[namespace] = {};
          }

          // Initialize namespaced state
          Object.entries(moduleState).forEach(([key, value]) => {
            this.state[namespace][key] = new eleva.signal(value);
          });

          // Set up namespaced actions
          this.actions[namespace] = { ...moduleActions };
        });
      }

      /**
       * Loads persisted state from storage
       * @private
       */
      _loadPersistedState() {
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
            console.warn(
              "[StorePlugin] Failed to load persisted state:",
              error
            );
          }
        }
      }

      /**
       * Applies persisted data to the current state
       * @private
       */
      _applyPersistedData(data, currentState = this.state, path = "") {
        Object.entries(data).forEach(([key, value]) => {
          const fullPath = path ? `${path}.${key}` : key;

          if (this._shouldPersist(fullPath)) {
            if (
              currentState[key] &&
              typeof currentState[key] === "object" &&
              "value" in currentState[key]
            ) {
              // This is a signal, update its value
              currentState[key].value = value;
            } else if (
              typeof value === "object" &&
              value !== null &&
              currentState[key]
            ) {
              // This is a nested object, recurse
              this._applyPersistedData(value, currentState[key], fullPath);
            }
          }
        });
      }

      /**
       * Determines if a state path should be persisted
       * @private
       */
      _shouldPersist(path) {
        const { include, exclude } = this.persistence;

        if (include && include.length > 0) {
          return include.some((includePath) => path.startsWith(includePath));
        }

        if (exclude && exclude.length > 0) {
          return !exclude.some((excludePath) => path.startsWith(excludePath));
        }

        return true;
      }

      /**
       * Saves current state to storage
       * @private
       */
      _saveState() {
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
       * Extracts data that should be persisted
       * @private
       */
      _extractPersistedData(currentState = this.state, path = "") {
        const result = {};

        Object.entries(currentState).forEach(([key, value]) => {
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
       * Sets up development tools integration
       * @private
       */
      _setupDevTools() {
        if (
          !this.devTools ||
          typeof window === "undefined" ||
          !window.__ELEVA_DEVTOOLS__
        ) {
          return;
        }

        window.__ELEVA_DEVTOOLS__.registerStore(this);
      }

      /**
       * Dispatches an action to mutate the state
       * @param {string} actionName - The name of the action to dispatch (supports namespaced actions like "auth.login")
       * @param {any} payload - The payload to pass to the action
       * @returns {Promise<any>} The result of the action
       */
      async dispatch(actionName, payload) {
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
            timestamp: Date.now(),
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
          this.subscribers.forEach((callback) => {
            try {
              callback(mutation, this.state);
            } catch (error) {
              if (this.onError) {
                this.onError(error, "Subscriber callback failed");
              }
            }
          });

          // Notify devtools
          if (
            this.devTools &&
            typeof window !== "undefined" &&
            window.__ELEVA_DEVTOOLS__
          ) {
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
       * Gets an action by name (supports namespaced actions)
       * @private
       */
      _getAction(actionName) {
        const parts = actionName.split(".");
        let current = this.actions;

        for (const part of parts) {
          if (current[part] === undefined) {
            return null;
          }
          current = current[part];
        }

        return typeof current === "function" ? current : null;
      }

      /**
       * Subscribes to store mutations
       * @param {Function} callback - Callback function to call on mutations
       * @returns {Function} Unsubscribe function
       */
      subscribe(callback) {
        if (typeof callback !== "function") {
          throw new Error("Subscribe callback must be a function");
        }

        this.subscribers.add(callback);

        // Return unsubscribe function
        return () => {
          this.subscribers.delete(callback);
        };
      }

      /**
       * Gets a deep copy of the current state values (not signals)
       * @returns {Object} The current state values
       */
      getState() {
        return this._extractPersistedData();
      }

      /**
       * Replaces the entire state (useful for testing or state hydration)
       * @param {Object} newState - The new state object
       */
      replaceState(newState) {
        this._applyPersistedData(newState);
        this._saveState();
      }

      /**
       * Clears persisted state from storage
       */
      clearPersistedState() {
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
       * Registers a new namespaced module at runtime
       * @param {string} namespace - The namespace for the module
       * @param {Object} module - The module definition
       * @param {Object} module.state - The module's initial state
       * @param {Object} module.actions - The module's actions
       */
      registerModule(namespace, module) {
        if (this.state[namespace] || this.actions[namespace]) {
          console.warn(`[StorePlugin] Module "${namespace}" already exists`);
          return;
        }

        // Initialize the module
        this.state[namespace] = {};
        this.actions[namespace] = {};

        const namespaces = { [namespace]: module };
        this._initializeNamespaces(namespaces);

        this._saveState();
      }

      /**
       * Unregisters a namespaced module
       * @param {string} namespace - The namespace to unregister
       */
      unregisterModule(namespace) {
        if (!this.state[namespace] && !this.actions[namespace]) {
          console.warn(`[StorePlugin] Module "${namespace}" does not exist`);
          return;
        }

        delete this.state[namespace];
        delete this.actions[namespace];
        this._saveState();
      }

      /**
       * Creates a new reactive state property at runtime
       * @param {string} key - The state key
       * @param {*} initialValue - The initial value
       * @returns {Object} The created signal
       */
      createState(key, initialValue) {
        if (this.state[key]) {
          return this.state[key]; // Return existing state
        }

        this.state[key] = new eleva.signal(initialValue);
        this._saveState();
        return this.state[key];
      }

      /**
       * Creates a new action at runtime
       * @param {string} name - The action name
       * @param {Function} actionFn - The action function
       */
      createAction(name, actionFn) {
        if (typeof actionFn !== "function") {
          throw new Error("Action must be a function");
        }

        this.actions[name] = actionFn;
      }
    }

    // Create the store instance
    const store = new Store();

    // Store the original mount method to override it
    const originalMount = eleva.mount;

    /**
     * Override the mount method to inject store context into components
     */
    eleva.mount = async (container, compName, props = {}) => {
      // Get the component definition
      const componentDef =
        typeof compName === "string"
          ? eleva._components.get(compName) || compName
          : compName;

      if (!componentDef) {
        return await originalMount.call(eleva, container, compName, props);
      }

      // Create a wrapped component that injects store into setup
      const wrappedComponent = {
        ...componentDef,
        async setup(ctx) {
          // Inject store into the context with enhanced API
          ctx.store = {
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
            signal: eleva.signal,
          };

          // Call original setup if it exists
          const originalSetup = componentDef.setup;
          const result = originalSetup ? await originalSetup(ctx) : {};

          return result;
        },
      };

      // Call original mount with wrapped component
      return await originalMount.call(
        eleva,
        container,
        wrappedComponent,
        props
      );
    };

    // Override _mountComponents to ensure child components also get store context
    const originalMountComponents = eleva._mountComponents;
    eleva._mountComponents = async (container, children, childInstances) => {
      // Create wrapped children with store injection
      const wrappedChildren = {};

      for (const [selector, childComponent] of Object.entries(children)) {
        const componentDef =
          typeof childComponent === "string"
            ? eleva._components.get(childComponent) || childComponent
            : childComponent;

        if (componentDef && typeof componentDef === "object") {
          wrappedChildren[selector] = {
            ...componentDef,
            async setup(ctx) {
              // Inject store into the context with enhanced API
              ctx.store = {
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
                signal: eleva.signal,
              };

              // Call original setup if it exists
              const originalSetup = componentDef.setup;
              const result = originalSetup ? await originalSetup(ctx) : {};

              return result;
            },
          };
        } else {
          wrappedChildren[selector] = childComponent;
        }
      }

      // Call original _mountComponents with wrapped children
      return await originalMountComponents.call(
        eleva,
        container,
        wrappedChildren,
        childInstances
      );
    };

    // Expose store instance and utilities on the Eleva instance
    eleva.store = store;

    /**
     * Expose utility methods on the Eleva instance
     * @namespace eleva.store
     */
    eleva.createAction = (name, actionFn) => {
      store.actions[name] = actionFn;
    };

    eleva.dispatch = (actionName, payload) => {
      return store.dispatch(actionName, payload);
    };

    eleva.getState = () => {
      return store.getState();
    };

    eleva.subscribe = (callback) => {
      return store.subscribe(callback);
    };

    // Store original methods for cleanup
    eleva._originalMount = originalMount;
    eleva._originalMountComponents = originalMountComponents;
  },

  /**
   * Uninstalls the plugin from the Eleva instance
   *
   * @param {Object} eleva - The Eleva instance
   *
   * @description
   * Restores the original Eleva methods and removes all plugin-specific
   * functionality. This method should be called when the plugin is no
   * longer needed.
   *
   * @example
   * // Uninstall the plugin
   * StorePlugin.uninstall(app);
   */
  uninstall(eleva) {
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
  },
};

// Short name export for convenience
export { StorePlugin as Store };

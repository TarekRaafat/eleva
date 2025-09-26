export namespace StorePlugin {
    let name: string;
    let version: string;
    let description: string;
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
    function install(eleva: Object, options?: {
        state?: Object | undefined;
        actions?: Object | undefined;
        namespaces?: Object | undefined;
        persistence?: {
            enabled?: boolean | undefined;
            key?: string | undefined;
            storage?: "localStorage" | "sessionStorage" | undefined;
            include?: string[] | undefined;
            exclude?: string[] | undefined;
        } | undefined;
        devTools?: boolean | undefined;
        onError?: Function | undefined;
    }): void;
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
    function uninstall(eleva: Object): void;
}
//# sourceMappingURL=Store.d.ts.map
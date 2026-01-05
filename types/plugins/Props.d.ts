export namespace PropsPlugin {
    let name: string;
    let version: string;
    let description: string;
    /**
     * Installs the plugin into the Eleva instance
     *
     * @param {Object} eleva - The Eleva instance
     * @param {Object} options - Plugin configuration options
     * @param {boolean} [options.enableAutoParsing=true] - Enable automatic type detection and parsing
     * @param {boolean} [options.enableReactivity=true] - Enable reactive prop updates using Eleva's signal system
     * @param {Function} [options.onError=null] - Error handler function called when parsing fails
     *
     * @example
     * // Basic installation
     * app.use(PropsPlugin);
     *
     * // Installation with custom options
     * app.use(PropsPlugin, {
     *   enableAutoParsing: true,
     *   enableReactivity: false,
     *   onError: (error, value) => {
     *     console.error('Props parsing error:', error, value);
     *   }
     * });
     */
    function install(eleva: Object, options?: {
        enableAutoParsing?: boolean | undefined;
        enableReactivity?: boolean | undefined;
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
     * PropsPlugin.uninstall(app);
     */
    function uninstall(eleva: Object): void;
}
export { PropsPlugin as Props };
//# sourceMappingURL=Props.d.ts.map
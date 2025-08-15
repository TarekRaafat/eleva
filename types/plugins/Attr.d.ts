export namespace AttrPlugin {
    let name: string;
    let version: string;
    let description: string;
    /**
     * Installs the plugin into the Eleva instance
     *
     * @param {Object} eleva - The Eleva instance
     * @param {Object} options - Plugin configuration options
     * @param {boolean} [options.enableAria=true] - Enable ARIA attribute handling
     * @param {boolean} [options.enableData=true] - Enable data attribute handling
     * @param {boolean} [options.enableBoolean=true] - Enable boolean attribute handling
     * @param {boolean} [options.enableDynamic=true] - Enable dynamic property detection
     */
    function install(eleva: Object, options?: {
        enableAria?: boolean | undefined;
        enableData?: boolean | undefined;
        enableBoolean?: boolean | undefined;
        enableDynamic?: boolean | undefined;
    }): void;
    /**
     * Uninstalls the plugin from the Eleva instance
     *
     * @param {Object} eleva - The Eleva instance
     */
    function uninstall(eleva: Object): void;
}
//# sourceMappingURL=Attr.d.ts.map
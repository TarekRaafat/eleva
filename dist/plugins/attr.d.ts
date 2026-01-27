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
    function install(eleva: Eleva, options?: AttrPluginOptions): void;
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
    function uninstall(eleva: Eleva): void;
}

/**
 * Type imports from the Eleva core library.
 */
type Eleva = eleva.Eleva;
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
 * Function signature for attribute update operations.
 */
type AttributeUpdateFunction = (oldEl: HTMLElement, newEl: HTMLElement) => void;

export { AttrPlugin as Attr, AttrPlugin };
export type { AttrPluginOptions, AttributeUpdateFunction, Eleva };
//# sourceMappingURL=attr.d.ts.map

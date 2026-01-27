/*! Eleva Attr Plugin v1.1.0 | MIT License | https://elevajs.com */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ElevaAttrPlugin = {}));
})(this, (function (exports) { 'use strict';

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
     */ version: "1.1.0",
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

  exports.Attr = AttrPlugin;
  exports.AttrPlugin = AttrPlugin;

}));
//# sourceMappingURL=attr.umd.js.map

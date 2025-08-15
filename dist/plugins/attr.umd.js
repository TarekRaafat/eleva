/*! Eleva Attr Plugin v1.0.0-rc.1 | MIT License | https://elevajs.com */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ElevaAttrPlugin = {}));
})(this, (function (exports) { 'use strict';

    /**
     * A regular expression to match hyphenated lowercase letters.
     * @private
     * @type {RegExp}
     */
    const CAMEL_RE = /-([a-z])/g;

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
     */
    const AttrPlugin = {
      /**
       * Unique identifier for the plugin
       * @type {string}
       */
      name: "attr",
      /**
       * Plugin version
       * @type {string}
       */
      version: "1.0.0-rc.1",
      /**
       * Plugin description
       * @type {string}
       */
      description: "Advanced attribute handling for Eleva components",
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
      install(eleva, options = {}) {
        const {
          enableAria = true,
          enableData = true,
          enableBoolean = true,
          enableDynamic = true
        } = options;

        /**
         * Updates the attributes of an element to match a new element's attributes.
         * This method provides sophisticated attribute processing including:
         * - ARIA attribute handling with proper property mapping
         * - Data attribute management
         * - Boolean attribute processing
         * - Dynamic property detection and mapping
         * - Attribute cleanup and removal
         *
         * @param {HTMLElement} oldEl - The original element to update
         * @param {HTMLElement} newEl - The new element to update
         * @returns {void}
         */
        const updateAttributes = (oldEl, newEl) => {
          const oldAttrs = oldEl.attributes;
          const newAttrs = newEl.attributes;

          // Process new attributes
          for (let i = 0; i < newAttrs.length; i++) {
            const {
              name,
              value
            } = newAttrs[i];

            // Skip event attributes (handled by event system)
            if (name.startsWith("@")) continue;

            // Skip if attribute hasn't changed
            if (oldEl.getAttribute(name) === value) continue;

            // Handle ARIA attributes
            if (enableAria && name.startsWith("aria-")) {
              const prop = "aria" + name.slice(5).replace(CAMEL_RE, (_, l) => l.toUpperCase());
              oldEl[prop] = value;
              oldEl.setAttribute(name, value);
            }
            // Handle data attributes
            else if (enableData && name.startsWith("data-")) {
              oldEl.dataset[name.slice(5)] = value;
              oldEl.setAttribute(name, value);
            }
            // Handle other attributes
            else {
              let prop = name.replace(CAMEL_RE, (_, l) => l.toUpperCase());

              // Dynamic property detection
              if (enableDynamic && !(prop in oldEl) && !Object.getOwnPropertyDescriptor(Object.getPrototypeOf(oldEl), prop)) {
                const elementProps = Object.getOwnPropertyNames(Object.getPrototypeOf(oldEl));
                const matchingProp = elementProps.find(p => p.toLowerCase() === name.toLowerCase() || p.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.toLowerCase()));
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
          for (let i = oldAttrs.length - 1; i >= 0; i--) {
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

          // Override the _patchNode method to use our attribute handler
          eleva.renderer._patchNode = function (oldNode, newNode) {
            if (oldNode?._eleva_instance) return;
            if (!this._isSameNode(oldNode, newNode)) {
              oldNode.replaceWith(newNode.cloneNode(true));
              return;
            }
            if (oldNode.nodeType === Node.ELEMENT_NODE) {
              updateAttributes(oldNode, newNode);
              this._diff(oldNode, newNode);
            } else if (oldNode.nodeType === Node.TEXT_NODE && oldNode.nodeValue !== newNode.nodeValue) {
              oldNode.nodeValue = newNode.nodeValue;
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
        eleva.updateElementAttributes = updateAttributes;
      },
      /**
       * Uninstalls the plugin from the Eleva instance
       * 
       * @param {Object} eleva - The Eleva instance
       */
      uninstall(eleva) {
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

    exports.AttrPlugin = AttrPlugin;

}));
//# sourceMappingURL=attr.umd.js.map

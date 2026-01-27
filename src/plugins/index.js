"use strict";

/**
 * @module eleva/plugins
 * @fileoverview Eleva Plugin System
 *
 * This module exports all official Eleva plugins. Plugins provide optional
 * functionality that can be added to Eleva applications as needed.
 *
 * Tree-shaking is supported - only imported plugins will be included in your bundle.
 *
 * @example
 * // Import specific plugins (recommended for optimal tree-shaking)
 * import { Attr } from 'eleva/plugins';
 *
 * const app = new Eleva("myApp");
 * app.use(Attr, {
 *   enableAria: true,
 *   enableData: true,
 *   enableBoolean: true,
 *   enableDynamic: true
 * });
 *
 * @example
 * // Import multiple plugins
 * import { Attr, Router, Store } from 'eleva/plugins';
 *
 * const app = new Eleva("myApp");
 * app.use(Attr);
 * app.use(Router);
 * app.use(Store, {
 *   state: { counter: 0 },
 *   actions: { increment: (state) => state.counter.value++ }
 * });
 */

// Export plugins with clean names
export { AttrPlugin as Attr } from "./Attr.js";
export { RouterPlugin as Router } from "./Router.js";
export { StorePlugin as Store } from "./Store.js";
// Props plugin removed - native props evaluation is now built into Eleva core

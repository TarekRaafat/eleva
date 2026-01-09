"use strict";

// ============================================================================
// TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
// ============================================================================

/**
 * @template T
 * @callback SignalWatcher
 * @param {T} value - The new value of the signal
 * @returns {void}
 */

/**
 * @callback SignalUnsubscribe
 * @returns {boolean} True if the watcher was successfully removed
 */

/**
 * @template T
 * @typedef {Object} SignalLike
 * @property {T} value - The current value
 * @property {function(SignalWatcher<T>): SignalUnsubscribe} watch - Subscribe to changes
 */

/**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers synchronously when their value changes, enabling efficient
 * DOM updates through targeted patching rather than full re-renders.
 * Synchronous notification preserves stack traces and allows immediate value inspection.
 * Render batching is handled at the component level, not the signal level.
 * The class is generic, allowing type-safe handling of any value type T.
 *
 * @template T The type of value held by this signal
 *
 * @example
 * // Basic usage
 * const count = new Signal(0);
 * count.watch((value) => console.log(`Count changed to: ${value}`));
 * count.value = 1; // Logs: "Count changed to: 1"
 *
 * @example
 * // With unsubscribe
 * const name = new Signal("John");
 * const unsubscribe = name.watch((value) => console.log(value));
 * name.value = "Jane"; // Logs: "Jane"
 * unsubscribe(); // Stop watching
 * name.value = "Bob"; // No log output
 *
 * @example
 * // With objects
 * /** @type {Signal<{x: number, y: number}>} *\/
 * const position = new Signal({ x: 0, y: 0 });
 * position.value = { x: 10, y: 20 }; // Triggers watchers
 *
 * @implements {SignalLike<T>}
 */
export class Signal {
  /**
   * Creates a new Signal instance with the specified initial value.
   *
   * @public
   * @param {T} value - The initial value of the signal.
   *
   * @example
   * // Primitive types
   * const count = new Signal(0);        // Signal<number>
   * const name = new Signal("John");    // Signal<string>
   * const active = new Signal(true);    // Signal<boolean>
   *
   * @example
   * // Complex types (use JSDoc for type inference)
   * /** @type {Signal<string[]>} *\/
   * const items = new Signal([]);
   *
   * /** @type {Signal<{id: number, name: string} | null>} *\/
   * const user = new Signal(null);
   */
  constructor(value) {
    /**
     * Internal storage for the signal's current value.
     * @private
     * @type {T}
     */
    this._value = value;
    /**
     * Collection of callback functions to be notified when value changes.
     * @private
     * @type {Set<SignalWatcher<T>>}
     */
    this._watchers = new Set();
  }

  /**
   * Gets the current value of the signal.
   *
   * @public
   * @returns {T} The current value.
   */
  get value() {
    return this._value;
  }

  /**
   * Sets a new value for the signal and synchronously notifies all registered watchers if the value has changed.
   * Synchronous notification preserves stack traces and ensures immediate value consistency.
   *
   * @public
   * @param {T} newVal - The new value to set.
   * @returns {void}
   */
  set value(newVal) {
    if (this._value !== newVal) {
      this._value = newVal;
      this._notify();
    }
  }

  /**
   * Registers a watcher function that will be called whenever the signal's value changes.
   * The watcher will receive the new value as its argument.
   *
   * @public
   * @param {SignalWatcher<T>} fn - The callback function to invoke on value change.
   * @returns {SignalUnsubscribe} A function to unsubscribe the watcher.
   *
   * @example
   * // Basic watching
   * const unsubscribe = signal.watch((value) => console.log(value));
   *
   * @example
   * // Stop watching
   * unsubscribe(); // Returns true if watcher was removed
   *
   * @example
   * // Multiple watchers
   * const unsub1 = signal.watch((v) => console.log("Watcher 1:", v));
   * const unsub2 = signal.watch((v) => console.log("Watcher 2:", v));
   * signal.value = "test"; // Both watchers are called
   */
  watch(fn) {
    this._watchers.add(fn);
    return () => this._watchers.delete(fn);
  }

  /**
   * Synchronously notifies all registered watchers of the value change.
   * This preserves stack traces for debugging and ensures immediate
   * value consistency. Render batching is handled at the component level.
   *
   * @private
   * @returns {void}
   */
  _notify() {
    for (const fn of this._watchers) fn(this._value);
  }
}

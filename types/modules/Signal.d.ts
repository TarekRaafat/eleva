/**
 * @module eleva/signal
 * @fileoverview Reactive Signal primitive for fine-grained state management and change notification.
 */
/**
 * Callback function invoked when a signal's value changes.
 * @template T The type of value held by the signal.
 * @callback SignalWatcher
 * @param {T} value
 *        The new value of the signal.
 * @returns {void}
 */
/**
 * Function to unsubscribe a watcher from a signal.
 * @callback SignalUnsubscribe
 * @returns {boolean}
 *          True if the watcher was successfully removed, false if already removed.
 *          Safe to call multiple times (idempotent).
 */
/**
 * Interface describing the public API of a Signal.
 * @template T The type of value held by the signal.
 * @typedef {Object} SignalLike
 * @property {T} value
 *           The current value of the signal.
 * @property {function(SignalWatcher<T>): SignalUnsubscribe} watch
 *           Subscribe to value changes.
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
 * @template T The type of value held by the signal.
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
 * const position = new Signal({ x: 0, y: 0 });
 * position.value = { x: 10, y: 20 }; // Triggers watchers
 *
 * @implements {SignalLike<T>}
 */
export class Signal<T> implements SignalLike<T> {
    /**
     * Creates a new Signal instance with the specified initial value.
     *
     * @public
     * @constructor
     * @param {T} value - The initial value of the signal.
     *
     * @example
     * // Primitive types
     * const count = new Signal(0);        // Signal<number>
     * const name = new Signal("John");    // Signal<string>
     * const active = new Signal(true);    // Signal<boolean>
     *
     * @example
     * // Complex types
     * const items = new Signal([]);          // Signal holding an array
     * const user = new Signal(null);         // Signal holding nullable object
     */
    constructor(value: T);
    /**
     * Internal storage for the signal's current value.
     * @private
     * @type {T}
     */
    private _value;
    /**
     * Collection of callback functions to be notified when value changes.
     * @private
     * @type {Set<SignalWatcher<T>>}
     */
    private _watchers;
    /**
     * Sets a new value for the signal and synchronously notifies all registered watchers if the value has changed.
     * Synchronous notification preserves stack traces and ensures immediate value consistency.
     *
     * Uses strict equality (===) for comparison. For objects/arrays, watchers are only notified
     * if the reference changes, not if properties are mutated. To trigger updates with objects,
     * assign a new reference: `signal.value = { ...signal.value, updated: true }`.
     *
     * @public
     * @param {T} newVal - The new value to set.
     * @returns {void}
     */
    public set value(newVal: T);
    /**
     * Gets the current value of the signal.
     *
     * @public
     * @returns {T} The current value.
     */
    public get value(): T;
    /**
     * Registers a watcher function that will be called whenever the signal's value changes.
     * The watcher will receive the new value as its argument.
     *
     * @public
     * @param {SignalWatcher<T>} fn - The callback function to invoke on value change.
     * @returns {SignalUnsubscribe} A function to unsubscribe the watcher.
     *          Returns true if watcher was removed, false if it wasn't registered.
     *          Safe to call multiple times (idempotent after first call).
     *
     * @example
     * // Basic watching
     * const unsubscribe = signal.watch((value) => console.log(value));
     *
     * @example
     * // Stop watching
     * unsubscribe(); // Returns true if watcher was removed
     * unsubscribe(); // Returns false (already removed, safe to call again)
     *
     * @example
     * // Multiple watchers
     * const unsub1 = signal.watch((v) => console.log("Watcher 1:", v));
     * const unsub2 = signal.watch((v) => console.log("Watcher 2:", v));
     * signal.value = "test"; // Both watchers are called
     */
    public watch(fn: SignalWatcher<T>): SignalUnsubscribe;
    /**
     * Synchronously notifies all registered watchers of the value change.
     * This preserves stack traces for debugging and ensures immediate
     * value consistency. Render batching is handled at the component level.
     *
     * @note If a watcher throws, subsequent watchers are NOT called.
     * The error propagates to the caller (the setter).
     *
     * @private
     * @returns {void}
     */
    private _notify;
}
/**
 * Callback function invoked when a signal's value changes.
 */
export type SignalWatcher<T> = (value: T) => void;
/**
 * Function to unsubscribe a watcher from a signal.
 */
export type SignalUnsubscribe = () => boolean;
/**
 * Interface describing the public API of a Signal.
 */
export type SignalLike<T> = {
    /**
     *           The current value of the signal.
     */
    value: T;
    /**
     *           Subscribe to value changes.
     */
    watch: (arg0: SignalWatcher<T>) => SignalUnsubscribe;
};
//# sourceMappingURL=Signal.d.ts.map
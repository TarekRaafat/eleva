/**
 * @class ⚡ Signal
 * @classdesc A reactive data holder that enables fine-grained reactivity in the Eleva framework.
 * Signals notify registered watchers when their value changes, enabling efficient DOM updates
 * through targeted patching rather than full re-renders.
 * Updates are batched using microtasks to prevent multiple synchronous notifications.
 * The class is generic, allowing type-safe handling of any value type T.
 *
 * @example
 * const count = new Signal(0);
 * count.watch((value) => console.log(`Count changed to: ${value}`));
 * count.value = 1; // Logs: "Count changed to: 1"
 * @template T
 */
export class Signal<T> {
    /**
     * Creates a new Signal instance with the specified initial value.
     *
     * @public
     * @param {T} value - The initial value of the signal.
     */
    constructor(value: T);
    /** @private {T} Internal storage for the signal's current value */
    private _value;
    /** @private {Set<(value: T) => void>} Collection of callback functions to be notified when value changes */
    private _watchers;
    /** @private {boolean} Flag to prevent multiple synchronous watcher notifications and batch updates into microtasks */
    private _pending;
    /**
     * Sets a new value for the signal and notifies all registered watchers if the value has changed.
     * The notification is batched using microtasks to prevent multiple synchronous updates.
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
     * @param {(value: T) => void} fn - The callback function to invoke on value change.
     * @returns {() => boolean} A function to unsubscribe the watcher.
     * @example
     * const unsubscribe = signal.watch((value) => console.log(value));
     * // Later...
     * unsubscribe(); // Stops watching for changes
     */
    public watch(fn: (value: T) => void): () => boolean;
    /**
     * Notifies all registered watchers of a value change using microtask scheduling.
     * Uses a pending flag to batch multiple synchronous updates into a single notification.
     * All watcher callbacks receive the current value when executed.
     *
     * @private
     * @returns {void}
     */
    private _notify;
}
//# sourceMappingURL=Signal.d.ts.map
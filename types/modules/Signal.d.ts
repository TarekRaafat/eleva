/**
 * @class ⚡ Signal
 * @classdesc Fine-grained reactivity.
 * A reactive data holder that notifies registered watchers when its value changes,
 * enabling fine-grained DOM patching rather than full re-renders.
 */
export class Signal {
    /**
     * Creates a new Signal instance.
     *
     * @param {*} value - The initial value of the signal.
     */
    constructor(value: any);
    /** @private {*} Internal storage for the signal's current value */
    private _value;
    /** @private {Set<function>} Collection of callback functions to be notified when value changes */
    private _watchers;
    /** @private {boolean} Flag to prevent multiple synchronous watcher notifications and batch updates into microtasks */
    private _pending;
    /**
     * Sets a new value for the signal and notifies all registered watchers if the value has changed.
     *
     * @param {*} newVal - The new value to set.
     */
    set value(newVal: any);
    /**
     * Gets the current value of the signal.
     *
     * @returns {*} The current value.
     */
    get value(): any;
    /**
     * Registers a watcher function that will be called whenever the signal's value changes.
     *
     * @param {function(any): void} fn - The callback function to invoke on value change.
     * @returns {function(): boolean} A function to unsubscribe the watcher.
     */
    watch(fn: (arg0: any) => void): () => boolean;
    /**
     * Notifies all registered watchers of a value change using microtask scheduling.
     * Uses a pending flag to batch multiple synchronous updates into a single notification.
     * All watcher callbacks receive the current value when executed.
     *
     * @private
     * @returns {void}
     */
    private _notifyWatchers;
}
//# sourceMappingURL=Signal.d.ts.map
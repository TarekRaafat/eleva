/**
 * ⚡ Signal: Fine-grained reactivity.
 *
 * A reactive data holder that notifies registered watchers when its value changes,
 * allowing for fine-grained DOM patching rather than full re-renders.
 */
export class Signal {
    /**
     * Creates a new Signal instance.
     *
     * @param {*} value - The initial value of the signal.
     */
    constructor(value: any);
    _value: any;
    _watchers: Set<any>;
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
     * @param {Function} fn - The callback function to invoke on value change.
     * @returns {Function} A function to unsubscribe the watcher.
     */
    watch(fn: Function): Function;
}
//# sourceMappingURL=Signal.d.ts.map
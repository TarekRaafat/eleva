"use strict";

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
  constructor(value) {
    this._value = value;
    this._watchers = new Set();
  }

  /**
   * Gets the current value of the signal.
   *
   * @returns {*} The current value.
   */
  get value() {
    return this._value;
  }

  /**
   * Sets a new value for the signal and notifies all registered watchers if the value has changed.
   *
   * @param {*} newVal - The new value to set.
   */
  set value(newVal) {
    if (newVal !== this._value) {
      this._value = newVal;
      this._watchers.forEach((fn) => fn(newVal));
    }
  }

  /**
   * Registers a watcher function that will be called whenever the signal's value changes.
   *
   * @param {Function} fn - The callback function to invoke on value change.
   * @returns {Function} A function to unsubscribe the watcher.
   */
  watch(fn) {
    this._watchers.add(fn);
    return () => this._watchers.delete(fn);
  }
}

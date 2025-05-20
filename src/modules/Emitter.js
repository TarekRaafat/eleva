"use strict";

/**
 * @class 📡 Emitter
 * @classdesc A robust event emitter that enables inter-component communication through a publish-subscribe pattern.
 * Components can emit events and listen for events from other components, facilitating loose coupling
 * and reactive updates across the application.
 *
 * @example
 * const emitter = new Emitter();
 * emitter.on('user:login', (user) => console.log(`User logged in: ${user.name}`));
 * emitter.emit('user:login', { name: 'John' }); // Logs: "User logged in: John"
 */
export class Emitter {
  /**
   * Creates a new Emitter instance.
   *
   * @public
   */
  constructor() {
    /** @private {Map<string, Set<function(any): void>>} Map of event names to their registered handler functions */
    this._events = new Map();
  }

  /**
   * Registers an event handler for the specified event name.
   * The handler will be called with the event data when the event is emitted.
   *
   * @public
   * @param {string} event - The name of the event to listen for.
   * @param {function(any): void} handler - The callback function to invoke when the event occurs.
   * @returns {function(): void} A function to unsubscribe the event handler.
   * @example
   * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
   * // Later...
   * unsubscribe(); // Stops listening for the event
   */
  on(event, handler) {
    if (!this._events.has(event)) this._events.set(event, new Set());

    this._events.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /**
   * Removes an event handler for the specified event name.
   * If no handler is provided, all handlers for the event are removed.
   *
   * @public
   * @param {string} event - The name of the event.
   * @param {function(any): void} [handler] - The specific handler function to remove.
   * @returns {void}
   */
  off(event, handler) {
    if (!this._events.has(event)) return;
    if (handler) {
      const handlers = this._events.get(event);
      handlers.delete(handler);
      // Remove the event if there are no handlers left
      if (handlers.size === 0) this._events.delete(event);
    } else {
      this._events.delete(event);
    }
  }

  /**
   * Emits an event with the specified data to all registered handlers.
   * Handlers are called synchronously in the order they were registered.
   *
   * @public
   * @param {string} event - The name of the event to emit.
   * @param {...any} args - Optional arguments to pass to the event handlers.
   * @returns {void}
   */
  emit(event, ...args) {
    if (!this._events.has(event)) return;
    this._events.get(event).forEach((handler) => handler(...args));
  }
}

"use strict";

// ============================================================================
// TYPE DEFINITIONS - TypeScript-friendly JSDoc types for IDE support
// ============================================================================

/**
 * @template T
 * @callback EventHandler
 * @param {...T} args - Event arguments
 * @returns {void|Promise<void>}
 */

/**
 * @callback EventUnsubscribe
 * @returns {void}
 */

/**
 * @typedef {`${string}:${string}`} EventName
 *           Event names follow the format 'namespace:action' (e.g., 'user:login', 'cart:update')
 */

/**
 * @typedef {Object} EmitterLike
 * @property {function(string, EventHandler<unknown>): EventUnsubscribe} on - Subscribe to an event
 * @property {function(string, EventHandler<unknown>=): void} off - Unsubscribe from an event
 * @property {function(string, ...unknown): void} emit - Emit an event
 */

/**
 * @class 📡 Emitter
 * @classdesc A robust event emitter that enables inter-component communication through a publish-subscribe pattern.
 * Components can emit events and listen for events from other components, facilitating loose coupling
 * and reactive updates across the application.
 * Events are handled synchronously in the order they were registered, with proper cleanup
 * of unsubscribed handlers.
 *
 * Event names should follow the format 'namespace:action' for consistency and organization.
 *
 * @example
 * // Basic usage
 * const emitter = new Emitter();
 * emitter.on('user:login', (user) => console.log(`User logged in: ${user.name}`));
 * emitter.emit('user:login', { name: 'John' }); // Logs: "User logged in: John"
 *
 * @example
 * // With unsubscribe
 * const unsub = emitter.on('cart:update', (items) => {
 *   console.log(`Cart has ${items.length} items`);
 * });
 * emitter.emit('cart:update', [{ id: 1, name: 'Book' }]); // Logs: "Cart has 1 items"
 * unsub(); // Stop listening
 * emitter.emit('cart:update', []); // No log output
 *
 * @example
 * // Multiple arguments
 * emitter.on('order:placed', (orderId, amount, currency) => {
 *   console.log(`Order ${orderId}: ${amount} ${currency}`);
 * });
 * emitter.emit('order:placed', 'ORD-123', 99.99, 'USD');
 *
 * @example
 * // Common event patterns
 * // Lifecycle events
 * emitter.on('component:mount', (component) => {});
 * emitter.on('component:unmount', (component) => {});
 * // State events
 * emitter.on('state:change', (newState, oldState) => {});
 * // Navigation events
 * emitter.on('router:navigate', (to, from) => {});
 *
 * @implements {EmitterLike}
 */
export class Emitter {
  /**
   * Creates a new Emitter instance.
   *
   * @public
   *
   * @example
   * const emitter = new Emitter();
   */
  constructor() {
    /**
     * Map of event names to their registered handler functions
     * @private
     * @type {Map<string, Set<EventHandler<unknown>>>}
     */
    this._events = new Map();
  }

  /**
   * Registers an event handler for the specified event name.
   * The handler will be called with the event data when the event is emitted.
   * Event names should follow the format 'namespace:action' for consistency.
   *
   * @public
   * @template T
   * @param {string} event - The name of the event to listen for (e.g., 'user:login').
   * @param {EventHandler<T>} handler - The callback function to invoke when the event occurs.
   * @returns {EventUnsubscribe} A function to unsubscribe the event handler.
   *
   * @example
   * // Basic subscription
   * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
   *
   * @example
   * // Typed handler
   * emitter.on('user:update', (/** @type {{id: number, name: string}} *\/ user) => {
   *   console.log(`User ${user.id}: ${user.name}`);
   * });
   *
   * @example
   * // Cleanup
   * unsubscribe(); // Stops listening for the event
   */
  on(event, handler) {
    let h = this._events.get(event);
    if (!h) this._events.set(event, (h = new Set()));
    h.add(handler);
    return () => this.off(event, handler);
  }

  /**
   * Removes an event handler for the specified event name.
   * If no handler is provided, all handlers for the event are removed.
   * Automatically cleans up empty event sets to prevent memory leaks.
   *
   * @public
   * @template T
   * @param {string} event - The name of the event to remove handlers from.
   * @param {EventHandler<T>} [handler] - The specific handler function to remove.
   * @returns {void}
   *
   * @example
   * // Remove a specific handler
   * const loginHandler = (user) => console.log(user);
   * emitter.on('user:login', loginHandler);
   * emitter.off('user:login', loginHandler);
   *
   * @example
   * // Remove all handlers for an event
   * emitter.off('user:login');
   */
  off(event, handler) {
    if (!this._events.has(event)) return;
    if (handler) {
      const handlers = this._events.get(event);
      handlers.delete(handler);
      if (handlers.size === 0) this._events.delete(event);
    } else {
      this._events.delete(event);
    }
  }

  /**
   * Emits an event with the specified data to all registered handlers.
   * Handlers are called synchronously in the order they were registered.
   * If no handlers are registered for the event, the emission is silently ignored.
   *
   * @public
   * @template T
   * @param {string} event - The name of the event to emit.
   * @param {...T} args - Optional arguments to pass to the event handlers.
   * @returns {void}
   *
   * @example
   * // Emit an event with data
   * emitter.emit('user:login', { name: 'John', role: 'admin' });
   *
   * @example
   * // Emit an event with multiple arguments
   * emitter.emit('order:placed', 'ORD-123', 99.99, 'USD');
   *
   * @example
   * // Emit without data
   * emitter.emit('app:ready');
   */
  emit(event, ...args) {
    const handlers = this._events.get(event);
    if (handlers) for (const handler of handlers) handler(...args);
  }
}

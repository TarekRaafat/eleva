/**
 * @module eleva/emitter
 * @fileoverview Event emitter for publish-subscribe communication between components.
 */
/**
 * Callback function invoked when an event is emitted.
 * @callback EventHandler
 * @param {...any} args
 *        Event arguments passed to the handler.
 * @returns {void | Promise<void>}
 */
/**
 * Function to unsubscribe an event handler.
 * @callback EventUnsubscribe
 * @returns {void}
 */
/**
 * Event name string identifier.
 * @typedef {string} EventName
 * @description
 * Recommended convention: 'namespace:action' (e.g., 'user:login').
 * This pattern prevents naming collisions and improves code readability.
 *
 * Common namespaces:
 * - `user:` - User-related events (login, logout, update)
 * - `component:` - Component lifecycle events (mount, unmount)
 * - `router:` - Navigation events (beforeEach, afterEach)
 * - `store:` - State management events (change, error)
 * @example
 * 'user:login'      // User logged in
 * 'cart:update'     // Shopping cart updated
 * 'component:mount' // Component was mounted
 */
/**
 * Interface describing the public API of an Emitter.
 * @typedef {Object} EmitterLike
 * @property {(event: string, handler: EventHandler) => EventUnsubscribe} on
 *           Subscribe to an event.
 * @property {(event: string, handler?: EventHandler) => void} off
 *           Unsubscribe from an event.
 * @property {(event: string, ...args: unknown[]) => void} emit
 *           Emit an event with arguments.
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
 * // Note: These lifecycle names are conventions; Eleva core does not emit them by default.
 * // State events
 * emitter.on('state:change', (newState, oldState) => {});
 * // Navigation events
 * emitter.on('router:navigate', (to, from) => {});
 *
 * @implements {EmitterLike}
 */
export class Emitter implements EmitterLike {
    /**
     * Map of event names to their registered handler functions
     * @private
     * @type {Map<string, Set<EventHandler>>}
     */
    private _events;
    /**
     * Registers an event handler for the specified event name.
     * The handler will be called with the event data when the event is emitted.
     * Event names should follow the format 'namespace:action' for consistency.
     *
     * @public
     * @param {string} event - The name of the event to listen for (e.g., 'user:login').
     * @param {EventHandler} handler - The callback function to invoke when the event occurs.
     *        Note: Handlers returning Promises are NOT awaited. For async operations,
     *        handle promise resolution within your handler.
     * @returns {EventUnsubscribe} A function to unsubscribe the event handler.
     *
     * @example
     * // Basic subscription
     * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
     *
     * @example
     * // Handler with typed parameter
     * emitter.on('user:update', (user) => {
     *   console.log(`User ${user.id}: ${user.name}`);
     * });
     *
     * @example
     * // Cleanup
     * unsubscribe(); // Stops listening for the event
     */
    public on(event: string, handler: EventHandler): EventUnsubscribe;
    /**
     * Removes an event handler for the specified event name.
     * Automatically cleans up empty event sets to prevent memory leaks.
     *
     * Behavior varies based on whether handler is provided:
     * - With handler: Removes only that specific handler function (O(1) Set deletion)
     * - Without handler: Removes ALL handlers for the event (O(1) Map deletion)
     *
     * @public
     * @param {string} event - The name of the event to remove handlers from.
     * @param {EventHandler} [handler] - The specific handler to remove. If omitted, all handlers are removed.
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
    public off(event: string, handler?: EventHandler): void;
    /**
     * Emits an event with the specified data to all registered handlers.
     * Handlers are called synchronously in the order they were registered.
     * If no handlers are registered for the event, the emission is silently ignored.
     * Handlers that return promises are not awaited.
     *
     * Error propagation behavior:
     * - If a handler throws synchronously, the error propagates immediately
     * - Remaining handlers in the iteration are NOT called after an error
     * - For error-resilient emission, wrap your emit call in try/catch
     * - Async handler rejections are not caught (fire-and-forget)
     *
     * @public
     * @param {string} event - The name of the event to emit.
     * @param {...any} args - Optional arguments to pass to the event handlers.
     * @returns {void}
     * @throws {Error} If a handler throws synchronously, the error propagates to the caller.
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
    public emit(event: string, ...args: any[]): void;
}
/**
 * Callback function invoked when an event is emitted.
 */
export type EventHandler = (...args: any[]) => void | Promise<void>;
/**
 * Function to unsubscribe an event handler.
 */
export type EventUnsubscribe = () => void;
/**
 * Event name string identifier.
 */
export type EventName = string;
/**
 * Interface describing the public API of an Emitter.
 */
export type EmitterLike = {
    /**
     *           Subscribe to an event.
     */
    on: (event: string, handler: EventHandler) => EventUnsubscribe;
    /**
     *           Unsubscribe from an event.
     */
    off: (event: string, handler?: EventHandler) => void;
    /**
     *           Emit an event with arguments.
     */
    emit: (event: string, ...args: unknown[]) => void;
};
//# sourceMappingURL=Emitter.d.ts.map
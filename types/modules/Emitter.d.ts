/**
 * @class 📡 Emitter
 * @classdesc A robust event emitter that enables inter-component communication through a publish-subscribe pattern.
 * Components can emit events and listen for events from other components, facilitating loose coupling
 * and reactive updates across the application.
 * Events are handled synchronously in the order they were registered, with proper cleanup
 * of unsubscribed handlers.
 * Event names should follow the format 'namespace:action' (e.g., 'user:login', 'cart:update').
 *
 * @example
 * const emitter = new Emitter();
 * emitter.on('user:login', (user) => console.log(`User logged in: ${user.name}`));
 * emitter.emit('user:login', { name: 'John' }); // Logs: "User logged in: John"
 */
export class Emitter {
    /** @private {Map<string, Set<(data: unknown) => void>>} Map of event names to their registered handler functions */
    private _events;
    /**
     * Registers an event handler for the specified event name.
     * The handler will be called with the event data when the event is emitted.
     * Event names should follow the format 'namespace:action' for consistency.
     *
     * @public
     * @param {string} event - The name of the event to listen for (e.g., 'user:login').
     * @param {(data: unknown) => void} handler - The callback function to invoke when the event occurs.
     * @returns {() => void} A function to unsubscribe the event handler.
     * @example
     * const unsubscribe = emitter.on('user:login', (user) => console.log(user));
     * // Later...
     * unsubscribe(); // Stops listening for the event
     */
    public on(event: string, handler: (data: unknown) => void): () => void;
    /**
     * Removes an event handler for the specified event name.
     * If no handler is provided, all handlers for the event are removed.
     * Automatically cleans up empty event sets to prevent memory leaks.
     *
     * @public
     * @param {string} event - The name of the event to remove handlers from.
     * @param {(data: unknown) => void} [handler] - The specific handler function to remove.
     * @returns {void}
     * @example
     * // Remove a specific handler
     * emitter.off('user:login', loginHandler);
     * // Remove all handlers for an event
     * emitter.off('user:login');
     */
    public off(event: string, handler?: (data: unknown) => void): void;
    /**
     * Emits an event with the specified data to all registered handlers.
     * Handlers are called synchronously in the order they were registered.
     * If no handlers are registered for the event, the emission is silently ignored.
     *
     * @public
     * @param {string} event - The name of the event to emit.
     * @param {...unknown} args - Optional arguments to pass to the event handlers.
     * @returns {void}
     * @example
     * // Emit an event with data
     * emitter.emit('user:login', { name: 'John', role: 'admin' });
     * // Emit an event with multiple arguments
     * emitter.emit('cart:update', { items: [] }, { total: 0 });
     */
    public emit(event: string, ...args: unknown[]): void;
}
//# sourceMappingURL=Emitter.d.ts.map
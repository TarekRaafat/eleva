/**
 * 🎙️ Emitter: Robust inter-component communication with event bubbling.
 *
 * Implements a basic publish-subscribe pattern for event handling,
 * allowing components to communicate through custom events.
 */
export class Emitter {
    /** @type {Object.<string, Function[]>} */
    events: {
        [x: string]: Function[];
    };
    /**
     * Registers an event handler for the specified event.
     *
     * @param {string} event - The name of the event.
     * @param {Function} handler - The function to call when the event is emitted.
     */
    on(event: string, handler: Function): void;
    /**
     * Removes a previously registered event handler.
     *
     * @param {string} event - The name of the event.
     * @param {Function} handler - The handler function to remove.
     */
    off(event: string, handler: Function): void;
    /**
     * Emits an event, invoking all handlers registered for that event.
     *
     * @param {string} event - The event name.
     * @param {...*} args - Additional arguments to pass to the event handlers.
     */
    emit(event: string, ...args: any[]): void;
}
//# sourceMappingURL=Emitter.d.ts.map
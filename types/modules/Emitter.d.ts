/**
 * @class 🎙️ Emitter
 * @classdesc Robust inter-component communication with event bubbling.
 * Implements a basic publish-subscribe pattern for event handling, allowing components
 * to communicate through custom events.
 */
export class Emitter {
    /** @type {Object.<string, Function[]>} Storage for event handlers mapped by event name */
    events: {
        [x: string]: Function[];
    };
    /**
     * Registers an event handler for the specified event.
     *
     * @param {string} event - The name of the event.
     * @param {function(...any): void} handler - The function to call when the event is emitted.
     */
    on(event: string, handler: (...args: any[]) => void): void;
    /**
     * Removes a previously registered event handler.
     *
     * @param {string} event - The name of the event.
     * @param {function(...any): void} handler - The handler function to remove.
     */
    off(event: string, handler: (...args: any[]) => void): void;
    /**
     * Emits an event, invoking all handlers registered for that event.
     *
     * @param {string} event - The event name.
     * @param {...any} args - Additional arguments to pass to the event handlers.
     */
    emit(event: string, ...args: any[]): void;
}
//# sourceMappingURL=Emitter.d.ts.map
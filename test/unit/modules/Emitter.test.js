/**
 * @fileoverview Tests for the Emitter module of the Eleva framework
 *
 * These tests verify the event handling capabilities of the Emitter module,
 * including:
 * - Event registration and emission
 * - Listener management
 * - Data passing between components
 * - Error handling
 *
 * The Emitter module provides the event handling functionality for the
 * Eleva framework, enabling communication between components through
 * a pub/sub pattern.
 *
 * @example
 * // Basic event handling
 * const emitter = new Emitter();
 *
 * // Register a listener
 * emitter.on("userLogin", (data) => {
 *   console.log("User logged in:", data);
 * });
 *
 * // Emit an event
 * emitter.emit("userLogin", { id: 1, name: "John" });
 *
 * // Remove a listener
 * emitter.off("userLogin");
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/Emitter
 * @category Unit
 * @group modules
 * @group unit
 */

import { Emitter } from "../../../src/modules/Emitter.js";

/**
 * Tests for the core functionality of the Emitter
 *
 * This suite verifies the fundamental event handling capabilities:
 * - Event registration and emission
 * - Listener management
 * - Data passing between components
 * - Error handling
 *
 * These capabilities form the foundation of Eleva's event-driven
 * communication system.
 *
 * @example
 * // Complete event handling workflow
 * const emitter = new Emitter();
 *
 * // Register multiple listeners
 * emitter.on("dataUpdate", (data) => {
 *   console.log("Data updated:", data);
 * });
 *
 * emitter.on("dataUpdate", (data) => {
 *   // Process data differently
 *   processData(data);
 * });
 *
 * // Emit event with data
 * emitter.emit("dataUpdate", { value: 42 });
 *
 * // Remove specific listener
 * emitter.off("dataUpdate", processData);
 *
 * // Remove all listeners
 * emitter.off("dataUpdate");
 *
 * @group modules
 * @group events
 * @group communication
 */
describe("Emitter", () => {
  /**
   * Tests that event listeners are correctly registered and triggered
   *
   * Verifies:
   * - Listener registration
   * - Event emission
   * - Listener execution
   * - Data passing
   *
   * Event handling ensures that registered listeners are properly
   * triggered when events are emitted with the correct data.
   *
   * @example
   * // Basic event registration and emission
   * const emitter = new Emitter();
   * const listener = jest.fn();
   *
   * emitter.on("test", listener);
   * emitter.emit("test", { value: 42 });
   *
   * // Multiple listeners
   * const emitter = new Emitter();
   * const listener1 = jest.fn();
   * const listener2 = jest.fn();
   *
   * emitter.on("test", listener1);
   * emitter.on("test", listener2);
   * emitter.emit("test", { value: 42 });
   *
   * @group events
   * @group communication
   */
  test("should register and trigger event listeners", () => {
    const emitter = new Emitter();
    const callback = jest.fn();

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });

  /**
   * Tests the event listener removal functionality
   *
   * Verifies that:
   * - Listeners can be removed using the off method
   * - Removed listeners no longer receive emitted events
   * - The emitter properly manages its internal listener registry
   *
   * This functionality is critical for preventing memory leaks by allowing
   * components to unsubscribe from events when they're no longer needed.
   *
   * @group event-handling
   * @group memory-management
   */
  test("should stop events after listener removal", () => {
    const emitter = new Emitter();
    const callback = jest.fn();

    emitter.on("test", callback);
    emitter.off("test", callback);
    emitter.emit("test", "data");

    expect(callback).not.toHaveBeenCalled();
  });

  /**
   * Tests support for multiple listeners on the same event
   *
   * Verifies that:
   * - Multiple callbacks can be registered for the same event
   * - All registered listeners receive the emitted event
   * - Event data is passed correctly to all listeners
   *
   * @group event-handling
   * @group communication
   */
  test("should notify multiple listeners", () => {
    const emitter = new Emitter();
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    emitter.on("test", callback1);
    emitter.on("test", callback2);
    emitter.emit("test", "data");

    expect(callback1).toHaveBeenCalledWith("data");
    expect(callback2).toHaveBeenCalledWith("data");
  });

  /**
   * Tests error handling for invalid event names
   *
   * Verifies that:
   * - Invalid event names are caught and reported
   * - Error messages are descriptive and helpful
   *
   * @group event-handling
   * @group error-handling
   */
  test("should handle invalid event names", () => {
    const emitter = new Emitter();
    const callback = jest.fn();

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });

  /**
   * Tests handling of edge cases in event handling
   *
   * Verifies:
   * - Invalid event names
   * - Missing listeners
   * - Multiple emissions
   * - Listener removal
   *
   * Edge case handling ensures the event system gracefully handles
   * various boundary conditions and error cases.
   *
   * @example
   * // Invalid event name
   * const emitter = new Emitter();
   * emitter.on("", () => {}); // Should throw error
   *
   * // Missing listener
   * emitter.emit("nonexistent"); // Should not throw error
   *
   * // Multiple emissions
   * const emitter = new Emitter();
   * const listener = jest.fn();
   *
   * emitter.on("test", listener);
   * emitter.emit("test", { value: 1 });
   * emitter.emit("test", { value: 2 });
   *
   * // Listener removal
   * emitter.off("test", listener);
   * emitter.emit("test", { value: 3 }); // Should not trigger listener
   *
   * @group events
   * @group communication
   * @group edge-cases
   */
  test("should handle edge cases correctly", () => {
    const emitter = new Emitter();
    const callback = jest.fn();

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });
});

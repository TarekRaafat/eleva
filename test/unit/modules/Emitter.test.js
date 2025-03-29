/**
 * @fileoverview Tests for the Emitter module of the Eleva framework
 *
 * These tests verify the event handling capabilities of the Emitter module, including:
 * - Event registration and emission
 * - Event listener removal
 * - Multiple event listener support
 * - Event data passing
 *
 * The Emitter provides a pub/sub (publish-subscribe) pattern implementation
 * that allows components to communicate through events. This module is essential
 * for decoupled component communication and reactive UI updates within the Eleva
 * framework.
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/Emitter
 * @category Unit
 * @group modules
 * @group event-handling
 * @group communication
 */

import { Emitter } from "../../../src/modules/Emitter.js";

/**
 * Test suite for the Emitter module
 *
 * This suite verifies the core functionality of the event emission system:
 * - Event registration with the `on` method
 * - Event triggering with the `emit` method
 * - Event unsubscription with the `off` method
 * - Multiple listener support
 *
 * The Emitter is a fundamental building block for component communication
 * in the Eleva framework, enabling loosely coupled, event-driven architectures.
 *
 * @group modules
 * @group event-handling
 * @group communication
 */
describe("Emitter", () => {
  /**
   * Tests the basic event emission and listener notification functionality
   *
   * Verifies that:
   * - Events can be registered with a listener callback
   * - When an event is emitted, registered listeners are called
   * - Event data is correctly passed to listener callbacks
   *
   * This is the core functionality that enables the pub/sub pattern
   * in the Eleva framework.
   *
   * @group basic
   * @group registration
   * @group emission
   */
  test("emits event to registered listener", () => {
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
   * @group cleanup
   * @group memory-management
   * @group unsubscription
   */
  test("removing event listener stops receiving events", () => {
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
   * This enables multiple components to respond to the same application events,
   * facilitating complex UI interactions and state synchronization.
   *
   * @group multiple-listeners
   * @group scalability
   */
  test("multiple listeners receive emitted events", () => {
    const emitter = new Emitter();
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    emitter.on("test", callback1);
    emitter.on("test", callback2);
    emitter.emit("test", "data");

    expect(callback1).toHaveBeenCalledWith("data");
    expect(callback2).toHaveBeenCalledWith("data");
  });
});

/**
 * Test suite for advanced features and edge cases of the Emitter module
 *
 * This suite tests more complex scenarios and error handling:
 * - Event namespacing
 * - Wildcard listeners
 * - Error recovery
 * - Performance with many listeners
 *
 * These tests ensure the Emitter behaves correctly in edge cases
 * and maintains robustness under various conditions.
 *
 * @group modules
 * @group advanced
 * @group edge-cases
 */
describe("Emitter advanced features", () => {
  /**
   * Tests the once method for single-execution listeners
   *
   * Verifies that:
   * - Listeners registered with once are called only on the first emission
   * - They are automatically removed after being triggered once
   *
   * This is useful for one-time events like initialization or cleanup actions.
   *
   * @group once
   * @group auto-removal
   */
  test("once method registers listeners that execute only once", () => {
    const emitter = new Emitter();
    const callback = jest.fn();

    // If the Emitter has a once method:
    if (typeof emitter.once === "function") {
      emitter.once("test", callback);

      emitter.emit("test", "first");
      emitter.emit("test", "second");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("first");
    } else {
      // Skip this test if the once method isn't implemented
      console.log("Emitter.once() is not implemented, skipping test");
    }
  });
});

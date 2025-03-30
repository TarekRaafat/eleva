/**
 * @fileoverview Performance tests for the Eleva Emitter module
 *
 * These tests measure and verify the performance characteristics of the Emitter module,
 * which is responsible for event handling and pub/sub functionality in the Eleva framework.
 *
 * Performance metrics measured:
 * - Event emission performance
 * - Listener registration and removal
 * - Memory usage with many listeners
 * - Event propagation speed
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/Emitter
 * @category Performance
 * @group events
 */

import { Emitter } from "../../../src/modules/Emitter.js";

/**
 * Test suite for measuring Emitter module performance characteristics
 *
 * @group performance
 * @group events
 */
describe("Emitter Performance", () => {
  let emitter;

  beforeEach(() => {
    emitter = new Emitter();
  });

  /**
   * Tests the performance of event emission with many listeners
   *
   * This test verifies that the Emitter can efficiently handle event emission
   * when there are many registered listeners.
   *
   * Performance expectations:
   * - Should emit events to 10000 listeners under 100ms
   * - Should handle event data efficiently
   *
   * @performance
   * @benchmark
   */
  test("emits events efficiently to many listeners", () => {
    const numListeners = 10000;
    const eventName = "test-event";
    const eventData = { value: "test" };

    // Register many listeners
    for (let i = 0; i < numListeners; i++) {
      emitter.on(eventName, () => {});
    }

    // Measure emission performance
    const start = performance.now();
    emitter.emit(eventName, eventData);
    const end = performance.now();

    console.log(`Event emission time: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(100); // Under 100ms
  });

  /**
   * Tests the performance of listener registration and removal
   *
   * This test measures how efficiently the Emitter handles adding and removing
   * event listeners.
   *
   * Performance expectations:
   * - Should register 10000 listeners under 50ms
   * - Should remove 10000 listeners under 50ms
   *
   * @performance
   * @benchmark
   */
  test("handles listener registration and removal efficiently", () => {
    const numListeners = 10000;
    const eventName = "test-event";
    const listeners = [];

    // Measure registration performance
    const registerStart = performance.now();
    for (let i = 0; i < numListeners; i++) {
      const listener = () => {};
      listeners.push(listener);
      emitter.on(eventName, listener);
    }
    const registerEnd = performance.now();

    // Measure removal performance
    const removeStart = performance.now();
    for (const listener of listeners) {
      emitter.off(eventName, listener);
    }
    const removeEnd = performance.now();

    console.log(
      `Listener registration time: ${(registerEnd - registerStart).toFixed(2)}ms`
    );
    console.log(
      `Listener removal time: ${(removeEnd - removeStart).toFixed(2)}ms`
    );

    expect(registerEnd - registerStart).toBeLessThan(50); // Under 50ms
    expect(removeEnd - removeStart).toBeLessThan(50); // Under 50ms
  });

  /**
   * Tests the performance of event propagation through multiple emitters
   *
   * This test measures how efficiently events propagate through a chain
   * of connected emitters.
   *
   * Performance expectations:
   * - Should propagate through 100 emitters under 50ms
   * - Should maintain event data integrity
   *
   * @performance
   * @benchmark
   */
  test("propagates events efficiently through emitter chain", () => {
    const numEmitters = 100;
    const emitters = Array(numEmitters)
      .fill()
      .map(() => new Emitter());
    const eventName = "chain-event";
    const eventData = { value: "test" };

    // Connect emitters in a chain
    for (let i = 0; i < numEmitters - 1; i++) {
      emitters[i].on(eventName, (data) => {
        emitters[i + 1].emit(eventName, data);
      });
    }

    // Add final listener
    emitters[numEmitters - 1].on(eventName, () => {});

    // Measure propagation performance
    const start = performance.now();
    emitters[0].emit(eventName, eventData);
    const end = performance.now();

    console.log(`Event chain propagation time: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(50); // Under 50ms
  });

  /**
   * Tests memory usage with many event listeners
   *
   * This test verifies that the Emitter manages memory efficiently
   * when dealing with many event listeners and frequent events.
   *
   * Performance expectations:
   * - Memory usage should remain stable
   * - No memory leaks should be detected
   *
   * @performance
   * @benchmark
   */
  test("maintains stable memory usage with many listeners", () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const numEvents = 10;
    const numListeners = 1000;
    const cycles = 10;

    let lastMemory = initialMemory;

    for (let cycle = 0; cycle < cycles; cycle++) {
      // Create event names and listeners
      const events = Array(numEvents)
        .fill()
        .map((_, i) => `event-${i}`);
      const listeners = events.map((eventName) => {
        const eventListeners = Array(numListeners)
          .fill()
          .map(() => () => {});
        eventListeners.forEach((listener) => {
          emitter.on(eventName, listener);
        });
        return eventListeners;
      });

      // Emit events
      events.forEach((eventName, i) => {
        emitter.emit(eventName, { cycle, event: i });
      });

      // Remove listeners
      events.forEach((eventName, i) => {
        listeners[i].forEach((listener) => {
          emitter.off(eventName, listener);
        });
      });

      const currentMemory = process.memoryUsage().heapUsed;
      const memoryDiff = currentMemory - lastMemory;

      console.log(
        `Cycle ${cycle + 1} memory difference: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`
      );

      // Memory should not grow significantly between cycles
      expect(memoryDiff).toBeLessThan(5 * 1024 * 1024); // Less than 5MB growth per cycle

      lastMemory = currentMemory;
    }
  });
});

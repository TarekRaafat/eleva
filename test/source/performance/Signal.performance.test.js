/**
 * @fileoverview Performance tests for the Eleva Signal module
 *
 * These tests measure and verify the performance characteristics of the Signal module,
 * which is responsible for reactive state management in the Eleva framework.
 *
 * Performance metrics measured:
 * - Signal creation and initialization time
 * - Signal update propagation speed
 * - Memory usage with many signals
 * - Computed signal performance
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/Signal
 * @category Performance
 * @group signals
 */

import { Signal } from "../../../src/modules/Signal.js";

/**
 * Test suite for measuring Signal module performance characteristics
 *
 * @group performance
 * @group signals
 */
describe("Signal Performance", () => {
  /**
   * Tests the performance of signal creation and initialization
   *
   * This test verifies that the Signal module can efficiently create
   * and initialize a large number of signals.
   *
   * Performance expectations:
   * - Should create 10000 signals under 100ms
   * - Memory usage should be efficient
   *
   * @performance
   * @benchmark
   */
  test("creates signals efficiently", () => {
    const start = performance.now();
    const signals = Array(10000)
      .fill()
      .map((_, i) => new Signal(i));
    const end = performance.now();

    console.log(`Signal creation time: ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(100); // Under 100ms
  });

  /**
   * Tests the performance of signal update propagation
   *
   * This test measures how quickly signal updates propagate through
   * a chain of dependent signals.
   *
   * Performance expectations:
   * - Should propagate updates through 1000 signals under 50ms
   * - Update propagation should be synchronous
   *
   * @performance
   * @benchmark
   */
  test("propagates updates efficiently", () => {
    // Create a chain of 1000 dependent signals
    const signals = Array(1000)
      .fill()
      .map(() => new Signal(0));
    const watchers = signals.map((signal, i) => {
      if (i === 0) return null;
      return signal.watch(() => {
        signals[i].value = signals[i - 1].value + 1;
      });
    });

    // Measure update propagation
    const start = performance.now();
    signals[0].value = 1;
    const end = performance.now();

    // Cleanup
    watchers.forEach((watcher) => watcher && watcher());

    console.log(
      `Signal update propagation time: ${(end - start).toFixed(2)}ms`
    );
    expect(end - start).toBeLessThan(50); // Under 50ms
  });

  /**
   * Tests the performance of computed signals
   *
   * This test measures the efficiency of computed signals that
   * depend on multiple source signals.
   *
   * Performance expectations:
   * - Should compute derived values quickly
   * - Should cache results efficiently
   *
   * @performance
   * @benchmark
   */
  test("computes derived values efficiently", () => {
    // Create source signals
    const source1 = new Signal(
      Array(1000)
        .fill()
        .map((_, i) => ({ id: i, value: i }))
    );
    const source2 = new Signal(
      Array(1000)
        .fill()
        .map((_, i) => ({ id: i, value: i * 2 }))
    );

    // Create computed signal
    const computed = new Signal(() => {
      const arr1 = source1.value;
      const arr2 = source2.value;
      return arr1.map((item, i) => ({
        id: item.id,
        sum: item.value + arr2[i].value,
        product: item.value * arr2[i].value,
      }));
    });

    // Measure computation time
    const start = performance.now();
    const result = computed.value;
    const end = performance.now();

    console.log(
      `Computed signal evaluation time: ${(end - start).toFixed(2)}ms`
    );
    expect(end - start).toBeLessThan(10); // Under 10ms
  });

  /**
   * Tests memory usage with many signals
   *
   * This test verifies that the Signal module manages memory efficiently
   * when dealing with a large number of signals and watchers.
   *
   * Performance expectations:
   * - Memory usage should remain stable
   * - No memory leaks should be detected
   *
   * @performance
   * @benchmark
   */
  test("manages memory efficiently", () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const numSignals = 10000;
    const numWatchers = 1000;

    // Create signals and watchers
    const signals = Array(numSignals)
      .fill()
      .map(() => new Signal(0));
    const watchers = Array(numWatchers)
      .fill()
      .map(() => {
        const source = signals[Math.floor(Math.random() * numSignals)];
        const target = signals[Math.floor(Math.random() * numSignals)];
        return source.watch(() => {
          target.value = source.value;
        });
      });

    // Trigger updates
    for (let i = 0; i < 100; i++) {
      signals[Math.floor(Math.random() * numSignals)].value = i;
    }

    // Cleanup
    watchers.forEach((watcher) => watcher());

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDiff = finalMemory - initialMemory;

    console.log(
      `Memory usage difference: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`
    );
    expect(memoryDiff).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
  });
});

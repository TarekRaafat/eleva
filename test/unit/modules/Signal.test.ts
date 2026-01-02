/**
 * @fileoverview Tests for the Signal module of the Eleva framework
 *
 * These tests verify the reactivity system implemented through the Signal class.
 */

import { describe, test, expect, mock } from "bun:test";
import { Signal } from "../../../src/modules/Signal.js";

describe("Signal", () => {
  test("should manage signal values correctly", () => {
    const signal = new Signal(42);

    expect(signal.value).toBe(42);

    signal.value = 43;
    expect(signal.value).toBe(43);

    const complexSignal = new Signal({ count: 0 });

    complexSignal.value = { ...complexSignal.value, count: 1 };
    expect(complexSignal.value).toEqual({ count: 1 });

    signal.value = 2;
    signal.value = 3;

    expect(signal.value).toBe(3);
  });

  test("should trigger watcher on value change", async () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);
    signal.value = 5;

    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(5);
  });

  test("should not trigger watcher for non-changes", async () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);
    signal.value = 0;

    expect(callback).not.toHaveBeenCalled();
  });

  test("should stop notifications after unsubscription", async () => {
    const signal = new Signal(0);
    const callback = mock(() => {});
    const unsubscribe = signal.watch(callback);

    unsubscribe();
    signal.value = 10;

    expect(callback).not.toHaveBeenCalled();
  });

  test("should handle invalid values", () => {
    const signal = new Signal<any>(undefined);
    (signal as any).listeners = null;
    expect(() => signal.emit("test")).toThrow();
  });
});

describe("Signal Edge Cases", () => {
  test("should handle null listeners gracefully", () => {
    const signal = new Signal<any>(undefined);
    (signal as any).listeners = null;
    expect(() => signal.emit("test")).toThrow();
  });

  test("should handle undefined initial value", () => {
    const signal = new Signal<undefined>(undefined);
    expect(signal.value).toBeUndefined();
  });

  test("should handle complex object values", () => {
    const initialObj = { name: "test", value: 42 };
    const signal = new Signal(initialObj);

    expect(signal.value).toBe(initialObj);

    const newObj = { name: "updated", value: 100 };
    signal.value = newObj;

    expect(signal.value).toBe(newObj);
  });

  test("should support multiple watchers", async () => {
    const signal = new Signal(0);
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    signal.watch(callback1);
    const unsubscribe2 = signal.watch(callback2);

    signal.value = 5;
    await Promise.resolve();

    expect(callback1).toHaveBeenCalledWith(5);
    expect(callback2).toHaveBeenCalledWith(5);

    unsubscribe2();
    signal.value = 10;
    await Promise.resolve();

    expect(callback1).toHaveBeenCalledWith(10);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test("should support batched updates", async () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    // If Signal implements a batch method, use it directly
    if (typeof (signal as any).batch === "function") {
      (signal as any).batch(() => {
        signal.value = 1;
        signal.value = 2;
        signal.value = 3;
      });

      await Promise.resolve();

      // Verify callback was only called once with the final value
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(3);
    } else {
      // Alternative implementation if Signal doesn't have explicit batch method
      signal.value = 1;
      signal.value = 2;
      signal.value = 3;

      // At this point, callback should not have been called yet
      expect(callback).not.toHaveBeenCalled();

      // Wait for microtask queue to process
      await Promise.resolve();

      // After the microtask queue is processed, the callback should be called
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(3);

      // Reset the callback to test an alternative batching scenario
      callback.mockReset();

      // Create a Promise to track when the microtask completes
      let resolveTask: () => void;
      const taskCompleted = new Promise<void>((resolve) => {
        resolveTask = resolve;
      });

      // Test batching with queueMicrotask
      queueMicrotask(() => {
        signal.value = 4;
        signal.value = 5;
        signal.value = 6;
        resolveTask();
      });

      await taskCompleted;
      await Promise.resolve();
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(6);
    }
  });

  test("should handle edge cases correctly", () => {
    const invalidSignal = new Signal<any>(undefined);
    expect(() => invalidSignal.emit("test")).toThrow();

    const circularReference: any = {};
    circularReference.self = circularReference;
    const circularSignal = new Signal(circularReference);
    expect(() => circularSignal.watch(() => {})).not.toThrow();

    const deepUpdateSignal = new Signal({
      user: {
        profile: {
          name: "John",
        },
      },
    });
    deepUpdateSignal.value = {
      ...deepUpdateSignal.value,
      user: {
        ...deepUpdateSignal.value.user,
        profile: {
          ...deepUpdateSignal.value.user.profile,
          name: "Jane",
        },
      },
    };

    const signal = new Signal(42);
    signal.watch(() => {});
  });
});

describe("Signal Stress Tests", () => {
  test("should handle circular references", () => {
    const obj: any = {};
    obj.self = obj;
    const signal = new Signal(obj);

    expect(() => signal.watch(() => {})).not.toThrow();
  });

  test("should handle large number of watchers", () => {
    const signal = new Signal(0);
    const watchers = Array(1000)
      .fill(null)
      .map(() => mock(() => {}));

    watchers.forEach((watcher) => signal.watch(watcher));

    signal.value = 1;
  });

  test("should handle rapid successive updates", async () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    for (let i = 0; i < 100; i++) {
      signal.value = i;
    }

    await Promise.resolve();

    expect(callback).toHaveBeenLastCalledWith(99);
  });
});

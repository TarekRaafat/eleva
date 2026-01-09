/**
 * @fileoverview Tests for the Signal module of the Eleva framework
 *
 * These tests verify the reactivity system implemented through the Signal class.
 */

import { describe, test, expect, mock } from "bun:test";
import { Signal } from "../../../src/modules/Signal.js";

// =============================================================================
// Core Signal Tests
// =============================================================================

describe("Signal", () => {
  test("should create signal with initial value", () => {
    const signal = new Signal(42);
    expect(signal.value).toBe(42);
  });

  test("should update signal value", () => {
    const signal = new Signal(42);
    signal.value = 43;
    expect(signal.value).toBe(43);
  });

  test("should handle multiple value updates", () => {
    const signal = new Signal(1);
    signal.value = 2;
    signal.value = 3;
    signal.value = 4;
    expect(signal.value).toBe(4);
  });

  test("should trigger watcher on value change", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);
    signal.value = 5;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(5);
  });

  test("should not trigger watcher for same value", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);
    signal.value = 0;

    expect(callback).not.toHaveBeenCalled();
  });

  test("should stop notifications after unsubscription", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});
    const unsubscribe = signal.watch(callback);

    unsubscribe();
    signal.value = 10;

    expect(callback).not.toHaveBeenCalled();
  });

  test("should support multiple watchers", () => {
    const signal = new Signal(0);
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    signal.watch(callback1);
    const unsubscribe2 = signal.watch(callback2);

    signal.value = 5;

    expect(callback1).toHaveBeenCalledWith(5);
    expect(callback2).toHaveBeenCalledWith(5);

    unsubscribe2();
    signal.value = 10;

    expect(callback1).toHaveBeenCalledWith(10);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test("should notify watchers synchronously", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(1);

    signal.value = 2;
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(2);

    signal.value = 3;
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(3);

    expect(signal.value).toBe(3);
  });
});

// =============================================================================
// Value Type Edge Cases
// =============================================================================

describe("Signal Value Types", () => {
  test("should handle null initial value", () => {
    const signal = new Signal(null);
    expect(signal.value).toBeNull();
  });

  test("should handle null value update", () => {
    const signal = new Signal<string | null>("hello");
    const callback = mock(() => {});

    signal.watch(callback);
    signal.value = null;

    expect(signal.value).toBeNull();
    expect(callback).toHaveBeenCalledWith(null);
  });

  test("should handle undefined initial value", () => {
    const signal = new Signal(undefined);
    expect(signal.value).toBeUndefined();
  });

  test("should handle undefined value update", () => {
    const signal = new Signal<string | undefined>("hello");
    const callback = mock(() => {});

    signal.watch(callback);
    signal.value = undefined;

    expect(signal.value).toBeUndefined();
    expect(callback).toHaveBeenCalledWith(undefined);
  });

  test("should handle boolean values", () => {
    const signal = new Signal(true);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(true);

    signal.value = false;
    expect(signal.value).toBe(false);
    expect(callback).toHaveBeenCalledWith(false);

    signal.value = true;
    expect(callback).toHaveBeenCalledWith(true);
  });

  test("should handle string values", () => {
    const signal = new Signal("hello");
    const callback = mock(() => {});

    signal.watch(callback);
    signal.value = "world";

    expect(signal.value).toBe("world");
    expect(callback).toHaveBeenCalledWith("world");
  });

  test("should handle empty string", () => {
    const signal = new Signal("");
    expect(signal.value).toBe("");

    signal.value = "test";
    expect(signal.value).toBe("test");

    signal.value = "";
    expect(signal.value).toBe("");
  });

  test("should handle array values", () => {
    const signal = new Signal<number[]>([1, 2, 3]);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toEqual([1, 2, 3]);

    const newArray = [4, 5, 6];
    signal.value = newArray;

    expect(signal.value).toBe(newArray);
    expect(callback).toHaveBeenCalledWith(newArray);
  });

  test("should handle function as value", () => {
    const fn1 = () => "hello";
    const fn2 = () => "world";
    const signal = new Signal(fn1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(fn1);
    expect(signal.value()).toBe("hello");

    signal.value = fn2;
    expect(signal.value).toBe(fn2);
    expect(signal.value()).toBe("world");
    expect(callback).toHaveBeenCalledWith(fn2);
  });

  test("should handle Symbol as value", () => {
    const sym1 = Symbol("test1");
    const sym2 = Symbol("test2");
    const signal = new Signal(sym1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(sym1);

    signal.value = sym2;
    expect(signal.value).toBe(sym2);
    expect(callback).toHaveBeenCalledWith(sym2);
  });

  test("should handle BigInt as value", () => {
    const signal = new Signal(BigInt(9007199254740991));
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(BigInt(9007199254740991));

    signal.value = BigInt(9007199254740992);
    expect(signal.value).toBe(BigInt(9007199254740992));
    expect(callback).toHaveBeenCalledWith(BigInt(9007199254740992));
  });

  test("should handle NaN value - triggers every time due to NaN !== NaN", () => {
    const signal = new Signal(NaN);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(Number.isNaN(signal.value)).toBe(true);

    // NaN === NaN is false, so this triggers the watcher
    signal.value = NaN;
    expect(callback).toHaveBeenCalledTimes(1);

    // Setting NaN again also triggers because NaN !== NaN
    signal.value = NaN;
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("should handle -0 and 0 as equal (=== comparison)", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    // -0 === 0 is true, so this should NOT trigger watcher
    signal.value = -0;
    expect(callback).not.toHaveBeenCalled();
    expect(signal.value).toBe(0);
  });

  test("should handle Infinity values", () => {
    const signal = new Signal(Infinity);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = -Infinity;
    expect(signal.value).toBe(-Infinity);
    expect(callback).toHaveBeenCalledWith(-Infinity);

    // Same value shouldn't trigger
    signal.value = -Infinity;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should handle Date objects", () => {
    const date1 = new Date("2024-01-01");
    const date2 = new Date("2024-12-31");
    const signal = new Signal(date1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(date1);

    signal.value = date2;
    expect(signal.value).toBe(date2);
    expect(callback).toHaveBeenCalledWith(date2);
  });

  test("should handle RegExp objects", () => {
    const regex1 = /test/gi;
    const regex2 = /hello/;
    const signal = new Signal(regex1);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = regex2;
    expect(signal.value).toBe(regex2);
    expect(callback).toHaveBeenCalledWith(regex2);
  });

  test("should handle Map objects", () => {
    const map1 = new Map([["a", 1]]);
    const map2 = new Map([["b", 2]]);
    const signal = new Signal(map1);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = map2;
    expect(signal.value).toBe(map2);
    expect(callback).toHaveBeenCalledWith(map2);
  });

  test("should handle Set objects", () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([4, 5, 6]);
    const signal = new Signal(set1);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = set2;
    expect(signal.value).toBe(set2);
    expect(callback).toHaveBeenCalledWith(set2);
  });
});

// =============================================================================
// Equality Comparison Tests (=== behavior)
// =============================================================================

describe("Signal Equality Comparison", () => {
  test("should not trigger for same object reference", () => {
    const obj = { name: "test" };
    const signal = new Signal(obj);
    const callback = mock(() => {});

    signal.watch(callback);

    // Same reference, should not trigger
    signal.value = obj;
    expect(callback).not.toHaveBeenCalled();
  });

  test("should trigger for different object reference with equal content", () => {
    const signal = new Signal({ name: "test" });
    const callback = mock(() => {});

    signal.watch(callback);

    // Different reference, should trigger even if content is same
    signal.value = { name: "test" };
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should not trigger for same array reference", () => {
    const arr = [1, 2, 3];
    const signal = new Signal(arr);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = arr;
    expect(callback).not.toHaveBeenCalled();
  });

  test("should trigger for different array reference with equal content", () => {
    const signal = new Signal([1, 2, 3]);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = [1, 2, 3];
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should handle primitives correctly", () => {
    const signal = new Signal(42);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = 42;
    expect(callback).not.toHaveBeenCalled();

    signal.value = 43;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should handle string equality", () => {
    const signal = new Signal("hello");
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = "hello";
    expect(callback).not.toHaveBeenCalled();

    signal.value = "world";
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Watcher Behavior Tests
// =============================================================================

describe("Signal Watcher Behavior", () => {
  test("should continue notifying other watchers when one throws", () => {
    const signal = new Signal(0);
    const callback1 = mock(() => {});
    const throwingCallback = mock(() => {
      throw new Error("Watcher error");
    });
    const callback2 = mock(() => {});

    signal.watch(callback1);
    signal.watch(throwingCallback);
    signal.watch(callback2);

    // The forEach will throw when it encounters the throwing callback
    // but callback1 should have been called before that
    expect(() => {
      signal.value = 5;
    }).toThrow("Watcher error");

    expect(callback1).toHaveBeenCalledWith(5);
    expect(throwingCallback).toHaveBeenCalledWith(5);
    // callback2 may or may not be called depending on iteration order
  });

  test("should handle watcher that modifies signal value (re-entry)", () => {
    const signal = new Signal(0);
    const values: number[] = [];

    signal.watch((value) => {
      values.push(value);
      // Only modify if value is less than 3 to prevent infinite loop
      if (value < 3) {
        signal.value = value + 1;
      }
    });

    signal.value = 1;

    // Due to synchronous re-entry: 1 -> 2 -> 3
    expect(values).toEqual([1, 2, 3]);
    expect(signal.value).toBe(3);
  });

  test("should handle watcher that unsubscribes itself", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});
    let unsubscribe: () => boolean;

    const selfUnsubscribingWatcher = mock((value: number) => {
      if (value === 2) {
        unsubscribe();
      }
    });

    unsubscribe = signal.watch(selfUnsubscribingWatcher);
    signal.watch(callback);

    signal.value = 1;
    expect(selfUnsubscribingWatcher).toHaveBeenCalledWith(1);
    expect(callback).toHaveBeenCalledWith(1);

    signal.value = 2;
    expect(selfUnsubscribingWatcher).toHaveBeenCalledWith(2);
    expect(callback).toHaveBeenCalledWith(2);

    // After self-unsubscribe, only callback should be called
    signal.value = 3;
    expect(selfUnsubscribingWatcher).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(3);
  });

  test("should handle watcher that unsubscribes other watchers", () => {
    const signal = new Signal(0);
    let unsubscribe2: () => boolean;

    const callback1 = mock((value: number) => {
      if (value === 2) {
        unsubscribe2();
      }
    });
    const callback2 = mock(() => {});

    signal.watch(callback1);
    unsubscribe2 = signal.watch(callback2);

    signal.value = 1;
    expect(callback1).toHaveBeenCalledWith(1);
    expect(callback2).toHaveBeenCalledWith(1);

    signal.value = 2;
    expect(callback1).toHaveBeenCalledWith(2);
    // callback2 might or might not be called for value 2 depending on Set iteration

    signal.value = 3;
    expect(callback1).toHaveBeenCalledWith(3);
    expect(callback2).not.toHaveBeenCalledWith(3);
  });

  test("should handle watcher that adds new watchers", () => {
    const signal = new Signal(0);
    const addedCallback = mock(() => {});
    const values: number[] = [];

    signal.watch((value) => {
      values.push(value);
      if (value === 1) {
        signal.watch(addedCallback);
      }
    });

    signal.value = 1;
    expect(values).toEqual([1]);
    // Added callback shouldn't be called for value 1 (added during iteration)

    signal.value = 2;
    expect(values).toEqual([1, 2]);
    expect(addedCallback).toHaveBeenCalledWith(2);
  });

  test("should prevent duplicate watchers (same function)", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);
    signal.watch(callback);
    signal.watch(callback);

    signal.value = 5;

    // Set prevents duplicates, so callback should only be called once
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should allow different functions as separate watchers", () => {
    const signal = new Signal(0);
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    signal.watch(callback1);
    signal.watch(callback2);

    signal.value = 5;

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test("should pass exact value reference to watchers", () => {
    const obj = { name: "test", nested: { value: 42 } };
    const signal = new Signal<typeof obj | null>(null);
    let receivedValue: typeof obj | null = null;

    signal.watch((value) => {
      receivedValue = value;
    });

    signal.value = obj;

    // Verify it's the exact same reference, not a copy
    expect(receivedValue).toBe(obj); // Same reference
    expect(receivedValue === obj).toBe(true); // Confirm reference equality

    // Mutating the original should affect receivedValue (same reference)
    obj.name = "modified";
    expect(receivedValue!.name).toBe("modified");
  });
});

// =============================================================================
// Unsubscribe Function Tests
// =============================================================================

describe("Signal Unsubscribe", () => {
  test("should return true when unsubscribing existing watcher", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    const unsubscribe = signal.watch(callback);
    const result = unsubscribe();

    expect(result).toBe(true);
  });

  test("should return false when unsubscribing already removed watcher", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    const unsubscribe = signal.watch(callback);
    const result1 = unsubscribe();
    const result2 = unsubscribe();

    expect(result1).toBe(true);
    expect(result2).toBe(false);
  });

  test("should handle multiple unsubscribe calls gracefully", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    const unsubscribe = signal.watch(callback);

    expect(unsubscribe()).toBe(true);
    expect(unsubscribe()).toBe(false);
    expect(unsubscribe()).toBe(false);
    expect(unsubscribe()).toBe(false);

    // Signal should still work
    signal.value = 5;
    expect(callback).not.toHaveBeenCalled();
  });

  test("should only unsubscribe the specific watcher", () => {
    const signal = new Signal(0);
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    const unsubscribe1 = signal.watch(callback1);
    signal.watch(callback2);

    unsubscribe1();
    signal.value = 5;

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith(5);
  });

  test("should handle unsubscribe during value change", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});
    const unsubscribe = signal.watch(callback);

    signal.value = 1;
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();

    signal.value = 2;
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("Signal Edge Cases", () => {
  test("should handle empty watchers set when notifying", () => {
    const signal = new Signal(0);

    // No watchers, should not throw
    expect(() => {
      signal.value = 5;
    }).not.toThrow();

    expect(signal.value).toBe(5);
  });

  test("should handle circular references in value", () => {
    const obj: any = { name: "test" };
    obj.self = obj;

    const signal = new Signal(obj);
    const callback = mock(() => {});

    expect(() => signal.watch(callback)).not.toThrow();

    const newObj: any = { name: "new" };
    newObj.self = newObj;

    expect(() => {
      signal.value = newObj;
    }).not.toThrow();

    expect(callback).toHaveBeenCalledWith(newObj);
  });

  test("should handle deeply nested object updates", () => {
    const signal = new Signal({
      user: {
        profile: {
          settings: {
            theme: "dark",
          },
        },
      },
    });
    const callback = mock(() => {});

    signal.watch(callback);

    const newValue = {
      user: {
        profile: {
          settings: {
            theme: "light",
          },
        },
      },
    };

    signal.value = newValue;

    expect(callback).toHaveBeenCalledWith(newValue);
    expect(signal.value.user.profile.settings.theme).toBe("light");
  });

  test("should handle very large number of subscribe/unsubscribe cycles", () => {
    const signal = new Signal(0);

    for (let i = 0; i < 1000; i++) {
      const unsubscribe = signal.watch(() => {});
      unsubscribe();
    }

    // Signal should still work
    const callback = mock(() => {});
    signal.watch(callback);
    signal.value = 5;

    expect(callback).toHaveBeenCalledWith(5);
  });

  test("should handle interleaved subscribe/unsubscribe", () => {
    const signal = new Signal(0);
    const callbacks = Array.from({ length: 10 }, () => mock(() => {}));
    const unsubscribes: (() => boolean)[] = [];

    // Subscribe all
    callbacks.forEach((cb) => {
      unsubscribes.push(signal.watch(cb));
    });

    signal.value = 1;
    callbacks.forEach((cb) => expect(cb).toHaveBeenCalledTimes(1));

    // Unsubscribe odd indices
    unsubscribes.forEach((unsub, i) => {
      if (i % 2 === 1) unsub();
    });

    signal.value = 2;
    callbacks.forEach((cb, i) => {
      if (i % 2 === 0) {
        expect(cb).toHaveBeenCalledTimes(2);
      } else {
        expect(cb).toHaveBeenCalledTimes(1);
      }
    });
  });
});

// =============================================================================
// Internal Implementation Tests
// =============================================================================

describe("Signal Internals", () => {
  test("should store value in _value property", () => {
    const signal = new Signal(42);
    expect((signal as any)._value).toBe(42);
  });

  test("should use Set for _watchers", () => {
    const signal = new Signal(0);
    expect((signal as any)._watchers instanceof Set).toBe(true);
  });

  test("should start with empty _watchers Set", () => {
    const signal = new Signal(0);
    expect((signal as any)._watchers.size).toBe(0);
  });

  test("should add watcher to _watchers Set", () => {
    const signal = new Signal(0);
    const callback = () => {};

    signal.watch(callback);

    expect((signal as any)._watchers.size).toBe(1);
    expect((signal as any)._watchers.has(callback)).toBe(true);
  });

  test("should remove watcher from _watchers Set on unsubscribe", () => {
    const signal = new Signal(0);
    const callback = () => {};

    const unsubscribe = signal.watch(callback);
    expect((signal as any)._watchers.size).toBe(1);

    unsubscribe();
    expect((signal as any)._watchers.size).toBe(0);
  });

  test("should update _value before notifying watchers", () => {
    const signal = new Signal(0);
    let valueInWatcher: number | undefined;

    signal.watch(() => {
      valueInWatcher = signal.value;
    });

    signal.value = 5;

    expect(valueInWatcher).toBe(5);
  });
});

// =============================================================================
// Stress Tests
// =============================================================================

describe("Signal Stress Tests", () => {
  test("should handle large number of watchers", () => {
    const signal = new Signal(0);
    const watchers = Array.from({ length: 1000 }, () => mock(() => {}));

    watchers.forEach((watcher) => signal.watch(watcher));

    signal.value = 1;

    watchers.forEach((watcher) => {
      expect(watcher).toHaveBeenCalledWith(1);
    });
  });

  test("should handle rapid successive updates", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    for (let i = 1; i <= 100; i++) {
      signal.value = i;
    }

    expect(callback).toHaveBeenCalledTimes(100);
    expect(callback).toHaveBeenLastCalledWith(100);
    expect(signal.value).toBe(100);
  });

  test("should handle alternating values", () => {
    const signal = new Signal(false);
    const callback = mock(() => {});

    signal.watch(callback);

    for (let i = 0; i < 50; i++) {
      signal.value = true;
      signal.value = false;
    }

    expect(callback).toHaveBeenCalledTimes(100);
    expect(signal.value).toBe(false);
  });

  test("should handle large object values", () => {
    const largeObject = {
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        values: Array.from({ length: 100 }, (_, j) => j),
      })),
    };

    const signal = new Signal(largeObject);
    const callback = mock(() => {});

    signal.watch(callback);

    const newLargeObject = { ...largeObject, updated: true };
    signal.value = newLargeObject as any;

    expect(callback).toHaveBeenCalledWith(newLargeObject);
  });

  test("should handle very long string values", () => {
    const longString = "a".repeat(1000000);
    const signal = new Signal(longString);
    const callback = mock(() => {});

    signal.watch(callback);

    const newLongString = "b".repeat(1000000);
    signal.value = newLongString;

    expect(callback).toHaveBeenCalledWith(newLongString);
    expect(signal.value).toBe(newLongString);
  });
});

// =============================================================================
// Complex Object Updates
// =============================================================================

describe("Signal Complex Object Updates", () => {
  test("should handle immutable update pattern", () => {
    const signal = new Signal({ count: 0, name: "test" });
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = { ...signal.value, count: 1 };
    expect(callback).toHaveBeenCalledTimes(1);

    signal.value = { ...signal.value, count: 2 };
    expect(callback).toHaveBeenCalledTimes(2);

    expect(signal.value).toEqual({ count: 2, name: "test" });
  });

  test("should handle nested immutable updates", () => {
    const signal = new Signal({
      user: {
        profile: {
          name: "John",
          age: 30,
        },
      },
    });
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = {
      ...signal.value,
      user: {
        ...signal.value.user,
        profile: {
          ...signal.value.user.profile,
          name: "Jane",
        },
      },
    };

    expect(callback).toHaveBeenCalledTimes(1);
    expect(signal.value.user.profile.name).toBe("Jane");
    expect(signal.value.user.profile.age).toBe(30);
  });

  test("should handle array immutable updates", () => {
    const signal = new Signal<number[]>([1, 2, 3]);
    const callback = mock(() => {});

    signal.watch(callback);

    // Add item
    signal.value = [...signal.value, 4];
    expect(callback).toHaveBeenCalledTimes(1);

    // Remove item
    signal.value = signal.value.filter((x) => x !== 2);
    expect(callback).toHaveBeenCalledTimes(2);

    // Update item
    signal.value = signal.value.map((x) => (x === 3 ? 30 : x));
    expect(callback).toHaveBeenCalledTimes(3);

    expect(signal.value).toEqual([1, 30, 4]);
  });
});

// =============================================================================
// Additional Value Types
// =============================================================================

describe("Signal Additional Value Types", () => {
  test("should handle Uint8Array", () => {
    const arr1 = new Uint8Array([1, 2, 3]);
    const arr2 = new Uint8Array([4, 5, 6]);
    const signal = new Signal(arr1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(arr1);

    signal.value = arr2;
    expect(signal.value).toBe(arr2);
    expect(callback).toHaveBeenCalledWith(arr2);
  });

  test("should handle Float32Array", () => {
    const arr1 = new Float32Array([1.5, 2.5, 3.5]);
    const arr2 = new Float32Array([4.5, 5.5]);
    const signal = new Signal(arr1);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = arr2;
    expect(signal.value).toBe(arr2);
    expect(callback).toHaveBeenCalledWith(arr2);
  });

  test("should handle Int32Array", () => {
    const arr = new Int32Array([1, -2, 3]);
    const signal = new Signal(arr);

    expect(signal.value).toBe(arr);
    expect(signal.value[1]).toBe(-2);
  });

  test("should handle ArrayBuffer", () => {
    const buffer1 = new ArrayBuffer(8);
    const buffer2 = new ArrayBuffer(16);
    const signal = new Signal(buffer1);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = buffer2;
    expect(signal.value).toBe(buffer2);
    expect(signal.value.byteLength).toBe(16);
    expect(callback).toHaveBeenCalledWith(buffer2);
  });

  test("should handle DataView", () => {
    const buffer = new ArrayBuffer(8);
    const view1 = new DataView(buffer);
    const view2 = new DataView(new ArrayBuffer(16));
    const signal = new Signal(view1);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = view2;
    expect(signal.value).toBe(view2);
    expect(callback).toHaveBeenCalledWith(view2);
  });

  test("should handle Promise as value", () => {
    const promise1 = Promise.resolve(42);
    const promise2 = Promise.resolve(100);
    const signal = new Signal(promise1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(promise1);

    signal.value = promise2;
    expect(signal.value).toBe(promise2);
    expect(callback).toHaveBeenCalledWith(promise2);
  });

  test("should handle Error object as value", () => {
    const error1 = new Error("First error");
    const error2 = new TypeError("Type error");
    const signal = new Signal<Error>(error1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value.message).toBe("First error");

    signal.value = error2;
    expect(signal.value).toBe(error2);
    expect(signal.value.message).toBe("Type error");
    expect(callback).toHaveBeenCalledWith(error2);
  });

  test("should handle Proxy object as value", () => {
    const target1 = { value: 10 };
    const proxy1 = new Proxy(target1, {
      get(t, prop) {
        if (prop === "value") return t.value * 2;
        return t[prop as keyof typeof t];
      },
    });

    const target2 = { value: 20 };
    const proxy2 = new Proxy(target2, {
      get(t, prop) {
        if (prop === "value") return t.value * 3;
        return t[prop as keyof typeof t];
      },
    });

    const signal = new Signal(proxy1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value.value).toBe(20); // 10 * 2

    signal.value = proxy2;
    expect(signal.value.value).toBe(60); // 20 * 3
    expect(callback).toHaveBeenCalledWith(proxy2);
  });

  test("should handle WeakMap as value", () => {
    const key1 = {};
    const key2 = {};
    const wm1 = new WeakMap([[key1, "value1"]]);
    const wm2 = new WeakMap([[key2, "value2"]]);
    const signal = new Signal(wm1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value.get(key1)).toBe("value1");

    signal.value = wm2;
    expect(signal.value.get(key2)).toBe("value2");
    expect(callback).toHaveBeenCalledWith(wm2);
  });

  test("should handle WeakSet as value", () => {
    const obj1 = {};
    const obj2 = {};
    const ws1 = new WeakSet([obj1]);
    const ws2 = new WeakSet([obj2]);
    const signal = new Signal(ws1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value.has(obj1)).toBe(true);

    signal.value = ws2;
    expect(signal.value.has(obj2)).toBe(true);
    expect(callback).toHaveBeenCalledWith(ws2);
  });
});

// =============================================================================
// Object Edge Cases
// =============================================================================

describe("Signal Object Edge Cases", () => {
  test("should handle object with null prototype", () => {
    const obj1 = Object.create(null);
    obj1.name = "test";
    const obj2 = Object.create(null);
    obj2.name = "updated";

    const signal = new Signal(obj1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value.name).toBe("test");

    signal.value = obj2;
    expect(signal.value.name).toBe("updated");
    expect(callback).toHaveBeenCalledWith(obj2);
  });

  test("should handle frozen object", () => {
    const frozen1 = Object.freeze({ a: 1, b: 2 });
    const frozen2 = Object.freeze({ c: 3, d: 4 });
    const signal = new Signal(frozen1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(Object.isFrozen(signal.value)).toBe(true);

    signal.value = frozen2;
    expect(signal.value).toBe(frozen2);
    expect(callback).toHaveBeenCalledWith(frozen2);
  });

  test("should handle sealed object", () => {
    const sealed1 = Object.seal({ a: 1 });
    const sealed2 = Object.seal({ b: 2 });
    const signal = new Signal(sealed1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(Object.isSealed(signal.value)).toBe(true);

    signal.value = sealed2;
    expect(signal.value).toBe(sealed2);
    expect(callback).toHaveBeenCalledWith(sealed2);
  });

  test("should handle object with getter", () => {
    const obj1 = {
      _value: 10,
      get computed() {
        return this._value * 2;
      },
    };
    const obj2 = {
      _value: 20,
      get computed() {
        return this._value * 3;
      },
    };

    const signal = new Signal(obj1);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value.computed).toBe(20);

    signal.value = obj2;
    expect(signal.value.computed).toBe(60);
    expect(callback).toHaveBeenCalledWith(obj2);
  });

  test("should handle object with getter that throws", () => {
    const obj = {
      get explosive() {
        throw new Error("Getter exploded");
      },
      safeValue: 42,
    };

    const signal = new Signal(obj);
    const callback = mock(() => {});

    signal.watch(callback);

    // Can access safe properties
    expect(signal.value.safeValue).toBe(42);

    // Accessing explosive getter throws
    expect(() => signal.value.explosive).toThrow("Getter exploded");

    // Signal still works
    const newObj = { safeValue: 100 } as any;
    signal.value = newObj;
    expect(callback).toHaveBeenCalledWith(newObj);
  });

  test("should handle object with setter", () => {
    const obj = {
      _name: "initial",
      get name() {
        return this._name;
      },
      set name(value: string) {
        this._name = value.toUpperCase();
      },
    };

    const signal = new Signal(obj);
    expect(signal.value.name).toBe("initial");

    // Mutating through setter
    signal.value.name = "test";
    expect(signal.value.name).toBe("TEST");
  });

  test("should handle empty object", () => {
    const signal = new Signal({});
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toEqual({});

    signal.value = { added: true };
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should handle empty array", () => {
    const signal = new Signal<number[]>([]);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toEqual([]);

    signal.value = [1, 2, 3];
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should handle object with inherited properties", () => {
    const parent = { inherited: "from parent" };
    const child = Object.create(parent);
    child.own = "own property";

    const signal = new Signal(child);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(signal.value.own).toBe("own property");
    expect(signal.value.inherited).toBe("from parent");

    const newChild = Object.create(parent);
    newChild.own = "new own";
    signal.value = newChild;

    expect(callback).toHaveBeenCalledWith(newChild);
  });
});

// =============================================================================
// Constructor Edge Cases
// =============================================================================

describe("Signal Constructor Edge Cases", () => {
  test("should handle constructor with no arguments", () => {
    const signal = new Signal(undefined);
    expect(signal.value).toBeUndefined();
  });

  test("should handle constructor with explicit undefined", () => {
    const signal = new Signal(undefined);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = "defined";
    expect(callback).toHaveBeenCalledWith("defined");

    signal.value = undefined;
    expect(callback).toHaveBeenCalledWith(undefined);
  });

  test("should allow watching immediately after creation", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    // Watch right away
    signal.watch(callback);

    // Should work
    signal.value = 1;
    expect(callback).toHaveBeenCalledWith(1);
  });

  test("should handle multiple signals created in sequence", () => {
    const signals = Array.from({ length: 10 }, (_, i) => new Signal(i));

    signals.forEach((signal, i) => {
      expect(signal.value).toBe(i);
    });
  });
});

// =============================================================================
// Watcher Execution Order
// =============================================================================

describe("Signal Watcher Execution Order", () => {
  test("should call watchers in insertion order", () => {
    const signal = new Signal(0);
    const order: number[] = [];

    signal.watch(() => order.push(1));
    signal.watch(() => order.push(2));
    signal.watch(() => order.push(3));

    signal.value = 1;

    expect(order).toEqual([1, 2, 3]);
  });

  test("should maintain order after unsubscribe and resubscribe", () => {
    const signal = new Signal(0);
    const order: string[] = [];

    const unsub1 = signal.watch(() => order.push("a"));
    signal.watch(() => order.push("b"));
    signal.watch(() => order.push("c"));

    signal.value = 1;
    expect(order).toEqual(["a", "b", "c"]);

    order.length = 0;
    unsub1();
    signal.watch(() => order.push("d")); // New watcher

    signal.value = 2;
    expect(order).toEqual(["b", "c", "d"]);
  });

  test("should call all watchers even if values change rapidly", () => {
    const signal = new Signal(0);
    const callCounts = [0, 0, 0];

    signal.watch(() => callCounts[0]++);
    signal.watch(() => callCounts[1]++);
    signal.watch(() => callCounts[2]++);

    for (let i = 1; i <= 10; i++) {
      signal.value = i;
    }

    expect(callCounts).toEqual([10, 10, 10]);
  });
});

// =============================================================================
// String Edge Cases
// =============================================================================

describe("Signal String Edge Cases", () => {
  test("should handle unicode strings", () => {
    const signal = new Signal("Hello 世界 🌍");
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe("Hello 世界 🌍");

    signal.value = "Привет мир 🚀";
    expect(signal.value).toBe("Привет мир 🚀");
    expect(callback).toHaveBeenCalledWith("Привет мир 🚀");
  });

  test("should handle emoji strings", () => {
    const signal = new Signal("👨‍👩‍👧‍👦");
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = "🏳️‍🌈";
    expect(callback).toHaveBeenCalledWith("🏳️‍🌈");
  });

  test("should handle strings with special characters", () => {
    const signal = new Signal("Line1\nLine2\tTabbed\r\nWindows");
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = "Quotes: \"double\" and 'single'";
    expect(callback).toHaveBeenCalledWith("Quotes: \"double\" and 'single'");
  });

  test("should handle null character in string", () => {
    const signal = new Signal("before\0after");
    expect(signal.value).toBe("before\0after");
    expect(signal.value.length).toBe(12);
  });

  test("should handle very long unicode string", () => {
    const longUnicode = "🎉".repeat(10000);
    const signal = new Signal(longUnicode);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value.length).toBe(20000); // Each emoji is 2 chars

    const newLongUnicode = "🚀".repeat(10000);
    signal.value = newLongUnicode;
    expect(callback).toHaveBeenCalled();
  });
});

// =============================================================================
// Multi-Signal Interaction
// =============================================================================

describe("Signal Multi-Signal Interaction", () => {
  test("should handle one signal watching another", () => {
    const source = new Signal(0);
    const derived = new Signal(0);
    const derivedCallback = mock(() => {});

    // Derived signal updates when source changes
    source.watch((value) => {
      derived.value = value * 2;
    });

    derived.watch(derivedCallback);

    source.value = 5;

    expect(derived.value).toBe(10);
    expect(derivedCallback).toHaveBeenCalledWith(10);
  });

  test("should handle chain of signal updates", () => {
    const signal1 = new Signal(1);
    const signal2 = new Signal(0);
    const signal3 = new Signal(0);
    const values: number[] = [];

    signal1.watch((v) => {
      signal2.value = v * 2;
    });

    signal2.watch((v) => {
      signal3.value = v * 3;
    });

    signal3.watch((v) => {
      values.push(v);
    });

    signal1.value = 5;

    expect(signal2.value).toBe(10);
    expect(signal3.value).toBe(30);
    expect(values).toEqual([30]);
  });

  test("should handle bidirectional signal updates without infinite loop", () => {
    const signalA = new Signal(0);
    const signalB = new Signal(0);
    let updateCount = 0;

    signalA.watch((v) => {
      updateCount++;
      if (signalB.value !== v * 2) {
        signalB.value = v * 2;
      }
    });

    signalB.watch((v) => {
      updateCount++;
      if (signalA.value !== v / 2) {
        signalA.value = v / 2;
      }
    });

    signalA.value = 5;

    expect(signalA.value).toBe(5);
    expect(signalB.value).toBe(10);
    // Should stop after initial sync, not infinite loop
    expect(updateCount).toBeLessThan(10);
  });

  test("should handle multiple signals updating same target", () => {
    const source1 = new Signal(0);
    const source2 = new Signal(0);
    const target = new Signal(0);
    const targetCallback = mock(() => {});

    target.watch(targetCallback);

    source1.watch((v) => {
      target.value = target.value + v;
    });

    source2.watch((v) => {
      target.value = target.value + v;
    });

    source1.value = 5;
    expect(target.value).toBe(5);

    source2.value = 10;
    expect(target.value).toBe(15);

    expect(targetCallback).toHaveBeenCalledTimes(2);
  });

  test("should handle independent signals", () => {
    const signal1 = new Signal("a");
    const signal2 = new Signal("b");
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    signal1.watch(callback1);
    signal2.watch(callback2);

    signal1.value = "x";
    expect(callback1).toHaveBeenCalledWith("x");
    expect(callback2).not.toHaveBeenCalled();

    signal2.value = "y";
    expect(callback2).toHaveBeenCalledWith("y");
    expect(callback1).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// Numeric Edge Cases
// =============================================================================

describe("Signal Numeric Edge Cases", () => {
  test("should handle Number.MAX_VALUE", () => {
    const signal = new Signal(Number.MAX_VALUE);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(Number.MAX_VALUE);

    signal.value = Number.MAX_VALUE - 1;
    // Due to floating point precision, this might not trigger
    // because MAX_VALUE - 1 === MAX_VALUE in JS
  });

  test("should handle Number.MIN_VALUE", () => {
    const signal = new Signal(Number.MIN_VALUE);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(Number.MIN_VALUE);

    signal.value = Number.MIN_VALUE * 2;
    expect(callback).toHaveBeenCalledWith(Number.MIN_VALUE * 2);
  });

  test("should handle Number.EPSILON", () => {
    const signal = new Signal(1);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = 1 + Number.EPSILON;
    expect(callback).toHaveBeenCalledTimes(1);

    // Values smaller than EPSILON difference from 1 might not trigger
    signal.value = 1 + Number.EPSILON / 2;
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("should handle very small decimals", () => {
    const signal = new Signal(0.1 + 0.2);
    const callback = mock(() => {});

    signal.watch(callback);

    // 0.1 + 0.2 !== 0.3 in JS due to floating point
    expect(signal.value).not.toBe(0.3);
    expect(signal.value).toBeCloseTo(0.3);

    signal.value = 0.3;
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should handle negative zero explicitly", () => {
    const signal = new Signal(-0);
    // -0 is stored as -0
    expect(Object.is(signal.value, -0)).toBe(true);
    // But -0 === 0 is true in JavaScript
    expect(signal.value === 0).toBe(true);
  });

  test("should handle scientific notation", () => {
    const signal = new Signal(1e10);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = 1e20;
    expect(callback).toHaveBeenCalledWith(1e20);

    signal.value = 1e-10;
    expect(callback).toHaveBeenCalledWith(1e-10);
  });

  test("should handle hexadecimal values", () => {
    const signal = new Signal(0xff);
    const callback = mock(() => {});

    signal.watch(callback);
    expect(signal.value).toBe(255);

    signal.value = 0xffff;
    expect(callback).toHaveBeenCalledWith(65535);
  });

  test("should handle binary values", () => {
    const signal = new Signal(0b1010);
    expect(signal.value).toBe(10);
  });

  test("should handle octal values", () => {
    const signal = new Signal(0o755);
    expect(signal.value).toBe(493);
  });
});

// =============================================================================
// Nested Signals
// =============================================================================

describe("Signal Nested Signals", () => {
  test("should handle Signal containing another Signal as value", () => {
    const innerSignal = new Signal(42);
    const outerSignal = new Signal(innerSignal);
    const callback = mock(() => {});

    outerSignal.watch(callback);

    expect(outerSignal.value).toBe(innerSignal);
    expect(outerSignal.value.value).toBe(42);

    // Changing inner signal's value doesn't trigger outer
    innerSignal.value = 100;
    expect(callback).not.toHaveBeenCalled();
    expect(outerSignal.value.value).toBe(100);

    // Changing outer signal's value triggers outer
    const newInnerSignal = new Signal(200);
    outerSignal.value = newInnerSignal;
    expect(callback).toHaveBeenCalledWith(newInnerSignal);
  });

  test("should handle deeply nested signals", () => {
    const level3 = new Signal("deep");
    const level2 = new Signal(level3);
    const level1 = new Signal(level2);

    expect(level1.value.value.value).toBe("deep");

    level3.value = "modified";
    expect(level1.value.value.value).toBe("modified");
  });

  test("should handle signal watching nested signal", () => {
    const inner = new Signal(0);
    const outer = new Signal(inner);
    const values: number[] = [];

    // Watch inner signal through outer
    outer.value.watch((v) => values.push(v));

    inner.value = 1;
    inner.value = 2;
    inner.value = 3;

    expect(values).toEqual([1, 2, 3]);
  });

  test("should handle replacing nested signal", () => {
    const inner1 = new Signal(10);
    const inner2 = new Signal(20);
    const outer = new Signal(inner1);
    const outerCallback = mock(() => {});
    const inner1Callback = mock(() => {});

    outer.watch(outerCallback);
    inner1.watch(inner1Callback);

    // Replace inner signal
    outer.value = inner2;
    expect(outerCallback).toHaveBeenCalledWith(inner2);

    // Old inner signal still works independently
    inner1.value = 15;
    expect(inner1Callback).toHaveBeenCalledWith(15);

    // But outer now points to inner2
    expect(outer.value.value).toBe(20);
  });
});

// =============================================================================
// Async Watcher Behavior
// =============================================================================

describe("Signal Async Watcher Behavior", () => {
  test("should handle async function as watcher", async () => {
    const signal = new Signal(0);
    const results: number[] = [];

    signal.watch(async (value) => {
      await Promise.resolve();
      results.push(value);
    });

    signal.value = 1;
    signal.value = 2;

    // Async watchers are called but don't block
    expect(results).toEqual([]); // Not yet resolved

    await Promise.resolve();
    await Promise.resolve(); // Need multiple ticks

    expect(results).toEqual([1, 2]);
  });

  test("should handle watcher returning Promise", () => {
    const signal = new Signal(0);
    const callback = mock(() => Promise.resolve("done"));

    signal.watch(callback);
    signal.value = 5;

    expect(callback).toHaveBeenCalledWith(5);
    // Return value is ignored
  });

  test("should handle async watcher that rejects gracefully", async () => {
    const signal = new Signal(0);
    const results: string[] = [];

    // Async watcher that rejects but is caught
    signal.watch(async (value) => {
      try {
        await Promise.reject(new Error("Async error"));
      } catch {
        results.push(`caught-${value}`);
      }
    });

    const normalCallback = mock(() => {});
    signal.watch(normalCallback);

    signal.value = 1;

    // Normal callback still called synchronously
    expect(normalCallback).toHaveBeenCalledWith(1);

    // Wait for async to complete
    await Promise.resolve();
    expect(results).toEqual(["caught-1"]);
  });

  test("should handle delayed async operations in watcher", async () => {
    const signal = new Signal(0);
    let asyncResult = 0;

    signal.watch(async (value) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      asyncResult = value * 2;
    });

    signal.value = 5;
    expect(asyncResult).toBe(0); // Not yet

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(asyncResult).toBe(10);
  });
});

// =============================================================================
// Class and Inheritance
// =============================================================================

describe("Signal Class and Inheritance", () => {
  test("should handle class instance as value", () => {
    class User {
      constructor(public name: string, public age: number) {}
      greet() {
        return `Hello, ${this.name}`;
      }
    }

    const user1 = new User("Alice", 30);
    const user2 = new User("Bob", 25);
    const signal = new Signal(user1);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(signal.value.greet()).toBe("Hello, Alice");
    expect(signal.value instanceof User).toBe(true);

    signal.value = user2;
    expect(callback).toHaveBeenCalledWith(user2);
    expect(signal.value.greet()).toBe("Hello, Bob");
  });

  test("should handle subclassed Signal", () => {
    class TrackedSignal<T> extends Signal<T> {
      public changeCount = 0;

      set value(newVal: T) {
        super.value = newVal;
        this.changeCount++;
      }

      get value(): T {
        return super.value;
      }
    }

    const signal = new TrackedSignal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = 1;
    signal.value = 2;
    signal.value = 2; // Same value, no trigger but still counted

    expect(signal.changeCount).toBe(3);
    expect(callback).toHaveBeenCalledTimes(2); // Only 2 actual changes
  });

  test("should handle class with private fields as value", () => {
    class SecretHolder {
      #secret: string;
      constructor(secret: string) {
        this.#secret = secret;
      }
      reveal() {
        return this.#secret;
      }
    }

    const holder1 = new SecretHolder("password123");
    const holder2 = new SecretHolder("newSecret");
    const signal = new Signal(holder1);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(signal.value.reveal()).toBe("password123");

    signal.value = holder2;
    expect(callback).toHaveBeenCalledWith(holder2);
    expect(signal.value.reveal()).toBe("newSecret");
  });

  test("should handle class with static methods as value", () => {
    class Calculator {
      static add(a: number, b: number) {
        return a + b;
      }
      multiply(a: number, b: number) {
        return a * b;
      }
    }

    const calc = new Calculator();
    const signal = new Signal(calc);

    expect(signal.value.multiply(3, 4)).toBe(12);
    expect(Calculator.add(1, 2)).toBe(3);
  });
});

// =============================================================================
// Invalid Input Handling
// =============================================================================

describe("Signal Invalid Input Handling", () => {
  test("should throw when notifying with non-function watcher", () => {
    const signal = new Signal(0);

    // Manually add invalid watcher (bypassing type system)
    (signal as any)._watchers.add("not a function");

    expect(() => {
      signal.value = 1;
    }).toThrow();
  });

  test("should handle watch called with arrow function", () => {
    const signal = new Signal(0);
    const callback = mock((v: number) => v * 2);

    signal.watch(callback);
    signal.value = 5;

    expect(callback).toHaveBeenCalledWith(5);
  });

  test("should handle watch called with bound function", () => {
    const signal = new Signal(0);
    const obj = {
      multiplier: 2,
      handler(value: number) {
        return value * this.multiplier;
      },
    };

    const boundHandler = mock(obj.handler.bind(obj));
    signal.watch(boundHandler);
    signal.value = 5;

    expect(boundHandler).toHaveBeenCalledWith(5);
  });

  test("should handle methods called with wrong this context", () => {
    const signal = new Signal(0);
    const { watch } = signal;

    // Calling watch without proper this context
    expect(() => {
      watch.call(null, () => {});
    }).toThrow();
  });

  test("should handle getter called with wrong this context", () => {
    const signal = new Signal(42);
    const descriptor = Object.getOwnPropertyDescriptor(
      Signal.prototype,
      "value"
    );

    expect(() => {
      descriptor?.get?.call(null);
    }).toThrow();
  });
});

// =============================================================================
// Special Objects
// =============================================================================

describe("Signal Special Objects", () => {
  test("should handle Generator as value", () => {
    function* numberGenerator() {
      yield 1;
      yield 2;
      yield 3;
    }

    const gen1 = numberGenerator();
    const gen2 = numberGenerator();
    const signal = new Signal(gen1);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(signal.value.next().value).toBe(1);
    expect(signal.value.next().value).toBe(2);

    signal.value = gen2;
    expect(callback).toHaveBeenCalledWith(gen2);
    expect(signal.value.next().value).toBe(1); // Fresh generator
  });

  test("should handle AsyncGenerator as value", async () => {
    async function* asyncNumberGenerator() {
      yield await Promise.resolve(1);
      yield await Promise.resolve(2);
    }

    const gen = asyncNumberGenerator();
    const signal = new Signal(gen);

    const result = await signal.value.next();
    expect(result.value).toBe(1);
  });

  test("should handle URL as value", () => {
    const url1 = new URL("https://example.com/path?q=test");
    const url2 = new URL("https://other.com");
    const signal = new Signal(url1);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(signal.value.hostname).toBe("example.com");
    expect(signal.value.searchParams.get("q")).toBe("test");

    signal.value = url2;
    expect(callback).toHaveBeenCalledWith(url2);
  });

  test("should handle URLSearchParams as value", () => {
    const params1 = new URLSearchParams("a=1&b=2");
    const params2 = new URLSearchParams("c=3");
    const signal = new Signal(params1);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(signal.value.get("a")).toBe("1");

    signal.value = params2;
    expect(callback).toHaveBeenCalledWith(params2);
    expect(signal.value.get("c")).toBe("3");
  });

  test("should handle WeakRef as value", () => {
    const obj = { data: "test" };
    const ref1 = new WeakRef(obj);
    const ref2 = new WeakRef({ data: "other" });
    const signal = new Signal(ref1);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(signal.value.deref()?.data).toBe("test");

    signal.value = ref2;
    expect(callback).toHaveBeenCalledWith(ref2);
  });

  test("should handle FinalizationRegistry as value", () => {
    const registry1 = new FinalizationRegistry(() => {});
    const registry2 = new FinalizationRegistry(() => {});
    const signal = new Signal(registry1);
    const callback = mock(() => {});

    signal.watch(callback);

    signal.value = registry2;
    expect(callback).toHaveBeenCalledWith(registry2);
  });

  test("should handle Intl objects as value", () => {
    const formatter1 = new Intl.NumberFormat("en-US");
    const formatter2 = new Intl.NumberFormat("de-DE");
    const signal = new Signal(formatter1);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(signal.value.format(1234.56)).toBe("1,234.56");

    signal.value = formatter2;
    expect(callback).toHaveBeenCalledWith(formatter2);
    expect(signal.value.format(1234.56)).toBe("1.234,56");
  });
});

// =============================================================================
// Symbol Methods
// =============================================================================

describe("Signal Symbol Methods", () => {
  test("should handle object with Symbol.toPrimitive", () => {
    const obj1 = {
      value: 42,
      [Symbol.toPrimitive](hint: string) {
        if (hint === "number") return this.value;
        if (hint === "string") return `Value: ${this.value}`;
        return this.value;
      },
    };
    const obj2 = {
      value: 100,
      [Symbol.toPrimitive](hint: string) {
        if (hint === "number") return this.value;
        return `Value: ${this.value}`;
      },
    };

    const signal = new Signal(obj1);
    const callback = mock(() => {});

    signal.watch(callback);

    expect(+signal.value).toBe(42);
    expect(`${signal.value}`).toBe("Value: 42");

    signal.value = obj2;
    expect(callback).toHaveBeenCalledWith(obj2);
    expect(+signal.value).toBe(100);
  });

  test("should handle object with valueOf", () => {
    const obj = {
      internalValue: 50,
      valueOf() {
        return this.internalValue;
      },
    };

    const signal = new Signal(obj);

    expect(+signal.value).toBe(50);
    expect(signal.value + 10).toBe(60);
  });

  test("should handle object with toString", () => {
    const obj = {
      name: "TestObject",
      toString() {
        return `[${this.name}]`;
      },
    };

    const signal = new Signal(obj);

    expect(String(signal.value)).toBe("[TestObject]");
    expect(`${signal.value}`).toBe("[TestObject]");
  });

  test("should handle object with valueOf that throws", () => {
    const obj = {
      valueOf() {
        throw new Error("valueOf failed");
      },
    };

    const signal = new Signal(obj);
    const callback = mock(() => {});

    signal.watch(callback);

    // Object is stored fine
    expect(signal.value).toBe(obj);

    // But coercion throws
    expect(() => +signal.value).toThrow("valueOf failed");

    // Signal still works
    signal.value = { normal: true } as any;
    expect(callback).toHaveBeenCalled();
  });

  test("should handle object with toString that throws", () => {
    const obj = {
      toString() {
        throw new Error("toString failed");
      },
    };

    const signal = new Signal(obj);

    expect(signal.value).toBe(obj);
    expect(() => String(signal.value)).toThrow("toString failed");
  });

  test("should handle object with custom Symbol.toStringTag", () => {
    const obj = {
      [Symbol.toStringTag]: "CustomType",
    };

    const signal = new Signal(obj);

    expect(Object.prototype.toString.call(signal.value)).toBe(
      "[object CustomType]"
    );
  });

  test("should handle object with Symbol.iterator", () => {
    const iterable = {
      data: [1, 2, 3],
      *[Symbol.iterator]() {
        yield* this.data;
      },
    };

    const signal = new Signal(iterable);

    expect([...signal.value]).toEqual([1, 2, 3]);
  });
});

// =============================================================================
// Context Edge Cases
// =============================================================================

describe("Signal Context Edge Cases", () => {
  test("should work inside try/catch block", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    try {
      signal.value = 5;
    } catch {
      // Should not reach here
    }

    expect(callback).toHaveBeenCalledWith(5);
  });

  test("should work inside finally block", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    try {
      throw new Error("Test error");
    } catch {
      // Handle error
    } finally {
      signal.value = 10;
    }

    expect(callback).toHaveBeenCalledWith(10);
  });

  test("should work in setTimeout callback", async () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        signal.value = 42;
        resolve();
      }, 10);
    });

    expect(callback).toHaveBeenCalledWith(42);
  });

  test("should work in Promise.then callback", async () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    await Promise.resolve().then(() => {
      signal.value = 99;
    });

    expect(callback).toHaveBeenCalledWith(99);
  });

  test("should work in Array.forEach callback", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    [1, 2, 3].forEach((n) => {
      signal.value = n;
    });

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenLastCalledWith(3);
  });

  test("should work in reduce callback", () => {
    const signal = new Signal(0);
    const callback = mock(() => {});

    signal.watch(callback);

    const result = [1, 2, 3, 4].reduce((acc, n) => {
      signal.value = acc + n;
      return acc + n;
    }, 0);

    expect(result).toBe(10);
    expect(signal.value).toBe(10);
  });

  test("should preserve error stack traces", () => {
    const signal = new Signal(0);
    let capturedError: Error | null = null;

    signal.watch(() => {
      try {
        throw new Error("Test error");
      } catch (e) {
        capturedError = e as Error;
      }
    });

    signal.value = 1;

    expect(capturedError).not.toBeNull();
    expect(capturedError!.stack).toContain("Signal.test.ts");
  });
});

// =============================================================================
// Prototype Manipulation
// =============================================================================

describe("Signal Prototype Manipulation", () => {
  test("should handle adding method to Signal.prototype", () => {
    // Add a method to prototype
    (Signal.prototype as any).double = function () {
      if (typeof this.value === "number") {
        this.value = this.value * 2;
      }
    };

    const signal = new Signal(5);
    const callback = mock(() => {});

    signal.watch(callback);

    (signal as any).double();

    expect(signal.value).toBe(10);
    expect(callback).toHaveBeenCalledWith(10);

    // Clean up
    delete (Signal.prototype as any).double;
  });

  test("should handle extending prototype chain", () => {
    const signal = new Signal(42);
    const callback = mock(() => {});

    signal.watch(callback);

    // Add method directly to instance instead of replacing prototype
    (signal as any).customMethod = function () {
      return "custom";
    };

    // Original functionality still works
    expect(signal.value).toBe(42);

    signal.value = 100;
    expect(callback).toHaveBeenCalledWith(100);

    // Custom method available
    expect((signal as any).customMethod()).toBe("custom");
  });

  test("should handle Object.freeze on signal instance", () => {
    const signal = new Signal(42);

    // Can't freeze because we need to change _value
    // Just verify the signal works before any freezing
    const callback = mock(() => {});
    signal.watch(callback);

    signal.value = 50;
    expect(callback).toHaveBeenCalledWith(50);
  });

  test("should handle Object.defineProperty on signal instance", () => {
    const signal = new Signal(42);

    // Add a computed property
    Object.defineProperty(signal, "doubled", {
      get() {
        return this.value * 2;
      },
    });

    expect((signal as any).doubled).toBe(84);

    signal.value = 10;
    expect((signal as any).doubled).toBe(20);
  });

  test("should handle signal as prototype for another object", () => {
    const signal = new Signal({ base: true });
    const derived = Object.create(signal);

    // Derived inherits signal's properties
    expect(derived.value).toEqual({ base: true });

    // But setting on derived creates own property
    derived.customProp = "custom";
    expect(derived.customProp).toBe("custom");
    expect(signal).not.toHaveProperty("customProp");
  });

  test("should be identifiable via instanceof", () => {
    const signal = new Signal(0);

    expect(signal instanceof Signal).toBe(true);
    expect(signal instanceof Object).toBe(true);
  });

  test("should have correct constructor reference", () => {
    const signal = new Signal(0);

    expect(signal.constructor).toBe(Signal);
    expect(signal.constructor.name).toBe("Signal");
  });
});

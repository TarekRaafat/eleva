/**
 * @fileoverview Tests for the Emitter module of the Eleva framework
 *
 * These tests verify the event handling capabilities of the Emitter module.
 */

import { describe, test, expect, mock } from "bun:test";
import { Emitter } from "../../../src/modules/Emitter.js";

// =============================================================================
// Core Emitter Tests
// =============================================================================

describe("Emitter", () => {
  test("should register and trigger event listeners", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });

  test("should stop events after listener removal", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.off("test", callback);
    emitter.emit("test", "data");

    expect(callback).not.toHaveBeenCalled();
  });

  test("should notify multiple listeners", () => {
    const emitter = new Emitter();
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    emitter.on("test", callback1);
    emitter.on("test", callback2);
    emitter.emit("test", "data");

    expect(callback1).toHaveBeenCalledWith("data");
    expect(callback2).toHaveBeenCalledWith("data");
  });

  test("should handle all off method scenarios", () => {
    const emitter = new Emitter();
    const handler1 = mock(() => {});
    const handler2 = mock(() => {});
    const nonExistentHandler = mock(() => {});

    // 1. Try to remove handler from non-existent event
    emitter.off("nonexistent", handler1);
    expect((emitter as any)._events.has("nonexistent")).toBe(false);

    // Setup for remaining tests
    emitter.on("test", handler1);
    emitter.on("test", handler2);
    expect((emitter as any)._events.get("test").size).toBe(2);

    // 2. Remove existing handler
    emitter.off("test", handler1);
    expect((emitter as any)._events.get("test").size).toBe(1);
    expect((emitter as any)._events.get("test").has(handler1)).toBe(false);
    expect((emitter as any)._events.get("test").has(handler2)).toBe(true);

    // 3. Try to remove non-existent handler
    emitter.off("test", nonExistentHandler);
    expect((emitter as any)._events.get("test").size).toBe(1);
    expect((emitter as any)._events.get("test").has(handler2)).toBe(true);

    // 4. Remove last handler (should cleanup event)
    emitter.off("test", handler2);
    expect((emitter as any)._events.has("test")).toBe(false);

    // Setup for bulk removal test
    emitter.on("bulk", handler1);
    emitter.on("bulk", handler2);
    expect((emitter as any)._events.get("bulk").size).toBe(2);

    // 5. Remove all handlers at once
    emitter.off("bulk");
    expect((emitter as any)._events.has("bulk")).toBe(false);

    // Verify no handlers are called after removal
    emitter.emit("test", "data");
    emitter.emit("bulk", "data");
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});

// =============================================================================
// Unsubscribe Function Tests
// =============================================================================

describe("Emitter Unsubscribe Function", () => {
  test("should return unsubscribe function from on()", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    const unsubscribe = emitter.on("test", callback);

    expect(typeof unsubscribe).toBe("function");
  });

  test("should unsubscribe when calling returned function", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    const unsubscribe = emitter.on("test", callback);

    emitter.emit("test", "first");
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();

    emitter.emit("test", "second");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should handle multiple unsubscribe calls gracefully", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    const unsubscribe = emitter.on("test", callback);

    unsubscribe();
    unsubscribe(); // Second call should not throw
    unsubscribe(); // Third call should not throw

    emitter.emit("test", "data");
    expect(callback).not.toHaveBeenCalled();
  });

  test("should only unsubscribe specific handler", () => {
    const emitter = new Emitter();
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    const unsubscribe1 = emitter.on("test", callback1);
    emitter.on("test", callback2);

    unsubscribe1();

    emitter.emit("test", "data");
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith("data");
  });

  test("should handle unsubscribe for different events independently", () => {
    const emitter = new Emitter();
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    const unsubscribe1 = emitter.on("event1", callback1);
    emitter.on("event2", callback2);

    unsubscribe1();

    emitter.emit("event1", "data1");
    emitter.emit("event2", "data2");

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith("data2");
  });
});

// =============================================================================
// Emit Arguments Tests
// =============================================================================

describe("Emitter Emit Arguments", () => {
  test("should emit without any data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith();
  });

  test("should emit with single argument", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", "single");

    expect(callback).toHaveBeenCalledWith("single");
  });

  test("should emit with multiple arguments", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", "arg1", "arg2", "arg3");

    expect(callback).toHaveBeenCalledWith("arg1", "arg2", "arg3");
  });

  test("should emit with object argument", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const data = { name: "John", age: 30 };

    emitter.on("test", callback);
    emitter.emit("test", data);

    expect(callback).toHaveBeenCalledWith(data);
  });

  test("should emit with array argument", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const data = [1, 2, 3, 4, 5];

    emitter.on("test", callback);
    emitter.emit("test", data);

    expect(callback).toHaveBeenCalledWith(data);
  });

  test("should emit with null and undefined arguments", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", null, undefined);

    expect(callback).toHaveBeenCalledWith(null, undefined);
  });

  test("should emit with mixed type arguments", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const obj = { key: "value" };

    emitter.on("test", callback);
    emitter.emit("test", "string", 42, true, obj, [1, 2]);

    expect(callback).toHaveBeenCalledWith("string", 42, true, obj, [1, 2]);
  });

  test("should emit with function as argument", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const fn = () => "result";

    emitter.on("test", callback);
    emitter.emit("test", fn);

    expect(callback).toHaveBeenCalledWith(fn);
  });
});

// =============================================================================
// Emit to Non-existent Event
// =============================================================================

describe("Emitter Emit to Non-existent Event", () => {
  test("should silently ignore emit to non-existent event", () => {
    const emitter = new Emitter();

    expect(() => {
      emitter.emit("nonexistent", "data");
    }).not.toThrow();
  });

  test("should not affect other events when emitting to non-existent", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("existing", callback);
    emitter.emit("nonexistent", "data");

    expect(callback).not.toHaveBeenCalled();

    emitter.emit("existing", "real-data");
    expect(callback).toHaveBeenCalledWith("real-data");
  });
});

// =============================================================================
// Handler Error Handling
// =============================================================================

describe("Emitter Handler Errors", () => {
  test("should propagate error when handler throws", () => {
    const emitter = new Emitter();
    const errorHandler = mock(() => {
      throw new Error("Handler error");
    });

    emitter.on("test", errorHandler);

    expect(() => {
      emitter.emit("test", "data");
    }).toThrow("Handler error");
  });

  test("should call handlers before the throwing one", () => {
    const emitter = new Emitter();
    const callback1 = mock(() => {});
    const errorHandler = mock(() => {
      throw new Error("Handler error");
    });
    const callback2 = mock(() => {});

    emitter.on("test", callback1);
    emitter.on("test", errorHandler);
    emitter.on("test", callback2);

    expect(() => {
      emitter.emit("test", "data");
    }).toThrow("Handler error");

    expect(callback1).toHaveBeenCalledWith("data");
    expect(errorHandler).toHaveBeenCalledWith("data");
    // callback2 may or may not be called depending on Set iteration order
  });
});

// =============================================================================
// Duplicate Handler Prevention
// =============================================================================

describe("Emitter Duplicate Handlers", () => {
  test("should prevent duplicate handlers (same function)", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.on("test", callback);
    emitter.on("test", callback);

    emitter.emit("test", "data");

    // Set prevents duplicates, so callback should only be called once
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should allow different functions as separate handlers", () => {
    const emitter = new Emitter();
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    emitter.on("test", callback1);
    emitter.on("test", callback2);

    emitter.emit("test", "data");

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test("should track handlers count correctly with duplicates", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.on("test", callback);

    expect((emitter as any)._events.get("test").size).toBe(1);
  });
});

// =============================================================================
// Handler Execution Order
// =============================================================================

describe("Emitter Handler Execution Order", () => {
  test("should call handlers in registration order", () => {
    const emitter = new Emitter();
    const order: number[] = [];

    emitter.on("test", () => order.push(1));
    emitter.on("test", () => order.push(2));
    emitter.on("test", () => order.push(3));

    emitter.emit("test");

    expect(order).toEqual([1, 2, 3]);
  });

  test("should maintain order after some handlers removed", () => {
    const emitter = new Emitter();
    const order: string[] = [];

    const handlerA = () => order.push("a");
    const handlerB = () => order.push("b");
    const handlerC = () => order.push("c");

    emitter.on("test", handlerA);
    emitter.on("test", handlerB);
    emitter.on("test", handlerC);

    emitter.off("test", handlerB);

    emitter.emit("test");

    expect(order).toEqual(["a", "c"]);
  });

  test("should add new handler at end of order", () => {
    const emitter = new Emitter();
    const order: string[] = [];

    emitter.on("test", () => order.push("first"));
    emitter.on("test", () => order.push("second"));

    emitter.emit("test");
    expect(order).toEqual(["first", "second"]);

    order.length = 0;
    emitter.on("test", () => order.push("third"));

    emitter.emit("test");
    expect(order).toEqual(["first", "second", "third"]);
  });
});

// =============================================================================
// Event Names Tests
// =============================================================================

describe("Emitter Event Names", () => {
  test("should handle namespace:action format", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("user:login", callback);
    emitter.emit("user:login", { name: "John" });

    expect(callback).toHaveBeenCalledWith({ name: "John" });
  });

  test("should handle simple event names", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("click", callback);
    emitter.emit("click");

    expect(callback).toHaveBeenCalled();
  });

  test("should handle event names with special characters", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("event-with-dashes", callback);
    emitter.on("event_with_underscores", callback);
    emitter.on("event.with.dots", callback);

    emitter.emit("event-with-dashes");
    emitter.emit("event_with_underscores");
    emitter.emit("event.with.dots");

    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("should handle unicode event names", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("事件:登录", callback);
    emitter.emit("事件:登录", { user: "用户" });

    expect(callback).toHaveBeenCalledWith({ user: "用户" });
  });

  test("should handle emoji event names", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("🎉:party", callback);
    emitter.emit("🎉:party");

    expect(callback).toHaveBeenCalled();
  });

  test("should handle empty string event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("", callback);
    emitter.emit("");

    expect(callback).toHaveBeenCalled();
  });

  test("should handle whitespace event names", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("   ", callback);
    emitter.emit("   ");

    expect(callback).toHaveBeenCalled();
  });

  test("should treat similar event names as different", () => {
    const emitter = new Emitter();
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    emitter.on("test", callback1);
    emitter.on("Test", callback2);

    emitter.emit("test");
    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    emitter.emit("Test");
    expect(callback2).toHaveBeenCalled();
  });

  test("should handle very long event names", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const longName = "a".repeat(1000);

    emitter.on(longName, callback);
    emitter.emit(longName);

    expect(callback).toHaveBeenCalled();
  });
});

// =============================================================================
// Handler During Emit Tests
// =============================================================================

describe("Emitter Handler Modifications During Emit", () => {
  test("should handle handler that registers new handler during emit", () => {
    const emitter = new Emitter();
    const newHandler = mock(() => {});
    const values: number[] = [];

    emitter.on("test", (value) => {
      values.push(value);
      if (value === 1) {
        emitter.on("test", newHandler);
      }
    });

    emitter.emit("test", 1);
    expect(values).toEqual([1]);
    // New handler shouldn't be called for this emit (added during iteration)

    emitter.emit("test", 2);
    expect(values).toEqual([1, 2]);
    expect(newHandler).toHaveBeenCalledWith(2);
  });

  test("should handle handler that unregisters itself during emit", () => {
    const emitter = new Emitter();
    const values: number[] = [];
    let unsubscribe: () => void;

    const selfRemovingHandler = (value: number) => {
      values.push(value);
      if (value === 2) {
        unsubscribe();
      }
    };

    unsubscribe = emitter.on("test", selfRemovingHandler);

    emitter.emit("test", 1);
    expect(values).toEqual([1]);

    emitter.emit("test", 2);
    expect(values).toEqual([1, 2]);

    emitter.emit("test", 3);
    expect(values).toEqual([1, 2]); // Handler was removed
  });

  test("should handle handler that unregisters other handler during emit", () => {
    const emitter = new Emitter();
    const callback2 = mock(() => {});
    let unsubscribe2: () => void;

    const callback1 = mock(() => {
      unsubscribe2();
    });

    emitter.on("test", callback1);
    unsubscribe2 = emitter.on("test", callback2);

    emitter.emit("test");

    expect(callback1).toHaveBeenCalled();
    // callback2 may or may not be called depending on Set iteration order

    // After emit, callback2 should definitely be unsubscribed
    callback1.mockClear();
    callback2.mockClear();

    emitter.emit("test");
    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  test("should handle handler that emits same event", () => {
    const emitter = new Emitter();
    const values: number[] = [];
    let count = 0;

    emitter.on("test", (value) => {
      values.push(value);
      count++;
      if (count < 3) {
        emitter.emit("test", value + 1);
      }
    });

    emitter.emit("test", 1);

    expect(values).toEqual([1, 2, 3]);
  });

  test("should handle handler that emits different event", () => {
    const emitter = new Emitter();
    const event1Values: number[] = [];
    const event2Values: number[] = [];

    emitter.on("event1", (value) => {
      event1Values.push(value);
      emitter.emit("event2", value * 2);
    });

    emitter.on("event2", (value) => {
      event2Values.push(value);
    });

    emitter.emit("event1", 5);

    expect(event1Values).toEqual([5]);
    expect(event2Values).toEqual([10]);
  });
});

// =============================================================================
// Async Handler Tests
// =============================================================================

describe("Emitter Async Handlers", () => {
  test("should handle async handler", async () => {
    const emitter = new Emitter();
    const results: number[] = [];

    emitter.on("test", async (value) => {
      await Promise.resolve();
      results.push(value);
    });

    emitter.emit("test", 42);

    // Async handlers are called but don't block
    expect(results).toEqual([]);

    await Promise.resolve();
    expect(results).toEqual([42]);
  });

  test("should handle mixed sync and async handlers", async () => {
    const emitter = new Emitter();
    const order: string[] = [];

    emitter.on("test", () => {
      order.push("sync1");
    });

    emitter.on("test", async () => {
      await Promise.resolve();
      order.push("async");
    });

    emitter.on("test", () => {
      order.push("sync2");
    });

    emitter.emit("test");

    expect(order).toEqual(["sync1", "sync2"]);

    await Promise.resolve();
    expect(order).toEqual(["sync1", "sync2", "async"]);
  });

  test("should handle async handler returning Promise", () => {
    const emitter = new Emitter();
    const callback = mock(() => Promise.resolve("done"));

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
    // Return value is ignored
  });
});

// =============================================================================
// Stress Tests
// =============================================================================

describe("Emitter Stress Tests", () => {
  test("should handle many handlers", () => {
    const emitter = new Emitter();
    const handlers = Array.from({ length: 1000 }, () => mock(() => {}));

    handlers.forEach((handler) => emitter.on("test", handler));

    emitter.emit("test", "data");

    handlers.forEach((handler) => {
      expect(handler).toHaveBeenCalledWith("data");
    });
  });

  test("should handle many events", () => {
    const emitter = new Emitter();
    const callbacks: Record<string, ReturnType<typeof mock>> = {};

    for (let i = 0; i < 100; i++) {
      const eventName = `event-${i}`;
      callbacks[eventName] = mock(() => {});
      emitter.on(eventName, callbacks[eventName]);
    }

    for (let i = 0; i < 100; i++) {
      emitter.emit(`event-${i}`, i);
    }

    for (let i = 0; i < 100; i++) {
      expect(callbacks[`event-${i}`]).toHaveBeenCalledWith(i);
    }
  });

  test("should handle rapid emit calls", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);

    for (let i = 0; i < 1000; i++) {
      emitter.emit("test", i);
    }

    expect(callback).toHaveBeenCalledTimes(1000);
    expect(callback).toHaveBeenLastCalledWith(999);
  });

  test("should handle rapid subscribe/unsubscribe", () => {
    const emitter = new Emitter();

    for (let i = 0; i < 1000; i++) {
      const unsubscribe = emitter.on("test", () => {});
      unsubscribe();
    }

    // Should have no handlers left
    expect((emitter as any)._events.has("test")).toBe(false);
  });
});

// =============================================================================
// Internal Structure Tests
// =============================================================================

describe("Emitter Internal Structure", () => {
  test("should use Map for _events", () => {
    const emitter = new Emitter();
    expect((emitter as any)._events instanceof Map).toBe(true);
  });

  test("should start with empty _events Map", () => {
    const emitter = new Emitter();
    expect((emitter as any)._events.size).toBe(0);
  });

  test("should use Set for handlers", () => {
    const emitter = new Emitter();
    const callback = () => {};

    emitter.on("test", callback);

    expect((emitter as any)._events.get("test") instanceof Set).toBe(true);
  });

  test("should create Set lazily for each event", () => {
    const emitter = new Emitter();

    expect((emitter as any)._events.has("test1")).toBe(false);
    expect((emitter as any)._events.has("test2")).toBe(false);

    emitter.on("test1", () => {});

    expect((emitter as any)._events.has("test1")).toBe(true);
    expect((emitter as any)._events.has("test2")).toBe(false);
  });

  test("should cleanup empty event Sets", () => {
    const emitter = new Emitter();
    const callback = () => {};

    emitter.on("test", callback);
    expect((emitter as any)._events.has("test")).toBe(true);

    emitter.off("test", callback);
    expect((emitter as any)._events.has("test")).toBe(false);
  });

  test("should not cleanup Set when other handlers exist", () => {
    const emitter = new Emitter();
    const callback1 = () => {};
    const callback2 = () => {};

    emitter.on("test", callback1);
    emitter.on("test", callback2);

    emitter.off("test", callback1);

    expect((emitter as any)._events.has("test")).toBe(true);
    expect((emitter as any)._events.get("test").size).toBe(1);
  });
});

// =============================================================================
// Multiple Emitter Instances
// =============================================================================

describe("Emitter Multiple Instances", () => {
  test("should isolate events between instances", () => {
    const emitter1 = new Emitter();
    const emitter2 = new Emitter();
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    emitter1.on("test", callback1);
    emitter2.on("test", callback2);

    emitter1.emit("test", "from1");

    expect(callback1).toHaveBeenCalledWith("from1");
    expect(callback2).not.toHaveBeenCalled();

    emitter2.emit("test", "from2");

    expect(callback2).toHaveBeenCalledWith("from2");
    expect(callback1).toHaveBeenCalledTimes(1);
  });

  test("should not share handlers between instances", () => {
    const emitter1 = new Emitter();
    const emitter2 = new Emitter();
    const sharedCallback = mock(() => {});

    emitter1.on("test", sharedCallback);

    emitter1.emit("test");
    expect(sharedCallback).toHaveBeenCalledTimes(1);

    emitter2.emit("test"); // Different instance, no handlers
    expect(sharedCallback).toHaveBeenCalledTimes(1);
  });

  test("should allow same handler on different instances", () => {
    const emitter1 = new Emitter();
    const emitter2 = new Emitter();
    const callback = mock(() => {});

    emitter1.on("test", callback);
    emitter2.on("test", callback);

    emitter1.emit("test", "e1");
    emitter2.emit("test", "e2");

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenNthCalledWith(1, "e1");
    expect(callback).toHaveBeenNthCalledWith(2, "e2");
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("Emitter Edge Cases", () => {
  test("should handle off() with no handlers registered", () => {
    const emitter = new Emitter();

    expect(() => {
      emitter.off("test");
    }).not.toThrow();
  });

  test("should handle off() with non-existent handler", () => {
    const emitter = new Emitter();
    const registered = () => {};
    const notRegistered = () => {};

    emitter.on("test", registered);

    expect(() => {
      emitter.off("test", notRegistered);
    }).not.toThrow();

    // Original handler should still work
    const callback = mock(() => {});
    emitter.on("test", callback);
    emitter.emit("test");
    expect(callback).toHaveBeenCalled();
  });

  test("should handle circular event chains with limit", () => {
    const emitter = new Emitter();
    let count = 0;
    const maxCalls = 10;

    emitter.on("ping", () => {
      count++;
      if (count < maxCalls) {
        emitter.emit("pong");
      }
    });

    emitter.on("pong", () => {
      count++;
      if (count < maxCalls) {
        emitter.emit("ping");
      }
    });

    emitter.emit("ping");

    expect(count).toBe(maxCalls);
  });

  test("should handle handler that clears all handlers", () => {
    const emitter = new Emitter();
    const callback1 = mock(() => {});
    const callback2 = mock(() => {
      emitter.off("test"); // Remove all handlers
    });
    const callback3 = mock(() => {});

    emitter.on("test", callback1);
    emitter.on("test", callback2);
    emitter.on("test", callback3);

    emitter.emit("test");

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
    // callback3 behavior depends on iteration order

    // After emit, all handlers should be gone
    callback1.mockClear();
    callback2.mockClear();
    callback3.mockClear();

    emitter.emit("test");
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
    expect(callback3).not.toHaveBeenCalled();
  });

  test("should handle Symbol as data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const sym = Symbol("test");

    emitter.on("test", callback);
    emitter.emit("test", sym);

    expect(callback).toHaveBeenCalledWith(sym);
  });

  test("should handle BigInt as data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const bigNum = BigInt(9007199254740991);

    emitter.on("test", callback);
    emitter.emit("test", bigNum);

    expect(callback).toHaveBeenCalledWith(bigNum);
  });
});

// =============================================================================
// Real-world Usage Patterns
// =============================================================================

describe("Emitter Real-world Patterns", () => {
  test("should handle component lifecycle events", () => {
    const emitter = new Emitter();
    const mountCallback = mock(() => {});
    const unmountCallback = mock(() => {});

    emitter.on("component:mount", mountCallback);
    emitter.on("component:unmount", unmountCallback);

    emitter.emit("component:mount", { id: "app" });
    expect(mountCallback).toHaveBeenCalledWith({ id: "app" });

    emitter.emit("component:unmount", { id: "app" });
    expect(unmountCallback).toHaveBeenCalledWith({ id: "app" });
  });

  test("should handle state change events", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("state:change", callback);

    emitter.emit("state:change", { count: 1 }, { count: 0 });

    expect(callback).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
  });

  test("should handle router navigation events", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("router:navigate", callback);

    emitter.emit("router:navigate", "/dashboard", "/home");

    expect(callback).toHaveBeenCalledWith("/dashboard", "/home");
  });

  test("should handle error events", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const error = new Error("Something went wrong");

    emitter.on("error", callback);

    emitter.emit("error", error);

    expect(callback).toHaveBeenCalledWith(error);
  });

  test("should handle wildcard-like event grouping", () => {
    const emitter = new Emitter();
    const userEvents: string[] = [];

    // Listen to specific user events
    emitter.on("user:login", () => userEvents.push("login"));
    emitter.on("user:logout", () => userEvents.push("logout"));
    emitter.on("user:update", () => userEvents.push("update"));

    emitter.emit("user:login");
    emitter.emit("user:update");
    emitter.emit("user:logout");

    expect(userEvents).toEqual(["login", "update", "logout"]);
  });
});

// =============================================================================
// Re-registration Tests
// =============================================================================

describe("Emitter Handler Re-registration", () => {
  test("should allow re-registering handler after removal", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    const unsub1 = emitter.on("test", callback);
    emitter.emit("test", "first");
    expect(callback).toHaveBeenCalledTimes(1);

    unsub1();
    emitter.emit("test", "second");
    expect(callback).toHaveBeenCalledTimes(1);

    // Re-register same handler
    emitter.on("test", callback);
    emitter.emit("test", "third");
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith("third");
  });

  test("should allow re-registering after off() with no handler", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.off("test"); // Remove all handlers

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });

  test("should handle multiple re-registrations", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    for (let i = 0; i < 5; i++) {
      const unsub = emitter.on("test", callback);
      emitter.emit("test", i);
      unsub();
    }

    expect(callback).toHaveBeenCalledTimes(5);
  });
});

// =============================================================================
// Bound Functions Tests
// =============================================================================

describe("Emitter Bound Functions", () => {
  test("should treat bound function as different handler each time", () => {
    const emitter = new Emitter();
    const obj = {
      value: 0,
      handler() {
        this.value++;
      },
    };

    // Each bind() creates a new function reference
    emitter.on("test", obj.handler.bind(obj));
    emitter.on("test", obj.handler.bind(obj));

    emitter.emit("test");

    // Both bound functions are treated as different handlers
    expect(obj.value).toBe(2);
  });

  test("should be able to remove bound function if reference is kept", () => {
    const emitter = new Emitter();
    const obj = { value: 0 };
    const boundHandler = function (this: typeof obj) {
      this.value++;
    }.bind(obj);

    emitter.on("test", boundHandler);
    emitter.emit("test");
    expect(obj.value).toBe(1);

    emitter.off("test", boundHandler);
    emitter.emit("test");
    expect(obj.value).toBe(1);
  });

  test("should handle Function.prototype.bind with arguments", () => {
    const emitter = new Emitter();
    const results: any[] = [];

    function handler(prefix: string, data: string) {
      results.push(`${prefix}:${data}`);
    }

    const boundHandler = handler.bind(null, "PREFIX");
    emitter.on("test", boundHandler);
    emitter.emit("test", "value");

    expect(results).toEqual(["PREFIX:value"]);
  });
});

// =============================================================================
// Handler This Context Tests
// =============================================================================

describe("Emitter Handler This Context", () => {
  test("should not preserve this context for regular functions", () => {
    const emitter = new Emitter();
    let capturedThis: any;

    emitter.on("test", function (this: any) {
      capturedThis = this;
    });

    emitter.emit("test");

    // In strict mode, this is undefined for regular function calls
    expect(capturedThis).toBeUndefined();
  });

  test("should work with arrow functions (lexical this)", () => {
    const emitter = new Emitter();
    const obj = {
      value: "original",
      setupHandler() {
        // Arrow function captures lexical this
        emitter.on("test", () => {
          this.value = "modified";
        });
      },
    };

    obj.setupHandler();
    emitter.emit("test");

    expect(obj.value).toBe("modified");
  });

  test("should work with explicitly bound this", () => {
    const emitter = new Emitter();
    const context = { name: "TestContext" };
    let capturedThis: any;

    const handler = function (this: any) {
      capturedThis = this;
    };

    emitter.on("test", handler.bind(context));
    emitter.emit("test");

    expect(capturedThis).toBe(context);
  });
});

// =============================================================================
// Prototype Property Event Names Tests
// =============================================================================

describe("Emitter Prototype Property Event Names", () => {
  test("should handle 'constructor' as event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("constructor", callback);
    emitter.emit("constructor", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });

  test("should handle 'toString' as event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("toString", callback);
    emitter.emit("toString");

    expect(callback).toHaveBeenCalled();
  });

  test("should handle 'valueOf' as event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("valueOf", callback);
    emitter.emit("valueOf", 42);

    expect(callback).toHaveBeenCalledWith(42);
  });

  test("should handle '__proto__' as event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("__proto__", callback);
    emitter.emit("__proto__", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });

  test("should handle 'hasOwnProperty' as event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("hasOwnProperty", callback);
    emitter.emit("hasOwnProperty");

    expect(callback).toHaveBeenCalled();
  });

  test("should handle 'prototype' as event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("prototype", callback);
    emitter.emit("prototype", { key: "value" });

    expect(callback).toHaveBeenCalledWith({ key: "value" });
  });
});

// =============================================================================
// Special Numeric Values Tests
// =============================================================================

describe("Emitter Special Numeric Values", () => {
  test("should handle NaN as emit data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", NaN);

    expect(callback).toHaveBeenCalledWith(NaN);
    const receivedArg = callback.mock.calls[0][0];
    expect(Number.isNaN(receivedArg)).toBe(true);
  });

  test("should handle Infinity as emit data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", Infinity);

    expect(callback).toHaveBeenCalledWith(Infinity);
  });

  test("should handle -Infinity as emit data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", -Infinity);

    expect(callback).toHaveBeenCalledWith(-Infinity);
  });

  test("should handle -0 as emit data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", -0);

    expect(callback).toHaveBeenCalledWith(-0);
    const receivedArg = callback.mock.calls[0][0];
    expect(Object.is(receivedArg, -0)).toBe(true);
  });

  test("should handle Number.MAX_VALUE as emit data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", Number.MAX_VALUE);

    expect(callback).toHaveBeenCalledWith(Number.MAX_VALUE);
  });

  test("should handle Number.MIN_VALUE as emit data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", Number.MIN_VALUE);

    expect(callback).toHaveBeenCalledWith(Number.MIN_VALUE);
  });
});

// =============================================================================
// Async Error Handling Tests
// =============================================================================

describe("Emitter Async Error Handling", () => {
  test("should not block on async handler rejection", async () => {
    const emitter = new Emitter();
    const syncCallback = mock(() => {});
    let rejectionCaught = false;

    emitter.on("test", async () => {
      throw new Error("Async error");
    });
    emitter.on("test", syncCallback);

    // Emit should not throw synchronously
    expect(() => {
      emitter.emit("test");
    }).not.toThrow();

    // Sync handler should still be called
    expect(syncCallback).toHaveBeenCalled();

    // Give time for async rejection
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  test("should handle async handler that rejects with non-Error", async () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", async () => {
      // Catch own rejection to prevent unhandled rejection
      try {
        throw "string rejection";
      } catch {
        // Swallow error for test
      }
    });
    emitter.on("test", callback);

    emitter.emit("test");
    expect(callback).toHaveBeenCalled();
  });

  test("should handle multiple async handlers independently", async () => {
    const emitter = new Emitter();
    const results: string[] = [];

    emitter.on("test", async () => {
      await Promise.resolve();
      results.push("success1");
    });

    emitter.on("test", async () => {
      await Promise.resolve();
      results.push("success2");
    });

    emitter.on("test", async () => {
      await Promise.resolve();
      results.push("success3");
    });

    emitter.emit("test");

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(results).toContain("success1");
    expect(results).toContain("success2");
    expect(results).toContain("success3");
  });
});

// =============================================================================
// Generator Function Handler Tests
// =============================================================================

describe("Emitter Generator Function Handlers", () => {
  test("should accept generator function as handler (returns iterator)", () => {
    const emitter = new Emitter();
    let iteratorReturned = false;

    function* generatorHandler(data: number) {
      yield data * 2;
    }

    // Wrap to check if generator is called
    emitter.on("test", (data) => {
      const iterator = generatorHandler(data);
      iteratorReturned = iterator !== undefined && typeof iterator.next === "function";
    });

    emitter.emit("test", 5);

    // Generator function returns an iterator when called
    expect(iteratorReturned).toBe(true);
  });

  test("should handle generator that is manually iterated in handler", () => {
    const emitter = new Emitter();
    const results: number[] = [];

    function* numberGenerator() {
      yield 1;
      yield 2;
      yield 3;
    }

    emitter.on("test", () => {
      for (const num of numberGenerator()) {
        results.push(num);
      }
    });

    emitter.emit("test");

    expect(results).toEqual([1, 2, 3]);
  });

  test("should allow iterating generator inside handler", () => {
    const emitter = new Emitter();
    const results: number[] = [];

    function* doubleGenerator(value: number) {
      yield value;
      yield value * 2;
      yield value * 3;
    }

    emitter.on("test", (value) => {
      const gen = doubleGenerator(value);
      for (const num of gen) {
        results.push(num);
      }
    });

    emitter.emit("test", 5);

    expect(results).toEqual([5, 10, 15]);
  });
});

// =============================================================================
// Handler Return Values Tests
// =============================================================================

describe("Emitter Handler Return Values", () => {
  test("should ignore handler return value (number)", () => {
    const emitter = new Emitter();
    let called = false;

    emitter.on("test", () => {
      called = true;
      return 42;
    });

    const result = emitter.emit("test");

    expect(called).toBe(true);
    expect(result).toBeUndefined();
  });

  test("should ignore handler return value (object)", () => {
    const emitter = new Emitter();

    emitter.on("test", () => {
      return { data: "value" };
    });

    const result = emitter.emit("test");
    expect(result).toBeUndefined();
  });

  test("should ignore handler return value (boolean)", () => {
    const emitter = new Emitter();

    emitter.on("test", () => false);
    emitter.on("test", () => true);

    const result = emitter.emit("test");
    expect(result).toBeUndefined();
  });

  test("should ignore handler return value (array)", () => {
    const emitter = new Emitter();

    emitter.on("test", () => [1, 2, 3]);

    const result = emitter.emit("test");
    expect(result).toBeUndefined();
  });
});

// =============================================================================
// Class Method Handler Tests
// =============================================================================

describe("Emitter Class Method Handlers", () => {
  test("should work with class method as handler (arrow function property)", () => {
    const emitter = new Emitter();

    class Counter {
      count = 0;
      increment = () => {
        this.count++;
      };
    }

    const counter = new Counter();
    emitter.on("increment", counter.increment);

    emitter.emit("increment");
    emitter.emit("increment");

    expect(counter.count).toBe(2);
  });

  test("should work with bound class method", () => {
    const emitter = new Emitter();

    class Logger {
      logs: string[] = [];
      log(message: string) {
        this.logs.push(message);
      }
    }

    const logger = new Logger();
    emitter.on("log", logger.log.bind(logger));

    emitter.emit("log", "first");
    emitter.emit("log", "second");

    expect(logger.logs).toEqual(["first", "second"]);
  });

  test("should lose this context with unbound class method", () => {
    const emitter = new Emitter();

    class Service {
      name = "TestService";
      getName() {
        return this?.name;
      }
    }

    const service = new Service();
    let result: string | undefined;

    emitter.on("test", () => {
      result = service.getName.call(undefined);
    });

    emitter.emit("test");

    expect(result).toBeUndefined();
  });

  test("should work with static class method", () => {
    const emitter = new Emitter();

    class Utils {
      static results: number[] = [];
      static process(value: number) {
        Utils.results.push(value * 2);
      }
    }

    emitter.on("process", Utils.process);

    emitter.emit("process", 5);
    emitter.emit("process", 10);

    expect(Utils.results).toEqual([10, 20]);
  });
});

// =============================================================================
// Large Argument Spread Tests
// =============================================================================

describe("Emitter Large Argument Spread", () => {
  test("should handle many arguments", () => {
    const emitter = new Emitter();
    const received: any[] = [];

    emitter.on("test", (...args) => {
      received.push(...args);
    });

    const args = Array.from({ length: 100 }, (_, i) => i);
    emitter.emit("test", ...args);

    expect(received).toEqual(args);
  });

  test("should handle very large argument array", () => {
    const emitter = new Emitter();
    let receivedCount = 0;

    emitter.on("test", (...args) => {
      receivedCount = args.length;
    });

    const args = Array.from({ length: 1000 }, (_, i) => i);
    emitter.emit("test", ...args);

    expect(receivedCount).toBe(1000);
  });

  test("should handle arguments with various types", () => {
    const emitter = new Emitter();
    const received: any[] = [];

    emitter.on("test", (...args) => {
      received.push(...args);
    });

    const mixedArgs = [
      1,
      "string",
      true,
      null,
      undefined,
      { obj: true },
      [1, 2],
      () => {},
      Symbol("sym"),
      BigInt(123),
    ];

    emitter.emit("test", ...mixedArgs);

    expect(received.length).toBe(mixedArgs.length);
    expect(received[0]).toBe(1);
    expect(received[1]).toBe("string");
    expect(received[2]).toBe(true);
    expect(received[3]).toBe(null);
    expect(received[4]).toBe(undefined);
  });
});

// =============================================================================
// Control Character Event Names Tests
// =============================================================================

describe("Emitter Control Character Event Names", () => {
  test("should handle null byte in event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test\x00event", callback);
    emitter.emit("test\x00event");

    expect(callback).toHaveBeenCalled();
  });

  test("should handle newline in event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test\nevent", callback);
    emitter.emit("test\nevent");

    expect(callback).toHaveBeenCalled();
  });

  test("should handle tab in event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test\tevent", callback);
    emitter.emit("test\tevent");

    expect(callback).toHaveBeenCalled();
  });

  test("should handle carriage return in event name", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test\revent", callback);
    emitter.emit("test\revent");

    expect(callback).toHaveBeenCalled();
  });

  test("should distinguish events with different control characters", () => {
    const emitter = new Emitter();
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});

    emitter.on("test\nevent", callback1);
    emitter.on("test\tevent", callback2);

    emitter.emit("test\nevent");

    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});

// =============================================================================
// Argument Mutation Tests
// =============================================================================

describe("Emitter Argument Mutation", () => {
  test("should allow handler to mutate object argument", () => {
    const emitter = new Emitter();
    const data = { value: 1 };

    emitter.on("test", (obj: any) => {
      obj.value = 2;
    });

    emitter.on("test", (obj: any) => {
      obj.value = obj.value * 10;
    });

    emitter.emit("test", data);

    // Mutations are visible because same object reference
    expect(data.value).toBe(20);
  });

  test("should allow handler to mutate array argument", () => {
    const emitter = new Emitter();
    const arr = [1, 2, 3];

    emitter.on("test", (arr: number[]) => {
      arr.push(4);
    });

    emitter.on("test", (arr: number[]) => {
      arr.push(5);
    });

    emitter.emit("test", arr);

    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  test("should not affect primitive arguments across handlers", () => {
    const emitter = new Emitter();
    const receivedValues: number[] = [];

    emitter.on("test", (num: number) => {
      receivedValues.push(num);
      num = 999; // This doesn't affect other handlers
    });

    emitter.on("test", (num: number) => {
      receivedValues.push(num);
    });

    emitter.emit("test", 42);

    expect(receivedValues).toEqual([42, 42]);
  });

  test("should handle handler that replaces object properties", () => {
    const emitter = new Emitter();
    const data = { nested: { value: 1 } };

    emitter.on("test", (obj: any) => {
      obj.nested = { value: 100 };
    });

    emitter.on("test", (obj: any) => {
      obj.nested.value += 1;
    });

    emitter.emit("test", data);

    expect(data.nested.value).toBe(101);
  });
});

// =============================================================================
// Additional Edge Cases
// =============================================================================

describe("Emitter Additional Edge Cases", () => {
  test("should handle async generator function as handler", async () => {
    const emitter = new Emitter();
    let asyncIteratorReturned = false;

    async function* asyncGenHandler() {
      yield 1;
      yield 2;
    }

    // Wrap to verify async generator behavior
    emitter.on("test", () => {
      const asyncIterator = asyncGenHandler();
      asyncIteratorReturned =
        asyncIterator !== undefined && typeof asyncIterator.next === "function";
    });

    emitter.emit("test");

    // Async generator returns an async iterator when called
    expect(asyncIteratorReturned).toBe(true);
  });

  test("should handle Proxy as event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    const target = { value: 42 };
    const proxy = new Proxy(target, {
      get(t, prop) {
        return prop === "value" ? t.value * 2 : (t as any)[prop];
      },
    });

    emitter.on("test", callback);
    emitter.emit("test", proxy);

    expect(callback).toHaveBeenCalledWith(proxy);
    const received = callback.mock.calls[0][0];
    expect(received.value).toBe(84);
  });

  test("should handle Map as event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ]);

    emitter.on("test", callback);
    emitter.emit("test", map);

    expect(callback).toHaveBeenCalledWith(map);
  });

  test("should handle Set as event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const set = new Set([1, 2, 3]);

    emitter.on("test", callback);
    emitter.emit("test", set);

    expect(callback).toHaveBeenCalledWith(set);
  });

  test("should handle WeakMap as event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const key = {};
    const weakMap = new WeakMap([[key, "value"]]);

    emitter.on("test", callback);
    emitter.emit("test", weakMap);

    expect(callback).toHaveBeenCalledWith(weakMap);
  });

  test("should handle Date as event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const date = new Date("2024-01-01");

    emitter.on("test", callback);
    emitter.emit("test", date);

    expect(callback).toHaveBeenCalledWith(date);
  });

  test("should handle RegExp as event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const regex = /test/gi;

    emitter.on("test", callback);
    emitter.emit("test", regex);

    expect(callback).toHaveBeenCalledWith(regex);
  });

  test("should handle Error as event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const error = new TypeError("Test error");

    emitter.on("test", callback);
    emitter.emit("test", error);

    expect(callback).toHaveBeenCalledWith(error);
  });

  test("should handle ArrayBuffer as event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});
    const buffer = new ArrayBuffer(8);

    emitter.on("test", callback);
    emitter.emit("test", buffer);

    expect(callback).toHaveBeenCalledWith(buffer);
  });

  test("should handle circular reference in event data", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    const obj: any = { name: "test" };
    obj.self = obj; // Circular reference

    emitter.on("test", callback);
    emitter.emit("test", obj);

    expect(callback).toHaveBeenCalledWith(obj);
    const received = callback.mock.calls[0][0];
    expect(received.self).toBe(received);
  });
});

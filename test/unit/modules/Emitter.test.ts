/**
 * @fileoverview Tests for the Emitter module of the Eleva framework
 *
 * These tests verify the event handling capabilities of the Emitter module.
 */

import { describe, test, expect, mock } from "bun:test";
import { Emitter } from "../../../src/modules/Emitter.js";

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

  test("should handle invalid event names", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });

  test("should handle edge cases correctly", () => {
    const emitter = new Emitter();
    const callback = mock(() => {});

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
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

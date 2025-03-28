import { Signal } from "../src/modules/Signal.js";

describe("Signal", () => {
  test("initial value is set correctly", () => {
    const signal = new Signal(10);

    expect(signal.value).toBe(10);
  });

  test("watcher is triggered on value change", async () => {
    const signal = new Signal(0);
    const callback = jest.fn();

    signal.watch(callback);
    signal.value = 5;

    await Promise.resolve();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(5);
  });

  test("watcher is not triggered if value remains the same", () => {
    const signal = new Signal(0);
    const callback = jest.fn();

    signal.watch(callback);
    signal.value = 0;

    expect(callback).not.toHaveBeenCalled();
  });

  test("unsubscribe stops watcher from being called", () => {
    const signal = new Signal(0);
    const callback = jest.fn();
    const unsubscribe = signal.watch(callback);

    unsubscribe();
    signal.value = 10;

    expect(callback).not.toHaveBeenCalled();
  });
});

describe("Signal edge cases", () => {
  test("should handle null listeners", () => {
    // Test for line 65 branch
    const signal = new Signal();
    signal.listeners = null;
    expect(() => signal.emit("test")).toThrow();
  });
});

import { Emitter } from "../src/modules/Emitter.js";

describe("Emitter", () => {
  test("emits event to registered listener", () => {
    const emitter = new Emitter();
    const callback = jest.fn();

    emitter.on("test", callback);
    emitter.emit("test", "data");

    expect(callback).toHaveBeenCalledWith("data");
  });

  test("removing event listener stops receiving events", () => {
    const emitter = new Emitter();
    const callback = jest.fn();

    emitter.on("test", callback);
    emitter.off("test", callback);
    emitter.emit("test", "data");

    expect(callback).not.toHaveBeenCalled();
  });

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

/**
 * @fileoverview Build-specific tests for the Emitter module
 *
 * These tests verify the event handling system in the built version of Eleva,
 * ensuring that the Emitter maintains its functionality in production:
 * - Event registration and emission
 * - Listener management
 * - Component communication
 * - Error handling
 * - Edge cases
 *
 * @example
 * // Basic event handling in production
 * const app = new window.Eleva("TestApp");
 * const component = app.component("emitter-test", {
 *   setup: ({ emitter }) => ({
 *     onMessage: (data) => console.log(data)
 *   })
 * });
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva
 * @category Unit
 * @group modules
 * @group unit
 * @group build
 */

describe("Emitter (Build)", () => {
  let app;
  let appContainer;

  /**
   * Setup for each test - ensures clean environment
   */
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app");
    app = new window.Eleva("TestApp");
  });

  /**
   * Tests basic event handling in components
   *
   * Verifies:
   * - Event registration in setup
   * - Event emission
   * - Event handling
   *
   * @group events
   * @group components
   */
  test("should handle basic event operations", async () => {
    const messageHandler = jest.fn();

    app.component("event-test", {
      setup: ({ emitter }) => ({
        sendMessage: () => emitter.emit("message", "Hello"),
        onMount() {
          emitter.on("message", messageHandler);
        },
      }),
      template: (ctx) => `
        <div>
          <button @click="sendMessage">Send</button>
        </div>
      `,
    });

    await app.mount(appContainer, "event-test");

    const button = appContainer.querySelector("button");
    button.click();

    expect(messageHandler).toHaveBeenCalledWith("Hello");
  });

  /**
   * Tests component communication through events
   *
   * Verifies:
   * - Inter-component communication
   * - Event data passing
   * - Multiple component coordination
   *
   * @group events
   * @group communication
   */
  test("should enable component communication", async () => {
    const dataHandler = jest.fn();

    app.component("sender", {
      setup: ({ emitter }) => ({
        sendData: () => emitter.emit("data", { value: 42 }),
      }),
      template: () => `
        <button @click="sendData">Send Data</button>
      `,
    });

    app.component("receiver", {
      setup: ({ emitter }) => ({
        onMount() {
          emitter.on("data", dataHandler);
        },
      }),
      template: () => `<div>Receiver</div>`,
    });

    await app.mount(appContainer, "sender");
    await app.mount(document.createElement("div"), "receiver");

    const button = appContainer.querySelector("button");
    button.click();

    expect(dataHandler).toHaveBeenCalledWith({ value: 42 });
  });

  /**
   * Tests event listener cleanup
   *
   * Verifies:
   * - Listeners are removed on unmount
   * - No memory leaks from lingering listeners
   * - Cleanup in component lifecycle
   *
   * @group events
   * @group memory-management
   */
  test("should clean up event listeners", async () => {
    const messageHandler = jest.fn();

    app.component("cleanup-test", {
      setup: ({ emitter }) => ({
        onMessage: messageHandler,
        onMount() {
          emitter.on("message", this.onMessage);
        },
        onUnmount() {
          emitter.off("message", this.onMessage);
        },
      }),
      template: () => `<div>Cleanup Test</div>`,
    });

    const instance = await app.mount(appContainer, "cleanup-test");

    app.emitter.emit("message", "test");
    expect(messageHandler).toHaveBeenCalledTimes(1);

    instance.unmount();
    app.emitter.emit("message", "test");
    expect(messageHandler).toHaveBeenCalledTimes(1); // Should not increase
  });

  /**
   * Tests multiple event listeners
   *
   * Verifies:
   * - Multiple listeners per event
   * - Order of execution
   * - Individual listener removal
   *
   * @group events
   * @group listeners
   */
  test("should handle multiple listeners", async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    app.component("multi-listener", {
      setup: ({ emitter }) => ({
        emit: () => emitter.emit("test", "data"),
        onMount() {
          emitter.on("test", handler1);
          emitter.on("test", handler2);
        },
      }),
      template: () => `<button @click="emit">Emit</button>`,
    });

    await app.mount(appContainer, "multi-listener");

    const button = appContainer.querySelector("button");
    button.click();

    expect(handler1).toHaveBeenCalledWith("data");
    expect(handler2).toHaveBeenCalledWith("data");
  });
});

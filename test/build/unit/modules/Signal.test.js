/**
 * @fileoverview Build-specific tests for the Signal module
 *
 * These tests verify the reactivity system in the built version of Eleva,
 * ensuring that the Signal class maintains its functionality in production:
 * - Value initialization and updates
 * - Change detection
 * - Watcher registration and execution
 * - Error handling
 * - Edge cases
 *
 * @example
 * // Basic signal usage in production
 * const app = new window.Eleva("TestApp");
 * const component = app.component("signal-test", {
 *   setup: ({ signal }) => ({
 *     count: signal(0)
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

describe("Signal (Build)", () => {
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
   * Tests basic signal functionality in components
   *
   * Verifies:
   * - Signal creation in setup
   * - Value updates
   * - Template reactivity
   *
   * @group reactivity
   * @group components
   */
  test("should handle basic signal operations", async () => {
    app.component("signal-test", {
      setup: ({ signal }) => {
        const count = signal(0);

        return {
          count,
          increment: function () {
            count.value++;
          },
        };
      },
      template: (ctx) => `
        <div>
          <span id="count">${ctx.count.value}</span>
          <button @click="increment">Increment</button>
        </div>
      `,
    });

    await app.mount(appContainer, "signal-test");

    const countSpan = appContainer.querySelector("#count");
    const button = appContainer.querySelector("button");

    expect(countSpan.textContent).toBe("0");

    button.click();
    await Promise.resolve(); // Wait for update
    expect(countSpan.textContent).toBe("1");
  });

  /**
   * Tests signal batch updates
   *
   * Verifies:
   * - Multiple updates are batched
   * - Template only updates once
   * - Final value is correct
   *
   * @group reactivity
   * @group optimization
   */
  test("should handle batch updates correctly", async () => {
    const updateCallback = jest.fn();

    app.component("batch-test", {
      setup: ({ signal }) => {
        const count = signal(0);
        count.watch(updateCallback);

        return {
          count,
          batchUpdate: function () {
            for (let i = 0; i < 3; i++) {
              count.value++;
            }
          },
        };
      },
      template: (ctx) => `
        <div>
          <span id="count">${ctx.count.value}</span>
          <button @click="batchUpdate">Update</button>
        </div>
      `,
    });

    await app.mount(appContainer, "batch-test");

    const button = appContainer.querySelector("button");
    button.click();

    await Promise.resolve(); // Wait for updates
    expect(updateCallback).toHaveBeenCalledTimes(1);
    expect(appContainer.querySelector("#count").textContent).toBe("3");
  });

  /**
   * Tests signal with complex objects
   *
   * Verifies:
   * - Complex object handling
   * - Nested property updates
   * - Template updates with objects
   *
   * @group reactivity
   * @group state-management
   */
  test("should handle complex objects", async () => {
    app.component("object-test", {
      setup: ({ signal }) => {
        const user = signal({ name: "John", age: 30 });

        return {
          user,
          updateUser: function () {
            user.value = { ...user.value, age: 31 };
          },
        };
      },
      template: (ctx) => `
        <div>
          <span id="user">${ctx.user.value.name} (${ctx.user.value.age})</span>
          <button @click="updateUser">Update Age</button>
        </div>
      `,
    });

    await app.mount(appContainer, "object-test");

    const userSpan = appContainer.querySelector("#user");
    const button = appContainer.querySelector("button");

    expect(userSpan.textContent).toBe("John (30)");

    button.click();
    await Promise.resolve();
    expect(userSpan.textContent).toBe("John (31)");
  });

  /**
   * Tests multiple signal watchers
   *
   * Verifies:
   * - Multiple watchers can be registered
   * - All watchers receive updates
   * - Watchers can be removed
   *
   * @group reactivity
   * @group events
   */
  test("should handle multiple watchers", async () => {
    const watcher1 = jest.fn();
    const watcher2 = jest.fn();

    app.component("watcher-test", {
      setup: ({ signal }) => {
        const count = signal(0);
        count.watch(watcher1);
        const unsubscribe = count.watch(watcher2);

        return {
          count,
          increment: function () {
            count.value++;
          },
          unsubscribeWatcher2: unsubscribe,
        };
      },
      template: (ctx) => `
        <div>
          <span id="count">${ctx.count.value}</span>
          <button id="increment" @click="increment">Increment</button>
          <button id="unsubscribe" @click="unsubscribeWatcher2">Unsubscribe</button>
        </div>
      `,
    });

    await app.mount(appContainer, "watcher-test");

    const incrementBtn = appContainer.querySelector("#increment");
    const unsubscribeBtn = appContainer.querySelector("#unsubscribe");

    incrementBtn.click();
    await Promise.resolve();

    expect(watcher1).toHaveBeenCalledTimes(1);
    expect(watcher2).toHaveBeenCalledTimes(1);

    unsubscribeBtn.click();
    incrementBtn.click();
    await Promise.resolve();

    expect(watcher1).toHaveBeenCalledTimes(2);
    expect(watcher2).toHaveBeenCalledTimes(1);
  });
});

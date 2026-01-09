/**
 * @fileoverview Integration tests for the Eleva.js minified production bundle
 *
 * These tests verify that the minified/mangled version of Eleva.js works correctly.
 * They test the dist/eleva.umd.min.js file to ensure aggressive minification doesn't
 * break any functionality.
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @category Integration
 * @group bundle-minified
 */

import { describe, test, expect, beforeEach, mock } from "bun:test";
import Eleva from "../../dist/eleva.umd.min.js";

describe("Eleva.js Minified Bundle Integration", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  describe("Core Framework", () => {
    test("instantiates correctly", () => {
      expect(Eleva).toBeDefined();
      expect(typeof Eleva).toBe("function");
      expect(app.name).toBe("TestApp");
    });

    test("registers and mounts components", async () => {
      app.component("test-component", {
        template: () => "<div>Hello World</div>",
      });

      await app.mount(container, "test-component");
      expect(container.innerHTML).toContain("Hello World");
    });

    test("handles component lifecycle", async () => {
      const onBeforeMount = mock(() => {});
      const onMount = mock(() => {});
      const onUnmount = mock(() => {});

      app.component("lifecycle-test", {
        setup: () => ({
          onBeforeMount,
          onMount,
          onUnmount,
        }),
        template: () => "<div>Lifecycle Test</div>",
      });

      const instance = await app.mount(container, "lifecycle-test");

      expect(onBeforeMount).toHaveBeenCalled();
      expect(onMount).toHaveBeenCalled();

      await instance.unmount();
      expect(onUnmount).toHaveBeenCalled();
      expect(container.innerHTML).not.toContain("Lifecycle Test");
    });
  });

  describe("Signal Reactivity", () => {
    test("creates and updates signals", async () => {
      app.component("signal-test", {
        setup: ({ signal }: any) => {
          const count = signal(0);
          return {
            count,
            increment: () => count.value++,
          };
        },
        template: (ctx: any) => `
          <div>
            <span id="count">${ctx.count.value}</span>
            <button @click="increment">+</button>
          </div>
        `,
      });

      await app.mount(container, "signal-test");

      const countEl = container.querySelector("#count")!;
      const button = container.querySelector("button")!;

      expect(countEl.textContent).toBe("0");

      button.click();
      await new Promise((r) => setTimeout(r, 50));
      expect(countEl.textContent).toBe("1");
    });

    test("watches signal changes", async () => {
      const watcher = mock(() => {});

      app.component("watcher-test", {
        setup: ({ signal }: any) => {
          const value = signal(0);
          value.watch(watcher);
          return {
            value,
            update: () => (value.value = 42),
          };
        },
        template: (ctx: any) => `
          <button @click="update">Update</button>
        `,
      });

      await app.mount(container, "watcher-test");

      const button = container.querySelector("button")!;
      button.click();
      await new Promise((r) => setTimeout(r, 50));

      expect(watcher).toHaveBeenCalled();
    });
  });

  describe("Event Emitter", () => {
    test("emits and receives events", async () => {
      const handler = mock(() => {});

      app.component("emitter-test", {
        setup: ({ emitter }: any) => ({
          send: () => emitter.emit("message", "Hello"),
          onMount() {
            emitter.on("message", handler);
          },
        }),
        template: () => `<button @click="send">Send</button>`,
      });

      await app.mount(container, "emitter-test");

      const button = container.querySelector("button")!;
      button.click();

      expect(handler).toHaveBeenCalledWith("Hello");
    });
  });

  describe("Template Rendering", () => {
    test("renders dynamic content", async () => {
      app.component("dynamic-test", {
        setup: ({ signal }: any) => ({
          name: signal("World"),
          greeting: signal("Hello"),
        }),
        template: (ctx: any) => `
          <div id="msg">${ctx.greeting.value} ${ctx.name.value}!</div>
        `,
      });

      await app.mount(container, "dynamic-test");
      expect(container.querySelector("#msg")!.textContent!.trim()).toBe("Hello World!");
    });

    test("renders lists", async () => {
      app.component("list-test", {
        setup: ({ signal }: any) => ({
          items: signal(["A", "B", "C"]),
        }),
        template: (ctx: any) => `
          <ul>
            ${ctx.items.value.map((item: string) => `<li>${item}</li>`).join("")}
          </ul>
        `,
      });

      await app.mount(container, "list-test");
      expect(container.querySelectorAll("li").length).toBe(3);
    });

    test("handles conditional rendering", async () => {
      app.component("conditional-test", {
        setup: ({ signal }: any) => {
          const show = signal(false);
          return {
            show,
            toggle: () => (show.value = !show.value),
          };
        },
        template: (ctx: any) => `
          <div>
            ${ctx.show.value ? '<span id="content">Visible</span>' : ""}
            <button @click="toggle">Toggle</button>
          </div>
        `,
      });

      await app.mount(container, "conditional-test");
      expect(container.querySelector("#content")).toBeNull();

      container.querySelector("button")!.click();
      await new Promise((r) => setTimeout(r, 50));
      expect(container.querySelector("#content")).not.toBeNull();
    });
  });

  describe("Event Handling", () => {
    test("binds click events", async () => {
      const handler = mock(() => {});

      app.component("click-test", {
        setup: () => ({ handleClick: handler }),
        template: () => `<button @click="handleClick">Click</button>`,
      });

      await app.mount(container, "click-test");

      container.querySelector("button")!.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Plugin System", () => {
    test("installs and uses plugins", async () => {
      const pluginFn = mock(() => {});

      app.use({
        install: (appInstance: any) => {
          appInstance.customMethod = pluginFn;
        },
      });

      app.component("plugin-test", {
        setup: () => ({
          callPlugin: () => app.customMethod(),
        }),
        template: () => `<button @click="callPlugin">Call</button>`,
      });

      await app.mount(container, "plugin-test");

      container.querySelector("button")!.click();
      expect(pluginFn).toHaveBeenCalled();
    });
  });

  describe("Nested Components", () => {
    test("renders child components", async () => {
      const ChildComponent = {
        setup: ({ signal }: any) => {
          const count = signal(0);
          return {
            count,
            increment: () => count.value++,
          };
        },
        template: (ctx: any) => `
          <div class="child">
            <span id="child-count">${ctx.count.value}</span>
            <button @click="increment">+</button>
          </div>
        `,
      };

      app.component("parent", {
        template: () => `<div class="parent"><child></child></div>`,
        children: { child: ChildComponent },
      });

      await app.mount(container, "parent");

      expect(container.querySelector(".child")).not.toBeNull();
      expect(container.querySelector("#child-count")!.textContent).toBe("0");

      container.querySelector("button")!.click();
      await new Promise((r) => setTimeout(r, 50));
      expect(container.querySelector("#child-count")!.textContent).toBe("1");
    });
  });
});

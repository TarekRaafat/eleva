/**
 * @fileoverview TypeScript smoke tests for Eleva.js type definitions
 *
 * These tests verify that TypeScript types are correctly exported and usable.
 * They test both the core framework types and plugin types to ensure
 * the build process produces valid type definitions.
 *
 * Tests cover:
 * - Default export typing
 * - Named exports (Signal, Emitter, Renderer, TemplateEngine)
 * - Plugin type exports
 * - Component definition types
 * - Setup context types
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @category Integration
 * @group types
 */

import { describe, test, expect } from "bun:test";
import Eleva, { Signal, Emitter, Renderer, TemplateEngine } from "../../dist/eleva.js";
import { Attr, Router, Store } from "../../dist/eleva-plugins.js";

describe("TypeScript Type Definitions", () => {
  describe("Core Named Exports", () => {
    test("Eleva default export is a constructor", () => {
      expect(Eleva).toBeDefined();
      expect(typeof Eleva).toBe("function");
      const app = new Eleva("TypeTest");
      expect(app.name).toBe("TypeTest");
    });

    test("Signal is exported and functional", () => {
      expect(Signal).toBeDefined();
      expect(typeof Signal).toBe("function");

      const sig = new Signal(42);
      expect(sig.value).toBe(42);

      sig.value = 100;
      expect(sig.value).toBe(100);
    });

    test("Signal.watch works correctly", () => {
      const sig = new Signal<string>("initial");
      let watchedValue = "";

      const unwatch = sig.watch((newVal) => {
        watchedValue = newVal;
      });

      sig.value = "updated";
      expect(watchedValue).toBe("updated");

      // Cleanup
      if (typeof unwatch === "function") {
        unwatch();
      }
    });

    test("Emitter is exported and functional", () => {
      expect(Emitter).toBeDefined();
      expect(typeof Emitter).toBe("function");

      const emitter = new Emitter();
      let received = "";

      emitter.on("test", (data) => {
        received = data as string;
      });

      emitter.emit("test", "hello");
      expect(received).toBe("hello");
    });

    test("Renderer is exported and functional", () => {
      expect(Renderer).toBeDefined();
      expect(typeof Renderer).toBe("function");

      const renderer = new Renderer();
      expect(renderer).toBeDefined();
      expect(typeof renderer.patchDOM).toBe("function");
    });

    test("TemplateEngine is exported and functional", () => {
      expect(TemplateEngine).toBeDefined();
      expect(typeof TemplateEngine).toBe("function");
      expect(typeof TemplateEngine.evaluate).toBe("function");
    });
  });

  describe("Plugin Exports", () => {
    test("Attr plugin is exported", () => {
      expect(Attr).toBeDefined();
      expect(typeof Attr).toBe("object");
      expect(Attr.name).toBe("attr");
      expect(typeof Attr.install).toBe("function");
    });

    test("Router plugin is exported", () => {
      expect(Router).toBeDefined();
      expect(typeof Router).toBe("object");
      expect(Router.name).toBe("router");
      expect(typeof Router.install).toBe("function");
    });

    test("Store plugin is exported", () => {
      expect(Store).toBeDefined();
      expect(typeof Store).toBe("object");
      expect(Store.name).toBe("store");
      expect(typeof Store.install).toBe("function");
    });
  });

  describe("Component Definition Types", () => {
    test("component accepts valid definition", async () => {
      const app = new Eleva("ComponentTypeTest");
      document.body.innerHTML = `<div id="type-test"></div>`;
      const container = document.getElementById("type-test")!;

      // This tests that TypeScript accepts these shapes
      app.component("typed-component", {
        setup: ({ signal, emitter, props }) => {
          const count = signal(0);
          return {
            count,
            increment: () => count.value++,
          };
        },
        template: (ctx: any) => `<div>${ctx.count.value}</div>`,
      });

      const instance = await app.mount(container, "typed-component");
      expect(container.innerHTML).toContain("0");
      await instance.unmount();
    });

    test("component accepts minimal definition", async () => {
      const app = new Eleva("MinimalTypeTest");
      document.body.innerHTML = `<div id="minimal-test"></div>`;
      const container = document.getElementById("minimal-test")!;

      // Minimal component - just template
      app.component("minimal-component", {
        template: () => `<span>Minimal</span>`,
      });

      const instance = await app.mount(container, "minimal-component");
      expect(container.innerHTML).toContain("Minimal");
      await instance.unmount();
    });

    test("component accepts style property", async () => {
      const app = new Eleva("StyleTypeTest");
      document.body.innerHTML = `<div id="style-test"></div>`;
      const container = document.getElementById("style-test")!;

      app.component("styled-component", {
        template: () => `<div class="styled">Styled</div>`,
        style: `.styled { color: red; }`,
      });

      const instance = await app.mount(container, "styled-component");
      expect(container.innerHTML).toContain("Styled");
      await instance.unmount();
    });

    test("component accepts children mapping", async () => {
      const app = new Eleva("ChildrenTypeTest");
      document.body.innerHTML = `<div id="children-test"></div>`;
      const container = document.getElementById("children-test")!;

      const ChildDef = {
        template: () => `<span>Child</span>`,
      };

      app.component("parent-component", {
        template: () => `<div><child-comp></child-comp></div>`,
        children: { "child-comp": ChildDef },
      });

      const instance = await app.mount(container, "parent-component");
      expect(container.innerHTML).toContain("Child");
      await instance.unmount();
    });
  });

  describe("Plugin Installation Types", () => {
    test("app.use accepts Attr plugin", () => {
      const app = new Eleva("AttrPluginTest");
      expect(() => {
        app.use(Attr, { enableAria: true });
      }).not.toThrow();
    });

    test("app.use accepts Store plugin", () => {
      const app = new Eleva("StorePluginTest");
      expect(() => {
        app.use(Store, {
          state: { count: 0 },
          actions: {
            increment: (state: any) => state.count.value++,
          },
        });
      }).not.toThrow();
    });
  });
});

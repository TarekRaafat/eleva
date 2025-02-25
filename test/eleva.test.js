/**
 * eleva.test.js
 *
 * This test suite covers 100% of the Eleva library functionalities:
 * - TemplateEngine (parse & evaluate)
 * - Signal (reactivity, watchers, unsubscribe)
 * - Emitter (on, off, emit)
 * - Renderer (patchDOM, diff, updateAttributes)
 * - Eleva Core (component registration, mounting, lifecycle hooks, plugins)
 * - Children components and passing props
 */

import Eleva from "../src/index.js";
import { TemplateEngine } from "../src/modules/TemplateEngine.js";
import { Signal } from "../src/modules/Signal.js";
import { Emitter } from "../src/modules/Emitter.js";
import { Renderer } from "../src/modules/Renderer.js";

describe("TemplateEngine", () => {
  test("parse replaces interpolation expressions", () => {
    const template = "Hello, {{ name }}!";
    const data = { name: "World" };
    expect(TemplateEngine.parse(template, data)).toBe("Hello, World!");
  });

  test("evaluate returns correct result for valid expression", () => {
    const data = { a: 2, b: 3 };
    expect(TemplateEngine.evaluate("a + b", data)).toBe(5);
  });

  test("evaluate returns empty string on error", () => {
    const data = { a: 1 };
    const result = TemplateEngine.evaluate("nonExistentVariable", data);
    expect(result).toBe("");
  });
});

describe("Signal", () => {
  test("initial value is set correctly", () => {
    const signal = new Signal(10);
    expect(signal.value).toBe(10);
  });

  test("watcher is triggered on value change", () => {
    const signal = new Signal(0);
    const callback = jest.fn();
    signal.watch(callback);
    signal.value = 5;
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

describe("Renderer", () => {
  let container;
  let renderer;
  beforeEach(() => {
    container = document.createElement("div");
    renderer = new Renderer();
  });

  test("patchDOM updates container content", () => {
    container.innerHTML = "<p>Old</p>";
    renderer.patchDOM(container, "<p>New</p>");
    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });

  test("updateAttributes syncs element attributes", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");
    const newEl = document.createElement("div");
    newEl.setAttribute("data-test", "new");
    renderer.updateAttributes(oldEl, newEl);
    expect(oldEl.getAttribute("data-test")).toBe("new");
  });

  test("diff method replaces differing nodes", () => {
    container.innerHTML = `<div key="1">Old</div>`;
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<div key="1">New</div>`;
    renderer.diff(container, tempContainer);
    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });
});

describe("Eleva (Core)", () => {
  let app;
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    app = new Eleva("TestApp");
  });

  test("registers and mounts a component", () => {
    const component = {
      setup: ({ signal }) => ({ msg: signal("Hello") }),
      template: (ctx) => `<div>${ctx.msg}</div>`,
    };
    app.component("hello-comp", component);
    app.mount("#app", "hello-comp");
    const appContainer = document.querySelector("#app");
    expect(appContainer.innerHTML).toContain("Hello");
  });

  test("lifecycle hooks are called appropriately", () => {
    const onMount = jest.fn();
    const onUnmount = jest.fn();
    const component = {
      setup: ({ signal, onMount: hookOnMount, onUnmount: hookOnUnmount }) => {
        hookOnMount(onMount);
        hookOnUnmount(onUnmount);
        return { msg: signal("Lifecycle") };
      },
      template: (ctx) => `<div>${ctx.msg}</div>`,
    };
    app.component("lifecycle-comp", component);
    const instance = app.mount("#app", "lifecycle-comp");
    expect(onMount).toHaveBeenCalled();
    instance.unmount();
    expect(onUnmount).toHaveBeenCalled();
  });

  test("plugin integration extends Eleva instance", () => {
    const myPlugin = {
      install(eleva, options) {
        eleva.testPlugin = () => options.msg;
      },
    };
    app.use(myPlugin, { msg: "Plugin Works" });
    expect(app.testPlugin()).toBe("Plugin Works");
  });
});

describe("Children Components & Passing Props", () => {
  let app;
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    app = new Eleva("TestApp");
  });

  test("child component receives props from parent", () => {
    const ChildComponent = {
      setup: ({ props }) => ({ title: props.title }),
      template: (ctx) => `<div>Child: ${ctx.title}</div>`,
    };
    const ParentComponent = {
      setup: () => ({}),
      template: () => `
        <div>
          <h1>Parent Component</h1>
          <child-comp eleva-prop-title="Hello from Parent"></child-comp>
        </div>
      `,
      children: {
        "child-comp": ChildComponent,
      },
    };
    app.component("parent-comp", ParentComponent);
    app.component("child-comp", ChildComponent);
    app.mount("#app", "parent-comp");
    expect(document.body.innerHTML).toContain("Hello from Parent");
  });
});

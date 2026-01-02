/**
 * @fileoverview Tests for the Eleva core framework functionality
 *
 * These tests verify the core behavior of the Eleva framework, including:
 * - Component registration and mounting
 * - Component lifecycle management (mount, unmount)
 * - Event handling and cleanup
 * - Style injection and reactivity
 * - Error conditions and validation
 * - Parent-child component relationships
 * - Props passing between components
 * - Plugin system integration
 */

import { describe, test, expect, beforeEach, mock } from "bun:test";
import Eleva from "../../../src/index.js";

/**
 * Tests for the core functionality of the Eleva framework
 */
describe("Eleva", () => {
  let app: any;
  let appContainer: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should register and mount a component", async () => {
    const component = {
      setup: ({ signal }: any) => ({ msg: signal("Hello") }),
      template: (ctx: any) => `<div>${ctx.msg.value}</div>`,
    };
    app.component("hello-comp", component);

    const instance = await app.mount(appContainer, "hello-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Hello");
  });

  test("should call lifecycle hooks in the correct order", async () => {
    const onBeforeMountFn = mock(() => {});
    const onMountFn = mock(() => {});
    const onUnmountFn = mock(() => {});

    const component = {
      setup: ({ signal }: any) => {
        return {
          msg: signal("Lifecycle"),
          onBeforeMount() {
            onBeforeMountFn();
          },
          onMount() {
            onMountFn();
          },
          onUnmount() {
            onUnmountFn();
          },
        };
      },
      template: (ctx: any) => `<div>${ctx.msg.value}</div>`,
    };
    app.component("lifecycle-comp", component);

    const instance = await app.mount(appContainer, "lifecycle-comp");

    expect(instance).toBeTruthy();
    expect(onBeforeMountFn).toHaveBeenCalled();
    expect(onMountFn).toHaveBeenCalled();
    expect(appContainer.innerHTML).toContain("Lifecycle");

    await instance.unmount();

    expect(appContainer.innerHTML).not.toContain("Lifecycle");
    expect(onUnmountFn).toHaveBeenCalled();
  });

  test("should call update lifecycle hooks on re-render", async () => {
    const onBeforeUpdateFn = mock(() => {});
    const onUpdateFn = mock(() => {});

    let counterSignal: any;

    const component = {
      setup: ({ signal }: any) => {
        counterSignal = signal(0);
        return {
          counter: counterSignal,
          onBeforeUpdate() {
            onBeforeUpdateFn();
          },
          onUpdate() {
            onUpdateFn();
          },
        };
      },
      template: (ctx: any) => `<div>Count: ${ctx.counter.value}</div>`,
    };
    app.component("update-lifecycle-comp", component);

    await app.mount(appContainer, "update-lifecycle-comp");

    expect(appContainer.innerHTML).toContain("Count: 0");
    expect(onBeforeUpdateFn).not.toHaveBeenCalled();
    expect(onUpdateFn).not.toHaveBeenCalled();

    // Trigger re-render by updating the signal
    counterSignal.value = 1;

    // Wait for re-render
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(appContainer.innerHTML).toContain("Count: 1");
    expect(onBeforeUpdateFn).toHaveBeenCalled();
    expect(onUpdateFn).toHaveBeenCalled();
  });

  test("should clean up event listeners on unmount", async () => {
    const clickHandler = mock(() => {});

    const component = {
      setup: () => ({
        handleClick: clickHandler,
      }),
      template: () => `<button @click="handleClick">Click me</button>`,
    };

    app.component("cleanup-comp", component);
    const instance = await app.mount(appContainer, "cleanup-comp");

    const button = appContainer.querySelector("button")!;
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);

    // Unmount component
    await instance.unmount();

    // Click should no longer trigger handler
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  test("should handle missing setup function in component definition", async () => {
    const component = {
      template: () => `<div>No Setup</div>`,
    };
    app.component("no-setup-comp", component);

    const instance = await app.mount(appContainer, "no-setup-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("No Setup");
  });

  test("should inject component scoped styles", async () => {
    const component = {
      setup: () => ({ color: "red" }),
      template: () => `<div class="styled">Styled Component</div>`,
      style: (ctx: any) => `
      .styled {
        color: ${ctx.color};
        font-weight: bold;
      }
    `,
    };

    app.component("styled-comp", component);
    const instance = await app.mount(appContainer, "styled-comp");

    // Verify style element was created and injected
    const styleEl = appContainer.querySelector('style[data-e-style="c1"]');
    expect(styleEl).toBeTruthy();
    expect(styleEl!.textContent).toContain("color: red");

    // Test style update
    instance.data.color = "blue";
    const updatedStyle = component.style(instance.data);
    // Re-inject the updated styles
    app["_injectStyles"](appContainer, "c1", component.style, instance.data);

    // Verify the style was updated
    expect(
      appContainer.querySelector('style[data-e-style="c1"]')!.textContent
    ).toContain("color: blue");
  });

  test("should extend Eleva instance with plugin integration", () => {
    const myPlugin = {
      install(eleva: any, options: any) {
        eleva.testPlugin = () => options.msg;
      },
    };
    app.use(myPlugin, { msg: "Plugin Works" });
    expect(app.testPlugin()).toBe("Plugin Works");
  });

  test("should return existing instance if container already has _eleva_instance", async () => {
    const component = {
      template: () => `<div>Test</div>`,
    };
    app.component("test-comp", component);
    const instance1 = await app.mount(appContainer, "test-comp");
    const instance2 = await app.mount(appContainer, "test-comp");
    expect(instance2).toBe(instance1);
  });
});

/**
 * Tests for error handling within the Eleva framework
 */
describe("Eleva error handling", () => {
  let app: any;
  let appContainer: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should handle invalid container elements", async () => {
    const component = {
      setup: () => ({}),
      template: () => "<div>Test</div>",
    };
    app.component("valid-comp", component);
    try {
      await app.mount(null, "valid-comp");
      throw new Error("Expected mount to throw an error");
    } catch (error: any) {
      expect(error.message).toBe("Container not found: null");
    }
  });

  test("should handle invalid component names", async () => {
    const component = {
      setup: () => ({}),
      template: () => "<div>Test</div>",
    };
    app.component("valid-comp", component);
    try {
      await app.mount(appContainer, "invalid-comp");
      throw new Error("Expected mount to throw an error");
    } catch (error: any) {
      expect(error.message).toBe('Component "invalid-comp" not registered.');
    }
  });
});

/**
 * Tests for component relationships and prop passing
 */
describe("Children Components & Passing Props", () => {
  let app: any;
  let appContainer: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should mount child components with props extracted from attributes", async () => {
    const ChildComponent = {
      setup: ({ props }: any) => ({ title: props.title }),
      template: (ctx: any) => `<div>${ctx.title}</div>`,
    };
    const ParentComponent = {
      template: () => `<div><child-comp :title="Hello"></child-comp></div>`,
      children: {
        "child-comp": ChildComponent,
      },
    };

    app.component("parent-comp", ParentComponent);
    app.component("child-comp", ChildComponent);

    const instance = await app.mount(appContainer, "parent-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Hello");
  });

  test("should unmount existing child components before mounting new ones", async () => {
    const ChildComponent1 = {
      setup: ({ props }: any) => ({ title: props.title }),
      template: (ctx: any) => `<div>Child 1: ${ctx.title}</div>`,
    };
    const ChildComponent2 = {
      setup: ({ props }: any) => ({ title: props.title }),
      template: (ctx: any) => `<div>Child 2: ${ctx.title}</div>`,
    };
    const ParentComponent = {
      setup: () => ({}),
      template: () => `
        <div>
          <child-comp :title="Hello from Parent"></child-comp>
        </div>
      `,
      children: {
        "child-comp": ChildComponent1,
      },
    };

    app.component("parent-comp", ParentComponent);
    app.component("child-comp", ChildComponent1);

    // Mount the parent component with the first child
    const parentInstance = await app.mount(appContainer, "parent-comp");
    expect(appContainer.innerHTML).toContain("Child 1: Hello from Parent");

    // Unmount the parent before remounting
    await parentInstance.unmount();

    // Update both the child component registration and the parent's children definition
    app.component("child-comp", ChildComponent2);
    ParentComponent.children["child-comp"] = ChildComponent2;
    await app.mount(appContainer, "parent-comp");
    expect(appContainer.innerHTML).toContain("Child 2: Hello from Parent");
    expect(appContainer.innerHTML).not.toContain("Child 1: Hello from Parent");
  });

  test("should pass props from parent to child component", async () => {
    const ChildComponent = {
      setup: ({ props }: any) => ({ title: props.title }),
      template: (ctx: any) => `<div>Child: ${ctx.title}</div>`,
    };
    const ParentComponent = {
      setup: () => ({}),
      template: () => `
        <div>
          <h1>Parent Component</h1>
          <child-comp :title="Hello from Parent"></child-comp>
        </div>
      `,
      children: {
        "child-comp": ChildComponent,
      },
    };
    app.component("parent-comp", ParentComponent);
    app.component("child-comp", ChildComponent);

    const instance = await app.mount(appContainer, "parent-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Parent Component");
    expect(appContainer.innerHTML).toContain("Child: Hello from Parent");
  });
});

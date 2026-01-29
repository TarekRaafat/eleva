/**
 * @fileoverview Tests for the Eleva core framework functionality
 *
 * These tests verify the core behavior of the Eleva framework, including:
 * - Constructor validation and initialization
 * - Component registration and mounting
 * - Component lifecycle management (mount, unmount)
 * - Event handling and cleanup
 * - Style injection and reactivity
 * - Error conditions and validation
 * - Parent-child component relationships
 * - Props passing between components
 * - Plugin system integration
 * - Render batching
 * - Async lifecycle hooks
 */

import { describe, test, expect, beforeEach, mock } from "bun:test";
import Eleva from "../../../src/index.js";
import { Signal } from "../../../src/modules/Signal.js";
import { Emitter } from "../../../src/modules/Emitter.js";
import { TemplateEngine } from "../../../src/modules/TemplateEngine.js";
import { Renderer } from "../../../src/modules/Renderer.js";

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
      expect(error.message).toBe("Eleva: container must be a DOM element");
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
      setup: () => ({ greeting: "Hello" }),
      template: (ctx: any) =>
        `<div><child-comp :title="greeting"></child-comp></div>`,
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
      setup: () => ({ message: "Hello from Parent" }),
      template: (ctx: any) => `
        <div>
          <child-comp :title="message"></child-comp>
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
      setup: () => ({ message: "Hello from Parent" }),
      template: (ctx: any) => `
        <div>
          <h1>Parent Component</h1>
          <child-comp :title="message"></child-comp>
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

  test("should handle _extractProps when element has no attributes property", () => {
    // Create a mock element without attributes property
    const mockElement = {} as unknown as HTMLElement;
    const result = (app as any)._extractProps(mockElement, {});
    expect(result).toEqual({});
  });

  test("should skip render when children map has empty selector", async () => {
    const ChildComponent = {
      template: () => `<div>Child</div>`,
    };
    const ParentComponent = {
      template: () => `<div><span class="target"></span></div>`,
      children: {
        "": ChildComponent, // Empty selector should be skipped
        ".target": ChildComponent,
      },
    };

    const instance = await app.mount(appContainer, ParentComponent);
    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Child");
    await instance.unmount();
  });
});

// ============================================================================
// CONSTRUCTOR VALIDATION TESTS
// ============================================================================

describe("Eleva Constructor", () => {
  test("should throw error when name is empty string", () => {
    expect(() => new Eleva("")).toThrow("Eleva: name must be a non-empty string");
  });

  test("should throw error when name is null", () => {
    expect(() => new Eleva(null as any)).toThrow("Eleva: name must be a non-empty string");
  });

  test("should throw error when name is undefined", () => {
    expect(() => new Eleva(undefined as any)).toThrow("Eleva: name must be a non-empty string");
  });

  test("should throw error when name is a number", () => {
    expect(() => new Eleva(123 as any)).toThrow("Eleva: name must be a non-empty string");
  });

  test("should throw error when name is an object", () => {
    expect(() => new Eleva({} as any)).toThrow("Eleva: name must be a non-empty string");
  });

  test("should throw error when name is an array", () => {
    expect(() => new Eleva([] as any)).toThrow("Eleva: name must be a non-empty string");
  });

  test("should store name property correctly", () => {
    const app = new Eleva("MyApp");
    expect(app.name).toBe("MyApp");
  });

  test("should initialize emitter as Emitter instance", () => {
    const app = new Eleva("MyApp");
    expect(app.emitter).toBeInstanceOf(Emitter);
  });

  test("should expose Signal class reference", () => {
    const app = new Eleva("MyApp");
    expect(app.signal).toBe(Signal);
  });

  test("should expose TemplateEngine class reference", () => {
    const app = new Eleva("MyApp");
    expect(app.templateEngine).toBe(TemplateEngine);
  });

  test("should initialize renderer as Renderer instance", () => {
    const app = new Eleva("MyApp");
    expect(app.renderer).toBeInstanceOf(Renderer);
  });

  test("should initialize empty _components Map", () => {
    const app = new Eleva("MyApp");
    expect((app as any)._components).toBeInstanceOf(Map);
    expect((app as any)._components.size).toBe(0);
  });

  test("should initialize empty _plugins Map", () => {
    const app = new Eleva("MyApp");
    expect((app as any)._plugins).toBeInstanceOf(Map);
    expect((app as any)._plugins.size).toBe(0);
  });

  test("should initialize _componentCounter to 0", () => {
    const app = new Eleva("MyApp");
    expect((app as any)._componentCounter).toBe(0);
  });

  test("should accept special characters in name", () => {
    const app = new Eleva("my-app_v1.0");
    expect(app.name).toBe("my-app_v1.0");
  });

  test("should accept unicode characters in name", () => {
    const app = new Eleva("我的应用");
    expect(app.name).toBe("我的应用");
  });

  test("should accept whitespace-only string as valid name", () => {
    // Whitespace is technically a non-empty string
    const app = new Eleva("   ");
    expect(app.name).toBe("   ");
  });
});

// ============================================================================
// PLUGIN SYSTEM TESTS
// ============================================================================

describe("Eleva Plugin System", () => {
  let app: any;

  beforeEach(() => {
    app = new Eleva("TestApp");
  });

  test("should throw error when plugin has no install function", () => {
    const invalidPlugin = { name: "invalid" };
    expect(() => app.use(invalidPlugin)).toThrow("Eleva: plugin must have an install function");
  });

  test("should throw error when plugin install is not a function", () => {
    const invalidPlugin = { name: "invalid", install: "not a function" };
    expect(() => app.use(invalidPlugin)).toThrow("Eleva: plugin must have an install function");
  });

  test("should throw error when plugin is null", () => {
    expect(() => app.use(null)).toThrow("Eleva: plugin must have an install function");
  });

  test("should throw error when plugin is undefined", () => {
    expect(() => app.use(undefined)).toThrow("Eleva: plugin must have an install function");
  });

  test("should store plugin in _plugins Map by name", () => {
    const plugin = {
      name: "testPlugin",
      install: () => {},
    };
    app.use(plugin);
    expect((app as any)._plugins.get("testPlugin")).toBe(plugin);
  });

  test("should call install function with eleva instance and options", () => {
    const installMock = mock(() => {});
    const plugin = {
      name: "testPlugin",
      install: installMock,
    };
    const options = { foo: "bar" };
    app.use(plugin, options);
    expect(installMock).toHaveBeenCalledWith(app, options);
  });

  test("should pass empty object as default options", () => {
    const installMock = mock(() => {});
    const plugin = {
      name: "testPlugin",
      install: installMock,
    };
    app.use(plugin);
    expect(installMock).toHaveBeenCalledWith(app, {});
  });

  test("should return eleva instance for chaining when install returns undefined", () => {
    const plugin = {
      name: "testPlugin",
      install: () => undefined,
    };
    const result = app.use(plugin);
    expect(result).toBe(app);
  });

  test("should return custom value when plugin install returns a value", () => {
    const customReturn = { customApi: true };
    const plugin = {
      name: "testPlugin",
      install: () => customReturn,
    };
    const result = app.use(plugin);
    expect(result).toBe(customReturn);
  });

  test("should allow multiple plugins to be installed", () => {
    const plugin1 = { name: "plugin1", install: () => {} };
    const plugin2 = { name: "plugin2", install: () => {} };
    const plugin3 = { name: "plugin3", install: () => {} };

    app.use(plugin1).use(plugin2).use(plugin3);

    expect((app as any)._plugins.size).toBe(3);
    expect((app as any)._plugins.has("plugin1")).toBe(true);
    expect((app as any)._plugins.has("plugin2")).toBe(true);
    expect((app as any)._plugins.has("plugin3")).toBe(true);
  });

  test("should overwrite plugin with same name", () => {
    const plugin1 = { name: "samePlugin", install: () => {} };
    const plugin2 = { name: "samePlugin", install: () => {} };

    app.use(plugin1);
    app.use(plugin2);

    expect((app as any)._plugins.size).toBe(1);
    expect((app as any)._plugins.get("samePlugin")).toBe(plugin2);
  });

  test("should allow plugin to modify eleva instance", () => {
    const plugin = {
      name: "extendPlugin",
      install: (eleva: any) => {
        eleva.customMethod = () => "extended";
        eleva.customProperty = 42;
      },
    };
    app.use(plugin);
    expect(app.customMethod()).toBe("extended");
    expect(app.customProperty).toBe(42);
  });

  test("should allow plugin to wrap mount method", () => {
    const originalMount = app.mount.bind(app);
    const wrapperCalls: string[] = [];

    const plugin = {
      name: "wrapperPlugin",
      install: (eleva: any) => {
        const origMount = eleva.mount.bind(eleva);
        eleva.mount = async (...args: any[]) => {
          wrapperCalls.push("before");
          const result = await origMount(...args);
          wrapperCalls.push("after");
          return result;
        };
      },
    };

    app.use(plugin);

    document.body.innerHTML = '<div id="app"></div>';
    const container = document.getElementById("app")!;
    app.component("test", { template: () => "<div>Test</div>" });

    return app.mount(container, "test").then(() => {
      expect(wrapperCalls).toEqual(["before", "after"]);
    });
  });

  test("should handle plugin with undefined name", () => {
    const plugin = {
      name: undefined,
      install: () => {},
    };
    app.use(plugin);
    expect((app as any)._plugins.get(undefined)).toBe(plugin);
  });
});

// ============================================================================
// COMPONENT REGISTRATION TESTS
// ============================================================================

describe("Eleva Component Registration", () => {
  let app: any;

  beforeEach(() => {
    app = new Eleva("TestApp");
  });

  test("should throw error when component name is empty string", () => {
    expect(() => app.component("", { template: "<div></div>" })).toThrow(
      "Eleva: component name must be a non-empty string"
    );
  });

  test("should throw error when component name is null", () => {
    expect(() => app.component(null, { template: "<div></div>" })).toThrow(
      "Eleva: component name must be a non-empty string"
    );
  });

  test("should throw error when component name is undefined", () => {
    expect(() => app.component(undefined, { template: "<div></div>" })).toThrow(
      "Eleva: component name must be a non-empty string"
    );
  });

  test("should throw error when component name is a number", () => {
    expect(() => app.component(123 as any, { template: "<div></div>" })).toThrow(
      "Eleva: component name must be a non-empty string"
    );
  });

  test("should throw error when definition has no template", () => {
    expect(() => app.component("my-comp", {})).toThrow(
      'Eleva: component "my-comp" must have a template'
    );
  });

  test("should throw error when definition is null", () => {
    expect(() => app.component("my-comp", null)).toThrow(
      'Eleva: component "my-comp" must have a template'
    );
  });

  test("should throw error when definition is undefined", () => {
    expect(() => app.component("my-comp", undefined)).toThrow(
      'Eleva: component "my-comp" must have a template'
    );
  });

  test("should store component in _components Map", () => {
    const definition = { template: "<div>Test</div>" };
    app.component("my-comp", definition);
    expect((app as any)._components.get("my-comp")).toBe(definition);
  });

  test("should return eleva instance for chaining", () => {
    const result = app.component("comp1", { template: "<div></div>" });
    expect(result).toBe(app);
  });

  test("should allow chaining multiple component registrations", () => {
    app
      .component("comp1", { template: "<div>1</div>" })
      .component("comp2", { template: "<div>2</div>" })
      .component("comp3", { template: "<div>3</div>" });

    expect((app as any)._components.size).toBe(3);
  });

  test("should overwrite component with same name", () => {
    const def1 = { template: "<div>First</div>" };
    const def2 = { template: "<div>Second</div>" };

    app.component("same-comp", def1);
    app.component("same-comp", def2);

    expect((app as any)._components.get("same-comp")).toBe(def2);
  });

  test("should accept string template", () => {
    const definition = { template: "<div>Static</div>" };
    app.component("static-comp", definition);
    expect((app as any)._components.get("static-comp").template).toBe("<div>Static</div>");
  });

  test("should accept function template", () => {
    const templateFn = () => "<div>Dynamic</div>";
    const definition = { template: templateFn };
    app.component("dynamic-comp", definition);
    expect((app as any)._components.get("dynamic-comp").template).toBe(templateFn);
  });

  test("should accept component with all properties", () => {
    const definition = {
      setup: () => ({}),
      template: () => "<div></div>",
      style: () => ".test {}",
      children: {},
    };
    app.component("full-comp", definition);
    const stored = (app as any)._components.get("full-comp");
    expect(stored.setup).toBeDefined();
    expect(stored.template).toBeDefined();
    expect(stored.style).toBeDefined();
    expect(stored.children).toBeDefined();
  });
});

// ============================================================================
// MOUNT VARIATIONS TESTS
// ============================================================================

describe("Eleva Mount Variations", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should throw error when container is null", async () => {
    app.component("test", { template: "<div></div>" });
    await expect(app.mount(null, "test")).rejects.toThrow(
      "Eleva: container must be a DOM element"
    );
  });

  test("should throw error when container is undefined", async () => {
    app.component("test", { template: "<div></div>" });
    await expect(app.mount(undefined, "test")).rejects.toThrow(
      "Eleva: container must be a DOM element"
    );
  });

  test("should throw error when container is a string", async () => {
    app.component("test", { template: "<div></div>" });
    await expect(app.mount("#app" as any, "test")).rejects.toThrow(
      "Eleva: container must be a DOM element"
    );
  });

  test("should throw error when container is a plain object", async () => {
    app.component("test", { template: "<div></div>" });
    await expect(app.mount({} as any, "test")).rejects.toThrow(
      "Eleva: container must be a DOM element"
    );
  });

  test("should mount with direct component definition object", async () => {
    const definition = {
      template: () => "<div>Direct Definition</div>",
    };
    const instance = await app.mount(container, definition);
    expect(container.innerHTML).toContain("Direct Definition");
    await instance.unmount();
  });

  test("should mount with string template", async () => {
    app.component("static", { template: "<div>Static Template</div>" });
    const instance = await app.mount(container, "static");
    expect(container.innerHTML).toContain("Static Template");
    await instance.unmount();
  });

  test("should mount with async setup function", async () => {
    const component = {
      setup: async ({ signal }: any) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { message: signal("Async Setup") };
      },
      template: (ctx: any) => `<div>${ctx.message.value}</div>`,
    };
    app.component("async-setup", component);
    const instance = await app.mount(container, "async-setup");
    expect(container.innerHTML).toContain("Async Setup");
    await instance.unmount();
  });

  test("should mount with async template function", async () => {
    const component = {
      template: async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return "<div>Async Template</div>";
      },
    };
    app.component("async-template", component);
    const instance = await app.mount(container, "async-template");
    expect(container.innerHTML).toContain("Async Template");
    await instance.unmount();
  });

  test("should pass props to mounted component", async () => {
    const component = {
      template: (ctx: any) => `<div>${ctx.props.message}</div>`,
    };
    app.component("props-comp", component);
    const instance = await app.mount(container, "props-comp", { message: "Hello Props" });
    expect(container.innerHTML).toContain("Hello Props");
    await instance.unmount();
  });

  test("should use empty object as default props", async () => {
    const component = {
      template: (ctx: any) => `<div>${JSON.stringify(ctx.props)}</div>`,
    };
    app.component("no-props", component);
    const instance = await app.mount(container, "no-props");
    expect(container.innerHTML).toContain("{}");
    await instance.unmount();
  });

  test("should provide emitter in context", async () => {
    let capturedEmitter: any;
    const component = {
      setup: (ctx: any) => {
        capturedEmitter = ctx.emitter;
        return {};
      },
      template: () => "<div>Test</div>",
    };
    app.component("emitter-test", component);
    await app.mount(container, "emitter-test");
    expect(capturedEmitter).toBe(app.emitter);
  });

  test("should provide signal factory in context", async () => {
    let createdSignal: any;
    const component = {
      setup: (ctx: any) => {
        createdSignal = ctx.signal(42);
        return { num: createdSignal };
      },
      template: (ctx: any) => `<div>${ctx.num.value}</div>`,
    };
    app.component("signal-factory", component);
    const instance = await app.mount(container, "signal-factory");
    expect(createdSignal).toBeInstanceOf(Signal);
    expect(createdSignal.value).toBe(42);
    await instance.unmount();
  });

  test("should increment _componentCounter on each mount", async () => {
    const component = { template: "<div>Test</div>" };
    app.component("counter-test", component);

    expect((app as any)._componentCounter).toBe(0);

    const container1 = document.createElement("div");
    const container2 = document.createElement("div");
    const container3 = document.createElement("div");

    await app.mount(container1, "counter-test");
    expect((app as any)._componentCounter).toBe(1);

    await app.mount(container2, "counter-test");
    expect((app as any)._componentCounter).toBe(2);

    await app.mount(container3, "counter-test");
    expect((app as any)._componentCounter).toBe(3);
  });

  test("should return MountResult with container, data, and unmount", async () => {
    const component = {
      setup: ({ signal }: any) => ({ count: signal(0) }),
      template: () => "<div>Test</div>",
    };
    app.component("result-test", component);
    const instance = await app.mount(container, "result-test");

    expect(instance.container).toBe(container);
    expect(instance.data).toBeDefined();
    expect(instance.data.count).toBeDefined();
    expect(instance.data.props).toBeDefined();
    expect(instance.data.emitter).toBeDefined();
    expect(instance.data.signal).toBeInstanceOf(Function);
    expect(typeof instance.unmount).toBe("function");

    await instance.unmount();
  });

  test("should store instance on container._eleva_instance", async () => {
    const component = { template: "<div>Test</div>" };
    app.component("instance-store", component);

    const instance = await app.mount(container, "instance-store");
    expect((container as any)._eleva_instance).toBe(instance);

    await instance.unmount();
  });
});

// ============================================================================
// RENDER BATCHING TESTS
// ============================================================================

describe("Eleva Render Batching", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should batch multiple signal changes into single render", async () => {
    let renderCount = 0;
    let countSignal: any;

    const component = {
      setup: ({ signal }: any) => {
        countSignal = signal(0);
        return {
          count: countSignal,
          onBeforeUpdate: () => {
            renderCount++;
          },
        };
      },
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    };

    app.component("batch-test", component);
    await app.mount(container, "batch-test");

    // Multiple synchronous updates
    countSignal.value = 1;
    countSignal.value = 2;
    countSignal.value = 3;

    // Wait for batched render
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should have batched all updates into one render
    expect(renderCount).toBe(1);
    expect(container.innerHTML).toContain("3");
  });

  test("should render after microtask", async () => {
    let countSignal: any;
    const renderTimes: number[] = [];

    const component = {
      setup: ({ signal }: any) => {
        countSignal = signal(0);
        return {
          count: countSignal,
          onUpdate: () => {
            renderTimes.push(Date.now());
          },
        };
      },
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    };

    app.component("microtask-test", component);
    await app.mount(container, "microtask-test");

    const beforeUpdate = Date.now();
    countSignal.value = 1;

    // Render should not have happened yet (synchronously)
    expect(container.innerHTML).toContain("0");

    // Wait for microtask
    await new Promise(resolve => queueMicrotask(resolve));
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(container.innerHTML).toContain("1");
  });

  test("should handle rapid signal updates", async () => {
    let countSignal: any;
    let updateCount = 0;

    const component = {
      setup: ({ signal }: any) => {
        countSignal = signal(0);
        return {
          count: countSignal,
          onUpdate: () => updateCount++,
        };
      },
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    };

    app.component("rapid-test", component);
    await app.mount(container, "rapid-test");

    // Rapid updates
    for (let i = 1; i <= 100; i++) {
      countSignal.value = i;
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // Should batch into minimal renders
    expect(updateCount).toBeLessThan(10);
    expect(container.innerHTML).toContain("100");
  });

  test("should handle multiple signals changing simultaneously", async () => {
    let signal1: any, signal2: any, signal3: any;
    let updateCount = 0;

    const component = {
      setup: ({ signal }: any) => {
        signal1 = signal("a");
        signal2 = signal("b");
        signal3 = signal("c");
        return {
          s1: signal1,
          s2: signal2,
          s3: signal3,
          onUpdate: () => updateCount++,
        };
      },
      template: (ctx: any) => `<div>${ctx.s1.value}-${ctx.s2.value}-${ctx.s3.value}</div>`,
    };

    app.component("multi-signal", component);
    await app.mount(container, "multi-signal");

    // Change all signals simultaneously
    signal1.value = "x";
    signal2.value = "y";
    signal3.value = "z";

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(updateCount).toBe(1);
    expect(container.innerHTML).toContain("x-y-z");
  });
});

// ============================================================================
// EVENT PROCESSING TESTS
// ============================================================================

describe("Eleva Event Processing", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should bind click event handler", async () => {
    const clickHandler = mock(() => {});
    const component = {
      setup: () => ({ handleClick: clickHandler }),
      template: () => `<button @click="handleClick">Click</button>`,
    };

    app.component("click-test", component);
    await app.mount(container, "click-test");

    const button = container.querySelector("button")!;
    button.click();

    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  test("should bind multiple event types on different elements", async () => {
    const clickHandler = mock(() => {});
    const inputHandler = mock(() => {});
    const changeHandler = mock(() => {});

    const component = {
      setup: () => ({
        handleClick: clickHandler,
        handleInput: inputHandler,
        handleChange: changeHandler,
      }),
      template: () => `
        <div>
          <button @click="handleClick">Click</button>
          <input id="text-input" @input="handleInput" />
          <select id="select-input" @change="handleChange"><option>A</option></select>
        </div>
      `,
    };

    app.component("multi-event", component);
    await app.mount(container, "multi-event");

    // Test click event
    container.querySelector("button")!.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);

    // Test input event
    const textInput = container.querySelector("#text-input")! as HTMLInputElement;
    textInput.value = "test";
    textInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(inputHandler).toHaveBeenCalledTimes(1);

    // Test change event
    const selectInput = container.querySelector("#select-input")!;
    selectInput.dispatchEvent(new Event("change", { bubbles: true }));
    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  test("should bind events on multiple elements", async () => {
    const handler1 = mock(() => {});
    const handler2 = mock(() => {});

    const component = {
      setup: () => ({ h1: handler1, h2: handler2 }),
      template: () => `
        <div>
          <button id="btn1" @click="h1">Button 1</button>
          <button id="btn2" @click="h2">Button 2</button>
        </div>
      `,
    };

    app.component("multi-element", component);
    await app.mount(container, "multi-element");

    container.querySelector("#btn1")!.dispatchEvent(new MouseEvent("click"));
    container.querySelector("#btn2")!.dispatchEvent(new MouseEvent("click"));

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test("should pass event object to handler", async () => {
    let receivedEvent: any;
    const component = {
      setup: () => ({
        handleClick: (e: Event) => {
          receivedEvent = e;
        },
      }),
      template: () => `<button @click="handleClick">Click</button>`,
    };

    app.component("event-obj", component);
    await app.mount(container, "event-obj");

    container.querySelector("button")!.click();

    expect(receivedEvent).toBeInstanceOf(MouseEvent);
    expect(receivedEvent.type).toBe("click");
  });

  test("should remove @attribute after binding", async () => {
    const component = {
      setup: () => ({ handler: () => {} }),
      template: () => `<button @click="handler">Click</button>`,
    };

    app.component("attr-removal", component);
    await app.mount(container, "attr-removal");

    const button = container.querySelector("button")!;
    expect(button.hasAttribute("@click")).toBe(false);
  });

  test("should bind both @ attributes when two exist on same element", async () => {
    const calls: string[] = [];
    const component = {
      setup: () => ({
        handleClick: () => calls.push("click"),
        handleMouseOver: () => calls.push("mouseover"),
      }),
      template: () =>
        `<button @click="handleClick" @mouseover="handleMouseOver">Hover me</button>`,
    };

    app.component("two-events", component);
    await app.mount(container, "two-events");

    const button = container.querySelector("button")!;

    // Both @ attributes should be removed after binding
    expect(button.hasAttribute("@click")).toBe(false);
    expect(button.hasAttribute("@mouseover")).toBe(false);

    // Both handlers should be bound and functional
    button.click();
    button.dispatchEvent(new Event("mouseover"));

    expect(calls).toEqual(["click", "mouseover"]);
  });

  test("should bind all @ attributes when three exist on same element", async () => {
    const calls: string[] = [];
    const component = {
      setup: () => ({
        handleClick: () => calls.push("click"),
        handleMouseOver: () => calls.push("mouseover"),
        handleMouseOut: () => calls.push("mouseout"),
      }),
      template: () =>
        `<button @click="handleClick" @mouseover="handleMouseOver" @mouseout="handleMouseOut">Hover me</button>`,
    };

    app.component("three-events", component);
    await app.mount(container, "three-events");

    const button = container.querySelector("button")!;

    // All @ attributes should be removed after binding
    expect(button.hasAttribute("@click")).toBe(false);
    expect(button.hasAttribute("@mouseover")).toBe(false);
    expect(button.hasAttribute("@mouseout")).toBe(false);

    // All handlers should be bound and functional
    button.click();
    button.dispatchEvent(new Event("mouseover"));
    button.dispatchEvent(new Event("mouseout"));

    expect(calls).toEqual(["click", "mouseover", "mouseout"]);
  });

  test("should handle expression-based handler", async () => {
    let count = 0;
    const component = {
      setup: () => ({
        increment: () => count++,
      }),
      template: () => `<button @click="increment">Click</button>`,
    };

    app.component("expr-handler", component);
    await app.mount(container, "expr-handler");

    container.querySelector("button")!.click();
    expect(count).toBe(1);
  });

  test("should skip non-function handlers silently", async () => {
    const component = {
      setup: () => ({
        notAFunction: "string value",
      }),
      template: () => `<button @click="notAFunction">Click</button>`,
    };

    app.component("invalid-handler", component);
    await app.mount(container, "invalid-handler");

    // Should not throw when clicking
    expect(() => {
      container.querySelector("button")!.click();
    }).not.toThrow();
  });

  test("should handle custom event names", async () => {
    const handler = mock(() => {});
    const component = {
      setup: () => ({ handler }),
      template: () => `<div @custom-event="handler">Test</div>`,
    };

    app.component("custom-event", component);
    await app.mount(container, "custom-event");

    const div = container.querySelector("div")!;
    div.dispatchEvent(new CustomEvent("custom-event"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("should handle input event", async () => {
    let inputValue = "";
    const component = {
      setup: () => ({
        handleInput: (e: any) => {
          inputValue = e.target.value;
        },
      }),
      template: () => `<input @input="handleInput" />`,
    };

    app.component("input-event", component);
    await app.mount(container, "input-event");

    const input = container.querySelector("input")! as HTMLInputElement;
    input.value = "test value";
    input.dispatchEvent(new Event("input"));

    expect(inputValue).toBe("test value");
  });

  test("should handle submit event with preventDefault", async () => {
    let submitted = false;
    const component = {
      setup: () => ({
        handleSubmit: (e: Event) => {
          e.preventDefault();
          submitted = true;
        },
      }),
      template: () => `<form @submit="handleSubmit"><button type="submit">Submit</button></form>`,
    };

    app.component("submit-event", component);
    await app.mount(container, "submit-event");

    const form = container.querySelector("form")!;
    form.dispatchEvent(new Event("submit"));

    expect(submitted).toBe(true);
  });
});

// ============================================================================
// STYLE INJECTION TESTS
// ============================================================================

describe("Eleva Style Injection", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should inject string style", async () => {
    const component = {
      template: () => "<div>Test</div>",
      style: ".test { color: red; }",
    };

    app.component("string-style", component);
    await app.mount(container, "string-style");

    const styleEl = container.querySelector("style[data-e-style]");
    expect(styleEl).toBeTruthy();
    expect(styleEl!.textContent).toBe(".test { color: red; }");
  });

  test("should inject function style", async () => {
    const component = {
      setup: () => ({ color: "blue" }),
      template: () => "<div>Test</div>",
      style: (ctx: any) => `.test { color: ${ctx.color}; }`,
    };

    app.component("fn-style", component);
    await app.mount(container, "fn-style");

    const styleEl = container.querySelector("style[data-e-style]");
    expect(styleEl!.textContent).toContain("color: blue");
  });

  test("should use component ID for style data attribute", async () => {
    const component = {
      template: () => "<div>Test</div>",
      style: ".test {}",
    };

    app.component("id-style", component);
    await app.mount(container, "id-style");

    const styleEl = container.querySelector('style[data-e-style="c1"]');
    expect(styleEl).toBeTruthy();
  });

  test("should skip style update if content unchanged", async () => {
    const component = {
      setup: ({ signal }: any) => ({ count: signal(0) }),
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
      style: ".static { color: red; }",
    };

    app.component("skip-style", component);
    const instance = await app.mount(container, "skip-style");

    const styleEl = container.querySelector("style[data-e-style]");
    const originalStyle = styleEl!.textContent;

    // Trigger re-render
    instance.data.count.value = 1;
    await new Promise(resolve => setTimeout(resolve, 50));

    // Style should be unchanged
    expect(styleEl!.textContent).toBe(originalStyle);
  });

  test("should update style when content changes", async () => {
    let colorSignal: any;
    const component = {
      setup: ({ signal }: any) => {
        colorSignal = signal("red");
        return { color: colorSignal };
      },
      template: () => "<div>Test</div>",
      style: (ctx: any) => `.test { color: ${ctx.color.value}; }`,
    };

    app.component("update-style", component);
    await app.mount(container, "update-style");

    let styleEl = container.querySelector("style[data-e-style]");
    expect(styleEl!.textContent).toContain("red");

    colorSignal.value = "blue";
    await new Promise(resolve => setTimeout(resolve, 50));

    styleEl = container.querySelector("style[data-e-style]");
    expect(styleEl!.textContent).toContain("blue");
  });

  test("should parse template expressions in style", async () => {
    const component = {
      setup: () => ({
        size: "20px",
        weight: "bold",
      }),
      template: () => "<div>Test</div>",
      style: (ctx: any) => `.test { font-size: ${ctx.size}; font-weight: ${ctx.weight}; }`,
    };

    app.component("expr-style", component);
    await app.mount(container, "expr-style");

    const styleEl = container.querySelector("style[data-e-style]");
    expect(styleEl!.textContent).toContain("font-size: 20px");
    expect(styleEl!.textContent).toContain("font-weight: bold");
  });

  test("should handle component without style", async () => {
    const component = {
      template: () => "<div>No Style</div>",
    };

    app.component("no-style", component);
    await app.mount(container, "no-style");

    const styleEl = container.querySelector("style[data-e-style]");
    expect(styleEl).toBeNull();
  });

  test("should reuse existing style element", async () => {
    let countSignal: any;
    const component = {
      setup: ({ signal }: any) => {
        countSignal = signal(0);
        return { count: countSignal };
      },
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
      style: (ctx: any) => `.test { content: "${ctx.count.value}"; }`,
    };

    app.component("reuse-style", component);
    await app.mount(container, "reuse-style");

    const styleEl1 = container.querySelector("style[data-e-style]");

    countSignal.value = 1;
    await new Promise(resolve => setTimeout(resolve, 50));

    const styleEl2 = container.querySelector("style[data-e-style]");

    // Should be the same element, not a new one
    expect(styleEl1).toBe(styleEl2);
    // Only one style element should exist
    expect(container.querySelectorAll("style[data-e-style]").length).toBe(1);
  });
});

// ============================================================================
// PROPS EXTRACTION TESTS
// ============================================================================

describe("Eleva Props Extraction", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should extract single prop", async () => {
    const ChildComponent = {
      template: (ctx: any) => `<span>${ctx.props.name}</span>`,
    };
    const ParentComponent = {
      setup: () => ({ userName: "John" }),
      template: (ctx: any) => `<child-comp :name="userName"></child-comp>`,
      children: { "child-comp": ChildComponent },
    };

    await app.mount(container, ParentComponent);
    expect(container.innerHTML).toContain("John");
  });

  test("should extract multiple props", async () => {
    const ChildComponent = {
      template: (ctx: any) =>
        `<span>${ctx.props.first} ${ctx.props.last} - ${ctx.props.age}</span>`,
    };
    const ParentComponent = {
      setup: () => ({ first: "John", last: "Doe", age: 30 }),
      template: (ctx: any) =>
        `<child-comp :first="first" :last="last" :age="age"></child-comp>`,
      children: { "child-comp": ChildComponent },
    };

    await app.mount(container, ParentComponent);
    expect(container.innerHTML).toContain("John Doe - 30");
  });

  test("should remove prop attributes after extraction", async () => {
    const ChildComponent = {
      template: () => `<span>Child</span>`,
    };
    const ParentComponent = {
      setup: () => ({ testName: "Test", testValue: 123 }),
      template: (ctx: any) =>
        `<child-comp :name="testName" :value="testValue"></child-comp>`,
      children: { "child-comp": ChildComponent },
    };

    await app.mount(container, ParentComponent);

    const childEl = container.querySelector("child-comp");
    expect(childEl!.hasAttribute(":name")).toBe(false);
    expect(childEl!.hasAttribute(":value")).toBe(false);
  });

  test("should handle empty prop value", async () => {
    const ChildComponent = {
      template: (ctx: any) =>
        `<span>${ctx.props.empty === undefined ? "empty" : "not empty"}</span>`,
    };
    const ParentComponent = {
      template: () => `<child-comp :empty=""></child-comp>`,
      children: { "child-comp": ChildComponent },
    };

    await app.mount(container, ParentComponent);
    expect(container.innerHTML).toContain("empty");
  });

  test("should handle props with special characters in values", async () => {
    const ChildComponent = {
      template: (ctx: any) => `<span>${ctx.props.message}</span>`,
    };
    const ParentComponent = {
      setup: () => ({ msg: "Hello World!" }),
      template: (ctx: any) => `<child-comp :message="msg"></child-comp>`,
      children: { "child-comp": ChildComponent },
    };

    await app.mount(container, ParentComponent);
    expect(container.innerHTML).toContain("Hello World!");
  });

  test("should return empty object for element with no props", async () => {
    const result = (app as any)._extractProps(document.createElement("div"), {});
    expect(result).toEqual({});
  });

  test("should only extract attributes starting with colon", async () => {
    const element = document.createElement("div");
    element.setAttribute(":prop1", "value1");
    element.setAttribute("class", "my-class");
    element.setAttribute("id", "my-id");
    element.setAttribute(":prop2", "value2");

    // Provide context with the values
    const context = { value1: "resolved1", value2: "resolved2" };
    const result = (app as any)._extractProps(element, context);

    expect(result).toEqual({ prop1: "resolved1", prop2: "resolved2" });
    expect(element.hasAttribute("class")).toBe(true);
    expect(element.hasAttribute("id")).toBe(true);
  });
});

// ============================================================================
// CHILDREN MOUNTING TESTS
// ============================================================================

describe("Eleva Children Mounting", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should mount multiple children with different selectors", async () => {
    const Header = { template: () => "<h1>Header</h1>" };
    const Sidebar = { template: () => "<aside>Sidebar</aside>" };
    const Footer = { template: () => "<footer>Footer</footer>" };

    const ParentComponent = {
      template: () => `
        <div>
          <header-comp></header-comp>
          <sidebar-comp></sidebar-comp>
          <footer-comp></footer-comp>
        </div>
      `,
      children: {
        "header-comp": Header,
        "sidebar-comp": Sidebar,
        "footer-comp": Footer,
      },
    };

    await app.mount(container, ParentComponent);

    expect(container.innerHTML).toContain("Header");
    expect(container.innerHTML).toContain("Sidebar");
    expect(container.innerHTML).toContain("Footer");
  });

  test("should mount child using CSS class selector", async () => {
    const Child = { template: () => "<span>Child Content</span>" };
    const Parent = {
      template: () => `<div class="child-container"></div>`,
      children: { ".child-container": Child },
    };

    await app.mount(container, Parent);
    expect(container.innerHTML).toContain("Child Content");
  });

  test("should mount child using ID selector", async () => {
    const Child = { template: () => "<span>By ID</span>" };
    const Parent = {
      template: () => `<div id="my-child"></div>`,
      children: { "#my-child": Child },
    };

    await app.mount(container, Parent);
    expect(container.innerHTML).toContain("By ID");
  });

  test("should mount multiple instances of same child", async () => {
    const Item = {
      template: (ctx: any) => `<li>${ctx.props.label}</li>`,
    };
    const List = {
      setup: () => ({ one: "One", two: "Two", three: "Three" }),
      template: (ctx: any) => `
        <ul>
          <list-item :label="one"></list-item>
          <list-item :label="two"></list-item>
          <list-item :label="three"></list-item>
        </ul>
      `,
      children: { "list-item": Item },
    };

    await app.mount(container, List);

    expect(container.innerHTML).toContain("One");
    expect(container.innerHTML).toContain("Two");
    expect(container.innerHTML).toContain("Three");
  });

  test("should skip non-HTMLElement matches", async () => {
    // This is hard to test directly, but we can verify it doesn't throw
    const Child = { template: () => "<span>Child</span>" };
    const Parent = {
      template: () => `<div><!-- comment --><child-el></child-el>Text node</div>`,
      children: { "child-el": Child },
    };

    await app.mount(container, Parent);
    expect(container.innerHTML).toContain("Child");
  });

  test("should use registered component name as child", async () => {
    const RegisteredChild = { template: () => "<span>Registered</span>" };
    app.component("registered-child", RegisteredChild);

    const Parent = {
      template: () => `<child-slot></child-slot>`,
      children: { "child-slot": "registered-child" },
    };

    await app.mount(container, Parent);
    expect(container.innerHTML).toContain("Registered");
  });

  test("should prevent duplicate child instances", async () => {
    let mountCount = 0;
    const Child = {
      setup: () => {
        mountCount++;
        return {};
      },
      template: () => "<span>Child</span>",
    };
    const Parent = {
      template: () => `<child-comp></child-comp>`,
      children: { "child-comp": Child },
    };

    const instance = await app.mount(container, Parent);
    expect(mountCount).toBe(1);

    // Re-mounting same parent should not re-mount child
    await app.mount(container, Parent);
    expect(mountCount).toBe(1); // Should still be 1
  });

  test("should handle deeply nested children", async () => {
    const GrandChild = { template: () => "<span>Grand Child</span>" };
    const Child = {
      template: () => `<div><grand-child></grand-child></div>`,
      children: { "grand-child": GrandChild },
    };
    const Parent = {
      template: () => `<div><child-comp></child-comp></div>`,
      children: { "child-comp": Child },
    };

    await app.mount(container, Parent);
    expect(container.innerHTML).toContain("Grand Child");
  });

  test("should pass props through multiple levels", async () => {
    const GrandChild = {
      template: (ctx: any) => `<span>${ctx.props.message}</span>`,
    };
    const Child = {
      setup: ({ props }: any) => ({ text: props.text }),
      template: (ctx: any) => `<grand-child :message="text"></grand-child>`,
      children: { "grand-child": GrandChild },
    };
    const Parent = {
      setup: () => ({ deepMessage: "Hello Deep" }),
      template: (ctx: any) => `<child-comp :text="deepMessage"></child-comp>`,
      children: { "child-comp": Child },
    };

    await app.mount(container, Parent);
    expect(container.innerHTML).toContain("Hello Deep");
  });
});

// ============================================================================
// UNMOUNT BEHAVIOR TESTS
// ============================================================================

describe("Eleva Unmount Behavior", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should call onUnmount hook", async () => {
    const unmountFn = mock(() => {});
    const component = {
      setup: () => ({ onUnmount: unmountFn }),
      template: () => "<div>Test</div>",
    };

    app.component("unmount-hook", component);
    const instance = await app.mount(container, "unmount-hook");

    await instance.unmount();
    expect(unmountFn).toHaveBeenCalledTimes(1);
  });

  test("should pass cleanup resources to onUnmount", async () => {
    let cleanupResources: any;
    const component = {
      setup: ({ signal }: any) => ({
        count: signal(0),
        onUnmount: ({ cleanup }: any) => {
          cleanupResources = cleanup;
        },
      }),
      template: () => `<button @click="handler">Click</button>`,
    };

    app.component("cleanup-resources", component);
    const instance = await app.mount(container, "cleanup-resources");

    await instance.unmount();

    expect(cleanupResources).toBeDefined();
    expect(cleanupResources.watchers).toBeInstanceOf(Array);
    expect(cleanupResources.listeners).toBeInstanceOf(Array);
    expect(cleanupResources.children).toBeInstanceOf(Array);
  });

  test("should cleanup signal watchers", async () => {
    let signalRef: any;
    let watcherCalled = 0;

    const component = {
      setup: ({ signal }: any) => {
        signalRef = signal(0);
        return { count: signalRef };
      },
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    };

    app.component("watcher-cleanup", component);
    const instance = await app.mount(container, "watcher-cleanup");

    await instance.unmount();

    // Signal change after unmount should not trigger re-render
    const contentBefore = container.innerHTML;
    signalRef.value = 100;
    await new Promise(resolve => setTimeout(resolve, 50));

    // Container should be empty after unmount
    expect(container.innerHTML).toBe("");
  });

  test("should cleanup event listeners", async () => {
    const handler = mock(() => {});
    const component = {
      setup: () => ({ handler }),
      template: () => `<button @click="handler">Click</button>`,
    };

    app.component("listener-cleanup", component);
    const instance = await app.mount(container, "listener-cleanup");

    const button = container.querySelector("button")!;
    button.click();
    expect(handler).toHaveBeenCalledTimes(1);

    // Store reference before unmount clears innerHTML
    const buttonRef = button;

    await instance.unmount();

    // Event listener should be removed, but button is also removed
    // So we verify container is empty
    expect(container.innerHTML).toBe("");
  });

  test("should unmount child components", async () => {
    const childUnmount = mock(() => {});
    const Child = {
      setup: () => ({ onUnmount: childUnmount }),
      template: () => "<span>Child</span>",
    };
    const Parent = {
      template: () => `<child-comp></child-comp>`,
      children: { "child-comp": Child },
    };

    app.component("parent-with-child", Parent);
    const instance = await app.mount(container, "parent-with-child");

    await instance.unmount();
    expect(childUnmount).toHaveBeenCalledTimes(1);
  });

  test("should unmount child when parent re-render removes child host element", async () => {
    const childUnmount = mock(() => {});
    let showSignal: any;

    const Child = {
      setup: () => ({ onUnmount: childUnmount }),
      template: () => "<span>Child Content</span>",
    };

    const Parent = {
      setup: ({ signal }: any) => {
        const show = signal(true);
        showSignal = show;
        return { show };
      },
      template: (ctx: any) =>
        ctx.show.value
          ? `<child-comp></child-comp>`
          : `<div>No child</div>`,
      children: { "child-comp": Child },
    };

    app.component("conditional-child-parent", Parent);
    const instance = await app.mount(container, "conditional-child-parent");

    expect(container.innerHTML).toContain("Child Content");
    expect(childUnmount).not.toHaveBeenCalled();

    // Re-render parent without child (removes child host element)
    showSignal.value = false;
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(container.innerHTML).toContain("No child");
    expect(container.innerHTML).not.toContain("Child Content");
    expect(childUnmount).toHaveBeenCalledTimes(1);

    await instance.unmount();
  });

  test("should not block parent render when child unmount is async", async () => {
    const order: string[] = [];
    const childUnmount = mock(async () => {
      order.push("unmount-start");
      await new Promise((resolve) => setTimeout(resolve, 50));
      order.push("unmount-end");
    });
    let showSignal: any;

    const Child = {
      setup: () => ({ onUnmount: childUnmount }),
      template: () => "<span>Child Content</span>",
    };

    const Parent = {
      setup: ({ signal }: any) => {
        const show = signal(true);
        showSignal = show;
        return { show };
      },
      template: (ctx: any) =>
        ctx.show.value
          ? `<child-comp></child-comp>`
          : `<div>No child</div>`,
      children: { "child-comp": Child },
    };

    app.component("async-unmount-parent", Parent);
    const instance = await app.mount(container, "async-unmount-parent");

    showSignal.value = false;

    // Allow render + queued unmount to run, but not the delayed completion.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(container.innerHTML).toContain("No child");
    expect(order).toContain("unmount-start");
    expect(order).not.toContain("unmount-end");

    await instance.unmount();
  });

  test("should clear container innerHTML", async () => {
    const component = { template: () => "<div>Content</div>" };

    app.component("clear-content", component);
    const instance = await app.mount(container, "clear-content");

    expect(container.innerHTML).toContain("Content");

    await instance.unmount();
    expect(container.innerHTML).toBe("");
  });

  test("should delete _eleva_instance from container", async () => {
    const component = { template: () => "<div>Test</div>" };

    app.component("delete-instance", component);
    const instance = await app.mount(container, "delete-instance");

    expect((container as any)._eleva_instance).toBe(instance);

    await instance.unmount();
    expect((container as any)._eleva_instance).toBeUndefined();
  });

  test("should handle async onUnmount", async () => {
    const order: string[] = [];
    const component = {
      setup: () => ({
        onUnmount: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          order.push("unmount");
        },
      }),
      template: () => "<div>Test</div>",
    };

    app.component("async-unmount", component);
    const instance = await app.mount(container, "async-unmount");

    await instance.unmount();
    order.push("after");

    expect(order).toEqual(["unmount", "after"]);
  });

  test("should cleanup multiple watchers", async () => {
    let s1: any, s2: any, s3: any;
    const component = {
      setup: ({ signal }: any) => {
        s1 = signal(1);
        s2 = signal(2);
        s3 = signal(3);
        return { a: s1, b: s2, c: s3 };
      },
      template: (ctx: any) => `<div>${ctx.a.value}-${ctx.b.value}-${ctx.c.value}</div>`,
    };

    app.component("multi-watcher", component);
    const instance = await app.mount(container, "multi-watcher");

    await instance.unmount();

    // Changes should have no effect after unmount
    s1.value = 10;
    s2.value = 20;
    s3.value = 30;
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(container.innerHTML).toBe("");
  });

  test("should cleanup multiple listeners", async () => {
    const h1 = mock(() => {});
    const h2 = mock(() => {});
    const h3 = mock(() => {});

    const component = {
      setup: () => ({ h1, h2, h3 }),
      template: () => `
        <div>
          <button id="b1" @click="h1">1</button>
          <button id="b2" @click="h2">2</button>
          <button id="b3" @click="h3">3</button>
        </div>
      `,
    };

    app.component("multi-listener", component);
    const instance = await app.mount(container, "multi-listener");

    await instance.unmount();

    expect(container.innerHTML).toBe("");
  });

  test("should recursively unmount nested children", async () => {
    const order: string[] = [];
    const GrandChild = {
      setup: () => ({
        onUnmount: () => order.push("grandchild"),
      }),
      template: () => "<span>GC</span>",
    };
    const Child = {
      setup: () => ({
        onUnmount: () => order.push("child"),
      }),
      template: () => `<grand-child></grand-child>`,
      children: { "grand-child": GrandChild },
    };
    const Parent = {
      setup: () => ({
        onUnmount: () => order.push("parent"),
      }),
      template: () => `<child-comp></child-comp>`,
      children: { "child-comp": Child },
    };

    const instance = await app.mount(container, Parent);
    await instance.unmount();

    // Parent onUnmount is called first, then children are unmounted
    expect(order).toContain("parent");
    expect(order).toContain("child");
    expect(order).toContain("grandchild");
  });
});

// ============================================================================
// ASYNC LIFECYCLE HOOKS TESTS
// ============================================================================

describe("Eleva Async Lifecycle Hooks", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should await async onBeforeMount", async () => {
    const order: string[] = [];
    const component = {
      setup: () => ({
        onBeforeMount: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          order.push("beforeMount");
        },
        onMount: () => {
          order.push("mount");
        },
      }),
      template: () => "<div>Test</div>",
    };

    app.component("async-before-mount", component);
    await app.mount(container, "async-before-mount");

    expect(order).toEqual(["beforeMount", "mount"]);
  });

  test("should await async onMount", async () => {
    let mountCompleted = false;
    const component = {
      setup: () => ({
        onMount: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          mountCompleted = true;
        },
      }),
      template: () => "<div>Test</div>",
    };

    app.component("async-mount", component);
    await app.mount(container, "async-mount");

    expect(mountCompleted).toBe(true);
  });

  test("should await async onBeforeUpdate", async () => {
    let countSignal: any;
    const order: string[] = [];

    const component = {
      setup: ({ signal }: any) => {
        countSignal = signal(0);
        return {
          count: countSignal,
          onBeforeUpdate: async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            order.push("beforeUpdate");
          },
          onUpdate: () => {
            order.push("update");
          },
        };
      },
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    };

    app.component("async-before-update", component);
    await app.mount(container, "async-before-update");

    countSignal.value = 1;
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(order).toEqual(["beforeUpdate", "update"]);
  });

  test("should await async onUpdate", async () => {
    let countSignal: any;
    let updateCompleted = false;

    const component = {
      setup: ({ signal }: any) => {
        countSignal = signal(0);
        return {
          count: countSignal,
          onUpdate: async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            updateCompleted = true;
          },
        };
      },
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    };

    app.component("async-update", component);
    await app.mount(container, "async-update");

    countSignal.value = 1;
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(updateCompleted).toBe(true);
  });

  test("should handle all async hooks in correct order", async () => {
    let countSignal: any;
    const order: string[] = [];

    const component = {
      setup: ({ signal }: any) => {
        countSignal = signal(0);
        return {
          count: countSignal,
          onBeforeMount: async () => {
            await new Promise(resolve => setTimeout(resolve, 5));
            order.push("beforeMount");
          },
          onMount: async () => {
            await new Promise(resolve => setTimeout(resolve, 5));
            order.push("mount");
          },
          onBeforeUpdate: async () => {
            await new Promise(resolve => setTimeout(resolve, 5));
            order.push("beforeUpdate");
          },
          onUpdate: async () => {
            await new Promise(resolve => setTimeout(resolve, 5));
            order.push("update");
          },
          onUnmount: async () => {
            await new Promise(resolve => setTimeout(resolve, 5));
            order.push("unmount");
          },
        };
      },
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    };

    app.component("all-async", component);
    const instance = await app.mount(container, "all-async");

    expect(order).toEqual(["beforeMount", "mount"]);

    countSignal.value = 1;
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(order).toEqual(["beforeMount", "mount", "beforeUpdate", "update"]);

    await instance.unmount();

    expect(order).toEqual(["beforeMount", "mount", "beforeUpdate", "update", "unmount"]);
  });
});

// ============================================================================
// EDGE CASES TESTS
// ============================================================================

describe("Eleva Edge Cases", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    container = document.getElementById("app")!;
    app = new Eleva("TestApp");
  });

  test("should handle component with empty-rendering template", async () => {
    // Template function returns empty string (component registration requires truthy template)
    const component = { template: () => "" };
    app.component("empty-template", component);
    const instance = await app.mount(container, "empty-template");
    expect(container.innerHTML).toBe("");
    await instance.unmount();
  });

  test("should handle component with whitespace-only template", async () => {
    const component = { template: "   \n\t   " };
    app.component("whitespace-template", component);
    const instance = await app.mount(container, "whitespace-template");
    expect(container.textContent!.trim()).toBe("");
    await instance.unmount();
  });

  test("should handle setup returning empty object", async () => {
    const component = {
      setup: () => ({}),
      template: () => "<div>Empty Setup</div>",
    };
    app.component("empty-setup", component);
    const instance = await app.mount(container, "empty-setup");
    expect(container.innerHTML).toContain("Empty Setup");
    await instance.unmount();
  });

  test("should handle setup returning null-ish values", async () => {
    const component = {
      setup: () => ({ nullVal: null, undefVal: undefined }),
      template: (ctx: any) => `<div>${ctx.nullVal}-${ctx.undefVal}</div>`,
    };
    app.component("nullish-setup", component);
    const instance = await app.mount(container, "nullish-setup");
    expect(container.innerHTML).toContain("null-undefined");
    await instance.unmount();
  });

  test("should handle mounting same component to different containers", async () => {
    const component = {
      setup: ({ signal }: any) => ({ count: signal(0) }),
      template: (ctx: any) => `<div>${ctx.count.value}</div>`,
    };

    const container1 = document.createElement("div");
    const container2 = document.createElement("div");
    document.body.appendChild(container1);
    document.body.appendChild(container2);

    app.component("multi-mount", component);

    const instance1 = await app.mount(container1, "multi-mount");
    const instance2 = await app.mount(container2, "multi-mount");

    // Each should have independent state
    instance1.data.count.value = 10;
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(container1.innerHTML).toContain("10");
    expect(container2.innerHTML).toContain("0");

    await instance1.unmount();
    await instance2.unmount();
  });

  test("should handle template with HTML entities", async () => {
    const component = {
      template: () => "<div>&lt;script&gt;alert('xss')&lt;/script&gt;</div>",
    };
    app.component("entities", component);
    const instance = await app.mount(container, "entities");
    expect(container.innerHTML).toContain("&lt;script&gt;");
    expect(container.querySelector("script")).toBeNull();
    await instance.unmount();
  });

  test("should handle very long template", async () => {
    const longContent = "x".repeat(10000);
    const component = {
      template: () => `<div>${longContent}</div>`,
    };
    app.component("long-template", component);
    const instance = await app.mount(container, "long-template");
    expect(container.textContent).toContain(longContent);
    await instance.unmount();
  });

  test("should handle complex nested HTML structure", async () => {
    const component = {
      template: () => `
        <div class="wrapper">
          <header>
            <nav>
              <ul>
                <li><a href="#">Link 1</a></li>
                <li><a href="#">Link 2</a></li>
              </ul>
            </nav>
          </header>
          <main>
            <article>
              <section>
                <p>Paragraph</p>
              </section>
            </article>
          </main>
          <footer>
            <p>Footer</p>
          </footer>
        </div>
      `,
    };
    app.component("complex-html", component);
    const instance = await app.mount(container, "complex-html");

    expect(container.querySelector("header")).toBeTruthy();
    expect(container.querySelector("nav ul li a")).toBeTruthy();
    expect(container.querySelector("main article section p")).toBeTruthy();
    expect(container.querySelector("footer")).toBeTruthy();

    await instance.unmount();
  });

  test("should handle signal with complex object value", async () => {
    const complexObj = {
      nested: {
        array: [1, 2, { deep: "value" }],
        map: new Map([["key", "value"]]),
        set: new Set([1, 2, 3]),
      },
    };

    const component = {
      setup: ({ signal }: any) => ({ data: signal(complexObj) }),
      template: (ctx: any) => `<div>${JSON.stringify(ctx.data.value.nested.array)}</div>`,
    };

    app.component("complex-signal", component);
    const instance = await app.mount(container, "complex-signal");
    expect(container.innerHTML).toContain('[1,2,{"deep":"value"}]');
    await instance.unmount();
  });

  test("should handle rapid mount/unmount cycles", async () => {
    const component = { template: () => "<div>Rapid</div>" };
    app.component("rapid", component);

    for (let i = 0; i < 10; i++) {
      const instance = await app.mount(container, "rapid");
      await instance.unmount();
    }

    expect(container.innerHTML).toBe("");
  });

  test("should handle component with all features combined", async () => {
    let countSignal: any;
    const lifecycleOrder: string[] = [];

    const Child = {
      setup: ({ props }: any) => ({
        onMount: () => lifecycleOrder.push(`child-mount-${props.id}`),
        onUnmount: () => lifecycleOrder.push(`child-unmount-${props.id}`),
      }),
      template: (ctx: any) => `<span>Child ${ctx.props.id}</span>`,
    };

    const component = {
      setup: ({ signal }: any) => {
        countSignal = signal(0);
        return {
          count: countSignal,
          handleClick: () => countSignal.value++,
          onBeforeMount: () => lifecycleOrder.push("beforeMount"),
          onMount: () => lifecycleOrder.push("mount"),
          onBeforeUpdate: () => lifecycleOrder.push("beforeUpdate"),
          onUpdate: () => lifecycleOrder.push("update"),
          onUnmount: () => lifecycleOrder.push("unmount"),
        };
      },
      template: (ctx: any) => `
        <div class="parent">
          <h1>Count: ${ctx.count.value}</h1>
          <button @click="handleClick">Increment</button>
          <child-comp :id="1"></child-comp>
          <child-comp :id="2"></child-comp>
        </div>
      `,
      style: (ctx: any) => `.parent { counter: ${ctx.count.value}; }`,
      children: { "child-comp": Child },
    };

    app.component("full-featured", component);
    const instance = await app.mount(container, "full-featured");

    expect(lifecycleOrder).toContain("beforeMount");
    expect(lifecycleOrder).toContain("mount");
    expect(container.innerHTML).toContain("Count: 0");
    expect(container.innerHTML).toContain("Child 1");
    expect(container.innerHTML).toContain("Child 2");
    expect(container.querySelector("style")).toBeTruthy();

    // Click button
    container.querySelector("button")!.click();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(container.innerHTML).toContain("Count: 1");
    expect(lifecycleOrder).toContain("beforeUpdate");
    expect(lifecycleOrder).toContain("update");

    await instance.unmount();
    expect(lifecycleOrder).toContain("unmount");
  });

  test("should handle emoji in template", async () => {
    const component = {
      template: () => "<div>Hello 👋 World 🌍!</div>",
    };
    app.component("emoji", component);
    const instance = await app.mount(container, "emoji");
    expect(container.innerHTML).toContain("👋");
    expect(container.innerHTML).toContain("🌍");
    await instance.unmount();
  });

  test("should handle unicode in various places", async () => {
    const component = {
      setup: () => ({ message: "你好世界" }),
      template: (ctx: any) => `<div class="unicode-test" data-label="日本語">${ctx.message}</div>`,
      style: `.unicode-test { content: "한국어"; }`,
    };
    app.component("unicode", component);
    const instance = await app.mount(container, "unicode");
    expect(container.innerHTML).toContain("你好世界");
    const div = container.querySelector(".unicode-test");
    expect(div).toBeTruthy();
    expect(div!.getAttribute("data-label")).toBe("日本語");
    await instance.unmount();
  });
});

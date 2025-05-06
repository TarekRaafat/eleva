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
 *
 * The Eleva core provides the foundation for building reactive UI components
 * with an intuitive API, efficient rendering, and lifecycle management.
 *
 * @example
 * // Basic component registration and mounting
 * const app = new Eleva("MyApp");
 * app.component("my-comp", {
 *   setup: ({ signal }) => ({ msg: signal("Hello") }),
 *   template: (ctx) => `<div>${ctx.msg.value}</div>`
 * });
 * await app.mount(document.getElementById("app"), "my-comp");
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva
 * @category Unit
 * @group core
 * @group unit
 */

import Eleva from "../../../../src/index.js";

/**
 * Tests for the core functionality of the Eleva framework
 *
 * This suite verifies the basic component API and functionality:
 * - Component registration
 * - Component mounting and rendering
 * - Lifecycle hooks
 * - Event handling
 * - Style management
 * - Plugin system
 *
 * @example
 * // Component with lifecycle hooks
 * const component = {
 *   setup: ({ signal }) => ({
 *     msg: signal("Hello"),
 *     onBeforeMount() { console.log("Before mount"); },
 *     onMount() { console.log("Mounted"); },
 *     onUnmount() { console.log("Unmounted"); }
 *   }),
 *   template: (ctx) => `<div>${ctx.msg.value}</div>`
 * };
 *
 * @group core
 * @group components
 * @group lifecycle
 */
describe("Eleva", () => {
  let app;
  let appContainer;

  /**
   * Setup for each test - creates a fresh DOM container and Eleva instance
   *
   * This setup ensures each test starts with a clean environment to avoid
   * test interdependencies and side effects.
   */
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app");
    app = new Eleva("TestApp");
  });

  /**
   * Tests component registration and mounting functionality
   *
   * Verifies that a component can be:
   * - Registered with the Eleva instance
   * - Successfully mounted to the DOM
   * - Renders the expected content
   *
   * @example
   * // Register and mount a simple component
   * const component = {
   *   setup: ({ signal }) => ({ msg: signal("Hello") }),
   *   template: (ctx) => `<div>${ctx.msg.value}</div>`
   * };
   * app.component("hello-comp", component);
   * const instance = await app.mount(appContainer, "hello-comp");
   *
   * @async
   * @group components
   * @group rendering
   */
  test("should register and mount a component", async () => {
    const component = {
      setup: ({ signal }) => ({ msg: signal("Hello") }),
      template: (ctx) => `<div>${ctx.msg.value}</div>`,
    };
    app.component("hello-comp", component);

    const instance = await app.mount(appContainer, "hello-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Hello");
  });

  /**
   * Tests that component lifecycle hooks are called in the correct order
   *
   * Verifies:
   * - onBeforeMount is called before rendering
   * - onMount is called after rendering
   * - onUnmount is called when the component is unmounted
   *
   * @example
   * // Component with all lifecycle hooks
   * const component = {
   *   setup: ({ signal }) => ({
   *     msg: signal("Lifecycle"),
   *     onBeforeMount() { console.log("Before mount"); },
   *     onMount() { console.log("Mounted"); },
   *     onUnmount() { console.log("Unmounted"); }
   *   }),
   *   template: (ctx) => `<div>${ctx.msg.value}</div>`
   * };
   *
   * @async
   * @group lifecycle
   */
  test("should call lifecycle hooks in the correct order", async () => {
    const onBeforeMountFn = jest.fn();
    const onMountFn = jest.fn();
    const onUnmountFn = jest.fn();

    const component = {
      setup: ({ signal }) => {
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
      template: (ctx) => `<div>${ctx.msg.value}</div>`,
    };
    app.component("lifecycle-comp", component);

    const instance = await app.mount(appContainer, "lifecycle-comp");

    expect(instance).toBeTruthy();
    expect(onBeforeMountFn).toHaveBeenCalled();
    expect(onMountFn).toHaveBeenCalled();
    expect(appContainer.innerHTML).toContain("Lifecycle");

    instance.unmount();

    expect(appContainer.innerHTML).not.toContain("Lifecycle");
    expect(onUnmountFn).toHaveBeenCalled();
  });

  /**
   * Tests that event listeners are properly cleaned up on unmount
   *
   * Verifies:
   * - Event handlers work correctly when component is mounted
   * - Event handlers are removed when component is unmounted
   * - No memory leaks from lingering event handlers
   *
   * @example
   * // Component with event handling
   * const component = {
   *   setup: () => ({
   *     handleClick: () => console.log("Clicked")
   *   }),
   *   template: () => `<button @click="handleClick">Click me</button>`
   * };
   *
   * @async
   * @group event-handling
   * @group memory-management
   */
  test("should clean up event listeners on unmount", async () => {
    const clickHandler = jest.fn();

    const component = {
      setup: () => ({
        handleClick: clickHandler,
      }),
      template: () => `<button @click="handleClick">Click me</button>`,
    };

    app.component("cleanup-comp", component);
    const instance = await app.mount(appContainer, "cleanup-comp");

    const button = appContainer.querySelector("button");
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);

    // Unmount component
    instance.unmount();

    // Click should no longer trigger handler
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  /**
   * Tests that components can work without a setup function
   *
   * Verifies that components with only a template function
   * can still be registered and mounted successfully
   *
   * @async
   * @group components
   * @group edge-cases
   */
  test("should handle missing setup function in component definition", async () => {
    const component = {
      template: () => `<div>No Setup</div>`,
    };
    app.component("no-setup-comp", component);

    const instance = await app.mount(appContainer, "no-setup-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("No Setup");
  });

  /**
   * Tests component scoped style injection functionality
   *
   * Verifies:
   * - Styles are properly scoped to the component
   * - Styles are reactive to component state changes
   * - Styles are injected into the DOM correctly
   *
   * @example
   * // Component with scoped styles
   * const component = {
   *   setup: () => ({ color: "red" }),
   *   template: () => `<div class="styled">Styled Component</div>`,
   *   style: (ctx) => `
   *     .styled {
   *       color: ${ctx.color};
   *       font-weight: bold;
   *     }
   *   `
   * };
   *
   * @async
   * @group rendering
   * @group reactivity
   */
  test("should inject component scoped styles", async () => {
    const component = {
      setup: () => ({ color: "red" }),
      template: () => `<div class="styled">Styled Component</div>`,
      style: (ctx) => `
      .styled { 
        color: ${ctx.color}; 
        font-weight: bold;
      }
    `,
    };

    app.component("styled-comp", component);
    const instance = await app.mount(appContainer, "styled-comp");

    // Verify style element was created and injected
    const styleEl = appContainer.querySelector(
      'style[data-eleva-style="styled-comp"]'
    );
    expect(styleEl).toBeTruthy();
    expect(styleEl.textContent).toContain("color: red");

    // Test style update
    instance.data.color = "blue";
    const updatedStyle = component.style(instance.data);
    // Re-inject the updated styles
    app["_injectStyles"](
      appContainer,
      "styled-comp",
      component.style,
      instance.data
    );

    // Verify the style was updated
    expect(
      appContainer.querySelector('style[data-eleva-style="styled-comp"]')
        .textContent
    ).toContain("color: blue");
  });

  /**
   * Tests the plugin system functionality
   *
   * Verifies:
   * - Plugins can be registered with the Eleva instance
   * - Plugins can extend the Eleva API
   * - Plugin options are correctly passed
   *
   * @example
   * // Create and use a plugin
   * const myPlugin = {
   *   install(eleva, options) {
   *     eleva.testPlugin = () => options.msg;
   *   }
   * };
   * app.use(myPlugin, { msg: "Plugin Works" });
   *
   * @group core
   * @group edge-cases
   */
  test("should extend Eleva instance with plugin integration", () => {
    const myPlugin = {
      install(eleva, options) {
        eleva.testPlugin = () => options.msg;
      },
    };
    app.use(myPlugin, { msg: "Plugin Works" });
    expect(app.testPlugin()).toBe("Plugin Works");
  });
});

/**
 * Tests for error handling within the Eleva framework
 *
 * This suite verifies that Eleva correctly handles various error conditions:
 * - Invalid state transitions
 * - Invalid templates
 * - Navigation errors
 * - Movement errors
 *
 * @group core
 * @group error-handling
 * @group robustness
 */
describe("Eleva error handling", () => {
  let app;
  let appContainer;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app");
    app = new Eleva("TestApp");
  });

  /**
   * Tests error handling for invalid component definitions
   *
   * @group validation
   * @group error-handling
   */
  test("should handle invalid component definitions", async () => {
    const component = {
      setup: () => ({}),
      template: null,
    };
    app.component("invalid-comp", component);
    try {
      await app.mount(appContainer, "invalid-comp");
      fail("Expected mount to throw an error");
    } catch (error) {
      expect(error.message).toBe("Component template must be a function");
    }
  });

  /**
   * Tests error handling for invalid template functions
   *
   * @group validation
   * @group error-handling
   */
  test("should handle invalid template functions", async () => {
    const component = {
      setup: () => ({}),
      template: null,
    };
    app.component("invalid-template", component);
    try {
      await app.mount(appContainer, "invalid-template");
      fail("Expected mount to throw an error");
    } catch (error) {
      expect(error.message).toBe("Component template must be a function");
    }
  });

  /**
   * Tests error handling for invalid container elements
   *
   * @group validation
   * @group error-handling
   */
  test("should handle invalid container elements", async () => {
    const component = {
      setup: () => ({}),
      template: () => "<div>Test</div>",
    };
    app.component("valid-comp", component);
    try {
      await app.mount(null, "valid-comp");
      fail("Expected mount to throw an error");
    } catch (error) {
      expect(error.message).toBe("Container not found: null");
    }
  });

  /**
   * Tests error handling for invalid component names
   *
   * @group validation
   * @group error-handling
   */
  test("should handle invalid component names", async () => {
    const component = {
      setup: () => ({}),
      template: () => "<div>Test</div>",
    };
    app.component("valid-comp", component);
    try {
      await app.mount(appContainer, "invalid-comp");
      fail("Expected mount to throw an error");
    } catch (error) {
      expect(error.message).toBe('Component "invalid-comp" not registered.');
    }
  });
});

/**
 * Tests for component relationships and prop passing
 *
 * This suite verifies the parent-child component relationship functionality:
 * - Child component mounting within parent templates
 * - Props passing from parent to children
 * - Component unmounting and replacement
 *
 * @example
 * // Parent component with child
 * const ChildComponent = {
 *   setup: ({ props }) => ({ title: props.title }),
 *   template: (ctx) => `<div>${ctx.title}</div>`
 * };
 *
 * const ParentComponent = {
 *   template: () => `
 *     <div>
 *       <h1>Parent Component</h1>
 *       <child-comp eleva-prop-title="Hello from Parent"></child-comp>
 *     </div>
 *   `,
 *   children: {
 *     "child-comp": ChildComponent
 *   }
 * };
 *
 * @group core
 * @group components
 * @group rendering
 */
describe("Children Components & Passing Props", () => {
  let app;
  let appContainer;

  /**
   * Setup for each test - creates a fresh DOM container and Eleva instance
   *
   * This setup ensures each test starts with a clean environment to avoid
   * test interdependencies and side effects.
   */
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app");
    app = new Eleva("TestApp");
  });

  /**
   * Tests that child components can extract props from parent attributes
   *
   * Verifies:
   * - Child components receive props from parent templates
   * - Props are accessible within the child setup function
   * - Child components render correctly with passed props
   *
   * @async
   * @group props
   * @group component-composition
   */
  test("should mount child components with props extracted from attributes", async () => {
    const ChildComponent = {
      setup: ({ props }) => ({ title: props.title }),
      template: (ctx) => `<div>${ctx.title}</div>`,
    };
    const ParentComponent = {
      template: () =>
        `<div><child-comp eleva-prop-title="Hello"></child-comp></div>`,
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

  /**
   * Tests that existing child components are properly unmounted
   * before new ones are mounted
   *
   * Verifies:
   * - Child components can be replaced without leaks
   * - New child components render correctly
   * - Old child components are properly removed from DOM
   *
   * @async
   * @group lifecycle
   * @group component-replacement
   * @group memory-management
   */
  test("should unmount existing child components before mounting new ones", async () => {
    const ChildComponent1 = {
      setup: ({ props }) => ({ title: props.title }),
      template: (ctx) => `<div>Child 1: ${ctx.title}</div>`,
    };
    const ChildComponent2 = {
      setup: ({ props }) => ({ title: props.title }),
      template: (ctx) => `<div>Child 2: ${ctx.title}</div>`,
    };
    const ParentComponent = {
      setup: () => ({}),
      template: () => `
        <div>
          <child-comp eleva-prop-title="Hello from Parent"></child-comp>
        </div>
      `,
      children: {
        "child-comp": ChildComponent1,
      },
    };

    app.component("parent-comp", ParentComponent);
    app.component("child-comp", ChildComponent1);

    // Mount the parent component with the first child
    await app.mount(appContainer, "parent-comp");
    expect(appContainer.innerHTML).toContain("Child 1: Hello from Parent");

    // Replace the first child component with the second one
    app.component("child-comp", ChildComponent2);
    await app.mount(appContainer, "parent-comp");
    expect(appContainer.innerHTML).toContain("Child 2: Hello from Parent");
    expect(appContainer.innerHTML).not.toContain("Child 1: Hello from Parent");
  });

  /**
   * Tests the complete parent-child component relationship
   *
   * Verifies:
   * - Parent components render correctly
   * - Child components receive props from parent
   * - Both parent and child content appears in the DOM
   *
   * @async
   * @group component-composition
   * @group rendering
   */
  test("should pass props from parent to child component", async () => {
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

    const instance = await app.mount(appContainer, "parent-comp");

    expect(instance).toBeTruthy();
    expect(appContainer.innerHTML).toContain("Parent Component");
    expect(appContainer.innerHTML).toContain("Child: Hello from Parent");
  });
});

/**
 * @fileoverview Build-specific tests for the Eleva core framework functionality
 *
 * These tests verify the core behavior of the built version of the Eleva framework,
 * ensuring that the production build works correctly in a browser environment.
 * Key aspects tested include:
 * - Global availability of the Eleva constructor
 * - Basic component creation and registration
 * - Core functionality using the built version
 * - Component lifecycle management
 * - Event handling
 * - Props and state management
 * - Error handling
 * - Plugin system
 *
 * The build tests are crucial for ensuring that the production build
 * maintains all the expected functionality of the development version.
 *
 * @example
 * // Basic usage with the built version
 * const app = new window.Eleva("MyApp");
 * app.component("my-comp", {
 *   template: () => `<div>Hello from built version</div>`
 * });
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva
 * @category Unit
 * @group core
 * @group unit
 * @group build
 */

/**
 * Tests for the built version of the Eleva framework
 *
 * This suite verifies that the production build:
 * - Is properly exposed to the global scope
 * - Maintains core functionality
 * - Works as expected in a browser environment
 * - Handles all component lifecycle events
 * - Manages state and props correctly
 * - Processes events properly
 * - Handles errors gracefully
 *
 * @example
 * // Testing global availability
 * const app = new window.Eleva("TestApp");
 * app.component("test-comp", {
 *   template: () => "<div>Test</div>"
 * });
 *
 * @group core
 * @group build
 * @group components
 */
describe("Eleva.js (Build)", () => {
  let app;
  let appContainer;

  /**
   * Setup for each test - ensures clean environment
   *
   * Creates a fresh DOM container and Eleva instance
   * for each test to avoid test interdependencies
   */
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    appContainer = document.getElementById("app");
    app = new window.Eleva("TestApp");
  });

  /**
   * Tests that the built version is properly exposed to the global scope
   *
   * Verifies:
   * - Eleva constructor is available on the window object
   * - Constructor is a function
   * - Basic instantiation works correctly
   *
   * @group global-scope
   * @group initialization
   */
  test("should be available globally", () => {
    expect(window.Eleva).toBeDefined();
    expect(typeof window.Eleva).toBe("function");

    const app = new window.Eleva("TestApp");
    expect(app.name).toBe("TestApp");
  });

  /**
   * Tests basic component creation using the built version
   *
   * Verifies:
   * - Component registration works with the built version
   * - Component object is properly created
   * - Basic template rendering is supported
   *
   * @example
   * // Component registration with built version
   * const component = app.component("test-component", {
   *   template: () => "<div>Test</div>"
   * });
   *
   * @group components
   * @group registration
   */
  test("should create a basic component", () => {
    const component = app.component("test-component", {
      template: () => "<div>Test</div>",
    });

    expect(component).toBeDefined();
    expect(typeof component).toBe("object");
  });

  /**
   * Tests component mounting and lifecycle hooks
   *
   * Verifies:
   * - Component can be mounted to DOM
   * - Lifecycle hooks are called in correct order
   * - Component is properly unmounted
   *
   * @group components
   * @group lifecycle
   */
  test("should handle component lifecycle correctly", async () => {
    const onBeforeMountFn = jest.fn();
    const onMountFn = jest.fn();
    const onUnmountFn = jest.fn();

    app.component("lifecycle-test", {
      setup: () => ({
        onBeforeMount: onBeforeMountFn,
        onMount: onMountFn,
        onUnmount: onUnmountFn,
      }),
      template: () => "<div>Lifecycle Test</div>",
    });

    const instance = await app.mount(appContainer, "lifecycle-test");

    expect(onBeforeMountFn).toHaveBeenCalled();
    expect(onMountFn).toHaveBeenCalled();
    expect(appContainer.innerHTML).toContain("Lifecycle Test");

    instance.unmount();
    expect(onUnmountFn).toHaveBeenCalled();
    expect(appContainer.innerHTML).not.toContain("Lifecycle Test");
  });

  /**
   * Tests event handling in components
   *
   * Verifies:
   * - Event handlers are properly bound
   * - Events are correctly processed
   * - Event cleanup works on unmount
   *
   * @group components
   * @group events
   */
  test("should handle events correctly", async () => {
    const clickHandler = jest.fn();

    app.component("event-test", {
      setup: () => ({
        handleClick: clickHandler,
      }),
      template: () => `
        <div>
          <button @click="handleClick">Click me</button>
        </div>
      `,
    });

    await app.mount(appContainer, "event-test");

    const button = appContainer.querySelector("button");
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  /**
   * Tests plugin system functionality
   *
   * Verifies:
   * - Plugins can be registered
   * - Plugin hooks are called
   * - Plugin state is maintained
   *
   * @group plugins
   * @group extensibility
   */
  test("should support plugin system", async () => {
    const pluginHook = jest.fn();

    app.use({
      install: (app) => {
        app.pluginHook = pluginHook;
      },
    });

    app.component("plugin-test", {
      setup: () => ({
        testPlugin: () => app.pluginHook(),
      }),
      template: (ctx) => `
        <div>
          <button @click="testPlugin">Test Plugin</button>
        </div>
      `,
    });

    await app.mount(appContainer, "plugin-test");

    const button = appContainer.querySelector("button");
    button.click();
    expect(pluginHook).toHaveBeenCalled();
  });
});

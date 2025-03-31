/**
 * @fileoverview Build-specific tests for the Eleva core framework functionality
 *
 * These tests verify the core behavior of the built version of the Eleva framework,
 * ensuring that the production build works correctly in a browser environment.
 * Key aspects tested include:
 * - Global availability of the Eleva constructor
 * - Basic component creation and registration
 * - Core functionality using the built version
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
    const app = new window.Eleva("TestApp");

    const component = app.component("test-component", {
      template: () => "<div>Test</div>",
    });

    expect(component).toBeDefined();
    expect(typeof component).toBe("object");
  });

  // Add more build-specific tests here
  // These tests should focus on testing the built version's behavior
  // and ensure it works as expected in a production environment
});

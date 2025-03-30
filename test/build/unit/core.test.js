/**
 * Build-specific tests for core functionality
 * These tests run against the built version of the library
 */

describe("Eleva.js (Build)", () => {
  // Test that the built version is available globally
  test("should be available globally", () => {
    expect(window.Eleva).toBeDefined();
    expect(typeof window.Eleva).toBe("function");

    const app = new window.Eleva("TestApp");
    expect(app.name).toBe("TestApp");
  });

  // Test basic functionality using the built version
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

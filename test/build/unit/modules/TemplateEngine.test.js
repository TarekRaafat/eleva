/**
 * @fileoverview Build-specific tests for the TemplateEngine module
 *
 * These tests verify the template processing capabilities in the built
 * version of Eleva, ensuring that the TemplateEngine maintains its
 * functionality in production:
 * - Template string processing
 * - Expression evaluation
 * - Dynamic content rendering
 * - Error handling
 * - Edge cases
 *
 * @example
 * // Basic template usage in production
 * const app = new window.Eleva("TestApp");
 * const component = app.component("template-test", {
 *   setup: ({ signal }) => ({
 *     name: signal("World")
 *   }),
 *   template: (ctx) => `<div>Hello ${ctx.name.value}!</div>`
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

describe("TemplateEngine (Build)", () => {
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
   * Tests basic template string processing
   *
   * Verifies:
   * - Simple variable interpolation
   * - Static content rendering
   * - Basic expressions
   *
   * @group templating
   * @group basics
   */
  test("should process basic template strings", async () => {
    app.component("basic-template", {
      setup: ({ signal }) => ({
        name: signal("World"),
        greeting: signal("Hello"),
      }),
      template: (ctx) => `
        <div id="message">${ctx.greeting.value} ${ctx.name.value}!</div>
      `,
    });

    await app.mount(appContainer, "basic-template");

    expect(appContainer.querySelector("#message").textContent.trim()).toBe(
      "Hello World!"
    );
  });

  /**
   * Tests complex expression evaluation
   *
   * Verifies:
   * - Mathematical operations
   * - Conditional expressions
   * - Function calls
   *
   * @group templating
   * @group expressions
   */
  test("should evaluate complex expressions", async () => {
    app.component("expression-test", {
      setup: ({ signal }) => ({
        count: signal(5),
        threshold: signal(10),
        multiply: (x) => x * 2,
      }),
      template: (ctx) => `
        <div>
          <span id="math">${ctx.multiply(ctx.count.value)}</span>
          <span id="condition">${ctx.count.value > ctx.threshold.value ? "High" : "Low"}</span>
        </div>
      `,
    });

    await app.mount(appContainer, "expression-test");

    expect(appContainer.querySelector("#math").textContent).toBe("10");
    expect(appContainer.querySelector("#condition").textContent).toBe("Low");
  });

  /**
   * Tests nested object and array access
   *
   * Verifies:
   * - Nested property access
   * - Array indexing
   * - Complex data structures
   *
   * @group templating
   * @group data-access
   */
  test("should handle nested objects and arrays", async () => {
    app.component("nested-test", {
      setup: ({ signal }) => ({
        user: signal({
          name: "John",
          profile: {
            age: 30,
            location: "New York",
          },
        }),
        items: signal(["apple", "banana", "orange"]),
      }),
      template: (ctx) => `
        <div>
          <div id="user">
            ${ctx.user.value.name} (${ctx.user.value.profile.age}) from ${ctx.user.value.profile.location}
          </div>
          <div id="items">
            ${ctx.items.value
              .map(
                (item, index) =>
                  `<span class="item" data-index="${index}">${item}</span>`
              )
              .join("")}
          </div>
        </div>
      `,
    });

    await app.mount(appContainer, "nested-test");

    const userEl = appContainer.querySelector("#user");
    expect(userEl.textContent.trim()).toContain("John (30) from New York");

    const items = appContainer.querySelectorAll(".item");
    expect(items.length).toBe(3);
    expect(items[0].textContent).toBe("apple");
  });

  /**
   * Tests conditional rendering
   *
   * Verifies:
   * - Conditional content display
   * - Toggle functionality
   * - Multiple conditions
   *
   * @group templating
   * @group conditionals
   */
  test("should handle conditional rendering", async () => {
    app.component("conditional-test", {
      setup: ({ signal }) => {
        const isVisible = signal(false);
        const count = signal(0);

        return {
          isVisible,
          count,
          toggle: function () {
            isVisible.value = !isVisible.value;
          },
          increment: function () {
            count.value++;
          },
        };
      },
      template: (ctx) => `
        <div>
          ${
            ctx.isVisible.value
              ? `
                <div id="content">
                  Count: ${ctx.count.value}
                  <span class="status">
                    ${
                      ctx.count.value === 0
                        ? "Zero"
                        : ctx.count.value < 5
                          ? "Low"
                          : "High"
                    }
                  </span>
                </div>
              `
              : ""
          }
          <button id="toggle" @click="toggle">Toggle</button>
          <button id="increment" @click="increment">Increment</button>
        </div>
      `,
    });

    await app.mount(appContainer, "conditional-test");

    expect(appContainer.querySelector("#content")).toBeNull();

    const toggleBtn = appContainer.querySelector("#toggle");
    toggleBtn.click();
    await Promise.resolve();

    expect(appContainer.querySelector("#content")).not.toBeNull();
    expect(appContainer.querySelector(".status").textContent.trim()).toBe(
      "Zero"
    );

    const incrementBtn = appContainer.querySelector("#increment");
    for (let i = 0; i < 5; i++) {
      incrementBtn.click();
    }
    await Promise.resolve();

    expect(appContainer.querySelector(".status").textContent.trim()).toBe(
      "High"
    );
  });

  /**
   * Tests error handling in templates
   *
   * Verifies:
   * - Invalid expression handling
   * - Undefined variable access
   * - Syntax error recovery
   *
   * @group templating
   * @group error-handling
   */
  test("should handle template errors gracefully", async () => {
    const errorHandler = jest.fn();
    window.onerror = errorHandler;

    app.component("error-template", {
      setup: ({ signal }) => {
        const shouldError = signal(false);

        return {
          shouldError,
          triggerError: function () {
            shouldError.value = true;
          },
        };
      },
      template: (ctx) => `
        <div>
          ${ctx.shouldError.value ? `${undefined.property}` : "Valid Content"}
          <button @click="triggerError">Trigger Error</button>
        </div>
      `,
    });

    await app.mount(appContainer, "error-template");

    const content = appContainer.textContent;
    expect(content).toContain("Valid Content");

    const button = appContainer.querySelector("button");
    button.click();
    await Promise.resolve();

    expect(errorHandler).toHaveBeenCalled();
  });
});

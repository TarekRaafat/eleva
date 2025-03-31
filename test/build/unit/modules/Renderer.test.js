/**
 * @fileoverview Build-specific tests for the Renderer module
 *
 * These tests verify the DOM manipulation and rendering capabilities
 * in the built version of Eleva, ensuring that the Renderer maintains
 * its functionality in production:
 * - Template rendering
 * - DOM updates and patching
 * - Attribute handling
 * - Event binding
 * - Component lifecycle integration
 *
 * @example
 * // Basic rendering in production
 * const app = new window.Eleva("TestApp");
 * const component = app.component("render-test", {
 *   template: () => `<div>Hello World</div>`
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

describe("Renderer (Build)", () => {
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
   * Tests basic template rendering
   *
   * Verifies:
   * - Template string rendering
   * - DOM node creation
   * - Content insertion
   *
   * @group rendering
   * @group templates
   */
  test("should render basic templates", async () => {
    app.component("basic-render", {
      template: () => `
        <div class="wrapper">
          <h1>Title</h1>
          <p>Content</p>
        </div>
      `,
    });

    await app.mount(appContainer, "basic-render");

    expect(appContainer.querySelector(".wrapper")).toBeTruthy();
    expect(appContainer.querySelector("h1").textContent).toBe("Title");
    expect(appContainer.querySelector("p").textContent).toBe("Content");
  });

  /**
   * Tests dynamic content rendering
   *
   * Verifies:
   * - Dynamic data interpolation
   * - Reactive updates
   * - DOM synchronization
   *
   * @group rendering
   * @group reactivity
   */
  test("should render dynamic content", async () => {
    app.component("dynamic-render", {
      setup: ({ signal }) => {
        const message = signal("Initial");

        return {
          message,
          updateMessage: function () {
            message.value = "Updated";
          },
        };
      },
      template: (ctx) => `
        <div>
          <p id="message">${ctx.message.value}</p>
          <button @click="updateMessage">Update</button>
        </div>
      `,
    });

    await app.mount(appContainer, "dynamic-render");

    const messageEl = appContainer.querySelector("#message");
    const button = appContainer.querySelector("button");

    expect(messageEl.textContent).toBe("Initial");

    button.click();
    await Promise.resolve();
    expect(messageEl.textContent).toBe("Updated");
  });

  /**
   * Tests attribute handling
   *
   * Verifies:
   * - Static attribute rendering
   * - Dynamic attribute updates
   * - Class and style bindings
   *
   * @group rendering
   * @group attributes
   */
  test("should handle attributes correctly", async () => {
    app.component("attribute-test", {
      setup: ({ signal }) => {
        const isActive = signal(false);

        return {
          isActive,
          toggleActive: function () {
            isActive.value = !isActive.value;
          },
        };
      },
      template: (ctx) => `
        <div 
          class="base ${ctx.isActive.value ? "active" : ""}"
          data-state="${ctx.isActive.value ? "active" : "inactive"}"
        >
          <button @click="toggleActive">Toggle</button>
        </div>
      `,
    });

    await app.mount(appContainer, "attribute-test");

    const div = appContainer.querySelector("div");
    const button = appContainer.querySelector("button");

    expect(div.classList.contains("active")).toBe(false);
    expect(div.dataset.state).toBe("inactive");

    button.click();
    await Promise.resolve();

    expect(div.classList.contains("active")).toBe(true);
    expect(div.dataset.state).toBe("active");
  });

  /**
   * Tests list rendering and updates
   *
   * Verifies:
   * - List item rendering
   * - Dynamic list updates
   * - Keyed item handling
   *
   * @group rendering
   * @group lists
   */
  test("should handle list rendering", async () => {
    app.component("list-test", {
      setup: ({ signal }) => {
        const items = signal([1, 2, 3]);

        return {
          items,
          addItem: function () {
            items.value = [...items.value, items.value.length + 1];
          },
        };
      },
      template: (ctx) => `
        <div>
          <ul>
            ${ctx.items.value
              .map(
                (item) => `
              <li key="${item}" id="item-${item}">${item}</li>
            `
              )
              .join("")}
          </ul>
          <button @click="addItem">Add Item</button>
        </div>
      `,
    });

    await app.mount(appContainer, "list-test");

    const button = appContainer.querySelector("button");

    expect(appContainer.querySelectorAll("li").length).toBe(3);

    button.click();
    await Promise.resolve();

    expect(appContainer.querySelectorAll("li").length).toBe(4);
    expect(appContainer.querySelector("#item-4")).toBeTruthy();
  });

  /**
   * Tests nested component rendering
   *
   * Verifies:
   * - Parent-child relationships
   * - Nested updates
   * - Event bubbling
   *
   * @group rendering
   * @group components
   */
  test("should handle nested components", async () => {
    const ChildComponent = {
      setup: ({ signal }) => {
        const count = signal(0);

        return {
          count,
          increment: function () {
            count.value++;
          },
        };
      },
      template: (ctx) => `
        <div class="child">
          <span id="count">${ctx.count.value}</span>
          <button @click="increment">Increment</button>
        </div>
      `,
    };

    app.component("parent", {
      template: () => `
        <div class="parent">
          <child></child>
        </div>
      `,
      children: { child: ChildComponent },
    });

    await app.mount(appContainer, "parent");

    const button = appContainer.querySelector("button");
    const countEl = appContainer.querySelector("#count");

    expect(countEl.textContent).toBe("0");

    button.click();
    await Promise.resolve();

    expect(countEl.textContent).toBe("1");
  });

  /**
   * Tests error handling in rendering
   *
   * Verifies:
   * - Invalid template handling
   * - Error recovery
   * - Component stability
   *
   * @group rendering
   * @group error-handling
   */
  test("should handle rendering errors gracefully", async () => {
    const errorHandler = jest.fn();
    window.onerror = errorHandler;

    app.component("error-test", {
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
          ${ctx.shouldError.value ? undefined.property : "Valid Content"}
          <button @click="triggerError">Trigger Error</button>
        </div>
      `,
    });

    await app.mount(appContainer, "error-test");

    const button = appContainer.querySelector("button");

    expect(() => button.click()).not.toThrow();
    await Promise.resolve();

    expect(errorHandler).toHaveBeenCalled();
  });
});

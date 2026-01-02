/**
 * Test utilities for Eleva.js tests (Bun)
 */

/**
 * Creates a fixture element in the DOM for testing
 * @param id - ID for the element
 * @param innerHTML - Initial HTML content
 * @returns The created element
 */
export function createFixture(id = "fixture", innerHTML = ""): HTMLElement {
  const fixture = document.createElement("div");
  fixture.setAttribute("id", id);
  fixture.innerHTML = innerHTML;
  document.body.appendChild(fixture);
  return fixture;
}

/**
 * Removes all fixture elements from the DOM
 */
export function cleanupFixtures(): void {
  const fixtures = document.querySelectorAll('[id^="fixture"]');
  fixtures.forEach((fixture) => {
    if (fixture.parentNode) {
      fixture.parentNode.removeChild(fixture);
    }
  });

  // Also clean up containers and store-test elements
  const containers = document.querySelectorAll('[id^="container"]');
  containers.forEach((container) => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  const storeTests = document.querySelectorAll('[id^="store-test"]');
  storeTests.forEach((el) => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
}

/**
 * Waits for all pending microtasks to complete
 */
export async function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates a component fixture for testing
 * @param options - Component options
 * @returns The component fixture
 */
export function createComponentFixture(options: {
  name?: string;
  setup?: (ctx: any) => any;
  template?: (ctx: any) => string;
  style?: (ctx: any) => string;
  [key: string]: any;
} = {}) {
  return {
    name: options.name || "test-component",
    setup: options.setup || (() => ({})),
    template: options.template || (() => "<div>Test Component</div>"),
    style: options.style,
    ...options,
  };
}

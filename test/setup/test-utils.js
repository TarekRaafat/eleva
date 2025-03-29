/**
 * Test utilities for Eleva.js tests
 */

/**
 * Creates a fixture element in the DOM for testing
 * @param {string} id - ID for the element
 * @param {string} [innerHTML=''] - Initial HTML content
 * @returns {HTMLElement} - The created element
 */
export function createFixture(id = "fixture", innerHTML = "") {
  const fixture = document.createElement("div");
  fixture.setAttribute("id", id);
  fixture.innerHTML = innerHTML;
  document.body.appendChild(fixture);
  return fixture;
}

/**
 * Removes all fixture elements from the DOM
 */
export function cleanupFixtures() {
  const fixtures = document.querySelectorAll('[id^="fixture"]');
  fixtures.forEach((fixture) => {
    if (fixture.parentNode) {
      fixture.parentNode.removeChild(fixture);
    }
  });
}

/**
 * Waits for all pending microtasks to complete
 * @returns {Promise<void>}
 */
export async function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Creates a component fixture for testing
 * @param {Object} options - Component options
 * @returns {Object} - The component fixture
 */
export function createComponentFixture(options = {}) {
  return {
    name: options.name || "test-component",
    setup: options.setup || (() => ({})),
    template: options.template || (() => "<div>Test Component</div>"),
    style: options.style,
    ...options,
  };
}

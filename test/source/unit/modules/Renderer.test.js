/**
 * @fileoverview Tests for the Renderer module of the Eleva framework
 *
 * These tests verify the DOM manipulation and rendering capabilities
 * of the Renderer module, including:
 * - DOM patching and updates
 * - Element attribute synchronization
 * - Node replacement and removal
 * - Keyed element handling
 * - Edge cases and error conditions
 *
 * The Renderer module provides the core DOM manipulation functionality
 * for the Eleva framework, ensuring efficient and correct updates to
 * the document structure.
 *
 * @example
 * // Basic DOM patching
 * const renderer = new Renderer();
 * const container = document.createElement("div");
 * renderer.patchDOM(container, "<p>New Content</p>");
 *
 * // Attribute synchronization
 * const oldEl = document.createElement("div");
 * const newEl = document.createElement("div");
 * newEl.setAttribute("data-test", "new");
 * renderer._updateAttributes(oldEl, newEl);
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/Renderer
 * @category Unit
 * @group modules
 * @group unit
 */

import { Renderer } from "../../../../src/modules/Renderer.js";

/**
 * Tests for the core functionality of the Renderer
 *
 * This suite verifies the fundamental rendering capabilities:
 * - DOM patching and updates
 * - Element attribute synchronization
 * - Node replacement and removal
 * - Keyed element handling
 *
 * These capabilities form the foundation of Eleva's efficient
 * DOM manipulation system.
 *
 * @example
 * // Complete rendering workflow
 * const renderer = new Renderer();
 * const container = document.createElement("div");
 *
 * // Initial render
 * renderer.patchDOM(container, "<div key='1'>Initial</div>");
 *
 * // Update with new content
 * renderer.patchDOM(container, "<div key='1'>Updated</div>");
 *
 * // Handle attribute changes
 * const oldEl = container.firstChild;
 * const newEl = document.createElement("div");
 * newEl.setAttribute("data-test", "new");
 * renderer._updateAttributes(oldEl, newEl);
 *
 * @group modules
 * @group rendering
 * @group dom
 */
describe("Renderer", () => {
  let container;
  let renderer;

  /**
   * Setup for each test - creates a fresh DOM container and Renderer instance
   *
   * This ensures each test starts with a clean environment to avoid
   * test interdependencies and side effects from prior DOM manipulations.
   */
  beforeEach(() => {
    container = document.createElement("div");
    renderer = new Renderer();
  });

  /**
   * Tests the patchDOM method correctly updates container content
   *
   * Verifies:
   * - Old content is removed
   * - New content is inserted
   *
   * The patchDOM method is the primary entry point for applying HTML string
   * updates to a DOM container, serving as the bridge between template rendering
   * and DOM updates.
   *
   * @group rendering
   * @group dom
   */
  test("should update container content when patching DOM", () => {
    container.innerHTML = "<p>Old</p>";
    renderer.patchDOM(container, "<p>New</p>");

    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });

  /**
   * Tests that element attributes are correctly synchronized
   *
   * Verifies:
   * - Attributes from the new element are applied to the old element
   * - Changes are correctly reflected in the DOM
   *
   * Attribute synchronization ensures that element properties like class, style,
   * and data attributes are updated efficiently when component state changes.
   *
   * @group rendering
   * @group dom
   */
  test("should sync element attributes correctly", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");
    oldEl.setAttribute("class", "to-remove");

    const newEl = document.createElement("div");
    newEl.setAttribute("data-test", "new");

    renderer._updateAttributes(oldEl, newEl);

    expect(oldEl.getAttribute("data-test")).toBe("new");
    expect(oldEl.hasAttribute("class")).toBe(false);
  });

  /**
   * Tests that element properties not in attributeToPropertyMap are updated
   *
   * Verifies:
   * - Properties are updated correctly
   * - Changes are reflected in the DOM
   *
   * @group rendering
   * @group dom
   */
  test("should update element properties not in attributeToPropertyMap", () => {
    const oldEl = document.createElement("div");
    oldEl.id = "oldValue"; // Set a valid DOM property directly.

    const newEl = document.createElement("div");
    newEl.setAttribute("id", "newValue"); // Add the attribute to the new element.

    renderer._updateAttributes(oldEl, newEl);

    // Verify that the DOM property on the old element is updated.
    expect(oldEl.id).toBe("newValue");
  });

  /**
   * Tests the diff method's node replacement functionality
   *
   * Verifies:
   * - Nodes are replaced correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   */
  test("should replace differing nodes", () => {
    container.innerHTML = `<div key="1">Old</div>`;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<div key="1">New</div>`;

    renderer._diff(container, tempContainer);

    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });

  /**
   * Tests handling of nodes with different types or names
   *
   * Verifies:
   * - Nodes are replaced correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   * @group edge-cases
   */
  test("should replace nodes with differing nodeType or nodeName", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = "<p>Old</p>";

    const newParent = document.createElement("div");
    newParent.innerHTML = "<span>New</span>";

    renderer._diff(oldParent, newParent);

    expect(oldParent.innerHTML).toBe("<span>New</span>");
  });

  /**
   * Tests handling of empty containers and newHtml
   *
   * Verifies:
   * - Empty containers are handled correctly
   * - New HTML is inserted correctly
   * - Content is properly removed when the new template is empty
   *
   * @group rendering
   * @group dom
   * @group edge-cases
   */
  test("should handle empty containers and newHtml", () => {
    // Test empty container
    const emptyContainer = document.createElement("div");
    renderer.patchDOM(emptyContainer, "");
    expect(emptyContainer.innerHTML).toBe("");

    // Test empty oldParent and populated newParent
    const container1 = document.createElement("div");
    const tempContainer1 = document.createElement("div");
    tempContainer1.innerHTML = `<p>New</p>`;
    renderer._diff(container1, tempContainer1);
    expect(container1.innerHTML).toBe(`<p>New</p>`);

    // Test empty newParent and populated oldParent
    const container2 = document.createElement("div");
    container2.innerHTML = `<p>Old</p>`;
    const tempContainer2 = document.createElement("div");
    renderer._diff(container2, tempContainer2);
    expect(container2.innerHTML).toBe("");
  });

  /**
   * Tests handling of identical nodes (fast path)
   *
   * Verifies:
   * - Identical nodes are handled efficiently
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   * @group optimization
   */
  test("should handle identical nodes (fast path)", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Same</p>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Same</p>";

    renderer._diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Same</p>");
  });

  /**
   * Tests appending and removing nodes
   *
   * Verifies:
   * - New nodes are appended correctly
   * - Old nodes are removed correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   */
  test("should handle appending and removing nodes", () => {
    // Test appending new nodes
    const container1 = document.createElement("div");
    container1.innerHTML = "<p>Old</p>";

    const tempContainer1 = document.createElement("div");
    tempContainer1.innerHTML = "<p>Old</p><span>New</span>";

    renderer._diff(container1, tempContainer1);

    expect(container1.innerHTML).toBe("<p>Old</p><span>New</span>");

    // Test removing old nodes
    const container2 = document.createElement("div");
    container2.innerHTML = "<p>Old</p><span>Remove</span>";

    const tempContainer2 = document.createElement("div");
    tempContainer2.innerHTML = "<p>Old</p>";

    renderer._diff(container2, tempContainer2);

    expect(container2.innerHTML).toBe("<p>Old</p>");
  });

  /**
   * Tests replacing nodes with differing keys
   *
   * Verifies:
   * - Nodes are replaced correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   */
  test("should replace nodes with differing keys", () => {
    const container = document.createElement("div");
    container.innerHTML = '<div key="1">Old</div>';

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = '<div key="2">New</div>';

    renderer._diff(container, tempContainer);

    expect(container.innerHTML).toBe('<div key="2">New</div>');
  });

  /**
   * Tests updating text content for text nodes
   *
   * Verifies:
   * - Text content is updated correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   */
  test("should update text content for text nodes", () => {
    const container = document.createElement("div");
    container.innerHTML = "Old Text";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "New Text";

    renderer._diff(container, tempContainer);

    expect(container.innerHTML).toBe("New Text");
  });

  /**
   * Tests handling of special properties and attributes
   *
   * Verifies:
   * - Special properties are handled correctly
   * - Boolean attributes are set properly
   * - ARIA attributes are handled correctly
   * - Data attributes are handled correctly
   *
   * @group rendering
   * @group dom
   * @group accessibility
   */
  test("should handle special properties and attributes", () => {
    const oldEl = document.createElement("input");
    const newEl = document.createElement("input");

    // Test value property
    newEl.setAttribute("value", "test");
    renderer._updateAttributes(oldEl, newEl);
    expect(oldEl.value).toBe("test");

    // Test boolean properties
    newEl.setAttribute("checked", "");
    newEl.setAttribute("disabled", "true");
    newEl.setAttribute("readOnly", "readOnly");
    newEl.setAttribute("multiple", "false");
    renderer._updateAttributes(oldEl, newEl);

    expect(oldEl.checked).toBe(true);
    expect(oldEl.disabled).toBe(true);
    expect(oldEl.readOnly).toBe(true);
    expect(oldEl.multiple).toBe(false);

    // Test ARIA attributes
    const oldDiv = document.createElement("div");
    const newDiv = document.createElement("div");

    newDiv.setAttribute("aria-label", "test label");
    newDiv.setAttribute("aria-hidden", "true");
    newDiv.setAttribute("aria-invalid-type", "spelling");

    renderer._updateAttributes(oldDiv, newDiv);

    expect(oldDiv.getAttribute("aria-label")).toBe("test label");
    expect(oldDiv.getAttribute("aria-hidden")).toBe("true");
    expect(oldDiv.getAttribute("aria-invalid-type")).toBe("spelling");

    // Test data attributes
    newDiv.setAttribute("data-test", "value");
    newDiv.setAttribute("data-custom", "custom");

    renderer._updateAttributes(oldDiv, newDiv);

    expect(oldDiv.dataset.test).toBe("value");
    expect(oldDiv.dataset.custom).toBe("custom");
  });

  /**
   * Tests error handling for invalid container in patchDOM
   *
   * Verifies:
   * - Error is thrown for non-HTMLElement container
   * - Error is thrown for non-string newHtml
   * - Error is caught and rethrown with appropriate message
   *
   * @group rendering
   * @group error-handling
   */
  test("should throw error for invalid container or newHtml in patchDOM", () => {
    const renderer = new Renderer();

    // Test invalid container
    expect(() => renderer.patchDOM(null, "<div>test</div>")).toThrow(
      "Container must be an HTMLElement"
    );

    // Test invalid newHtml
    expect(() => renderer.patchDOM(container, null)).toThrow(
      "newHtml must be a string"
    );

    // Test DOM operation failure
    Object.defineProperty(renderer._tempContainer, "innerHTML", {
      set: function (value) {
        throw new Error("Mock error");
      },
      configurable: true,
    });
    expect(() => renderer.patchDOM(container, "<div>test</div>")).toThrow(
      "Failed to patch DOM: Mock error"
    );
  });

  /**
   * Tests handling of deeply nested DOM structures
   *
   * Verifies:
   * - The diff algorithm correctly traverses and updates nested structures
   * - Changes at any level are properly applied
   *
   * @group rendering
   * @group dom
   * @group edge-cases
   */
  test("should handle deeply nested structures", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div class="wrapper">
        <div class="header">
          <h1>Title</h1>
          <nav>
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
          </nav>
        </div>
        <div class="content">
          <p>Content</p>
        </div>
      </div>
    `;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `
      <div class="wrapper">
        <div class="header">
          <h1>New Title</h1>
          <nav>
            <a href="#">New Link 1</a>
            <a href="#">New Link 2</a>
          </nav>
        </div>
        <div class="content">
          <p>New Content</p>
        </div>
      </div>
    `;

    renderer._diff(container, tempContainer);

    expect(container.innerHTML).toBe(tempContainer.innerHTML);
  });

  /**
   * Tests handling of nodes with _eleva_instance property
   *
   * Verifies:
   * - Nodes with _eleva_instance property are skipped during diffing
   * - Old nodes remain unchanged
   *
   * @group rendering
   * @group dom
   */
  test("should skip diffing nodes with _eleva_instance", () => {
    const oldParent = document.createElement("div");
    const oldNode = document.createElement("div");
    oldNode._eleva_instance = { some: "data" };
    oldParent.appendChild(oldNode);

    const newParent = document.createElement("div");
    const newNode = document.createElement("div");
    newNode.textContent = "New Content";
    newParent.appendChild(newNode);

    renderer._diff(oldParent, newParent);

    // The old node should remain unchanged because it has _eleva_instance
    expect(oldParent.firstChild).toBe(oldNode);
    expect(oldParent.firstChild.textContent).not.toBe("New Content");
  });

  /**
   * Tests handling of special style elements
   *
   * Verifies:
   * - <style data-e-style> nodes are not removed during diffing
   * - Special style elements are preserved during removal
   *
   * @group rendering
   * @group dom
   * @group coverage
   */
  test("should handle special style elements", () => {
    const container = document.createElement("div");
    const style = document.createElement("style");
    style.setAttribute("data-e-style", "");
    container.appendChild(style);

    const tempContainer = document.createElement("div"); // No style in new DOM

    renderer._diff(container, tempContainer);

    // The style element should still be present
    expect(container.querySelector("style[data-e-style]")).not.toBeNull();

    // Test direct removal
    renderer._removeNode(container, style);
    expect(container.querySelector("style[data-e-style]")).not.toBeNull();
  });

  /**
   * Tests handling of undefined nodes in diff
   *
   * Verifies:
   * - Undefined nodes are skipped in the diff process
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   * @group coverage
   */
  test("should handle undefined nodes in diff", () => {
    // Setup: oldParent has 3 children, newParent has 3 children with keys such that a move will mark one as undefined
    const oldParent = document.createElement("div");
    const a = document.createElement("div");
    a.setAttribute("key", "a");
    const b = document.createElement("div");
    b.setAttribute("key", "b");
    const c = document.createElement("div");
    c.setAttribute("key", "c");
    oldParent.appendChild(a);
    oldParent.appendChild(b);
    oldParent.appendChild(c);

    // New order: b, a, c (swap a and b)
    const newParent = document.createElement("div");
    const b2 = document.createElement("div");
    b2.setAttribute("key", "b");
    const a2 = document.createElement("div");
    a2.setAttribute("key", "a");
    const c2 = document.createElement("div");
    c2.setAttribute("key", "c");
    newParent.appendChild(b2);
    newParent.appendChild(a2);
    newParent.appendChild(c2);

    // This triggers the key map logic and will mark a node as undefined in the oldChildren array
    // The next iteration of the main loop will hit the skip undefined node branch
    expect(() => renderer._diff(oldParent, newParent)).not.toThrow();
    // The DOM should now match the new order (b, a, c)
    expect(oldParent.children[0].getAttribute("key")).toBe("b");
    expect(oldParent.children[1].getAttribute("key")).toBe("a");
    expect(oldParent.children[2].getAttribute("key")).toBe("c");
    expect(oldParent.children.length).toBe(3);
  });

  /**
   * Tests handling of different node types in patchNode
   *
   * Verifies:
   * - Nodes with different types are replaced correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   * @group coverage
   */
  test("should handle different node types in patchNode", () => {
    const parent = document.createElement("div");
    const oldNode = document.createElement("p");
    oldNode.textContent = "Old";
    parent.appendChild(oldNode);
    const newNode = document.createElement("span");
    newNode.textContent = "New";
    // Call _patchNode directly
    renderer._patchNode(oldNode, newNode);
    // The parent should now have a span, not a p
    expect(parent.firstChild.nodeName).toBe("SPAN");
    expect(parent.firstChild.textContent).toBe("New");
  });
});

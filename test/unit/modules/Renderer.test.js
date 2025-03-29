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
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/Renderer
 * @category Unit
 * @group modules
 * @group unit
 */

import { Renderer } from "../../../src/modules/Renderer.js";

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

    const newEl = document.createElement("div");
    newEl.setAttribute("data-test", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.getAttribute("data-test")).toBe("new");
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

    renderer.updateAttributes(oldEl, newEl);

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

    renderer.diff(container, tempContainer);

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

    renderer.diff(oldParent, newParent);

    expect(oldParent.innerHTML).toBe("<span>New</span>");
  });

  /**
   * Tests attribute removal functionality
   *
   * Verifies:
   * - Attributes are removed correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   */
  test("should remove attributes not present in new element", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");

    const newEl = document.createElement("div");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.hasAttribute("data-test")).toBe(false);
  });

  /**
   * Tests properties mapped from attributes
   *
   * Verifies:
   * - Properties are updated correctly
   * - Changes are reflected in the DOM
   *
   * @group rendering
   * @group dom
   */
  test("should update properties mapped from attributes", () => {
    const oldEl = document.createElement("input");
    oldEl.setAttribute("value", "old");

    const newEl = document.createElement("input");
    newEl.setAttribute("value", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.value).toBe("new");
  });

  /**
   * Tests handling of empty container and newHtml
   *
   * Verifies:
   * - Empty containers are handled correctly
   * - New HTML is inserted correctly
   *
   * @group rendering
   * @group dom
   * @group edge-cases
   */
  test("should handle empty container and newHtml", () => {
    const container = document.createElement("div");
    renderer.patchDOM(container, "");
    expect(container.innerHTML).toBe("");
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

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Same</p>");
  });

  /**
   * Tests appending new nodes when oldNode is missing
   *
   * Verifies:
   * - New nodes are appended correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   */
  test("should append new nodes when oldNode is missing", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Old</p>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Old</p><span>New</span>";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Old</p><span>New</span>");
  });

  /**
   * Tests removing old nodes when newNode is missing
   *
   * Verifies:
   * - Old nodes are removed correctly
   * - DOM structure is maintained
   *
   * @group rendering
   * @group dom
   */
  test("should remove old nodes when newNode is missing", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Old</p><span>Remove</span>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Old</p>";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Old</p>");
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

    renderer.diff(container, tempContainer);

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

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("New Text");
  });

  /**
   * Tests removal of attributes no longer present
   *
   * Verifies:
   * - Attributes in the old element are removed if not in the new element
   * - Multiple attributes are handled correctly
   *
   * This ensures complete synchronization of all attributes, not just
   * changed or added ones.
   *
   * @group attributes
   * @group removal
   * @group multiple-attributes
   */
  test("should remove attributes not present in new element", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");
    oldEl.setAttribute("class", "to-remove");

    const newEl = document.createElement("div");
    newEl.setAttribute("data-test", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.getAttribute("data-test")).toBe("new");
    expect(oldEl.hasAttribute("class")).toBe(false);
  });

  /**
   * Tests updating of mapped properties
   *
   * Verifies:
   * - Special properties like value on input elements are properly updated
   * - The attribute-to-property mapping works correctly
   *
   * This is critical for form elements where attributes and properties
   * have different behaviors and synchronization requirements.
   *
   * @group form-elements
   * @group special-properties
   * @group attribute-property-mapping
   */
  test("should update mapped properties", () => {
    const oldEl = document.createElement("input");
    oldEl.setAttribute("value", "old");

    const newEl = document.createElement("input");
    newEl.setAttribute("value", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.value).toBe("new");
  });

  /**
   * Tests handling of deeply nested DOM structures
   *
   * Verifies:
   * - The diff algorithm correctly traverses and updates nested structures
   * - Changes at any level are properly applied
   *
   * This ensures the diffing algorithm works correctly with complex
   * component hierarchies and deeply nested DOM trees.
   *
   * @group nested-structures
   * @group recursion
   * @group complex-dom
   */
  test("should handle deeply nested structures", () => {
    const container = document.createElement("div");
    container.innerHTML = `<div><p>Old</p></div>`;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<div><p>New</p></div>`;

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe(`<div><p>New</p></div>`);
  });

  /**
   * Tests handling of an empty old parent with content in the new parent
   *
   * Verifies:
   * - Content is properly added when the old container is empty
   *
   * This test ensures the renderer correctly handles the initial population
   * of previously empty containers.
   *
   * @group empty-container
   * @group initial-render
   * @group content-addition
   */
  test("should handle empty oldParent and populated newParent", () => {
    const container = document.createElement("div");

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<p>New</p>`;

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe(`<p>New</p>`);
  });

  /**
   * Tests handling of an empty new parent with content in the old parent
   *
   * Verifies:
   * - Content is properly removed when the new template is empty
   *
   * This test ensures the renderer correctly clears all content when
   * the new template is empty.
   *
   * @group content-clearing
   * @group empty-template
   * @group dom-cleanup
   */
  test("should handle empty newParent and populated oldParent", () => {
    const container = document.createElement("div");
    container.innerHTML = `<p>Old</p>`;

    const tempContainer = document.createElement("div");

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("");
  });
});

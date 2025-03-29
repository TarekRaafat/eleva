/**
 * @fileoverview Tests for the Renderer module of the Eleva framework
 *
 * These tests verify the DOM rendering and diffing capabilities of the Renderer module, including:
 * - DOM patching and content updates
 * - Attribute synchronization
 * - Node diffing algorithm functionality
 * - Edge case handling
 *
 * The Renderer is responsible for efficiently updating the DOM by comparing
 * old and new DOM structures and applying minimal changes. This virtual DOM-inspired
 * approach provides optimal performance by reducing direct DOM manipulations,
 * which are typically expensive operations in web browsers.
 *
 * @author Tarek Raafat
 * @see {@link https://github.com/tarekraafat/eleva|Eleva.js Repository}
 * @requires module:eleva/modules/Renderer
 * @category Unit
 * @group modules
 * @group rendering
 * @group dom-manipulation
 */

import { Renderer } from "../../../src/modules/Renderer.js";

/**
 * Tests for the core functionality of the Renderer module
 *
 * This suite verifies the fundamental rendering capabilities:
 * - DOM patching
 * - Attribute synchronization
 * - Element diffing and updates
 *
 * The Renderer module is critical for Eleva's performance as it minimizes
 * actual DOM operations by intelligently updating only what has changed.
 *
 * @group modules
 * @group rendering
 * @group core-functionality
 */
describe("Renderer Module", () => {
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
   * Tests that the patchDOM method correctly updates container content
   *
   * Verifies:
   * - Old content is removed
   * - New content is inserted
   *
   * The patchDOM method is the primary entry point for applying HTML string
   * updates to a DOM container, serving as the bridge between template rendering
   * and DOM updates.
   *
   * @group dom-updates
   * @group html-patching
   */
  test("patchDOM updates container content", () => {
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
   * @group attributes
   * @group synchronization
   */
  test("updateAttributes syncs element attributes", () => {
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
   * - DOM properties are correctly updated even when not in the mapping
   * - Property updates take precedence over attribute values
   *
   * This ensures that standard DOM properties like id are properly updated
   * even when not explicitly mapped in the attributeToPropertyMap.
   *
   * @group attributes
   * @group properties
   * @group dom-api
   */
  test("updateAttributes updates element properties not in attributeToPropertyMap", () => {
    const oldEl = document.createElement("div");
    oldEl.id = "oldValue"; // Set a valid DOM property directly.

    const newEl = document.createElement("div");
    newEl.setAttribute("id", "newValue"); // Add the attribute to the new element.

    renderer.updateAttributes(oldEl, newEl);

    // Verify that the DOM property on the old element is updated.
    expect(oldEl.id).toBe("newValue");
  });

  /**
   * Tests that the diff method correctly replaces differing nodes
   *
   * Verifies:
   * - Nodes with the same key but different content are updated
   * - The DOM reflects these changes accurately
   *
   * This tests the core diffing algorithm that determines which DOM elements
   * can be reused and which need to be replaced for optimal performance.
   *
   * @group diffing
   * @group node-replacement
   * @group keyed-elements
   */
  test("diff method replaces differing nodes", () => {
    container.innerHTML = `<div key="1">Old</div>`;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<div key="1">New</div>`;

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });
});

/**
 * Tests for edge cases in the Renderer module
 *
 * This suite verifies how the Renderer handles various error conditions:
 * - Invalid states
 * - Missing templates
 * - Null elements
 * - Error handling in callbacks
 *
 * Robust error handling ensures the Renderer can gracefully handle unexpected
 * situations without crashing the application.
 *
 * @group modules
 * @group rendering
 * @group error-handling
 * @group robustness
 */
describe("Renderer edge cases", () => {
  /**
   * Tests handling of invalid render states
   *
   * Verifies:
   * - The renderer throws appropriate errors for invalid states
   *
   * Clear error messages for invalid states help developers identify
   * and fix issues during development.
   *
   * @group state-validation
   * @group error-detection
   */
  test("should handle invalid render states", () => {
    const renderer = new Renderer();
    renderer.state = "invalid";
    expect(() => renderer.render()).toThrow();
  });

  /**
   * Tests handling of template errors
   *
   * Verifies:
   * - The renderer throws appropriate errors for null templates
   *
   * This prevents silent failures when template content is missing or undefined.
   *
   * @group templates
   * @group null-handling
   * @group input-validation
   */
  test("should handle template errors", () => {
    const renderer = new Renderer();
    renderer.template = null;
    expect(() => renderer.process()).toThrow();
  });

  /**
   * Tests handling of missing elements
   *
   * Verifies:
   * - The renderer throws appropriate errors when target element is null
   *
   * This prevents attempts to update non-existent DOM elements, which would
   * otherwise cause runtime errors.
   *
   * @group dom-elements
   * @group null-handling
   * @group defensive-programming
   */
  test("should handle missing elements", () => {
    const renderer = new Renderer();
    renderer.element = null;
    expect(() => renderer.update()).toThrow();
  });

  /**
   * Tests handling of callback errors
   *
   * Verifies:
   * - The renderer properly handles errors in completion callbacks
   *
   * This ensures that errors in user-provided callbacks are properly caught
   * and don't silently fail or corrupt the rendering process.
   *
   * @group callbacks
   * @group error-propagation
   * @group user-code
   */
  test("should handle callback errors", () => {
    const renderer = new Renderer();
    const badCallback = () => {
      throw new Error();
    };
    expect(() => renderer.onComplete(badCallback)).toThrow();
  });
});

/**
 * Tests for the diff algorithm implementation in the Renderer
 *
 * This suite focuses specifically on the node diffing algorithm that compares
 * old and new DOM structures to determine the minimal set of changes required.
 *
 * The diffing algorithm is the heart of the Renderer's performance optimization,
 * allowing efficient updates by minimizing actual DOM operations.
 *
 * @group modules
 * @group rendering
 * @group diffing
 * @group algorithm
 */
describe("Renderer diff method", () => {
  let renderer;

  /**
   * Setup for each test - creates a fresh Renderer instance
   *
   * This ensures each test starts with a clean Renderer object with
   * no state carried over from previous tests.
   */
  beforeEach(() => {
    renderer = new Renderer();
  });

  /**
   * Tests replacement of nodes with different types or names
   *
   * Verifies:
   * - Nodes with different nodeType or nodeName are properly replaced
   * - The resulting DOM structure reflects these replacements
   *
   * This tests a fundamental diffing rule: elements of different types
   * must be replaced rather than updated.
   *
   * @group node-type
   * @group element-replacement
   */
  test("replaces nodes with differing nodeType or nodeName", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = "<p>Old</p>";

    const newParent = document.createElement("div");
    newParent.innerHTML = "<span>New</span>";

    renderer.diff(oldParent, newParent);

    expect(oldParent.innerHTML).toBe("<span>New</span>");
  });

  /**
   * Tests removal of attributes that are no longer present
   *
   * Verifies:
   * - Attributes in the old element not present in the new element are removed
   *
   * This ensures that when attributes are removed from elements in the new template,
   * they're also removed from the actual DOM during updates.
   *
   * @group attributes
   * @group cleanup
   * @group attribute-removal
   */
  test("removes attributes not present in new element", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");

    const newEl = document.createElement("div");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.hasAttribute("data-test")).toBe(false);
  });

  /**
   * Tests property updates from attribute mappings
   *
   * Verifies:
   * - Properties mapped from attributes are correctly updated
   * - The attributeToPropertyMap is correctly applied
   *
   * This tests the special case handling of attributes that need to be set
   * as properties on DOM elements for correct behavior, like value on inputs.
   *
   * @group attributes
   * @group properties
   * @group special-attributes
   */
  test("updates properties mapped from attributes", () => {
    const oldEl = document.createElement("input");
    oldEl.setAttribute("value", "old");

    const newEl = document.createElement("input");
    newEl.setAttribute("value", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.value).toBe("new");
  });
});

/**
 * Additional tests for comprehensive coverage of the Renderer module
 *
 * This suite provides additional test cases to ensure thorough coverage
 * of the Renderer's functionality, including optimizations, edge cases,
 * and special handling for different DOM structures.
 *
 * Complete coverage helps ensure that the Renderer behaves correctly
 * across all possible usage scenarios and DOM manipulation needs.
 *
 * @group modules
 * @group rendering
 * @group coverage
 * @group comprehensive
 */
describe("Renderer additional tests for full coverage", () => {
  let renderer;

  /**
   * Setup for each test - creates a fresh Renderer instance
   *
   * This ensures each test starts with a clean Renderer object with
   * no state carried over from previous tests.
   */
  beforeEach(() => {
    renderer = new Renderer();
  });

  /**
   * Tests handling of empty containers and content
   *
   * Verifies:
   * - Renderer handles empty input gracefully
   *
   * This ensures the Renderer can handle empty templates or clearing content
   * without errors or unexpected behavior.
   *
   * @group empty-content
   * @group edge-cases
   */
  test("patchDOM handles empty container and newHtml", () => {
    const container = document.createElement("div");
    renderer.patchDOM(container, "");
    expect(container.innerHTML).toBe("");
  });

  /**
   * Tests the fast path for identical nodes
   *
   * Verifies:
   * - No unnecessary DOM updates occur when nodes are identical
   * - The diff algorithm optimizes for unchanged content
   *
   * This optimization is crucial for performance when most of the DOM
   * hasn't changed between renders.
   *
   * @group optimization
   * @group performance
   * @group fast-path
   */
  test("diff handles identical nodes (fast path)", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Same</p>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Same</p>";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Same</p>");
  });

  /**
   * Tests appending of new nodes when old ones don't exist
   *
   * Verifies:
   * - New nodes are properly appended when not present in the old tree
   * - Existing nodes remain untouched
   *
   * This ensures new elements are correctly added to the DOM when
   * templates are expanded with additional content.
   *
   * @group node-addition
   * @group child-appending
   */
  test("diff appends new nodes when oldNode is missing", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Old</p>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Old</p><span>New</span>";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Old</p><span>New</span>");
  });

  /**
   * Tests removal of nodes that no longer exist in the new tree
   *
   * Verifies:
   * - Nodes present in the old tree but not in the new tree are removed
   * - Other nodes remain untouched
   *
   * This ensures elements are correctly removed from the DOM when
   * they're no longer present in the template.
   *
   * @group node-removal
   * @group cleanup
   * @group dom-pruning
   */
  test("diff removes old nodes when newNode is missing", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Old</p><span>Remove</span>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Old</p>";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Old</p>");
  });

  /**
   * Tests replacement based on differing keys
   *
   * Verifies:
   * - Nodes with different keys are correctly replaced
   * - The key attribute is used for efficient node matching
   *
   * Keys are essential for efficient list rendering and element reordering,
   * allowing the diffing algorithm to correctly identify corresponding elements.
   *
   * @group keyed-elements
   * @group optimization
   * @group element-identity
   */
  test("diff replaces nodes with differing keys", () => {
    const container = document.createElement("div");
    container.innerHTML = '<div key="1">Old</div>';

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = '<div key="2">New</div>';

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe('<div key="2">New</div>');
  });

  /**
   * Tests updates to text node content
   *
   * Verifies:
   * - Text nodes have their content properly updated
   * - Text-specific diffing works correctly
   *
   * Text nodes require special handling in the diffing algorithm since
   * they don't have attributes or children.
   *
   * @group text-nodes
   * @group content-updates
   * @group special-nodes
   */
  test("diff updates text content for text nodes", () => {
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
  test("updateAttributes removes attributes not present in new element", () => {
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
  test("updateAttributes updates mapped properties", () => {
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
  test("diff handles deeply nested structures", () => {
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
  test("diff handles empty oldParent and populated newParent", () => {
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
   * - Content is properly removed when the new container is empty
   *
   * This test ensures the renderer correctly clears all content when
   * the new template is empty.
   *
   * @group content-clearing
   * @group empty-template
   * @group dom-cleanup
   */
  test("diff handles empty newParent and populated oldParent", () => {
    const container = document.createElement("div");
    container.innerHTML = `<p>Old</p>`;

    const tempContainer = document.createElement("div");

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("");
  });
});

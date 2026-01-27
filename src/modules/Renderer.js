"use strict";

/**
 * @module eleva/renderer
 * @fileoverview High-performance DOM renderer with two-pointer diffing and keyed reconciliation.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// -----------------------------------------------------------------------------
// Data Types
// -----------------------------------------------------------------------------

/**
 * Map of key attribute values to their corresponding DOM nodes.
 * @typedef {Map<string, Node>} KeyMap
 * @description Enables O(1) lookup for keyed element reconciliation.
 */

// -----------------------------------------------------------------------------
// Interface Types
// -----------------------------------------------------------------------------

/**
 * Interface describing the public API of a Renderer.
 * @typedef {Object} RendererLike
 * @property {function(HTMLElement, string): void} patchDOM
 *           Patches the DOM with new HTML content.
 * @description
 * Plugins may extend renderer behavior by wrapping private methods (e.g., `_patchNode`),
 * but those hooks are not part of the public API.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Properties that can diverge from attributes after user interaction.
 * These are synchronized during DOM patching to ensure element state
 * matches the rendered HTML attributes.
 *
 * - `value`: Text input, textarea, select element values
 * - `checked`: Checkbox and radio button states
 * - `selected`: Option element selection states
 *
 * @private
 * @type {string[]}
 */
const SYNC_PROPS = ["value", "checked", "selected"];

/**
 * @class 🎨 Renderer
 * @classdesc A high-performance DOM renderer that implements an optimized two-pointer diffing
 * algorithm with key-based node reconciliation. The renderer efficiently updates the DOM by
 * computing the minimal set of operations needed to transform the current state to the desired state.
 *
 * Key features:
 * - Two-pointer diffing algorithm for efficient DOM updates
 * - Key-based node reconciliation for optimal list performance (O(1) lookup)
 * - Preserves DOM node identity during reordering (maintains event listeners, focus, animations)
 * - Intelligent attribute synchronization (skips Eleva event attributes)
 * - Preservation of Eleva-managed component instances and style elements
 *
 * @example
 * // Basic usage
 * const renderer = new Renderer();
 * renderer.patchDOM(container, '<div>Updated content</div>');
 *
 * @example
 * // With keyed elements for optimal list updates
 * const html = items.map(item => `<li key="${item.id}">${item.name}</li>`).join('');
 * renderer.patchDOM(listContainer, `<ul>${html}</ul>`);
 *
 * @example
 * // Keyed elements preserve DOM identity during reordering
 * // Before: [A, B, C] -> After: [C, A, B]
 * // The actual DOM nodes are moved, not recreated
 * renderer.patchDOM(container, '<div key="C">C</div><div key="A">A</div><div key="B">B</div>');
 *
 * @implements {RendererLike}
 */
export class Renderer {
  /**
   * Creates a new Renderer instance.
   * Initializes a reusable temporary container for HTML parsing.
   *
   * Performance: The temp container is reused across all patch operations,
   * minimizing memory allocation overhead (O(1) memory per Renderer instance).
   *
   * @public
   * @constructor
   *
   * @example
   * const renderer = new Renderer();
   */
  constructor() {
    /**
     * Temporary container for parsing new HTML content.
     * Reused across patch operations to minimize memory allocation.
     * @private
     * @type {HTMLDivElement}
     */
    this._tempContainer = document.createElement("div");
  }

  /**
   * Patches the DOM of the given container with the provided HTML string.
   * Uses an optimized two-pointer diffing algorithm to minimize DOM operations.
   * The algorithm computes the minimal set of insertions, deletions, and updates
   * needed to transform the current DOM state to match the new HTML.
   *
   * @public
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML string to render.
   * @returns {void}
   *
   * @example
   * // Simple content update
   * renderer.patchDOM(container, '<div class="updated">New content</div>');
   *
   * @example
   * // List with keyed items (optimal for reordering)
   * renderer.patchDOM(container, '<ul><li key="1">First</li><li key="2">Second</li></ul>');
   *
   * @example
   * // Empty the container
   * renderer.patchDOM(container, '');
   *
   * @see _diff - Low-level diffing algorithm.
   * @see _patchNode - Individual node patching.
   */
  patchDOM(container, newHtml) {
    this._tempContainer.innerHTML = newHtml;
    this._diff(container, this._tempContainer);
    // Clear tempContainer to release cloned source nodes for garbage collection.
    this._tempContainer.innerHTML = "";
  }

  /**
   * Performs a diff between two DOM nodes and patches the old node to match the new node.
   * Uses a two-pointer algorithm with key-based reconciliation for optimal performance.
   * This method modifies oldParent in-place - it is not a pure function.
   *
   * Algorithm details:
   * 1. Early exit if both nodes have no children (O(1) leaf node optimization)
   * 2. Convert NodeLists to arrays for indexed access
   * 3. Initialize two-pointer indices (oldStart/oldEnd, newStart/newEnd)
   * 4. While pointers haven't crossed:
   *    a. Skip null entries (from previous moves)
   *    b. If nodes match (same key+tag or same type+name): patch and advance
   *    c. On mismatch: lazily build key→node map for O(1) lookup
   *    d. If keyed match found: move existing node (preserves DOM identity)
   *    e. Otherwise: clone and insert new node
   * 5. After loop: append remaining new nodes or remove remaining old nodes
   *
   * Complexity: O(n) for most cases, O(n²) worst case with no keys.
   * Non-keyed elements are matched by position and tag name.
   *
   * @private
   * @param {Element} oldParent - The original DOM element to update (modified in-place).
   * @param {Element} newParent - The new DOM element with desired state.
   * @returns {void}
   */
  _diff(oldParent, newParent) {
    // Early exit for leaf nodes (no children)
    if (!oldParent.firstChild && !newParent.firstChild) return;

    const oldChildren = Array.from(oldParent.childNodes);
    const newChildren = Array.from(newParent.childNodes);
    let oldStart = 0,
      newStart = 0;
    let oldEnd = oldChildren.length - 1;
    let newEnd = newChildren.length - 1;
    let keyMap = null;

    // Two-pointer algorithm with key-based reconciliation
    while (oldStart <= oldEnd && newStart <= newEnd) {
      const oldNode = oldChildren[oldStart];
      const newNode = newChildren[newStart];

      if (!oldNode) {
        oldStart++;
        continue;
      }

      if (this._isSameNode(oldNode, newNode)) {
        this._patchNode(oldNode, newNode);
        oldStart++;
        newStart++;
      } else {
        // Build key map lazily for O(1) lookup
        if (!keyMap) {
          keyMap = this._createKeyMap(oldChildren, oldStart, oldEnd);
        }

        const key = this._getNodeKey(newNode);
        const matchedNode = key ? keyMap.get(key) : null;

        // Only use matched node if tag also matches
        if (matchedNode && matchedNode.nodeName === newNode.nodeName) {
          // Move existing keyed node (preserves DOM identity)
          this._patchNode(matchedNode, newNode);
          oldParent.insertBefore(matchedNode, oldNode);
          oldChildren[oldChildren.indexOf(matchedNode)] = null;
        } else {
          // Insert new node
          oldParent.insertBefore(newNode.cloneNode(true), oldNode);
        }
        newStart++;
      }
    }

    // Add remaining new nodes
    if (oldStart > oldEnd) {
      const refNode = newChildren[newEnd + 1] ? oldChildren[oldStart] : null;
      for (let i = newStart; i <= newEnd; i++) {
        if (newChildren[i]) {
          oldParent.insertBefore(newChildren[i].cloneNode(true), refNode);
        }
      }
    }
    // Remove remaining old nodes
    else if (newStart > newEnd) {
      for (let i = oldStart; i <= oldEnd; i++) {
        if (oldChildren[i]) this._removeNode(oldParent, oldChildren[i]);
      }
    }
  }

  /**
   * Patches a single node, updating its content and attributes to match the new node.
   * Handles text nodes (nodeType 3 / Node.TEXT_NODE) by updating nodeValue,
   * and element nodes (nodeType 1 / Node.ELEMENT_NODE) by updating attributes
   * and recursively diffing children.
   *
   * Skips nodes that are managed by Eleva component instances to prevent interference
   * with nested component state.
   *
   * @private
   * @param {Node} oldNode - The original DOM node to update.
   * @param {Node} newNode - The new DOM node with desired state.
   * @returns {void}
   */
  _patchNode(oldNode, newNode) {
    // Skip nodes managed by Eleva component instances
    if (oldNode._eleva_instance) return;

    if (oldNode.nodeType === 3) {
      if (oldNode.nodeValue !== newNode.nodeValue) {
        oldNode.nodeValue = newNode.nodeValue;
      }
    } else if (oldNode.nodeType === 1) {
      this._updateAttributes(oldNode, newNode);
      this._diff(oldNode, newNode);
    }
  }

  /**
   * Removes a node from its parent, with special handling for Eleva-managed elements.
   * Style elements with the `data-e-style` attribute are preserved to maintain
   * component styles across re-renders. Without this protection, component styles
   * would be removed during DOM diffing and lost until the next full re-render.
   *
   * @note Style tags persist for the component's entire lifecycle. If the template
   * conditionally removes elements that the CSS rules target (e.g., `.foo` elements),
   * the style rules remain but simply have no matching elements. This is expected
   * behavior - styles are cleaned up when the component unmounts, not when individual
   * elements are removed.
   *
   * @private
   * @param {HTMLElement} parent - The parent element containing the node.
   * @param {Node} node - The node to remove.
   * @returns {void}
   * @see _injectStyles - Where data-e-style elements are created.
   */
  _removeNode(parent, node) {
    // Preserve Eleva-managed style elements
    if (node.nodeName === "STYLE" && node.hasAttribute("data-e-style")) return;
    parent.removeChild(node);
  }

  /**
   * Updates the attributes of an element to match a new element's attributes.
   * Adds new attributes, updates changed values, and removes attributes no longer present.
   * Also syncs DOM properties that can diverge from attributes after user interaction.
   *
   * Processing order:
   * 1. Iterate new attributes, skip @ prefixed (event) attributes
   * 2. Update attribute if value changed
   * 3. Sync corresponding DOM property if writable (handles boolean conversion)
   * 4. Iterate old attributes in reverse, remove if not in new element
   * 5. Sync SYNC_PROPS (value, checked, selected) from new to old element
   *
   * @private
   * @param {Element} oldEl - The original element to update.
   * @param {Element} newEl - The new element with target attributes.
   * @returns {void}
   */
  _updateAttributes(oldEl, newEl) {
    // Add/update attributes from new element
    for (const attr of newEl.attributes) {
      // Skip event attributes (handled by Eleva's event system)
      if (attr.name[0] === "@") continue;

      if (oldEl.getAttribute(attr.name) !== attr.value) {
        oldEl.setAttribute(attr.name, attr.value);
      }

      // Sync property if it exists and is writable (handles value, checked, selected, disabled, etc.)
      if (attr.name in oldEl) {
        try {
          const newProp =
            typeof oldEl[attr.name] === "boolean"
              ? attr.value !== "false" // Attribute presence = true, unless explicitly "false"
              : attr.value;
          if (oldEl[attr.name] !== newProp) oldEl[attr.name] = newProp;
        } catch {
          continue; // Property is readonly
        }
      }
    }

    // Remove attributes no longer present
    for (let i = oldEl.attributes.length - 1; i >= 0; i--) {
      const name = oldEl.attributes[i].name;
      if (!newEl.hasAttribute(name)) {
        oldEl.removeAttribute(name);
      }
    }

    // Sync properties that can diverge from attributes via user interaction
    for (const prop of SYNC_PROPS) {
      if (prop in newEl && oldEl[prop] !== newEl[prop])
        oldEl[prop] = newEl[prop];
    }
  }

  /**
   * Determines if two nodes are the same for reconciliation purposes.
   * Two nodes are considered the same if:
   * - Both have keys: keys match AND tag names match
   * - Neither has keys: node types match AND node names match
   * - One has key, other doesn't: not the same
   *
   * This ensures keyed elements are only reused when both key and tag match,
   * preventing bugs like `<div key="a">` incorrectly matching `<span key="a">`.
   *
   * @private
   * @param {Node} oldNode - The first node to compare.
   * @param {Node} newNode - The second node to compare.
   * @returns {boolean} True if the nodes are considered the same for reconciliation.
   */
  _isSameNode(oldNode, newNode) {
    if (!oldNode || !newNode) return false;

    const oldKey = this._getNodeKey(oldNode);
    const newKey = this._getNodeKey(newNode);

    // If both have keys, compare by key AND tag name
    if (oldKey && newKey) {
      return oldKey === newKey && oldNode.nodeName === newNode.nodeName;
    }

    // Otherwise, compare by type and name
    return (
      !oldKey &&
      !newKey &&
      oldNode.nodeType === newNode.nodeType &&
      oldNode.nodeName === newNode.nodeName
    );
  }

  /**
   * Extracts the key attribute from a node if it exists.
   * Only element nodes (nodeType === 1) can have key attributes.
   * Uses optional chaining for null-safe access.
   *
   * @private
   * @param {Node | null | undefined} node - The node to extract the key from.
   * @returns {string | null} The key attribute value, or null if not an element or no key.
   */
  _getNodeKey(node) {
    return node?.nodeType === 1 ? node.getAttribute("key") : null;
  }

  /**
   * Creates a key map for efficient O(1) lookup of keyed elements during diffing.
   * The map is built lazily only when needed (when a mismatch occurs during diffing).
   *
   * @private
   * @param {ChildNode[]} children - The array of child nodes to map.
   * @param {number} start - The start index (inclusive) for mapping.
   * @param {number} end - The end index (inclusive) for mapping.
   * @returns {KeyMap} A Map of key strings to their corresponding DOM nodes.
   */
  _createKeyMap(children, start, end) {
    const map = new Map();
    for (let i = start; i <= end; i++) {
      const key = this._getNodeKey(children[i]);
      if (key) map.set(key, children[i]);
    }
    return map;
  }
}

"use strict";

/**
 * @class 🎨 Renderer
 * @classdesc A high-performance DOM renderer that implements an optimized direct DOM diffing algorithm.
 *
 * Key features:
 * - Single-pass diffing algorithm for efficient DOM updates
 * - Key-based node reconciliation for optimal performance
 * - Intelligent attribute handling for ARIA, data attributes, and boolean properties
 * - Preservation of special Eleva-managed instances and style elements
 * - Memory-efficient with reusable temporary containers
 *
 * The renderer is designed to minimize DOM operations while maintaining
 * exact attribute synchronization and proper node identity preservation.
 * It's particularly optimized for frequent updates and complex DOM structures.
 *
 * @example
 * const renderer = new Renderer();
 * const container = document.getElementById("app");
 * const newHtml = "<div>Updated content</div>";
 * renderer.patchDOM(container, newHtml);
 */
export class Renderer {
  /**
   * Creates a new Renderer instance.
   * @public
   */
  constructor() {
    /** @private {HTMLElement} Reusable temporary container for parsing new HTML */
    this._tempContainer = document.createElement("div");
  }

  /**
   * Patches the DOM of a container element with new HTML content.
   * @public
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML content to apply.
   * @returns {void}
   * @throws {TypeError} If container is not an HTMLElement or newHtml is not a string.
   * @throws {Error} If DOM patching fails.
   */
  patchDOM(container, newHtml) {
    if (!(container instanceof HTMLElement)) {
      throw new TypeError("Container must be an HTMLElement");
    }
    if (typeof newHtml !== "string") {
      throw new TypeError("newHtml must be a string");
    }

    try {
      this._tempContainer.innerHTML = newHtml;
      this._diff(container, this._tempContainer);
    } catch (error) {
      throw new Error(`Failed to patch DOM: ${error.message}`);
    }
  }

  /**
   * Diffs two DOM trees using a unified, single-pass reconciliation algorithm.
   * This method implements a key-based diffing strategy that efficiently updates
   * the DOM while preserving node identity and minimizing unnecessary operations.
   *
   * The algorithm uses a two-pointer approach with the following indices:
   * - oldStartIdx/newStartIdx: Track the current position from the start
   * - oldEndIdx/newEndIdx: Track the current position from the end
   *
   * The diffing process follows these steps:
   * 1. Compare nodes at start indices
   * 2. If different, use key-based lookup to find matching nodes
   * 3. Move or create nodes as needed
   * 4. Clean up remaining nodes
   *
   * @private
   * @param {HTMLElement} oldParent - The original DOM element.
   * @param {HTMLElement} newParent - The new DOM element.
   * @returns {void}
   */
  _diff(oldParent, newParent) {
    if (oldParent.isEqualNode(newParent)) return;

    /** @type {Array<ChildNode>} Array of child nodes from the original parent */
    const oldChildren = Array.from(oldParent.childNodes);
    /** @type {Array<ChildNode>} Array of child nodes from the new parent */
    const newChildren = Array.from(newParent.childNodes);
    /** @type {number} Index tracking the start position in oldChildren */
    let oldStartIdx = 0,
      /** @type {number} Index tracking the start position in newChildren */
      newStartIdx = 0;
    /** @type {number} Index tracking the end position in oldChildren */
    let oldEndIdx = oldChildren.length - 1;
    /** @type {number} Index tracking the end position in newChildren */
    let newEndIdx = newChildren.length - 1;
    /** @type {Map<string, Node>|null} Map of nodes indexed by their key attributes */
    let oldKeyMap = null;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      let oldStartNode = oldChildren[oldStartIdx];
      let newStartNode = newChildren[newStartIdx];

      if (!oldStartNode) {
        oldStartNode = oldChildren[++oldStartIdx]; // Skip undefined nodes (moved)
      } else if (this._isSameNode(oldStartNode, newStartNode)) {
        // Case 1: Start nodes are the same
        this._patchNode(oldStartNode, newStartNode);
        oldStartIdx++;
        newStartIdx++;
      } else {
        // Fallback: Use a map to find the node by key or create a new one
        if (!oldKeyMap) {
          oldKeyMap = this._createKeyMap(oldChildren, oldStartIdx, oldEndIdx);
        }
        const key = this._getNodeKey(newStartNode);
        const oldNodeToMove = key ? oldKeyMap.get(key) : null;

        if (oldNodeToMove) {
          // Node with same key found, move it
          this._patchNode(oldNodeToMove, newStartNode);
          oldParent.insertBefore(oldNodeToMove, oldStartNode);
          oldChildren[oldChildren.indexOf(oldNodeToMove)] = undefined; // Mark as moved
        } else {
          // No matching node, create and insert
          oldParent.insertBefore(newStartNode.cloneNode(true), oldStartNode);
        }
        newStartIdx++;
      }
    }

    // Cleanup phase: Add remaining new nodes or remove leftover old nodes
    if (oldStartIdx > oldEndIdx) {
      const refNode = newChildren[newEndIdx + 1]
        ? oldChildren[oldStartIdx]
        : null;
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        if (newChildren[i])
          oldParent.insertBefore(newChildren[i].cloneNode(true), refNode);
      }
    } else if (newStartIdx > newEndIdx) {
      for (let i = oldStartIdx; i <= oldEndIdx; i++) {
        if (oldChildren[i]) this._removeNode(oldParent, oldChildren[i]);
      }
    }
  }

  /**
   * Patches a single node, preserving special Eleva instances.
   * This method handles node type checking, attribute updates, and recursive diffing
   * while ensuring Eleva-managed instances remain intact.
   *
   * @private
   * @param {Node} oldNode - The original DOM node.
   * @param {Node} newNode - The new DOM node to patch against.
   * @returns {void}
   */
  _patchNode(oldNode, newNode) {
    // Preserve Eleva-managed instances
    if (oldNode?._eleva_instance) {
      return;
    }

    const isSameType =
      oldNode.nodeType === newNode.nodeType &&
      oldNode.nodeName === newNode.nodeName;
    if (!isSameType) {
      oldNode.parentNode.replaceChild(newNode.cloneNode(true), oldNode);
      return;
    }

    if (oldNode.nodeType === Node.ELEMENT_NODE) {
      this._updateAttributes(oldNode, newNode);
      this._diff(oldNode, newNode); // Recurse
    } else if (
      oldNode.nodeType === Node.TEXT_NODE &&
      oldNode.nodeValue !== newNode.nodeValue
    ) {
      oldNode.nodeValue = newNode.nodeValue;
    }
  }

  /**
   * Removes a node from its parent, preserving special Eleva style tags.
   * This method ensures that style elements marked with data-e-style
   * are not removed during the diffing process.
   *
   * @private
   * @param {HTMLElement} parent - The parent element containing the node to remove.
   * @param {Node} node - The node to remove.
   * @returns {void}
   */
  _removeNode(parent, node) {
    // Preserve special style elements
    if (node.nodeName === "STYLE" && node.hasAttribute("data-e-style")) {
      return;
    }
    parent.removeChild(node);
  }

  /**
   * Updates the attributes of an element to match a new element's attributes.
   * This method handles special cases for different attribute types:
   *
   * 1. ARIA attributes: Updates both the attribute and corresponding property
   *    (e.g., aria-label updates both attribute and ariaLabel property)
   *
   * 2. Data attributes: Updates the dataset property
   *    (e.g., data-test updates element.dataset.test)
   *
   * 3. Boolean properties: Handles special cases for boolean values:
   *    - Empty string, attribute name, or "true" = true
   *    - "false" = false
   *    - Other values = string value
   *
   * 4. Regular attributes: Updates both attribute and property if they exist
   *
   * @private
   * @param {HTMLElement} oldEl - The original element to update.
   * @param {HTMLElement} newEl - The new element containing the target attributes.
   * @returns {void}
   */
  _updateAttributes(oldEl, newEl) {
    /** @type {NamedNodeMap} */
    const oldAttrs = oldEl.attributes;
    /** @type {NamedNodeMap} */
    const newAttrs = newEl.attributes;

    // Update/add new attributes
    for (const { name, value } of newAttrs) {
      if (name.startsWith("@")) continue;
      if (oldEl.getAttribute(name) === value) continue;
      oldEl.setAttribute(name, value);

      if (name.startsWith("aria-")) {
        const prop =
          "aria" +
          name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        /** @type {string} */
        oldEl[prop] = value;
      } else if (name.startsWith("data-")) {
        oldEl.dataset[name.slice(5)] = value;
      } else {
        const prop = name.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        if (prop in oldEl) {
          /** @type {PropertyDescriptor|undefined} */
          const descriptor = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(oldEl),
            prop
          );
          const isBoolean =
            typeof oldEl[prop] === "boolean" ||
            (descriptor?.get &&
              typeof descriptor.get.call(oldEl) === "boolean");
          if (isBoolean) {
            /** @type {boolean} */
            oldEl[prop] =
              value !== "false" &&
              (value === "" || value === prop || value === "true");
          } else {
            /** @type {string} */
            oldEl[prop] = value;
          }
        }
      }
    }

    // Remove old attributes
    for (const { name } of oldAttrs) {
      if (!newEl.hasAttribute(name)) {
        oldEl.removeAttribute(name);
      }
    }
  }

  /**
   * Determines if two nodes are the same based on their type, name, and key attributes.
   * This method is used during the diffing process to identify matching nodes.
   *
   * @private
   * @param {Node} oldNode - The first node to compare.
   * @param {Node} newNode - The second node to compare.
   * @returns {boolean} True if the nodes are considered the same, false otherwise.
   */
  _isSameNode(oldNode, newNode) {
    if (!oldNode || !newNode) return false;
    const oldKey =
      oldNode.nodeType === Node.ELEMENT_NODE
        ? oldNode.getAttribute("key")
        : null;
    const newKey =
      newNode.nodeType === Node.ELEMENT_NODE
        ? newNode.getAttribute("key")
        : null;
    if (oldKey && newKey) return oldKey === newKey;
    return (
      !oldKey &&
      !newKey &&
      oldNode.nodeType === newNode.nodeType &&
      oldNode.nodeName === newNode.nodeName
    );
  }

  /**
   * Creates a map of nodes indexed by their key attributes.
   * This map is used during the diffing process to efficiently locate nodes by key.
   *
   * @private
   * @param {Array<Node>} children - Array of child nodes to process.
   * @param {number} start - Starting index in the children array.
   * @param {number} end - Ending index in the children array.
   * @returns {Map<string, Node>} A map of nodes indexed by their key attributes.
   */
  _createKeyMap(children, start, end) {
    const map = new Map();
    for (let i = start; i <= end; i++) {
      const child = children[i];
      const key = this._getNodeKey(child);
      if (key) map.set(key, child);
    }
    return map;
  }

  /**
   * Extracts the key attribute from a node if it exists.
   * This method is used to identify nodes during the diffing process.
   *
   * @private
   * @param {Node} node - The node to extract the key from.
   * @returns {string|null} The key attribute value or null if not found.
   */
  _getNodeKey(node) {
    return node.nodeType === Node.ELEMENT_NODE
      ? node.getAttribute("key")
      : null;
  }
}

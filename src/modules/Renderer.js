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
    /**
     * A temporary container to hold the new HTML content while diffing.
     * @private
     * @type {HTMLElement}
     */
    this._tempContainer = document.createElement("div");
  }

  /**
   * Patches the DOM of the given container with the provided HTML string.
   *
   * @public
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML string.
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
   * Performs a diff between two DOM nodes and patches the old node to match the new node.
   *
   * @private
   * @param {HTMLElement} oldParent - The original DOM element.
   * @param {HTMLElement} newParent - The new DOM element.
   * @returns {void}
   */
  _diff(oldParent, newParent) {
    if (oldParent === newParent || oldParent.isEqualNode?.(newParent)) return;

    const oldChildren = Array.from(oldParent.childNodes);
    const newChildren = Array.from(newParent.childNodes);
    let oldStartIdx = 0,
      newStartIdx = 0;
    let oldEndIdx = oldChildren.length - 1;
    let newEndIdx = newChildren.length - 1;
    let oldKeyMap = null;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      let oldStartNode = oldChildren[oldStartIdx];
      let newStartNode = newChildren[newStartIdx];

      if (!oldStartNode) {
        oldStartNode = oldChildren[++oldStartIdx];
      } else if (this._isSameNode(oldStartNode, newStartNode)) {
        this._patchNode(oldStartNode, newStartNode);
        oldStartIdx++;
        newStartIdx++;
      } else {
        if (!oldKeyMap) {
          oldKeyMap = this._createKeyMap(oldChildren, oldStartIdx, oldEndIdx);
        }
        const key = this._getNodeKey(newStartNode);
        const oldNodeToMove = key ? oldKeyMap.get(key) : null;

        if (oldNodeToMove) {
          this._patchNode(oldNodeToMove, newStartNode);
          oldParent.insertBefore(oldNodeToMove, oldStartNode);
          oldChildren[oldChildren.indexOf(oldNodeToMove)] = null;
        } else {
          oldParent.insertBefore(newStartNode.cloneNode(true), oldStartNode);
        }
        newStartIdx++;
      }
    }

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
   * Patches a single node.
   *
   * @private
   * @param {Node} oldNode - The original DOM node.
   * @param {Node} newNode - The new DOM node.
   * @returns {void}
   */
  _patchNode(oldNode, newNode) {
    if (oldNode?._eleva_instance) return;

    if (!this._isSameNode(oldNode, newNode)) {
      oldNode.replaceWith(newNode.cloneNode(true));
      return;
    }

    if (oldNode.nodeType === Node.ELEMENT_NODE) {
      this._updateAttributes(oldNode, newNode);
      this._diff(oldNode, newNode);
    } else if (
      oldNode.nodeType === Node.TEXT_NODE &&
      oldNode.nodeValue !== newNode.nodeValue
    ) {
      oldNode.nodeValue = newNode.nodeValue;
    }
  }

  /**
   * Removes a node from its parent.
   *
   * @private
   * @param {HTMLElement} parent - The parent element containing the node to remove.
   * @param {Node} node - The node to remove.
   * @returns {void}
   */
  _removeNode(parent, node) {
    if (node.nodeName === "STYLE" && node.hasAttribute("data-e-style")) return;

    parent.removeChild(node);
  }

  /**
   * Updates the attributes of an element to match a new element's attributes.
   *
   * @private
   * @param {HTMLElement} oldEl - The original element to update.
   * @param {HTMLElement} newEl - The new element to update.
   * @returns {void}
   */
  _updateAttributes(oldEl, newEl) {
    const oldAttrs = oldEl.attributes;
    const newAttrs = newEl.attributes;

    // Process new attributes
    for (let i = 0; i < newAttrs.length; i++) {
      const { name, value } = newAttrs[i];

      // Skip event attributes (handled by event system)
      if (name.startsWith("@")) continue;

      // Skip if attribute hasn't changed
      if (oldEl.getAttribute(name) === value) continue;

      // Basic attribute setting
      oldEl.setAttribute(name, value);
    }

    // Remove old attributes that are no longer present
    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const name = oldAttrs[i].name;
      if (!newEl.hasAttribute(name)) {
        oldEl.removeAttribute(name);
      }
    }
  }

  /**
   * Determines if two nodes are the same based on their type, name, and key attributes.
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
   * Creates a key map for the children of a parent node.
   *
   * @private
   * @param {Array<Node>} children - The children of the parent node.
   * @param {number} start - The start index of the children.
   * @param {number} end - The end index of the children.
   * @returns {Map<string, Node>} A key map for the children.
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
   *
   * @private
   * @param {Node} node - The node to extract the key from.
   * @returns {string|null} The key attribute value or null if not found.
   */
  _getNodeKey(node) {
    return node?.nodeType === Node.ELEMENT_NODE
      ? node.getAttribute("key")
      : null;
  }
}

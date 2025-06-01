"use strict";

/**
 * A regular expression to match hyphenated lowercase letters.
 * @private
 * @type {RegExp}
 */
const CAMEL_RE = /-([a-z])/g;

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
   * @param {HTMLElement} container - The container whose DOM will be patched.
   * @param {string} newHtml - The new HTML string.
   * @throws {TypeError} If the container is not an HTMLElement or newHtml is not a string.
   * @throws {Error} If the DOM patching fails.
   * @returns {void}
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
   * @param {Node} oldParent - The old parent node to be patched.
   * @param {Node} newParent - The new parent node to compare.
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
        oldStartIdx++;
        continue;
      }
      if (!newStartNode) {
        newStartIdx++;
        continue;
      }

      if (this._keysMatch(oldStartNode, newStartNode)) {
        this._patchNode(oldStartNode, newStartNode);
        oldStartIdx++;
        newStartIdx++;
      } else {
        oldKeyMap ??= this._createKeyMap(oldChildren, oldStartIdx, oldEndIdx);

        const newKey =
          newStartNode.nodeType === Node.ELEMENT_NODE
            ? newStartNode.getAttribute("key")
            : null;
        const moveIndex = newKey ? oldKeyMap.get(newKey) : undefined;
        const oldNodeToMove =
          moveIndex !== undefined ? oldChildren[moveIndex] : null;

        if (oldNodeToMove) {
          this._patchNode(oldNodeToMove, newStartNode);
          oldParent.insertBefore(oldNodeToMove, oldStartNode);

          if (moveIndex !== undefined) oldChildren[moveIndex] = null;
        } else {
          oldParent.insertBefore(newStartNode.cloneNode(true), oldStartNode);
        }
        newStartIdx++;
      }
    }

    // Cleanup
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
        const node = oldChildren[i];
        if (
          node &&
          !(node.nodeName === "STYLE" && node.hasAttribute("data-e-style"))
        ) {
          oldParent.removeChild(node);
        }
      }
    }
  }

  /**
   * Checks if the node types match.
   *
   * @private
   * @param {Node} oldNode - The old node.
   * @param {Node} newNode - The new node.
   * @returns {boolean} True if the nodes match, false otherwise.
   */
  _keysMatch(oldNode, newNode) {
    if (oldNode.nodeType !== Node.ELEMENT_NODE) return true;
    const oldKey = oldNode.getAttribute("key");
    const newKey = newNode.getAttribute("key");
    return oldKey === newKey;
  }

  /**
   * Patches a node.
   *
   * @private
   * @param {Node} oldNode - The old node to patch.
   * @param {Node} newNode - The new node to patch.
   * @returns {void}
   */
  _patchNode(oldNode, newNode) {
    if (oldNode?._eleva_instance) return;

    if (
      oldNode.nodeType !== newNode.nodeType ||
      oldNode.nodeName !== newNode.nodeName
    ) {
      oldNode.replaceWith(newNode.cloneNode(true));
      return;
    }

    if (oldNode.nodeType === Node.ELEMENT_NODE) {
      const oldEl = oldNode;
      const newEl = newNode;
      this._updateAttributes(oldEl, newEl);
      this._diff(oldEl, newEl);
    } else if (
      oldNode.nodeType === Node.TEXT_NODE &&
      oldNode.nodeValue !== newNode.nodeValue
    ) {
      oldNode.nodeValue = newNode.nodeValue;
    }
  }

  /**
   * Updates the attributes of an element.
   *
   * @private
   * @param {HTMLElement} oldEl - The old element to update.
   * @param {HTMLElement} newEl - The new element to update.
   * @returns {void}
   */
  _updateAttributes(oldEl, newEl) {
    const oldAttrs = oldEl.attributes;
    const newAttrs = newEl.attributes;

    // Single pass for new/updated attributes
    for (let i = 0; i < newAttrs.length; i++) {
      const { name, value } = newAttrs[i];
      if (name[0] === "@" || oldEl.getAttribute(name) === value) continue;

      oldEl.setAttribute(name, value);

      if (name[0] === "a" && name[4] === "-") {
        const s = name.slice(5);
        oldEl["aria" + s.replace(CAMEL_RE, (_, l) => l.toUpperCase())] = value;
      } else if (name[0] === "d" && name[3] === "-") {
        oldEl.dataset[name.slice(5)] = value;
      } else {
        const prop = name.includes("-")
          ? name.replace(CAMEL_RE, (_, l) => l.toUpperCase())
          : name;

        if (prop in oldEl) {
          const descriptor = Object.getOwnPropertyDescriptor(
            Object.getPrototypeOf(oldEl),
            prop
          );
          const isBoolean =
            typeof oldEl[prop] === "boolean" ||
            (descriptor?.get &&
              typeof descriptor.get.call(oldEl) === "boolean");
          if (isBoolean) {
            oldEl[prop] =
              value !== "false" &&
              (value === "" || value === prop || value === "true");
          } else {
            oldEl[prop] = value;
          }
        }
      }
    }

    // Remove any attributes no longer present
    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const name = oldAttrs[i].name;
      if (!newEl.hasAttribute(name)) {
        oldEl.removeAttribute(name);
      }
    }
  }

  /**
   * Creates a key map for the children of a parent node.
   *
   * @private
   * @param {Array<Node>} children - The children of the parent node.
   * @param {number} start - The start index of the children.
   * @param {number} end - The end index of the children.
   * @returns {Map<string, number>} A map of key to child index.
   */
  _createKeyMap(children, start, end) {
    const map = new Map();
    for (let i = start; i <= end; i++) {
      const child = children[i];
      if (child?.nodeType === Node.ELEMENT_NODE) {
        const key = child.getAttribute("key");
        if (key) map.set(key, i);
      }
    }
    return map;
  }
}

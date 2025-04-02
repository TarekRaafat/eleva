"use strict";

/**
 * @class 🎨 Renderer
 * @classdesc Handles DOM patching, diffing, and attribute updates.
 * Provides methods for efficient DOM updates by diffing the new and old DOM structures
 * and applying only the necessary changes.
 */
export class Renderer {
  /**
   * Patches the DOM of a container element with new HTML content.
   *
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML content to apply.
   * @throws {Error} If container is not an HTMLElement or newHtml is not a string
   */
  patchDOM(container, newHtml) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("Container must be an HTMLElement");
    }
    if (typeof newHtml !== "string") {
      throw new Error("newHtml must be a string");
    }

    const tempContainer = document.createElement("div");
    try {
      tempContainer.innerHTML = newHtml;
      this.diff(container, tempContainer);
    } catch (error) {
      throw new Error(`Failed to patch DOM: ${error.message}`);
    } finally {
      tempContainer.innerHTML = "";
    }
  }

  /**
   * Diffs two DOM trees (old and new) and applies updates to the old DOM.
   *
   * @param {HTMLElement} oldParent - The original DOM element.
   * @param {HTMLElement} newParent - The new DOM element.
   * @throws {Error} If either parent is not an HTMLElement
   */
  diff(oldParent, newParent) {
    if (
      !(oldParent instanceof HTMLElement) ||
      !(newParent instanceof HTMLElement)
    ) {
      throw new Error("Both parents must be HTMLElements");
    }

    // Fast path for identical nodes
    if (oldParent.isEqualNode(newParent)) return;

    const oldNodes = Array.from(oldParent.childNodes);
    const newNodes = Array.from(newParent.childNodes);
    const max = Math.max(oldNodes.length, newNodes.length);

    // Batch DOM operations for better performance
    const operations = [];

    for (let i = 0; i < max; i++) {
      const oldNode = oldNodes[i];
      const newNode = newNodes[i];

      // Case 1: Append new nodes that don't exist in the old tree.
      if (!oldNode && newNode) {
        operations.push(() => oldParent.appendChild(newNode.cloneNode(true)));
        continue;
      }
      // Case 2: Remove old nodes not present in the new tree.
      if (oldNode && !newNode) {
        operations.push(() => oldParent.removeChild(oldNode));
        continue;
      }

      // Case 3: For element nodes, compare keys if available.
      if (
        oldNode?.nodeType === Node.ELEMENT_NODE &&
        newNode?.nodeType === Node.ELEMENT_NODE
      ) {
        const oldKey = oldNode.getAttribute("key");
        const newKey = newNode.getAttribute("key");
        if (oldKey || newKey) {
          if (oldKey !== newKey) {
            operations.push(() =>
              oldParent.replaceChild(newNode.cloneNode(true), oldNode)
            );
            continue;
          }
        }
      }

      // Case 4: Replace nodes if types or tag names differ.
      if (
        oldNode?.nodeType !== newNode?.nodeType ||
        oldNode?.nodeName !== newNode?.nodeName
      ) {
        operations.push(() =>
          oldParent.replaceChild(newNode.cloneNode(true), oldNode)
        );
        continue;
      }

      // Case 5: For text nodes, update content if different.
      if (oldNode?.nodeType === Node.TEXT_NODE) {
        if (oldNode.nodeValue !== newNode.nodeValue) {
          oldNode.nodeValue = newNode.nodeValue;
        }
        continue;
      }

      // Case 6: For element nodes, update attributes and then diff children.
      if (oldNode?.nodeType === Node.ELEMENT_NODE) {
        this.updateAttributes(oldNode, newNode);
        this.diff(oldNode, newNode);
      }
    }

    // Execute batched operations
    operations.forEach((op) => op());
  }

  /**
   * Updates the attributes of an element to match those of a new element.
   *
   * @param {HTMLElement} oldEl - The element to update.
   * @param {HTMLElement} newEl - The element providing the updated attributes.
   * @throws {Error} If either element is not an HTMLElement
   */
  updateAttributes(oldEl, newEl) {
    if (!(oldEl instanceof HTMLElement) || !(newEl instanceof HTMLElement)) {
      throw new Error("Both elements must be HTMLElements");
    }

    // Special cases for properties that don't map directly to attributes
    const specialProperties = {
      value: true,
      checked: true,
      selected: true,
      disabled: true,
      readOnly: true,
      multiple: true,
    };

    // Batch attribute operations for better performance
    const operations = [];

    // Remove old attributes that no longer exist
    Array.from(oldEl.attributes).forEach((attr) => {
      if (attr.name.startsWith("@")) return;
      if (!newEl.hasAttribute(attr.name)) {
        operations.push(() => oldEl.removeAttribute(attr.name));
      }
    });

    // Add or update attributes from newEl
    Array.from(newEl.attributes).forEach((attr) => {
      if (attr.name.startsWith("@")) return;
      if (oldEl.getAttribute(attr.name) !== attr.value) {
        operations.push(() => {
          oldEl.setAttribute(attr.name, attr.value);

          // Convert kebab-case to camelCase for property names
          const propName = attr.name.replace(/-([a-z])/g, (_, letter) =>
            letter.toUpperCase()
          );

          // Handle special cases first
          if (specialProperties[propName]) {
            oldEl[propName] = attr.value === "" ? true : attr.value;
          }
          // Handle ARIA attributes
          else if (attr.name.startsWith("aria-")) {
            const ariaName =
              "aria" +
              attr.name
                .slice(5)
                .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            oldEl[ariaName] = attr.value;
          }
          // Handle data attributes
          else if (attr.name.startsWith("data-")) {
            // dataset handles the camelCase conversion automatically
            const dataName = attr.name.slice(5);
            oldEl.dataset[dataName] = attr.value;
          }
          // Handle standard properties
          else if (propName in oldEl) {
            oldEl[propName] = attr.value;
          }
        });
      }
    });

    // Execute batched operations
    operations.forEach((op) => op());
  }
}

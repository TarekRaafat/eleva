"use strict";

/**
 * 🎨 Renderer: Handles DOM patching, diffing, and attribute updates.
 *
 * Provides methods for efficient DOM updates by diffing the new and old DOM structures
 * and applying only the necessary changes.
 */
export class Renderer {
  /**
   * Patches the DOM of a container element with new HTML content.
   *
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML content to apply.
   */
  patchDOM(container, newHtml) {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = newHtml;
    this.diff(container, tempContainer);
  }

  /**
   * Diffs two DOM trees (old and new) and applies updates to the old DOM.
   *
   * @param {HTMLElement} oldParent - The original DOM element.
   * @param {HTMLElement} newParent - The new DOM element.
   */
  diff(oldParent, newParent) {
    const oldNodes = Array.from(oldParent.childNodes);
    const newNodes = Array.from(newParent.childNodes);
    const max = Math.max(oldNodes.length, newNodes.length);
    for (let i = 0; i < max; i++) {
      const oldNode = oldNodes[i];
      const newNode = newNodes[i];

      // Append new nodes that don't exist in the old tree.
      if (!oldNode && newNode) {
        oldParent.appendChild(newNode.cloneNode(true));
        continue;
      }
      // Remove old nodes not present in the new tree.
      if (oldNode && !newNode) {
        oldParent.removeChild(oldNode);
        continue;
      }

      // For element nodes, compare keys if available.
      if (
        oldNode.nodeType === Node.ELEMENT_NODE &&
        newNode.nodeType === Node.ELEMENT_NODE
      ) {
        const oldKey = oldNode.getAttribute("key");
        const newKey = newNode.getAttribute("key");
        if (oldKey || newKey) {
          if (oldKey !== newKey) {
            oldParent.replaceChild(newNode.cloneNode(true), oldNode);
            continue;
          }
        }
      }

      // Replace nodes if types or tag names differ.
      if (
        oldNode.nodeType !== newNode.nodeType ||
        oldNode.nodeName !== newNode.nodeName
      ) {
        oldParent.replaceChild(newNode.cloneNode(true), oldNode);
        continue;
      }
      // For text nodes, update content if different.
      if (oldNode.nodeType === Node.TEXT_NODE) {
        if (oldNode.nodeValue !== newNode.nodeValue) {
          oldNode.nodeValue = newNode.nodeValue;
        }
        continue;
      }
      // For element nodes, update attributes and then diff children.
      if (oldNode.nodeType === Node.ELEMENT_NODE) {
        this.updateAttributes(oldNode, newNode);
        this.diff(oldNode, newNode);
      }
    }
  }

  /**
   * Updates the attributes of an element to match those of a new element.
   *
   * @param {HTMLElement} oldEl - The element to update.
   * @param {HTMLElement} newEl - The element providing the updated attributes.
   */
  updateAttributes(oldEl, newEl) {
    const attributeToPropertyMap = {
      value: "value",
      checked: "checked",
      selected: "selected",
      disabled: "disabled",
    };

    // Remove old attributes that no longer exist.
    Array.from(oldEl.attributes).forEach((attr) => {
      if (attr.name.startsWith("@")) return;
      if (!newEl.hasAttribute(attr.name)) {
        oldEl.removeAttribute(attr.name);
      }
    });
    // Add or update attributes from newEl.
    Array.from(newEl.attributes).forEach((attr) => {
      if (attr.name.startsWith("@")) return;
      if (oldEl.getAttribute(attr.name) !== attr.value) {
        oldEl.setAttribute(attr.name, attr.value);
        if (attributeToPropertyMap[attr.name]) {
          oldEl[attributeToPropertyMap[attr.name]] = attr.value;
        } else if (attr.name in oldEl) {
          oldEl[attr.name] = attr.value;
        }
      }
    });
  }
}

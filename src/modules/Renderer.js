"use strict";

/**
 * @class 🎨 Renderer
 * @classdesc A DOM renderer that handles efficient DOM updates through patching and diffing.
 * Provides methods for updating the DOM by comparing new and old structures and applying
 * only the necessary changes, minimizing layout thrashing and improving performance.
 *
 * @example
 * const renderer = new Renderer();
 * const container = document.getElementById("app");
 * const newHtml = "<div>Updated content</div>";
 * renderer.patchDOM(container, newHtml);
 */
export class Renderer {
  /**
   * Patches the DOM of a container element with new HTML content.
   * This method efficiently updates the DOM by comparing the new content with the existing
   * content and applying only the necessary changes.
   *
   * @public
   * @param {HTMLElement} container - The container element to patch.
   * @param {string} newHtml - The new HTML content to apply.
   * @returns {void}
   * @throws {Error} If container is not an HTMLElement or newHtml is not a string.
   */
  patchDOM(container, newHtml) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("Container must be an HTMLElement");
    }
    if (typeof newHtml !== "string") {
      throw new Error("newHtml must be a string");
    }

    const temp = document.createElement("div");
    temp.innerHTML = newHtml;
    this._diff(container, temp);
    temp.innerHTML = "";
  }

  /**
   * Diffs two DOM trees (old and new) and applies updates to the old DOM.
   * This method recursively compares nodes and their attributes, applying only
   * the necessary changes to minimize DOM operations.
   *
   * @private
   * @param {HTMLElement} oldParent - The original DOM element.
   * @param {HTMLElement} newParent - The new DOM element.
   * @returns {void}
   * @throws {Error} If either parent is not an HTMLElement.
   */
  _diff(oldParent, newParent) {
    if (
      !(oldParent instanceof HTMLElement) ||
      !(newParent instanceof HTMLElement)
    ) {
      throw new Error("Both parents must be HTMLElements");
    }

    if (oldParent.isEqualNode(newParent)) return;

    const oldChildren = oldParent.childNodes;
    const newChildren = newParent.childNodes;
    const maxLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      const oldNode = oldChildren[i];
      const newNode = newChildren[i];

      if (!oldNode && !newNode) continue;

      if (!oldNode && newNode) {
        oldParent.appendChild(newNode.cloneNode(true));
        continue;
      }
      if (oldNode && !newNode) {
        oldParent.removeChild(oldNode);
        continue;
      }

      const isSameType =
        oldNode.nodeType === newNode.nodeType &&
        oldNode.nodeName === newNode.nodeName;

      if (!isSameType) {
        oldParent.replaceChild(newNode.cloneNode(true), oldNode);
        continue;
      }

      if (oldNode.nodeType === Node.ELEMENT_NODE) {
        const oldKey = oldNode.getAttribute("key");
        const newKey = newNode.getAttribute("key");

        if (oldKey !== newKey && (oldKey || newKey)) {
          oldParent.replaceChild(newNode.cloneNode(true), oldNode);
          continue;
        }

        this._updateAttributes(oldNode, newNode);
        this._diff(oldNode, newNode);
      } else if (
        oldNode.nodeType === Node.TEXT_NODE &&
        oldNode.nodeValue !== newNode.nodeValue
      ) {
        oldNode.nodeValue = newNode.nodeValue;
      }
    }
  }

  /**
   * Updates the attributes of an element to match those of a new element.
   * Handles special cases for ARIA attributes, data attributes, and boolean properties.
   *
   * @private
   * @param {HTMLElement} oldEl - The element to update.
   * @param {HTMLElement} newEl - The element providing the updated attributes.
   * @returns {void}
   * @throws {Error} If either element is not an HTMLElement.
   */
  _updateAttributes(oldEl, newEl) {
    if (!(oldEl instanceof HTMLElement) || !(newEl instanceof HTMLElement)) {
      throw new Error("Both elements must be HTMLElements");
    }

    const oldAttrs = oldEl.attributes;
    const newAttrs = newEl.attributes;

    // Remove old attributes
    for (const { name } of oldAttrs) {
      if (!newEl.hasAttribute(name)) {
        oldEl.removeAttribute(name);
      }
    }

    // Update/add new attributes
    for (const attr of newAttrs) {
      const { name, value } = attr;
      if (name.startsWith("@")) continue;

      if (oldEl.getAttribute(name) === value) continue;

      oldEl.setAttribute(name, value);

      if (name.startsWith("aria-")) {
        const prop =
          "aria" +
          name.slice(5).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        oldEl[prop] = value;
      } else if (name.startsWith("data-")) {
        oldEl.dataset[name.slice(5)] = value;
      } else {
        const prop = name.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
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
  }
}

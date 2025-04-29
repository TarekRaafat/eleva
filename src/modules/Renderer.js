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

    const temp = document.createElement("div");
    temp.innerHTML = newHtml;
    this.diff(container, temp);
    temp.innerHTML = "";
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

    if (oldParent.isEqualNode(newParent)) return;

    const oldC = oldParent.childNodes;
    const newC = newParent.childNodes;
    const len = Math.max(oldC.length, newC.length);
    const operations = [];

    for (let i = 0; i < len; i++) {
      const oldNode = oldC[i];
      const newNode = newC[i];

      if (!oldNode && newNode) {
        operations.push(() => oldParent.appendChild(newNode.cloneNode(true)));
        continue;
      }
      if (oldNode && !newNode) {
        operations.push(() => oldParent.removeChild(oldNode));
        continue;
      }

      const isSameType =
        oldNode.nodeType === newNode.nodeType &&
        oldNode.nodeName === newNode.nodeName;

      if (!isSameType) {
        operations.push(() =>
          oldParent.replaceChild(newNode.cloneNode(true), oldNode)
        );
        continue;
      }

      if (oldNode.nodeType === Node.ELEMENT_NODE) {
        const oldKey = oldNode.getAttribute("key");
        const newKey = newNode.getAttribute("key");

        if (oldKey !== newKey && (oldKey || newKey)) {
          operations.push(() =>
            oldParent.replaceChild(newNode.cloneNode(true), oldNode)
          );
          continue;
        }

        this.updateAttributes(oldNode, newNode);
        this.diff(oldNode, newNode);
      } else if (
        oldNode.nodeType === Node.TEXT_NODE &&
        oldNode.nodeValue !== newNode.nodeValue
      ) {
        oldNode.nodeValue = newNode.nodeValue;
      }
    }

    if (operations.length) {
      operations.forEach((op) => op());
    }
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

    const oldAttrs = oldEl.attributes;
    const newAttrs = newEl.attributes;
    const operations = [];

    // Remove old attributes
    for (const { name } of oldAttrs) {
      if (!name.startsWith("@") && !newEl.hasAttribute(name)) {
        operations.push(() => oldEl.removeAttribute(name));
      }
    }

    // Update/add new attributes
    for (const attr of newAttrs) {
      const { name, value } = attr;
      if (name.startsWith("@")) continue;

      if (oldEl.getAttribute(name) === value) continue;

      operations.push(() => {
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
      });
    }

    if (operations.length) {
      operations.forEach((op) => op());
    }
  }
}

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
    patchDOM(container: HTMLElement, newHtml: string): void;
    /**
     * Diffs two DOM trees (old and new) and applies updates to the old DOM.
     *
     * @param {HTMLElement} oldParent - The original DOM element.
     * @param {HTMLElement} newParent - The new DOM element.
     * @throws {Error} If either parent is not an HTMLElement
     */
    diff(oldParent: HTMLElement, newParent: HTMLElement): void;
    /**
     * Updates the attributes of an element to match those of a new element.
     *
     * @param {HTMLElement} oldEl - The element to update.
     * @param {HTMLElement} newEl - The element providing the updated attributes.
     * @throws {Error} If either element is not an HTMLElement
     */
    updateAttributes(oldEl: HTMLElement, newEl: HTMLElement): void;
}
//# sourceMappingURL=Renderer.d.ts.map
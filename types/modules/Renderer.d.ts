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
    public patchDOM(container: HTMLElement, newHtml: string): void;
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
    private _diff;
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
    private _updateAttributes;
}
//# sourceMappingURL=Renderer.d.ts.map
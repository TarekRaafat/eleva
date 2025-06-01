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
     * A temporary container to hold the new HTML content while diffing.
     * @private
     * @type {HTMLElement}
     */
    private _tempContainer;
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
    public patchDOM(container: HTMLElement, newHtml: string): void;
    /**
     * Performs a diff between two DOM nodes and patches the old node to match the new node.
     *
     * @private
     * @param {Node} oldParent - The old parent node to be patched.
     * @param {Node} newParent - The new parent node to compare.
     * @returns {void}
     */
    private _diff;
    /**
     * Checks if the node types match.
     *
     * @private
     * @param {Node} oldNode - The old node.
     * @param {Node} newNode - The new node.
     * @returns {boolean} True if the nodes match, false otherwise.
     */
    private _keysMatch;
    /**
     * Patches a node.
     *
     * @private
     * @param {Node} oldNode - The old node to patch.
     * @param {Node} newNode - The new node to patch.
     * @returns {void}
     */
    private _patchNode;
    /**
     * Updates the attributes of an element.
     *
     * @private
     * @param {HTMLElement} oldEl - The old element to update.
     * @param {HTMLElement} newEl - The new element to update.
     * @returns {void}
     */
    private _updateAttributes;
    /**
     * Creates a key map for the children of a parent node.
     *
     * @private
     * @param {Array<Node>} children - The children of the parent node.
     * @param {number} start - The start index of the children.
     * @param {number} end - The end index of the children.
     * @returns {Map<string, number>} A map of key to child index.
     */
    private _createKeyMap;
}
//# sourceMappingURL=Renderer.d.ts.map
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
     * @param {HTMLElement} container - The container element to patch.
     * @param {string} newHtml - The new HTML string.
     * @returns {void}
     * @throws {TypeError} If container is not an HTMLElement or newHtml is not a string.
     * @throws {Error} If DOM patching fails.
     */
    public patchDOM(container: HTMLElement, newHtml: string): void;
    /**
     * Performs a diff between two DOM nodes and patches the old node to match the new node.
     *
     * @private
     * @param {HTMLElement} oldParent - The original DOM element.
     * @param {HTMLElement} newParent - The new DOM element.
     * @returns {void}
     */
    private _diff;
    /**
     * Patches a single node.
     *
     * @private
     * @param {Node} oldNode - The original DOM node.
     * @param {Node} newNode - The new DOM node.
     * @returns {void}
     */
    private _patchNode;
    /**
     * Removes a node from its parent.
     *
     * @private
     * @param {HTMLElement} parent - The parent element containing the node to remove.
     * @param {Node} node - The node to remove.
     * @returns {void}
     */
    private _removeNode;
    /**
     * Updates the attributes of an element to match a new element's attributes.
     *
     * @private
     * @param {HTMLElement} oldEl - The original element to update.
     * @param {HTMLElement} newEl - The new element to update.
     * @returns {void}
     */
    private _updateAttributes;
    /**
     * Determines if two nodes are the same based on their type, name, and key attributes.
     *
     * @private
     * @param {Node} oldNode - The first node to compare.
     * @param {Node} newNode - The second node to compare.
     * @returns {boolean} True if the nodes are considered the same, false otherwise.
     */
    private _isSameNode;
    /**
     * Creates a key map for the children of a parent node.
     *
     * @private
     * @param {Array<Node>} children - The children of the parent node.
     * @param {number} start - The start index of the children.
     * @param {number} end - The end index of the children.
     * @returns {Map<string, Node>} A key map for the children.
     */
    private _createKeyMap;
    /**
     * Extracts the key attribute from a node if it exists.
     *
     * @private
     * @param {Node} node - The node to extract the key from.
     * @returns {string|null} The key attribute value or null if not found.
     */
    private _getNodeKey;
}
//# sourceMappingURL=Renderer.d.ts.map
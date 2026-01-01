/**
 * @typedef {Object} PatchOptions
 * @property {boolean} [preserveStyles=true]
 *           Whether to preserve style elements with data-e-style attribute
 * @property {boolean} [preserveInstances=true]
 *           Whether to preserve elements with _eleva_instance property
 */
/**
 * @typedef {Map<string, Node>} KeyMap
 *           Map of key attribute values to their corresponding DOM nodes
 */
/**
 * @typedef {'ELEMENT_NODE'|'TEXT_NODE'|'COMMENT_NODE'|'DOCUMENT_FRAGMENT_NODE'} NodeTypeName
 *           Common DOM node type names
 */
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
 * // Basic usage
 * const renderer = new Renderer();
 * const container = document.getElementById("app");
 * const newHtml = "<div>Updated content</div>";
 * renderer.patchDOM(container, newHtml);
 *
 * @example
 * // With keyed elements for optimal list updates
 * const listHtml = `
 *   <ul>
 *     <li key="item-1">First</li>
 *     <li key="item-2">Second</li>
 *     <li key="item-3">Third</li>
 *   </ul>
 * `;
 * renderer.patchDOM(container, listHtml);
 *
 * @example
 * // The renderer preserves Eleva-managed elements
 * // Elements with _eleva_instance are not replaced during diffing
 * // Style elements with data-e-style are preserved
 */
export class Renderer {
    /**
     * A temporary container to hold the new HTML content while diffing.
     * Reused across patch operations to minimize memory allocation.
     * @private
     * @type {HTMLDivElement}
     */
    private _tempContainer;
    /**
     * Patches the DOM of the given container with the provided HTML string.
     * Uses an optimized diffing algorithm to minimize DOM operations.
     *
     * @public
     * @param {HTMLElement} container - The container element to patch.
     * @param {string} newHtml - The new HTML string.
     * @returns {void}
     * @throws {TypeError} If container is not an HTMLElement or newHtml is not a string.
     * @throws {Error} If DOM patching fails.
     *
     * @example
     * // Update container content
     * renderer.patchDOM(container, '<div class="updated">New content</div>');
     *
     * @example
     * // Update list with keys for optimal diffing
     * const items = ['a', 'b', 'c'];
     * const html = items.map(item =>
     *   `<li key="${item}">${item}</li>`
     * ).join('');
     * renderer.patchDOM(listContainer, `<ul>${html}</ul>`);
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
     * Used for efficient O(1) lookup of keyed elements during diffing.
     *
     * @private
     * @param {Array<ChildNode>} children - The children of the parent node.
     * @param {number} start - The start index of the children.
     * @param {number} end - The end index of the children.
     * @returns {KeyMap} A key map for the children.
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
export type PatchOptions = {
    /**
     * Whether to preserve style elements with data-e-style attribute
     */
    preserveStyles?: boolean | undefined;
    /**
     * Whether to preserve elements with _eleva_instance property
     */
    preserveInstances?: boolean | undefined;
};
/**
 * Map of key attribute values to their corresponding DOM nodes
 */
export type KeyMap = Map<string, Node>;
/**
 * Common DOM node type names
 */
export type NodeTypeName = "ELEMENT_NODE" | "TEXT_NODE" | "COMMENT_NODE" | "DOCUMENT_FRAGMENT_NODE";
//# sourceMappingURL=Renderer.d.ts.map
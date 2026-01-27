/**
 * @class 🎨 Renderer
 * @classdesc A high-performance DOM renderer that implements an optimized two-pointer diffing
 * algorithm with key-based node reconciliation. The renderer efficiently updates the DOM by
 * computing the minimal set of operations needed to transform the current state to the desired state.
 *
 * Key features:
 * - Two-pointer diffing algorithm for efficient DOM updates
 * - Key-based node reconciliation for optimal list performance (O(1) lookup)
 * - Preserves DOM node identity during reordering (maintains event listeners, focus, animations)
 * - Intelligent attribute synchronization (skips Eleva event attributes)
 * - Preservation of Eleva-managed component instances and style elements
 *
 * @example
 * // Basic usage
 * const renderer = new Renderer();
 * renderer.patchDOM(container, '<div>Updated content</div>');
 *
 * @example
 * // With keyed elements for optimal list updates
 * const html = items.map(item => `<li key="${item.id}">${item.name}</li>`).join('');
 * renderer.patchDOM(listContainer, `<ul>${html}</ul>`);
 *
 * @example
 * // Keyed elements preserve DOM identity during reordering
 * // Before: [A, B, C] -> After: [C, A, B]
 * // The actual DOM nodes are moved, not recreated
 * renderer.patchDOM(container, '<div key="C">C</div><div key="A">A</div><div key="B">B</div>');
 *
 * @implements {RendererLike}
 */
export class Renderer implements RendererLike {
    /**
     * Temporary container for parsing new HTML content.
     * Reused across patch operations to minimize memory allocation.
     * @private
     * @type {HTMLDivElement}
     */
    private _tempContainer;
    /**
     * Patches the DOM of the given container with the provided HTML string.
     * Uses an optimized two-pointer diffing algorithm to minimize DOM operations.
     * The algorithm computes the minimal set of insertions, deletions, and updates
     * needed to transform the current DOM state to match the new HTML.
     *
     * @public
     * @param {HTMLElement} container - The container element to patch.
     * @param {string} newHtml - The new HTML string to render.
     * @returns {void}
     *
     * @example
     * // Simple content update
     * renderer.patchDOM(container, '<div class="updated">New content</div>');
     *
     * @example
     * // List with keyed items (optimal for reordering)
     * renderer.patchDOM(container, '<ul><li key="1">First</li><li key="2">Second</li></ul>');
     *
     * @example
     * // Empty the container
     * renderer.patchDOM(container, '');
     *
     * @see _diff - Low-level diffing algorithm.
     * @see _patchNode - Individual node patching.
     */
    public patchDOM(container: HTMLElement, newHtml: string): void;
    /**
     * Performs a diff between two DOM nodes and patches the old node to match the new node.
     * Uses a two-pointer algorithm with key-based reconciliation for optimal performance.
     * This method modifies oldParent in-place - it is not a pure function.
     *
     * Algorithm details:
     * 1. Early exit if both nodes have no children (O(1) leaf node optimization)
     * 2. Convert NodeLists to arrays for indexed access
     * 3. Initialize two-pointer indices (oldStart/oldEnd, newStart/newEnd)
     * 4. While pointers haven't crossed:
     *    a. Skip null entries (from previous moves)
     *    b. If nodes match (same key+tag or same type+name): patch and advance
     *    c. On mismatch: lazily build key→node map for O(1) lookup
     *    d. If keyed match found: move existing node (preserves DOM identity)
     *    e. Otherwise: clone and insert new node
     * 5. After loop: append remaining new nodes or remove remaining old nodes
     *
     * Complexity: O(n) for most cases, O(n²) worst case with no keys.
     * Non-keyed elements are matched by position and tag name.
     *
     * @private
     * @param {Element} oldParent - The original DOM element to update (modified in-place).
     * @param {Element} newParent - The new DOM element with desired state.
     * @returns {void}
     */
    private _diff;
    /**
     * Patches a single node, updating its content and attributes to match the new node.
     * Handles text nodes (nodeType 3 / Node.TEXT_NODE) by updating nodeValue,
     * and element nodes (nodeType 1 / Node.ELEMENT_NODE) by updating attributes
     * and recursively diffing children.
     *
     * Skips nodes that are managed by Eleva component instances to prevent interference
     * with nested component state.
     *
     * @private
     * @param {Node} oldNode - The original DOM node to update.
     * @param {Node} newNode - The new DOM node with desired state.
     * @returns {void}
     */
    private _patchNode;
    /**
     * Removes a node from its parent, with special handling for Eleva-managed elements.
     * Style elements with the `data-e-style` attribute are preserved to maintain
     * component styles across re-renders. Without this protection, component styles
     * would be removed during DOM diffing and lost until the next full re-render.
     *
     * @note Style tags persist for the component's entire lifecycle. If the template
     * conditionally removes elements that the CSS rules target (e.g., `.foo` elements),
     * the style rules remain but simply have no matching elements. This is expected
     * behavior - styles are cleaned up when the component unmounts, not when individual
     * elements are removed.
     *
     * @private
     * @param {HTMLElement} parent - The parent element containing the node.
     * @param {Node} node - The node to remove.
     * @returns {void}
     * @see _injectStyles - Where data-e-style elements are created.
     */
    private _removeNode;
    /**
     * Updates the attributes of an element to match a new element's attributes.
     * Adds new attributes, updates changed values, and removes attributes no longer present.
     * Also syncs DOM properties that can diverge from attributes after user interaction.
     *
     * Processing order:
     * 1. Iterate new attributes, skip @ prefixed (event) attributes
     * 2. Update attribute if value changed
     * 3. Sync corresponding DOM property if writable (handles boolean conversion)
     * 4. Iterate old attributes in reverse, remove if not in new element
     * 5. Sync SYNC_PROPS (value, checked, selected) from new to old element
     *
     * @private
     * @param {Element} oldEl - The original element to update.
     * @param {Element} newEl - The new element with target attributes.
     * @returns {void}
     */
    private _updateAttributes;
    /**
     * Determines if two nodes are the same for reconciliation purposes.
     * Two nodes are considered the same if:
     * - Both have keys: keys match AND tag names match
     * - Neither has keys: node types match AND node names match
     * - One has key, other doesn't: not the same
     *
     * This ensures keyed elements are only reused when both key and tag match,
     * preventing bugs like `<div key="a">` incorrectly matching `<span key="a">`.
     *
     * @private
     * @param {Node} oldNode - The first node to compare.
     * @param {Node} newNode - The second node to compare.
     * @returns {boolean} True if the nodes are considered the same for reconciliation.
     */
    private _isSameNode;
    /**
     * Extracts the key attribute from a node if it exists.
     * Only element nodes (nodeType === 1) can have key attributes.
     * Uses optional chaining for null-safe access.
     *
     * @private
     * @param {Node | null | undefined} node - The node to extract the key from.
     * @returns {string | null} The key attribute value, or null if not an element or no key.
     */
    private _getNodeKey;
    /**
     * Creates a key map for efficient O(1) lookup of keyed elements during diffing.
     * The map is built lazily only when needed (when a mismatch occurs during diffing).
     *
     * @private
     * @param {ChildNode[]} children - The array of child nodes to map.
     * @param {number} start - The start index (inclusive) for mapping.
     * @param {number} end - The end index (inclusive) for mapping.
     * @returns {KeyMap} A Map of key strings to their corresponding DOM nodes.
     */
    private _createKeyMap;
}
/**
 * Map of key attribute values to their corresponding DOM nodes.
 */
export type KeyMap = Map<string, Node>;
/**
 * Interface describing the public API of a Renderer.
 */
export type RendererLike = {
    /**
     *           Patches the DOM with new HTML content.
     */
    patchDOM: (arg0: HTMLElement, arg1: string) => void;
};
//# sourceMappingURL=Renderer.d.ts.map
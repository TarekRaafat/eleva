"use strict";

import Eleva from "../../../../src/index.js";
import { AttrPlugin } from "../../../../src/plugins/Attr.js";
import { cleanupFixtures } from "../../setup/test-utils.js";

/**
 * Helper function to create test elements
 * @param {string} tagName - The HTML tag name
 * @param {Object} attributes - Optional attributes to set
 * @returns {HTMLElement} The created element
 */
function createTestElement(tagName, attributes = {}) {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    return element;
}

describe("AttrPlugin", () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `<div id="app"></div>`;
        app = new Eleva("testApp");
    });

    afterEach(() => {
        cleanupFixtures();
        app = null;
    });

    describe("Plugin Installation", () => {
        test("should install the plugin correctly", () => {
            expect(() => {
                app.use(AttrPlugin);
            }).not.toThrow();

            expect(app.plugins.has("attr")).toBe(true);
            expect(app.updateElementAttributes).toBeDefined();
            expect(typeof app.updateElementAttributes).toBe("function");
        });

        test("should install with custom options", () => {
            const options = {
                enableAria: false,
                enableData: true,
                enableBoolean: false,
                enableDynamic: true
            };

            expect(() => {
                app.use(AttrPlugin, options);
            }).not.toThrow();

            expect(app.plugins.has("attr")).toBe(true);

            // Verify options are stored
            const pluginInfo = app.plugins.get("attr");
            expect(pluginInfo.options).toEqual(options);
        });

        test("should extend renderer with updateAttributes method", () => {
            app.use(AttrPlugin);

            expect(typeof app.updateElementAttributes).toBe("function");
            expect(app.renderer.updateAttributes).toBeDefined();
            expect(app.renderer._originalPatchNode).toBeDefined();
        });

        test("should override renderer _patchNode method", () => {
            const originalPatchNode = app.renderer._patchNode;
            app.use(AttrPlugin);

            expect(app.renderer._patchNode).not.toBe(originalPatchNode);
            expect(app.renderer._originalPatchNode).toBe(originalPatchNode);
        });

        test("should uninstall the plugin correctly", () => {
            const originalPatchNode = app.renderer._patchNode;
            app.use(AttrPlugin);

            expect(app.plugins.has("attr")).toBe(true);
            expect(app.updateElementAttributes).toBeDefined();

            // Uninstall the plugin
            AttrPlugin.uninstall(app);

            expect(app.plugins.has("attr")).toBe(false);
            expect(app.updateElementAttributes).toBeUndefined();
            expect(app.renderer._patchNode).toBe(originalPatchNode);
            expect(app.renderer._originalPatchNode).toBeUndefined();
        });
    });

    describe("ARIA Attribute Handling", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should handle aria-expanded attribute", () => {
            const oldEl = createTestElement("button");
            const newEl = createTestElement("button");
            newEl.setAttribute("aria-expanded", "true");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.getAttribute("aria-expanded")).toBe("true");
            expect(oldEl.ariaExpanded).toBe("true");
        });

        test("should handle aria-hidden attribute", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("aria-hidden", "false");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.getAttribute("aria-hidden")).toBe("false");
            expect(oldEl.ariaHidden).toBe("false");
        });

        test("should handle complex aria attributes with hyphens", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("aria-current", "page");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.getAttribute("aria-current")).toBe("page");
            expect(oldEl.ariaCurrent).toBe("page");
        });

        test("should skip aria attributes when disabled", () => {
            // Reinstall with aria disabled
            AttrPlugin.uninstall(app);
            app.use(AttrPlugin, { enableAria: false });

            const oldEl = createTestElement("button");
            const newEl = createTestElement("button");
            newEl.setAttribute("aria-expanded", "true");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.getAttribute("aria-expanded")).toBe("true");
            // When aria handling is disabled, property should still be set via fallback to setAttribute
            // but the specific ARIA property handling should not occur
            expect(oldEl.ariaExpanded).toBe("true");
        });
    });

    describe("Data Attribute Handling", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should handle data attributes", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("data-userid", "123");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.getAttribute("data-userid")).toBe("123");
            expect(oldEl.dataset.userid).toBe("123");
        });

        test("should handle multiple data attributes", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("data-testid", "component");
            newEl.setAttribute("data-value", "42");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.dataset.testid).toBe("component");
            expect(oldEl.dataset.value).toBe("42");
        });

        test("should skip data attributes when disabled", () => {
            AttrPlugin.uninstall(app);
            app.use(AttrPlugin, { enableData: false });

            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("data-test", "value");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.getAttribute("data-test")).toBe("value");
            // When data handling is disabled, dataset should still be set via browser default
            expect(oldEl.dataset.test).toBe("value");
        });
    });

    describe("Boolean Attribute Handling", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should handle disabled attribute as boolean", () => {
            const oldEl = createTestElement("button");
            const newEl = createTestElement("button");
            newEl.setAttribute("disabled", "");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.disabled).toBe(true);
            expect(oldEl.hasAttribute("disabled")).toBe(true);
        });

        test("should handle checked attribute as boolean", () => {
            const oldEl = createTestElement("input", { type: "checkbox" });
            const newEl = createTestElement("input", { type: "checkbox" });
            newEl.setAttribute("checked", "true");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.checked).toBe(true);
            expect(oldEl.hasAttribute("checked")).toBe(true);
        });

        test("should handle false boolean values", () => {
            const oldEl = createTestElement("button");
            oldEl.disabled = true;
            const newEl = createTestElement("button");
            newEl.setAttribute("disabled", "false");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.disabled).toBe(false);
            expect(oldEl.hasAttribute("disabled")).toBe(false);
        });

        test("should skip boolean handling when disabled", () => {
            AttrPlugin.uninstall(app);
            app.use(AttrPlugin, { enableBoolean: false });

            const oldEl = createTestElement("button");
            const newEl = createTestElement("button");
            newEl.setAttribute("disabled", "");

            app.updateElementAttributes(oldEl, newEl);

            // When boolean handling is disabled, it should be treated as string
            expect(oldEl.disabled).toBe(true); // Browser default behavior
            expect(oldEl.getAttribute("disabled")).toBe("");
        });
    });

    describe("Dynamic Property Detection", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should handle standard properties", () => {
            const oldEl = createTestElement("input");
            const newEl = createTestElement("input");
            newEl.setAttribute("value", "test-value");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.value).toBe("test-value");
            expect(oldEl.getAttribute("value")).toBe("test-value");
        });

        test("should handle class attribute", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("class", "test-class");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.className).toBe("test-class");
            expect(oldEl.getAttribute("class")).toBe("test-class");
        });

        test("should handle id attribute", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("id", "test-id");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.id).toBe("test-id");
            expect(oldEl.getAttribute("id")).toBe("test-id");
        });

        test("should skip dynamic detection when disabled", () => {
            AttrPlugin.uninstall(app);
            app.use(AttrPlugin, { enableDynamic: false });

            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("customattr", "value");

            app.updateElementAttributes(oldEl, newEl);

            // Should still set the attribute but not attempt property detection
            expect(oldEl.getAttribute("customattr")).toBe("value");
        });
    });

    describe("Attribute Removal", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should remove attributes not present in new element", () => {
            const oldEl = createTestElement("div");
            oldEl.setAttribute("old-attr", "value");
            oldEl.setAttribute("keep-attr", "keep");

            const newEl = createTestElement("div");
            newEl.setAttribute("keep-attr", "keep");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.hasAttribute("old-attr")).toBe(false);
            expect(oldEl.hasAttribute("keep-attr")).toBe(true);
        });

        test("should remove multiple old attributes", () => {
            const oldEl = createTestElement("div");
            oldEl.setAttribute("attr1", "value1");
            oldEl.setAttribute("attr2", "value2");
            oldEl.setAttribute("attr3", "value3");

            const newEl = createTestElement("div");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.hasAttribute("attr1")).toBe(false);
            expect(oldEl.hasAttribute("attr2")).toBe(false);
            expect(oldEl.hasAttribute("attr3")).toBe(false);
        });
    });

    describe("Event Attribute Handling", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should skip event attributes starting with @", () => {
            const oldEl = createTestElement("button");
            const newEl = createTestElement("button");
            // Manually set the attribute to simulate template processing
            Object.defineProperty(newEl, 'attributes', {
                value: [{
                    name: "@click",
                    value: "handleClick"
                }],
                configurable: true
            });

            app.updateElementAttributes(oldEl, newEl);

            // Event attributes should be skipped
            expect(oldEl.hasAttribute("@click")).toBe(false);
        });
    });

    describe("Attribute Change Detection", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should skip unchanged attributes", () => {
            const oldEl = createTestElement("div");
            oldEl.setAttribute("same-attr", "same-value");

            const newEl = createTestElement("div");
            newEl.setAttribute("same-attr", "same-value");

            // Mock to verify the attribute isn't processed
            const spy = jest.spyOn(oldEl, 'setAttribute');

            app.updateElementAttributes(oldEl, newEl);

            // setAttribute should not be called for unchanged attributes
            expect(spy).not.toHaveBeenCalledWith("same-attr", "same-value");
            spy.mockRestore();
        });

        test("should update changed attributes", () => {
            const oldEl = createTestElement("div");
            oldEl.setAttribute("test-attr", "old-value");

            const newEl = createTestElement("div");
            newEl.setAttribute("test-attr", "new-value");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.getAttribute("test-attr")).toBe("new-value");
        });
    });

    describe("Renderer Integration", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should integrate with renderer _patchNode", () => {
            const oldNode = createTestElement("div");
            const newNode = createTestElement("div");
            newNode.setAttribute("test", "value");

            // Mock the renderer methods
            app.renderer._isSameNode = jest.fn().mockReturnValue(true);
            app.renderer._diff = jest.fn();

            app.renderer._patchNode(oldNode, newNode);

            expect(oldNode.getAttribute("test")).toBe("value");
            expect(app.renderer._diff).toHaveBeenCalledWith(oldNode, newNode);
        });

        test("should handle text nodes in _patchNode", () => {
            const oldNode = document.createTextNode("old text");
            const newNode = document.createTextNode("new text");

            app.renderer._patchNode(oldNode, newNode);

            expect(oldNode.nodeValue).toBe("new text");
        });

        test("should skip nodes with _eleva_instance", () => {
            const oldNode = createTestElement("div");
            oldNode._eleva_instance = {};
            const newNode = createTestElement("div");

            const spy = jest.spyOn(app, 'updateElementAttributes');

            app.renderer._patchNode(oldNode, newNode);

            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });

        test("should replace different nodes", () => {
            const oldNode = createTestElement("div");
            const newNode = createTestElement("span");
            const parent = createTestElement("div");
            parent.appendChild(oldNode);

            app.renderer._isSameNode = jest.fn().mockReturnValue(false);
            const replaceSpy = jest.spyOn(oldNode, 'replaceWith');

            app.renderer._patchNode(oldNode, newNode);

            expect(replaceSpy).toHaveBeenCalled();
            replaceSpy.mockRestore();
        });
    });

    describe("Edge Cases and Error Handling", () => {
        beforeEach(() => {
            app.use(AttrPlugin);
        });

        test("should handle elements without attributes gracefully", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");

            expect(() => {
                app.updateElementAttributes(oldEl, newEl);
            }).not.toThrow();
        });

        test("should handle null attribute values", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("test", "");

            expect(() => {
                app.updateElementAttributes(oldEl, newEl);
            }).not.toThrow();

            expect(oldEl.getAttribute("test")).toBe("");
        });

        test("should handle special characters in attribute names", () => {
            const oldEl = createTestElement("div");
            const newEl = createTestElement("div");
            newEl.setAttribute("data-special_123", "value");

            app.updateElementAttributes(oldEl, newEl);

            expect(oldEl.getAttribute("data-special_123")).toBe("value");
            expect(oldEl.dataset.special_123).toBe("value");
        });

        test("should handle installation without renderer", () => {
            const appWithoutRenderer = { plugins: new Map() };

            expect(() => {
                AttrPlugin.install(appWithoutRenderer);
            }).not.toThrow();

            expect(appWithoutRenderer.updateElementAttributes).toBeDefined();
        });
    });
});

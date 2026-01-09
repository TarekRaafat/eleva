/**
 * @fileoverview Tests for the Attr Plugin
 */

import { describe, test, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import Eleva from "../../../src/index.js";
import { AttrPlugin } from "../../../src/plugins/Attr.js";
import { cleanupFixtures } from "../../utils.js";

/**
 * Helper function to create test elements
 */
function createTestElement(
  tagName: string,
  attributes: Record<string, string> = {}
): HTMLElement {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

// =============================================================================
// Attr Plugin Tests
// =============================================================================

describe("AttrPlugin", () => {
  let app: any;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    app = new Eleva("testApp");
  });

  afterEach(() => {
    cleanupFixtures();
    app = null;
  });

  // ===========================================================================
  // Plugin Installation
  // ===========================================================================

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
        enableDynamic: true,
      };

      expect(() => {
        app.use(AttrPlugin, options);
      }).not.toThrow();

      expect(app.plugins.has("attr")).toBe(true);

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

      AttrPlugin.uninstall(app);

      expect(app.plugins.has("attr")).toBe(false);
      expect(app.updateElementAttributes).toBeUndefined();
      expect(app.renderer._patchNode).toBe(originalPatchNode);
      expect(app.renderer._originalPatchNode).toBeUndefined();
    });
  });

  // ===========================================================================
  // ARIA Attribute Handling
  // ===========================================================================

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
      // Only check ariaExpanded if the property is supported (not in happy-dom)
      if ("ariaExpanded" in oldEl) {
        expect(oldEl.ariaExpanded).toBe("true");
      }
    });

    test("should handle aria-hidden attribute", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("aria-hidden", "false");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-hidden")).toBe("false");
      // Only check ariaHidden if the property is supported (not in happy-dom)
      if ("ariaHidden" in oldEl) {
        expect(oldEl.ariaHidden).toBe("false");
      }
    });

    test("should handle complex aria attributes with hyphens", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("aria-current", "page");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-current")).toBe("page");
      // Only check ariaCurrent if the property is supported (not in happy-dom)
      if ("ariaCurrent" in oldEl) {
        expect(oldEl.ariaCurrent).toBe("page");
      }
    });

    test("should skip aria attributes when disabled", () => {
      AttrPlugin.uninstall(app);
      app.use(AttrPlugin, { enableAria: false });

      const oldEl = createTestElement("button");
      const newEl = createTestElement("button");
      newEl.setAttribute("aria-expanded", "true");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-expanded")).toBe("true");
      // Only check ariaExpanded if the property is supported (not in happy-dom)
      if ("ariaExpanded" in oldEl) {
        expect(oldEl.ariaExpanded).toBe("true");
      }
    });
  });

  // ===========================================================================
  // Data Attribute Handling
  // ===========================================================================

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
      expect(oldEl.dataset.test).toBe("value");
    });
  });

  // ===========================================================================
  // Boolean Attribute Handling
  // ===========================================================================

  describe("Boolean Attribute Handling", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle disabled attribute as boolean", () => {
      const oldEl = createTestElement("button");
      const newEl = createTestElement("button");
      newEl.setAttribute("disabled", "");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLButtonElement).disabled).toBe(true);
      expect(oldEl.hasAttribute("disabled")).toBe(true);
    });

    test("should handle checked attribute as boolean", () => {
      const oldEl = createTestElement("input", { type: "checkbox" });
      const newEl = createTestElement("input", { type: "checkbox" });
      newEl.setAttribute("checked", "true");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).checked).toBe(true);
      expect(oldEl.hasAttribute("checked")).toBe(true);
    });

    test("should handle false boolean values", () => {
      const oldEl = createTestElement("button") as HTMLButtonElement;
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

      expect((oldEl as HTMLButtonElement).disabled).toBe(true);
      expect(oldEl.getAttribute("disabled")).toBe("");
    });
  });

  // ===========================================================================
  // Dynamic Property Detection
  // ===========================================================================

  describe("Dynamic Property Detection", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle standard properties", () => {
      const oldEl = createTestElement("input");
      const newEl = createTestElement("input");
      newEl.setAttribute("value", "test-value");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).value).toBe("test-value");
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

      expect(oldEl.getAttribute("customattr")).toBe("value");
    });
  });

  // ===========================================================================
  // Attribute Removal
  // ===========================================================================

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

  // ===========================================================================
  // Event Attribute Handling
  // ===========================================================================

  describe("Event Attribute Handling", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should skip event attributes starting with @", () => {
      const oldEl = createTestElement("button");
      const newEl = createTestElement("button");
      Object.defineProperty(newEl, "attributes", {
        value: [
          {
            name: "@click",
            value: "handleClick",
          },
        ],
        configurable: true,
      });

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.hasAttribute("@click")).toBe(false);
    });
  });

  // ===========================================================================
  // Attribute Change Detection
  // ===========================================================================

  describe("Attribute Change Detection", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should skip unchanged attributes", () => {
      const oldEl = createTestElement("div");
      oldEl.setAttribute("same-attr", "same-value");

      const newEl = createTestElement("div");
      newEl.setAttribute("same-attr", "same-value");

      const setAttributeSpy = spyOn(oldEl, "setAttribute");

      app.updateElementAttributes(oldEl, newEl);

      expect(setAttributeSpy).not.toHaveBeenCalledWith("same-attr", "same-value");
      setAttributeSpy.mockRestore();
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

  // ===========================================================================
  // Renderer Integration
  // ===========================================================================

  describe("Renderer Integration", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should integrate with renderer _patchNode", () => {
      const oldNode = createTestElement("div");
      const newNode = createTestElement("div");
      newNode.setAttribute("test", "value");

      app.renderer._diff = mock(() => {});

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
      const oldNode = createTestElement("div") as any;
      oldNode._eleva_instance = {};
      const newNode = createTestElement("div");

      const updateSpy = spyOn(app, "updateElementAttributes");

      app.renderer._patchNode(oldNode, newNode);

      expect(updateSpy).not.toHaveBeenCalled();
      updateSpy.mockRestore();
    });
  });

  // ===========================================================================
  // Edge Cases and Error Handling
  // ===========================================================================

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
      const appWithoutRenderer: any = { plugins: new Map() };

      expect(() => {
        AttrPlugin.install(appWithoutRenderer);
      }).not.toThrow();

      expect(appWithoutRenderer.updateElementAttributes).toBeDefined();
    });
  });

  // ===========================================================================
  // Plugin Metadata
  // ===========================================================================

  describe("Plugin Metadata", () => {
    test("should have correct plugin name", () => {
      expect(AttrPlugin.name).toBe("attr");
    });

    test("should have version string", () => {
      expect(typeof AttrPlugin.version).toBe("string");
      expect(AttrPlugin.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    test("should have description", () => {
      expect(typeof AttrPlugin.description).toBe("string");
      expect(AttrPlugin.description.length).toBeGreaterThan(0);
    });

    test("should store plugin metadata with options", () => {
      const options = { enableAria: true, enableData: false };
      app.use(AttrPlugin, options);

      const pluginInfo = app.plugins.get("attr");
      expect(pluginInfo.name).toBe("attr");
      expect(pluginInfo.version).toBe(AttrPlugin.version);
      expect(pluginInfo.options).toEqual(options);
    });
  });

  // ===========================================================================
  // Additional ARIA Attributes
  // ===========================================================================

  describe("Additional ARIA Attributes", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle aria-label attribute", () => {
      const oldEl = createTestElement("button");
      const newEl = createTestElement("button");
      newEl.setAttribute("aria-label", "Close dialog");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-label")).toBe("Close dialog");
      if ("ariaLabel" in oldEl) {
        expect(oldEl.ariaLabel).toBe("Close dialog");
      }
    });

    test("should handle aria-labelledby attribute", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("aria-labelledby", "heading-1");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-labelledby")).toBe("heading-1");
    });

    test("should handle aria-describedby attribute", () => {
      const oldEl = createTestElement("input");
      const newEl = createTestElement("input");
      newEl.setAttribute("aria-describedby", "description-1");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-describedby")).toBe("description-1");
    });

    test("should handle aria-live attribute", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("aria-live", "polite");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-live")).toBe("polite");
    });

    test("should handle aria-pressed attribute for toggle buttons", () => {
      const oldEl = createTestElement("button");
      const newEl = createTestElement("button");
      newEl.setAttribute("aria-pressed", "true");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-pressed")).toBe("true");
    });

    test("should handle aria-selected attribute", () => {
      const oldEl = createTestElement("li");
      const newEl = createTestElement("li");
      newEl.setAttribute("aria-selected", "true");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-selected")).toBe("true");
    });

    test("should handle aria-valuenow attribute", () => {
      const oldEl = createTestElement("div");
      oldEl.setAttribute("role", "progressbar");
      const newEl = createTestElement("div");
      newEl.setAttribute("aria-valuenow", "50");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-valuenow")).toBe("50");
    });
  });

  // ===========================================================================
  // Additional Boolean Attributes
  // ===========================================================================

  describe("Additional Boolean Attributes", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle hidden attribute", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("hidden", "");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as any).hidden).toBe(true);
      expect(oldEl.hasAttribute("hidden")).toBe(true);
    });

    test("should handle readonly attribute on input", () => {
      const oldEl = createTestElement("input");
      const newEl = createTestElement("input");
      newEl.setAttribute("readonly", "true");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).readOnly).toBe(true);
    });

    test("should handle required attribute", () => {
      const oldEl = createTestElement("input");
      const newEl = createTestElement("input");
      newEl.setAttribute("required", "");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).required).toBe(true);
    });

    test("should handle multiple attribute on select", () => {
      const oldEl = createTestElement("select");
      const newEl = createTestElement("select");
      newEl.setAttribute("multiple", "");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLSelectElement).multiple).toBe(true);
    });

    test("should handle autofocus attribute", () => {
      const oldEl = createTestElement("input");
      const newEl = createTestElement("input");
      newEl.setAttribute("autofocus", "");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).autofocus).toBe(true);
    });

    test("should handle open attribute on details", () => {
      const oldEl = createTestElement("details");
      const newEl = createTestElement("details");
      newEl.setAttribute("open", "");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLDetailsElement).open).toBe(true);
    });

    test("should toggle boolean from true to false", () => {
      const oldEl = createTestElement("input") as HTMLInputElement;
      oldEl.required = true;
      oldEl.setAttribute("required", "");

      const newEl = createTestElement("input");
      newEl.setAttribute("required", "false");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.required).toBe(false);
      expect(oldEl.hasAttribute("required")).toBe(false);
    });
  });

  // ===========================================================================
  // Additional Data Attributes
  // ===========================================================================

  describe("Additional Data Attributes", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle hyphenated data attributes", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("data-user-name", "John Doe");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("data-user-name")).toBe("John Doe");
      expect(oldEl.dataset.userName).toBe("John Doe");
    });

    test("should handle numeric data attribute values", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("data-count", "42");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.dataset.count).toBe("42");
    });

    test("should handle JSON data attribute values", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      const jsonData = JSON.stringify({ key: "value", num: 42 });
      newEl.setAttribute("data-config", jsonData);

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.dataset.config).toBe(jsonData);
    });

    test("should update data attribute when value changes", () => {
      const oldEl = createTestElement("div");
      oldEl.setAttribute("data-status", "inactive");

      const newEl = createTestElement("div");
      newEl.setAttribute("data-status", "active");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.dataset.status).toBe("active");
    });
  });

  // ===========================================================================
  // Combined Attribute Handling
  // ===========================================================================

  describe("Combined Attribute Handling", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle aria, data, and boolean attributes together", () => {
      const oldEl = createTestElement("button");
      const newEl = createTestElement("button");
      newEl.setAttribute("aria-expanded", "false");
      newEl.setAttribute("data-target", "menu-1");
      newEl.setAttribute("disabled", "");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("aria-expanded")).toBe("false");
      expect(oldEl.dataset.target).toBe("menu-1");
      expect((oldEl as HTMLButtonElement).disabled).toBe(true);
    });

    test("should handle class and style together", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("class", "btn btn-primary");
      newEl.setAttribute("style", "color: red;");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.className).toBe("btn btn-primary");
      expect(oldEl.getAttribute("style")).toBe("color: red;");
    });

    test("should handle form-related attributes", () => {
      const oldEl = createTestElement("input");
      const newEl = createTestElement("input");
      newEl.setAttribute("type", "text");
      newEl.setAttribute("name", "username");
      newEl.setAttribute("placeholder", "Enter username");
      newEl.setAttribute("maxlength", "50");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).type).toBe("text");
      expect((oldEl as HTMLInputElement).name).toBe("username");
      expect((oldEl as HTMLInputElement).placeholder).toBe("Enter username");
      expect((oldEl as HTMLInputElement).maxLength).toBe(50);
    });
  });

  // ===========================================================================
  // Attribute Value Types
  // ===========================================================================

  describe("Attribute Value Types", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle empty string attribute value", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("title", "");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("title")).toBe("");
    });

    test("should handle whitespace attribute value", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("title", "   ");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("title")).toBe("   ");
    });

    test("should handle unicode attribute value", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("data-emoji", "👋🌍");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("data-emoji")).toBe("👋🌍");
      expect(oldEl.dataset.emoji).toBe("👋🌍");
    });

    test("should handle very long attribute value", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      const longValue = "a".repeat(10000);
      newEl.setAttribute("data-long", longValue);

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("data-long")).toBe(longValue);
    });
  });

  // ===========================================================================
  // Input Element Specifics
  // ===========================================================================

  describe("Input Element Specifics", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle input type changes", () => {
      const oldEl = createTestElement("input");
      const newEl = createTestElement("input");
      newEl.setAttribute("type", "password");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).type).toBe("password");
    });

    test("should handle min and max attributes on number input", () => {
      const oldEl = createTestElement("input", { type: "number" });
      const newEl = createTestElement("input", { type: "number" });
      newEl.setAttribute("min", "0");
      newEl.setAttribute("max", "100");
      newEl.setAttribute("step", "5");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).min).toBe("0");
      expect((oldEl as HTMLInputElement).max).toBe("100");
      expect((oldEl as HTMLInputElement).step).toBe("5");
    });

    test("should handle pattern attribute on input", () => {
      const oldEl = createTestElement("input");
      const newEl = createTestElement("input");
      newEl.setAttribute("pattern", "[A-Za-z]+");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLInputElement).pattern).toBe("[A-Za-z]+");
    });
  });

  // ===========================================================================
  // Link and Media Elements
  // ===========================================================================

  describe("Link and Media Elements", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should handle href attribute on anchor", () => {
      const oldEl = createTestElement("a");
      const newEl = createTestElement("a");
      newEl.setAttribute("href", "https://example.com");
      newEl.setAttribute("target", "_blank");
      newEl.setAttribute("rel", "noopener");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLAnchorElement).href).toBe("https://example.com/");
      expect((oldEl as HTMLAnchorElement).target).toBe("_blank");
      expect((oldEl as HTMLAnchorElement).rel).toBe("noopener");
    });

    test("should handle src attribute on image", () => {
      const oldEl = createTestElement("img");
      const newEl = createTestElement("img");
      newEl.setAttribute("src", "image.png");
      newEl.setAttribute("alt", "Test image");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLImageElement).alt).toBe("Test image");
    });

    test("should handle srcset and sizes on image", () => {
      const oldEl = createTestElement("img");
      const newEl = createTestElement("img");
      newEl.setAttribute("srcset", "small.jpg 500w, large.jpg 1000w");
      newEl.setAttribute("sizes", "(max-width: 600px) 500px, 1000px");

      app.updateElementAttributes(oldEl, newEl);

      expect((oldEl as HTMLImageElement).srcset).toBe("small.jpg 500w, large.jpg 1000w");
      expect((oldEl as HTMLImageElement).sizes).toBe("(max-width: 600px) 500px, 1000px");
    });
  });

  // ===========================================================================
  // Camel Case Conversion
  // ===========================================================================

  describe("Camel Case Conversion", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should convert hyphenated attribute to camelCase property", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("tab-index", "0");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("tab-index")).toBe("0");
    });

    test("should handle multiple hyphens", () => {
      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("data-my-complex-value", "test");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.dataset.myComplexValue).toBe("test");
    });
  });

  // ===========================================================================
  // Component Integration
  // ===========================================================================

  describe("Component Integration", () => {
    beforeEach(() => {
      app.use(AttrPlugin);
    });

    test("should work with component attribute binding", async () => {
      app.component("AttrComponent", {
        setup({ signal }: any) {
          const isExpanded = signal(false);
          const dataId = signal("123");
          return { isExpanded, dataId };
        },
        template: (ctx: any) => `
          <button
            aria-expanded="${ctx.isExpanded.value}"
            data-id="${ctx.dataId.value}"
            disabled="${ctx.isExpanded.value}">
            Toggle
          </button>
        `,
      });

      const container = document.getElementById("app")!;
      await app.mount(container, "AttrComponent");

      const button = container.querySelector("button")!;
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(button.dataset.id).toBe("123");
    });

    test("should update attributes on re-render", async () => {
      let updateFn: any;

      app.component("DynamicAttrComponent", {
        setup({ signal }: any) {
          const status = signal("inactive");
          updateFn = () => { status.value = "active"; };
          return { status };
        },
        template: (ctx: any) => `
          <div data-status="${ctx.status.value}">${ctx.status.value}</div>
        `,
      });

      const container = document.getElementById("app")!;
      await app.mount(container, "DynamicAttrComponent");

      let div = container.querySelector("div")!;
      expect(div.dataset.status).toBe("inactive");

      updateFn();
      await new Promise(resolve => setTimeout(resolve, 50));

      div = container.querySelector("div")!;
      expect(div.dataset.status).toBe("active");
    });
  });

  // ===========================================================================
  // All Options Disabled
  // ===========================================================================

  describe("All Options Disabled", () => {
    test("should still update basic attributes when all special handling disabled", () => {
      app.use(AttrPlugin, {
        enableAria: false,
        enableData: false,
        enableBoolean: false,
        enableDynamic: false,
      });

      const oldEl = createTestElement("div");
      const newEl = createTestElement("div");
      newEl.setAttribute("title", "Test title");
      newEl.setAttribute("class", "test-class");

      app.updateElementAttributes(oldEl, newEl);

      expect(oldEl.getAttribute("title")).toBe("Test title");
      expect(oldEl.getAttribute("class")).toBe("test-class");
    });
  });

  // ===========================================================================
  // Uninstall Scenarios
  // ===========================================================================

  describe("Uninstall Scenarios", () => {
    test("should handle double uninstall gracefully", () => {
      app.use(AttrPlugin);
      AttrPlugin.uninstall(app);

      expect(() => {
        AttrPlugin.uninstall(app);
      }).not.toThrow();
    });

    test("should handle uninstall without prior install", () => {
      const freshApp = new Eleva("freshApp");

      expect(() => {
        AttrPlugin.uninstall(freshApp);
      }).not.toThrow();
    });
  });
});

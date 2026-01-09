/**
 * @fileoverview Tests for the Renderer module of the Eleva framework
 *
 * These tests verify the DOM manipulation and rendering capabilities
 * of the minimal Renderer module.
 */

import { describe, test, expect, beforeEach } from "bun:test";
import { Renderer } from "../../../src/modules/Renderer.js";

describe("Renderer", () => {
  let container: HTMLElement;
  let renderer: Renderer;

  beforeEach(() => {
    container = document.createElement("div");
    renderer = new Renderer();
  });

  test("should update container content when patching DOM", () => {
    container.innerHTML = "<p>Old</p>";
    renderer.patchDOM(container, "<p>New</p>");

    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });

  test("should sync element attributes correctly", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");
    oldEl.setAttribute("class", "to-remove");

    const newEl = document.createElement("div");
    newEl.setAttribute("data-test", "new");

    (renderer as any)._updateAttributes(oldEl, newEl);

    expect(oldEl.getAttribute("data-test")).toBe("new");
    expect(oldEl.hasAttribute("class")).toBe(false);
  });

  test("should update element properties", () => {
    const oldEl = document.createElement("div");
    oldEl.id = "oldValue";

    const newEl = document.createElement("div");
    newEl.setAttribute("id", "newValue");

    (renderer as any)._updateAttributes(oldEl, newEl);

    expect(oldEl.id).toBe("newValue");
  });

  test("should replace differing nodes", () => {
    container.innerHTML = `<div key="1">Old</div>`;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<div key="1">New</div>`;

    (renderer as any)._diff(container, tempContainer);

    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });

  test("should replace nodes with differing nodeType or nodeName", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = "<p>Old</p>";

    const newParent = document.createElement("div");
    newParent.innerHTML = "<span>New</span>";

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.innerHTML).toBe("<span>New</span>");
  });

  test("should handle empty containers and newHtml", () => {
    const emptyContainer = document.createElement("div");
    renderer.patchDOM(emptyContainer, "");
    expect(emptyContainer.innerHTML).toBe("");

    const container1 = document.createElement("div");
    const tempContainer1 = document.createElement("div");
    tempContainer1.innerHTML = `<p>New</p>`;
    (renderer as any)._diff(container1, tempContainer1);
    expect(container1.innerHTML).toBe(`<p>New</p>`);

    const container2 = document.createElement("div");
    container2.innerHTML = `<p>Old</p>`;
    const tempContainer2 = document.createElement("div");
    (renderer as any)._diff(container2, tempContainer2);
    expect(container2.innerHTML).toBe("");
  });

  test("should handle identical nodes (fast path)", () => {
    const testContainer = document.createElement("div");
    testContainer.innerHTML = "<p>Same</p>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Same</p>";

    (renderer as any)._diff(testContainer, tempContainer);

    expect(testContainer.innerHTML).toBe("<p>Same</p>");
  });

  test("should handle appending and removing nodes", () => {
    const container1 = document.createElement("div");
    container1.innerHTML = "<p>Old</p>";

    const tempContainer1 = document.createElement("div");
    tempContainer1.innerHTML = "<p>Old</p><span>New</span>";

    (renderer as any)._diff(container1, tempContainer1);

    expect(container1.innerHTML).toBe("<p>Old</p><span>New</span>");

    const container2 = document.createElement("div");
    container2.innerHTML = "<p>Old</p><span>Remove</span>";

    const tempContainer2 = document.createElement("div");
    tempContainer2.innerHTML = "<p>Old</p>";

    (renderer as any)._diff(container2, tempContainer2);

    expect(container2.innerHTML).toBe("<p>Old</p>");
  });

  test("should replace nodes with differing keys", () => {
    const testContainer = document.createElement("div");
    testContainer.innerHTML = '<div key="1">Old</div>';

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = '<div key="2">New</div>';

    (renderer as any)._diff(testContainer, tempContainer);

    expect(testContainer.innerHTML).toBe('<div key="2">New</div>');
  });

  test("should update text content for text nodes", () => {
    const testContainer = document.createElement("div");
    testContainer.innerHTML = "Old Text";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "New Text";

    (renderer as any)._diff(testContainer, tempContainer);

    expect(testContainer.innerHTML).toBe("New Text");
  });

  test("should handle deeply nested structures", () => {
    const testContainer = document.createElement("div");
    testContainer.innerHTML = `
      <div class="wrapper">
        <div class="header">
          <h1>Title</h1>
          <nav>
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
          </nav>
        </div>
        <div class="content">
          <p>Content</p>
        </div>
      </div>
    `;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `
      <div class="wrapper">
        <div class="header">
          <h1>New Title</h1>
          <nav>
            <a href="#">New Link 1</a>
            <a href="#">New Link 2</a>
          </nav>
        </div>
        <div class="content">
          <p>New Content</p>
        </div>
      </div>
    `;

    (renderer as any)._diff(testContainer, tempContainer);

    expect(testContainer.innerHTML).toBe(tempContainer.innerHTML);
  });

  test("should skip diffing nodes with _eleva_instance", () => {
    const oldParent = document.createElement("div");
    const oldNode = document.createElement("div") as any;
    oldNode._eleva_instance = { some: "data" };
    oldParent.appendChild(oldNode);

    const newParent = document.createElement("div");
    const newNode = document.createElement("div");
    newNode.textContent = "New Content";
    newParent.appendChild(newNode);

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.firstChild).toBe(oldNode);
    expect((oldParent.firstChild as HTMLElement).textContent).not.toBe(
      "New Content"
    );
  });

  test("should preserve special style elements", () => {
    const testContainer = document.createElement("div");
    const style = document.createElement("style");
    style.setAttribute("data-e-style", "c1");
    testContainer.appendChild(style);

    const tempContainer = document.createElement("div");

    (renderer as any)._diff(testContainer, tempContainer);

    expect(testContainer.querySelector("style[data-e-style]")).not.toBeNull();
  });

  test("should handle keyed element reordering", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="a">A</div>
      <div key="b">B</div>
      <div key="c">C</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="c">C</div>
      <div key="a">A</div>
      <div key="b">B</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["c", "a", "b"]);
  });

  test("should patch text nodes correctly", () => {
    const parent = document.createElement("div");
    const oldText = document.createTextNode("Old");
    parent.appendChild(oldText);

    const newText = document.createTextNode("New");

    (renderer as any)._patchNode(oldText, newText);

    expect(oldText.nodeValue).toBe("New");
  });

  test("should skip event attributes (starting with @)", () => {
    const oldEl = document.createElement("button");
    oldEl.setAttribute("@click", "handleClick");

    const newEl = document.createElement("button");
    newEl.setAttribute("@click", "newHandler");
    newEl.setAttribute("class", "btn");

    (renderer as any)._updateAttributes(oldEl, newEl);

    // @ attributes should not be synced (handled by event system)
    expect(oldEl.getAttribute("@click")).toBe("handleClick");
    expect(oldEl.getAttribute("class")).toBe("btn");
  });

  test("should correctly identify same nodes", () => {
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const span = document.createElement("span");
    const keyedDiv1 = document.createElement("div");
    keyedDiv1.setAttribute("key", "1");
    const keyedDiv2 = document.createElement("div");
    keyedDiv2.setAttribute("key", "1");
    const keyedDiv3 = document.createElement("div");
    keyedDiv3.setAttribute("key", "2");

    expect((renderer as any)._isSameNode(div1, div2)).toBe(true);
    expect((renderer as any)._isSameNode(div1, span)).toBe(false);
    expect((renderer as any)._isSameNode(keyedDiv1, keyedDiv2)).toBe(true);
    expect((renderer as any)._isSameNode(keyedDiv1, keyedDiv3)).toBe(false);
    expect((renderer as any)._isSameNode(null, div1)).toBe(false);
    expect((renderer as any)._isSameNode(div1, null)).toBe(false);
  });

  // ============================================================================
  // Additional Edge Case Tests
  // ============================================================================

  test("should preserve DOM identity when reordering keyed elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="a">A</div>
      <div key="b">B</div>
      <div key="c">C</div>
    `;

    // Store references to original DOM nodes
    const originalNodes = Array.from(oldParent.children);
    const nodeA = originalNodes[0];
    const nodeB = originalNodes[1];
    const nodeC = originalNodes[2];

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="c">C</div>
      <div key="a">A</div>
      <div key="b">B</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    // Verify same DOM node references (identity preserved)
    const reorderedNodes = Array.from(oldParent.children);
    expect(reorderedNodes[0]).toBe(nodeC); // C moved to first
    expect(reorderedNodes[1]).toBe(nodeA); // A moved to second
    expect(reorderedNodes[2]).toBe(nodeB); // B moved to third
  });

  test("should handle mixed keyed and non-keyed elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="a">A</div>
      <span>No Key 1</span>
      <div key="b">B</div>
      <span>No Key 2</span>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="b">B Updated</div>
      <span>No Key Updated</span>
      <div key="a">A Updated</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children.length).toBe(3);
    expect(oldParent.children[0].getAttribute("key")).toBe("b");
    expect(oldParent.children[0].textContent).toBe("B Updated");
    expect(oldParent.children[2].getAttribute("key")).toBe("a");
    expect(oldParent.children[2].textContent).toBe("A Updated");
  });

  test("should update content of keyed elements while preserving identity", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div key="item1"><span>Old Content</span></div>`;

    const originalNode = oldParent.children[0];

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div key="item1"><span>New Content</span></div>`;

    (renderer as any)._diff(oldParent, newParent);

    // Same node reference but updated content
    expect(oldParent.children[0]).toBe(originalNode);
    expect(oldParent.children[0].textContent).toBe("New Content");
  });

  test("should handle keyed node removal in the middle", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="a">A</div>
      <div key="b">B</div>
      <div key="c">C</div>
      <div key="d">D</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="a">A</div>
      <div key="c">C</div>
      <div key="d">D</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["a", "c", "d"]);
  });

  test("should handle keyed node insertion in the middle", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="a">A</div>
      <div key="c">C</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="a">A</div>
      <div key="b">B</div>
      <div key="c">C</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["a", "b", "c"]);
  });

  test("should handle node type change from element to text", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<span>Element</span>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `Plain Text`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.innerHTML).toBe("Plain Text");
    expect(oldParent.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
  });

  test("should handle node type change from text to element", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `Plain Text`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<span>Element</span>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.innerHTML).toBe("<span>Element</span>");
    expect(oldParent.childNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
  });

  test("should handle comment nodes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<p>Before</p><!-- comment --><p>After</p>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<p>Before Updated</p><!-- new comment --><p>After Updated</p>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("p")?.textContent).toBe("Before Updated");
  });

  test("should handle multiple consecutive text nodes", () => {
    const oldParent = document.createElement("div");
    const text1 = document.createTextNode("Hello ");
    const text2 = document.createTextNode("World");
    oldParent.appendChild(text1);
    oldParent.appendChild(text2);

    const newParent = document.createElement("div");
    newParent.innerHTML = "Goodbye World";

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.textContent).toBe("Goodbye World");
  });

  test("should handle complete list replacement with different keys", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="1">Item 1</div>
      <div key="2">Item 2</div>
      <div key="3">Item 3</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="4">Item 4</div>
      <div key="5">Item 5</div>
      <div key="6">Item 6</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["4", "5", "6"]);
  });

  test("should handle reverse order of keyed elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="1">First</div>
      <div key="2">Second</div>
      <div key="3">Third</div>
    `;

    const originalFirst = oldParent.children[0];
    const originalSecond = oldParent.children[1];
    const originalThird = oldParent.children[2];

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="3">Third</div>
      <div key="2">Second</div>
      <div key="1">First</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    // Verify order reversed and identity preserved
    expect(oldParent.children[0]).toBe(originalThird);
    expect(oldParent.children[1]).toBe(originalSecond);
    expect(oldParent.children[2]).toBe(originalFirst);
  });

  test("should handle keyed element with only key as child", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div key="only"></div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div key="only"><span>Added child</span></div>`;

    const originalNode = oldParent.children[0];

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children[0]).toBe(originalNode);
    expect(oldParent.children[0].innerHTML).toBe("<span>Added child</span>");
  });

  test("should handle attribute-only changes on keyed elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div key="item" class="old-class" data-value="old">Content</div>`;

    const originalNode = oldParent.children[0];

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div key="item" class="new-class" data-value="new">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children[0]).toBe(originalNode);
    expect(oldParent.children[0].getAttribute("class")).toBe("new-class");
    expect(oldParent.children[0].getAttribute("data-value")).toBe("new");
  });

  // ============================================================================
  // Critical Corner Case Tests
  // ============================================================================

  test("should handle duplicate keys (last one wins in keyMap)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="dup">First</div>
      <div key="dup">Second</div>
      <div key="other">Other</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="other">Other Updated</div>
      <div key="dup">Merged</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    // Should have 2 children after diff
    expect(oldParent.children.length).toBe(2);
  });

  test("should handle keyed element with changed tag name", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div key="item">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<span key="item">New Content</span>`;

    (renderer as any)._diff(oldParent, newParent);

    // Key matches but tag differs - should insert new span
    expect(oldParent.innerHTML).toContain("span");
    expect(oldParent.textContent).toContain("New Content");
  });

  test("should handle key attribute being removed", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div key="item">Keyed</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div>No Key</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.innerHTML).toBe("<div>No Key</div>");
    expect(oldParent.children[0].hasAttribute("key")).toBe(false);
  });

  test("should handle key attribute being added", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div>No Key</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div key="item">Now Keyed</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children[0].getAttribute("key")).toBe("item");
    expect(oldParent.textContent).toContain("Now Keyed");
  });

  test("should handle empty string key as falsy", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div key="">Empty Key</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div key="">Updated Empty Key</div>`;

    (renderer as any)._diff(oldParent, newParent);

    // Empty key should be treated as no key (falsy)
    expect(oldParent.textContent).toContain("Updated Empty Key");
  });

  test("should handle _isSameNode with keyed vs non-keyed elements", () => {
    const keyedDiv = document.createElement("div");
    keyedDiv.setAttribute("key", "a");

    const nonKeyedDiv = document.createElement("div");

    // Keyed element should not match non-keyed element
    expect((renderer as any)._isSameNode(keyedDiv, nonKeyedDiv)).toBe(false);
    expect((renderer as any)._isSameNode(nonKeyedDiv, keyedDiv)).toBe(false);
  });

  test("should handle void elements (img, input, br)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<img src="old.jpg" alt="old">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<img src="new.jpg" alt="new">`;

    (renderer as any)._diff(oldParent, newParent);

    const img = oldParent.querySelector("img");
    expect(img?.getAttribute("src")).toBe("new.jpg");
    expect(img?.getAttribute("alt")).toBe("new");
  });

  test("should handle input type attribute changes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input type="text" value="test">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input type="password" value="secret">`;

    (renderer as any)._diff(oldParent, newParent);

    const input = oldParent.querySelector("input");
    expect(input?.getAttribute("type")).toBe("password");
    expect(input?.getAttribute("value")).toBe("secret");
  });

  test("should handle boolean attributes (disabled, checked, readonly)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button>Click</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button disabled>Click</button>`;

    (renderer as any)._diff(oldParent, newParent);

    const button = oldParent.querySelector("button");
    expect(button?.hasAttribute("disabled")).toBe(true);
  });

  test("should remove boolean attributes when not present", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button disabled>Click</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button>Click</button>`;

    (renderer as any)._diff(oldParent, newParent);

    const button = oldParent.querySelector("button");
    expect(button?.hasAttribute("disabled")).toBe(false);
  });

  test("should handle select element with options", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <select>
        <option value="a">A</option>
        <option value="b">B</option>
      </select>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <select>
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
      </select>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const options = oldParent.querySelectorAll("option");
    expect(options.length).toBe(3);
    expect(options[2].value).toBe("c");
  });

  test("should handle textarea content", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<textarea>Old content</textarea>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<textarea>New content</textarea>`;

    (renderer as any)._diff(oldParent, newParent);

    const textarea = oldParent.querySelector("textarea");
    expect(textarea?.textContent).toBe("New content");
  });

  test("should handle table structure", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <table>
        <tbody>
          <tr><td>A</td></tr>
        </tbody>
      </table>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <table>
        <tbody>
          <tr><td>A</td></tr>
          <tr><td>B</td></tr>
        </tbody>
      </table>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const rows = oldParent.querySelectorAll("tr");
    expect(rows.length).toBe(2);
  });

  test("should handle special characters in key values", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="item-1">Item 1</div>
      <div key="item:2">Item 2</div>
      <div key="item.3">Item 3</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="item.3">Item 3 Updated</div>
      <div key="item:2">Item 2 Updated</div>
      <div key="item-1">Item 1 Updated</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["item.3", "item:2", "item-1"]);
  });

  test("should handle whitespace-only text nodes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<span>A</span>   <span>B</span>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<span>A</span><span>B</span>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelectorAll("span").length).toBe(2);
  });

  test("should handle numeric key values", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="1">One</div>
      <div key="2">Two</div>
      <div key="3">Three</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="2">Two Updated</div>
      <div key="3">Three Updated</div>
      <div key="1">One Updated</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["2", "3", "1"]);
  });

  test("should handle single child scenarios", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<span>Only Child</span>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<span>Updated Only Child</span>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children.length).toBe(1);
    expect(oldParent.textContent).toBe("Updated Only Child");
  });

  test("should handle all children removed", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="1">A</div>
      <div key="2">B</div>
      <div key="3">C</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = ``;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children.length).toBe(0);
  });

  test("should handle all children added to empty parent", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = ``;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="1">A</div>
      <div key="2">B</div>
      <div key="3">C</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children.length).toBe(3);
  });

  // ============================================================================
  // HIGH RISK: _patchNode Edge Cases
  // ============================================================================

  test("should handle _patchNode with element nodes that have _eleva_instance", () => {
    const oldNode = document.createElement("div") as any;
    oldNode._eleva_instance = { component: "test" };
    oldNode.textContent = "Original";

    const newNode = document.createElement("div");
    newNode.textContent = "Updated";

    // Should skip patching when _eleva_instance exists
    (renderer as any)._patchNode(oldNode, newNode);

    expect(oldNode.textContent).toBe("Original"); // Not updated
  });

  test("should handle _patchNode with text nodes correctly", () => {
    const oldText = document.createTextNode("Old");
    const newText = document.createTextNode("New");

    (renderer as any)._patchNode(oldText, newText);

    expect(oldText.nodeValue).toBe("New");
  });

  test("should handle _patchNode with identical text nodes (no change)", () => {
    const oldText = document.createTextNode("Same");
    const newText = document.createTextNode("Same");

    (renderer as any)._patchNode(oldText, newText);

    expect(oldText.nodeValue).toBe("Same");
  });

  // ============================================================================
  // HIGH RISK: Form Element State
  // ============================================================================

  test("should sync input value attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input type="text" value="old">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input type="text" value="new">`;

    (renderer as any)._diff(oldParent, newParent);

    const input = oldParent.querySelector("input");
    expect(input?.getAttribute("value")).toBe("new");
  });

  test("should handle checkbox checked attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input type="checkbox">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input type="checkbox" checked>`;

    (renderer as any)._diff(oldParent, newParent);

    const checkbox = oldParent.querySelector("input");
    expect(checkbox?.hasAttribute("checked")).toBe(true);
  });

  test("should remove checkbox checked attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input type="checkbox" checked>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input type="checkbox">`;

    (renderer as any)._diff(oldParent, newParent);

    const checkbox = oldParent.querySelector("input");
    expect(checkbox?.hasAttribute("checked")).toBe(false);
  });

  test("should handle radio button checked attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <input type="radio" name="test" value="a">
      <input type="radio" name="test" value="b">
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <input type="radio" name="test" value="a" checked>
      <input type="radio" name="test" value="b">
    `;

    (renderer as any)._diff(oldParent, newParent);

    const radios = oldParent.querySelectorAll("input");
    expect(radios[0].hasAttribute("checked")).toBe(true);
    expect(radios[1].hasAttribute("checked")).toBe(false);
  });

  test("should handle select option selected attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <select>
        <option value="a" selected>A</option>
        <option value="b">B</option>
      </select>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <select>
        <option value="a">A</option>
        <option value="b" selected>B</option>
      </select>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const options = oldParent.querySelectorAll("option");
    expect(options[0].hasAttribute("selected")).toBe(false);
    expect(options[1].hasAttribute("selected")).toBe(true);
  });

  // ============================================================================
  // HIGH RISK: Script and Style Elements
  // ============================================================================

  test("should handle style element content updates", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<style>.old { color: red; }</style>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<style>.new { color: blue; }</style>`;

    (renderer as any)._diff(oldParent, newParent);

    const style = oldParent.querySelector("style");
    expect(style?.textContent).toContain(".new");
    expect(style?.textContent).toContain("blue");
  });

  test("should handle script element content (treated as text)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<script>console.log("old");</script>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<script>console.log("new");</script>`;

    (renderer as any)._diff(oldParent, newParent);

    const script = oldParent.querySelector("script");
    expect(script?.textContent).toContain("new");
  });

  test("should preserve data-e-style elements even when not in new HTML", () => {
    const oldParent = document.createElement("div");
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-e-style", "component-1");
    styleEl.textContent = ".scoped { color: red; }";
    oldParent.appendChild(styleEl);

    const newParent = document.createElement("div");
    newParent.innerHTML = `<p>Content without style</p>`;

    (renderer as any)._diff(oldParent, newParent);

    // Style with data-e-style should be preserved
    expect(oldParent.querySelector("style[data-e-style]")).not.toBeNull();
  });

  // ============================================================================
  // HIGH RISK: Node Type Mismatches in Diff
  // ============================================================================

  test("should handle replacing element with text at same position", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<span>Element</span>`;

    const newParent = document.createElement("div");
    newParent.appendChild(document.createTextNode("Just Text"));

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.childNodes.length).toBe(1);
    expect(oldParent.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
    expect(oldParent.textContent).toBe("Just Text");
  });

  test("should handle replacing text with element at same position", () => {
    const oldParent = document.createElement("div");
    oldParent.appendChild(document.createTextNode("Just Text"));

    const newParent = document.createElement("div");
    newParent.innerHTML = `<span>Element</span>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.childNodes.length).toBe(1);
    expect(oldParent.childNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
    expect(oldParent.innerHTML).toBe("<span>Element</span>");
  });

  test("should handle mixed text and element children reordering", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `Text Before<span>Middle</span>Text After`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<span>Middle Updated</span>Text After Updated`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("span")?.textContent).toBe("Middle Updated");
  });

  // ============================================================================
  // HIGH RISK: Complex Keyed Scenarios
  // ============================================================================

  test("should handle keyed list with some items removed and some added", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="a">A</div>
      <div key="b">B</div>
      <div key="c">C</div>
      <div key="d">D</div>
    `;

    const nodeB = oldParent.children[1];
    const nodeD = oldParent.children[3];

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="b">B Updated</div>
      <div key="e">E New</div>
      <div key="d">D Updated</div>
      <div key="f">F New</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["b", "e", "d", "f"]);

    // B and D should be the same DOM nodes (identity preserved)
    expect(oldParent.children[0]).toBe(nodeB);
    expect(oldParent.children[2]).toBe(nodeD);
  });

  test("should handle keyed list shuffle (random reorder)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="1">One</div>
      <div key="2">Two</div>
      <div key="3">Three</div>
      <div key="4">Four</div>
      <div key="5">Five</div>
    `;

    const originalNodes = Array.from(oldParent.children);

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="3">Three</div>
      <div key="1">One</div>
      <div key="5">Five</div>
      <div key="2">Two</div>
      <div key="4">Four</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["3", "1", "5", "2", "4"]);

    // Verify DOM identity preserved
    expect(oldParent.children[0]).toBe(originalNodes[2]); // key="3"
    expect(oldParent.children[1]).toBe(originalNodes[0]); // key="1"
    expect(oldParent.children[2]).toBe(originalNodes[4]); // key="5"
    expect(oldParent.children[3]).toBe(originalNodes[1]); // key="2"
    expect(oldParent.children[4]).toBe(originalNodes[3]); // key="4"
  });

  // ============================================================================
  // MEDIUM RISK: SVG Elements
  // ============================================================================

  test("should handle SVG element attribute updates", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<svg width="100" height="100"><circle cx="50" cy="50" r="40"></circle></svg>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<svg width="200" height="200"><circle cx="100" cy="100" r="80"></circle></svg>`;

    (renderer as any)._diff(oldParent, newParent);

    const svg = oldParent.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("200");
    expect(svg?.getAttribute("height")).toBe("200");

    const circle = oldParent.querySelector("circle");
    expect(circle?.getAttribute("cx")).toBe("100");
    expect(circle?.getAttribute("r")).toBe("80");
  });

  test("should handle SVG path element", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<svg><path d="M10 10 L20 20"></path></svg>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<svg><path d="M0 0 L50 50 L100 0"></path></svg>`;

    (renderer as any)._diff(oldParent, newParent);

    const path = oldParent.querySelector("path");
    expect(path?.getAttribute("d")).toBe("M0 0 L50 50 L100 0");
  });

  test("should handle SVG with multiple child elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <svg>
        <rect x="0" y="0" width="10" height="10"></rect>
        <circle cx="20" cy="20" r="5"></circle>
      </svg>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <svg>
        <rect x="0" y="0" width="20" height="20"></rect>
        <circle cx="40" cy="40" r="10"></circle>
        <line x1="0" y1="0" x2="50" y2="50"></line>
      </svg>
    `;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelectorAll("svg > *").length).toBe(3);
    expect(oldParent.querySelector("line")).not.toBeNull();
  });

  // ============================================================================
  // MEDIUM RISK: Table Structure
  // ============================================================================

  test("should handle table with thead and tbody", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <table>
        <thead><tr><th>Header</th></tr></thead>
        <tbody><tr><td>Row 1</td></tr></tbody>
      </table>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <table>
        <thead><tr><th>Updated Header</th></tr></thead>
        <tbody>
          <tr><td>Row 1 Updated</td></tr>
          <tr><td>Row 2</td></tr>
        </tbody>
      </table>
    `;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("th")?.textContent).toBe("Updated Header");
    expect(oldParent.querySelectorAll("tbody tr").length).toBe(2);
  });

  test("should handle table row additions and removals", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <table>
        <tbody>
          <tr key="1"><td>A</td></tr>
          <tr key="2"><td>B</td></tr>
          <tr key="3"><td>C</td></tr>
        </tbody>
      </table>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <table>
        <tbody>
          <tr key="2"><td>B</td></tr>
          <tr key="4"><td>D</td></tr>
        </tbody>
      </table>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const rows = oldParent.querySelectorAll("tr");
    expect(rows.length).toBe(2);
    expect(rows[0].getAttribute("key")).toBe("2");
    expect(rows[1].getAttribute("key")).toBe("4");
  });

  // ============================================================================
  // MEDIUM RISK: Comment Nodes
  // ============================================================================

  test("should handle comment nodes between elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<span>A</span><!-- comment --><span>B</span>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<span>A Updated</span><!-- new comment --><span>B Updated</span>`;

    (renderer as any)._diff(oldParent, newParent);

    const spans = oldParent.querySelectorAll("span");
    expect(spans[0].textContent).toBe("A Updated");
    expect(spans[1].textContent).toBe("B Updated");
  });

  test("should handle removal of comment nodes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<!-- comment to remove --><span>Keep</span>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<span>Keep Updated</span>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("span")?.textContent).toBe("Keep Updated");
  });

  test("should handle addition of comment nodes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<span>Content</span>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<!-- added comment --><span>Content</span>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.childNodes.length).toBeGreaterThanOrEqual(2);
  });

  // ============================================================================
  // MEDIUM RISK: Large List Operations
  // ============================================================================

  test("should handle large list (100 items) reordering", () => {
    const oldParent = document.createElement("div");
    const items = Array.from({ length: 100 }, (_, i) =>
      `<div key="${i}">${i}</div>`
    ).join("");
    oldParent.innerHTML = items;

    // Reverse the list
    const newParent = document.createElement("div");
    const reversedItems = Array.from({ length: 100 }, (_, i) =>
      `<div key="${99 - i}">${99 - i}</div>`
    ).join("");
    newParent.innerHTML = reversedItems;

    const startTime = performance.now();
    (renderer as any)._diff(oldParent, newParent);
    const endTime = performance.now();

    // Verify correctness
    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys[0]).toBe("99");
    expect(keys[99]).toBe("0");
    expect(oldParent.children.length).toBe(100);

    // Should complete in reasonable time (< 1000ms)
    expect(endTime - startTime).toBeLessThan(1000);
  });

  test("should handle large list with interleaved changes", () => {
    const oldParent = document.createElement("div");
    // Create list: 0, 1, 2, 3, ..., 49
    const items = Array.from({ length: 50 }, (_, i) =>
      `<div key="${i}">${i}</div>`
    ).join("");
    oldParent.innerHTML = items;

    // Change to: 0, 2, 4, 6, ..., 98 (even numbers 0-98)
    const newParent = document.createElement("div");
    const newItems = Array.from({ length: 50 }, (_, i) =>
      `<div key="${i * 2}">${i * 2}</div>`
    ).join("");
    newParent.innerHTML = newItems;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children.length).toBe(50);
    expect(oldParent.children[0].getAttribute("key")).toBe("0");
    expect(oldParent.children[1].getAttribute("key")).toBe("2");
    expect(oldParent.children[49].getAttribute("key")).toBe("98");
  });

  // ============================================================================
  // MEDIUM RISK: Template Element (content property)
  // ============================================================================

  test("should handle template element", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<template id="tmpl"><div>Template Content</div></template>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<template id="tmpl"><div>Updated Template Content</div></template>`;

    (renderer as any)._diff(oldParent, newParent);

    // Template element should exist
    const template = oldParent.querySelector("template");
    expect(template).not.toBeNull();
  });

  // ============================================================================
  // MEDIUM RISK: Focus Preservation (documented limitation)
  // ============================================================================

  test("should preserve keyed input element (identity preserved)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input key="input1" type="text" value="test">`;

    const originalInput = oldParent.querySelector("input");

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input key="input1" type="text" value="updated">`;

    (renderer as any)._diff(oldParent, newParent);

    // Same DOM node should be preserved (keyed)
    expect(oldParent.querySelector("input")).toBe(originalInput);
  });

  // ============================================================================
  // MEDIUM RISK: Pre/Code Whitespace
  // ============================================================================

  test("should handle pre element with whitespace", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<pre>Line 1
Line 2
Line 3</pre>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<pre>Line 1
Line 2 Updated
Line 3
Line 4</pre>`;

    (renderer as any)._diff(oldParent, newParent);

    const pre = oldParent.querySelector("pre");
    expect(pre?.textContent).toContain("Line 2 Updated");
    expect(pre?.textContent).toContain("Line 4");
  });

  test("should handle code element content", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<code>const x = 1;</code>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<code>const x = 2;</code>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("code")?.textContent).toBe("const x = 2;");
  });

  // ============================================================================
  // MEDIUM RISK: Nested Keyed Structures
  // ============================================================================

  test("should handle nested keyed lists", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <ul key="list1">
        <li key="a">A</li>
        <li key="b">B</li>
      </ul>
      <ul key="list2">
        <li key="c">C</li>
        <li key="d">D</li>
      </ul>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <ul key="list2">
        <li key="d">D Updated</li>
        <li key="c">C Updated</li>
      </ul>
      <ul key="list1">
        <li key="b">B Updated</li>
        <li key="a">A Updated</li>
      </ul>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const lists = oldParent.querySelectorAll("ul");
    expect(lists[0].getAttribute("key")).toBe("list2");
    expect(lists[1].getAttribute("key")).toBe("list1");

    // Check nested items reordered correctly
    const list2Items = lists[0].querySelectorAll("li");
    expect(list2Items[0].getAttribute("key")).toBe("d");
    expect(list2Items[1].getAttribute("key")).toBe("c");
  });

  test("should handle deeply nested structure changes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div class="level1">
        <div class="level2">
          <div class="level3">
            <span>Deep Content</span>
          </div>
        </div>
      </div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div class="level1">
        <div class="level2">
          <div class="level3">
            <span>Updated Deep Content</span>
            <span>New Sibling</span>
          </div>
        </div>
      </div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const spans = oldParent.querySelectorAll(".level3 span");
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe("Updated Deep Content");
    expect(spans[1].textContent).toBe("New Sibling");
  });

  // ============================================================================
  // LOW RISK: Unicode and Special Characters
  // ============================================================================

  test("should handle unicode/emoji in keys", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="🔑">Key Emoji</div>
      <div key="日本語">Japanese</div>
      <div key="émoji">Accented</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="日本語">Japanese Updated</div>
      <div key="🔑">Key Emoji Updated</div>
      <div key="émoji">Accented Updated</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) =>
      c.getAttribute("key")
    );
    expect(keys).toEqual(["日本語", "🔑", "émoji"]);
  });

  test("should handle unicode content", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<p>Hello 世界 🌍</p>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<p>Goodbye 世界 🌎</p>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("p")?.textContent).toBe("Goodbye 世界 🌎");
  });

  test("should handle whitespace-only key", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div key="   ">Whitespace Key</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div key="   ">Updated Whitespace Key</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.textContent).toContain("Updated Whitespace Key");
  });

  // ============================================================================
  // LOW RISK: HTML Entities
  // ============================================================================

  test("should handle HTML entities in content", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<p>&lt;div&gt; &amp; &quot;quotes&quot;</p>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<p>&lt;span&gt; &amp; &apos;apostrophe&apos;</p>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("p")?.textContent).toContain("<span>");
    expect(oldParent.querySelector("p")?.textContent).toContain("&");
  });

  test("should handle HTML entities in attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div data-value="a &amp; b">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div data-value="c &amp; d">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("div")?.getAttribute("data-value")).toBe(
      "c & d"
    );
  });

  // ============================================================================
  // LOW RISK: Self-Closing Tags
  // ============================================================================

  test("should handle self-closing tags", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<br><hr><input type="text">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<br><hr><hr><input type="password">`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelectorAll("hr").length).toBe(2);
    expect(oldParent.querySelector("input")?.getAttribute("type")).toBe(
      "password"
    );
  });

  test("should handle meta and link tags", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<meta name="description" content="old">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<meta name="description" content="new">`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("meta")?.getAttribute("content")).toBe(
      "new"
    );
  });

  // ============================================================================
  // LOW RISK: Empty/Null Edge Cases
  // ============================================================================

  test("should handle empty attribute values", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div data-empty="" class="">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div data-empty="filled" class="active">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("div")?.getAttribute("data-empty")).toBe(
      "filled"
    );
    expect(oldParent.querySelector("div")?.getAttribute("class")).toBe(
      "active"
    );
  });

  test("should handle removing all attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div id="test" class="foo" data-x="y">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div>Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const div = oldParent.querySelector("div");
    expect(div?.hasAttribute("id")).toBe(false);
    expect(div?.hasAttribute("class")).toBe(false);
    expect(div?.hasAttribute("data-x")).toBe(false);
  });

  // ============================================================================
  // LOW RISK: _getNodeKey Edge Cases
  // ============================================================================

  test("_getNodeKey should return null for text nodes", () => {
    const textNode = document.createTextNode("text");
    expect((renderer as any)._getNodeKey(textNode)).toBeNull();
  });

  test("_getNodeKey should return null for comment nodes", () => {
    const comment = document.createComment("comment");
    expect((renderer as any)._getNodeKey(comment)).toBeNull();
  });

  test("_getNodeKey should return null for element without key", () => {
    const div = document.createElement("div");
    expect((renderer as any)._getNodeKey(div)).toBeNull();
  });

  test("_getNodeKey should return key value for keyed element", () => {
    const div = document.createElement("div");
    div.setAttribute("key", "test-key");
    expect((renderer as any)._getNodeKey(div)).toBe("test-key");
  });

  test("_getNodeKey should handle null/undefined input", () => {
    expect((renderer as any)._getNodeKey(null)).toBeNull();
    expect((renderer as any)._getNodeKey(undefined)).toBeNull();
  });

  // ============================================================================
  // LOW RISK: _createKeyMap Edge Cases
  // ============================================================================

  test("_createKeyMap should return empty map for no keyed elements", () => {
    const parent = document.createElement("div");
    parent.innerHTML = `<span>A</span><span>B</span><span>C</span>`;

    const children = Array.from(parent.childNodes);
    const keyMap = (renderer as any)._createKeyMap(children, 0, 2);

    expect(keyMap.size).toBe(0);
  });

  test("_createKeyMap should handle mixed keyed and non-keyed", () => {
    const parent = document.createElement("div");
    parent.innerHTML = `<span>A</span><span key="b">B</span><span>C</span>`;

    const children = Array.from(parent.childNodes);
    const keyMap = (renderer as any)._createKeyMap(children, 0, 2);

    expect(keyMap.size).toBe(1);
    expect(keyMap.has("b")).toBe(true);
  });

  test("_createKeyMap should only include elements in range", () => {
    const parent = document.createElement("div");
    parent.innerHTML = `
      <div key="a">A</div>
      <div key="b">B</div>
      <div key="c">C</div>
      <div key="d">D</div>
    `;

    const children = Array.from(parent.childNodes).filter(
      (n) => n.nodeType === 1
    );
    const keyMap = (renderer as any)._createKeyMap(children, 1, 2);

    expect(keyMap.size).toBe(2);
    expect(keyMap.has("b")).toBe(true);
    expect(keyMap.has("c")).toBe(true);
    expect(keyMap.has("a")).toBe(false);
    expect(keyMap.has("d")).toBe(false);
  });

  // ============================================================================
  // LOW RISK: Idempotency and Stability
  // ============================================================================

  test("should be idempotent (consecutive identical diffs)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<p>Content</p>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<p>Updated</p>`;

    // First diff
    (renderer as any)._diff(oldParent, newParent);
    expect(oldParent.innerHTML).toBe("<p>Updated</p>");

    // Second identical diff should produce same result
    const newParent2 = document.createElement("div");
    newParent2.innerHTML = `<p>Updated</p>`;
    (renderer as any)._diff(oldParent, newParent2);
    expect(oldParent.innerHTML).toBe("<p>Updated</p>");
  });

  test("should handle diff with identical content (no-op)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<p>Same</p>`;

    const originalP = oldParent.querySelector("p");

    const newParent = document.createElement("div");
    newParent.innerHTML = `<p>Same</p>`;

    (renderer as any)._diff(oldParent, newParent);

    // Same node should be preserved
    expect(oldParent.querySelector("p")).toBe(originalP);
    expect(oldParent.innerHTML).toBe("<p>Same</p>");
  });

  // ============================================================================
  // LOW RISK: Very Deep Nesting
  // ============================================================================

  test("should handle very deep nesting (10 levels)", () => {
    const createNested = (depth: number, content: string): string => {
      if (depth === 0) return content;
      return `<div class="level${depth}">${createNested(depth - 1, content)}</div>`;
    };

    const oldParent = document.createElement("div");
    oldParent.innerHTML = createNested(10, "<span>Deep</span>");

    const newParent = document.createElement("div");
    newParent.innerHTML = createNested(10, "<span>Updated Deep</span>");

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("span")?.textContent).toBe("Updated Deep");
  });

  // ============================================================================
  // LOW RISK: _isSameNode Edge Cases
  // ============================================================================

  test("_isSameNode should handle text nodes", () => {
    const text1 = document.createTextNode("a");
    const text2 = document.createTextNode("b");

    expect((renderer as any)._isSameNode(text1, text2)).toBe(true); // Same type
  });

  test("_isSameNode should handle comment nodes", () => {
    const comment1 = document.createComment("a");
    const comment2 = document.createComment("b");

    expect((renderer as any)._isSameNode(comment1, comment2)).toBe(true);
  });

  test("_isSameNode should return false for different node types", () => {
    const text = document.createTextNode("text");
    const element = document.createElement("div");

    expect((renderer as any)._isSameNode(text, element)).toBe(false);
  });

  // ============================================================================
  // LOW RISK: Attribute Edge Cases
  // ============================================================================

  test("should handle attributes with special characters in names", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div data-test-value="old" aria-label="old">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div data-test-value="new" aria-label="new">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const div = oldParent.querySelector("div");
    expect(div?.getAttribute("data-test-value")).toBe("new");
    expect(div?.getAttribute("aria-label")).toBe("new");
  });

  test("should handle class attribute with multiple classes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div class="a b c">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div class="x y z">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("div")?.getAttribute("class")).toBe("x y z");
  });

  test("should handle style attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div style="color: red;">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div style="color: blue; font-size: 14px;">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("div")?.getAttribute("style")).toBe(
      "color: blue; font-size: 14px;"
    );
  });

  // ============================================================================
  // Namespace Attributes (SVG xlink:href, xml:lang)
  // ============================================================================

  test("should handle SVG use element with href attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<svg><use href="#icon-old"></use></svg>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<svg><use href="#icon-new"></use></svg>`;

    (renderer as any)._diff(oldParent, newParent);

    const use = oldParent.querySelector("use");
    expect(use?.getAttribute("href")).toBe("#icon-new");
  });

  test("should handle SVG xlink:href attribute (legacy)", () => {
    const oldParent = document.createElement("div");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#old-icon");
    svg.appendChild(use);
    oldParent.appendChild(svg);

    const newParent = document.createElement("div");
    newParent.innerHTML = `<svg><use href="#new-icon"></use></svg>`;

    (renderer as any)._diff(oldParent, newParent);

    // After diff, the use element should have the new href
    const updatedUse = oldParent.querySelector("use");
    expect(updatedUse?.getAttribute("href")).toBe("#new-icon");
  });

  test("should handle lang attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div lang="en">English</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div lang="fr">French</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("div")?.getAttribute("lang")).toBe("fr");
  });

  test("should handle dir attribute (text direction)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div dir="ltr">Left to right</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div dir="rtl">Right to left</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("div")?.getAttribute("dir")).toBe("rtl");
  });

  test("should handle SVG with multiple namespace attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <use href="#icon1"></use>
      </svg>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <use href="#icon2"></use>
        <use href="#icon3"></use>
      </svg>
    `;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 200 200");
    expect(oldParent.querySelectorAll("use").length).toBe(2);
  });

  // ============================================================================
  // Custom Elements / Web Components
  // ============================================================================

  test("should handle custom element tag names", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<my-component data-id="1">Old Content</my-component>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<my-component data-id="2">New Content</my-component>`;

    (renderer as any)._diff(oldParent, newParent);

    const component = oldParent.querySelector("my-component");
    expect(component?.getAttribute("data-id")).toBe("2");
    expect(component?.textContent).toBe("New Content");
  });

  test("should handle custom elements with hyphenated names", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <user-profile-card name="John"></user-profile-card>
      <app-navigation active="home"></app-navigation>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <user-profile-card name="Jane"></user-profile-card>
      <app-navigation active="settings"></app-navigation>
    `;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("user-profile-card")?.getAttribute("name")).toBe("Jane");
    expect(oldParent.querySelector("app-navigation")?.getAttribute("active")).toBe("settings");
  });

  test("should handle keyed custom elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <todo-item key="1">Task 1</todo-item>
      <todo-item key="2">Task 2</todo-item>
      <todo-item key="3">Task 3</todo-item>
    `;

    const originalNodes = Array.from(oldParent.children);

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <todo-item key="3">Task 3 Updated</todo-item>
      <todo-item key="1">Task 1 Updated</todo-item>
      <todo-item key="2">Task 2 Updated</todo-item>
    `;

    (renderer as any)._diff(oldParent, newParent);

    // Verify reordering and identity preservation
    expect(oldParent.children[0]).toBe(originalNodes[2]);
    expect(oldParent.children[1]).toBe(originalNodes[0]);
    expect(oldParent.children[2]).toBe(originalNodes[1]);
  });

  test("should handle custom element with slot content", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <card-component>
        <span slot="header">Old Header</span>
        <span slot="body">Old Body</span>
      </card-component>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <card-component>
        <span slot="header">New Header</span>
        <span slot="body">New Body</span>
        <span slot="footer">New Footer</span>
      </card-component>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const slots = oldParent.querySelectorAll("[slot]");
    expect(slots.length).toBe(3);
    expect(oldParent.querySelector("[slot='header']")?.textContent).toBe("New Header");
    expect(oldParent.querySelector("[slot='footer']")?.textContent).toBe("New Footer");
  });

  test("should handle custom element type change", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<old-component>Content</old-component>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<new-component>Content</new-component>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("new-component")).not.toBeNull();
    expect(oldParent.querySelector("old-component")).toBeNull();
  });

  // ============================================================================
  // Media Elements (video/audio)
  // ============================================================================

  test("should handle video element attribute updates", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<video src="old.mp4" width="320" height="240"></video>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<video src="new.mp4" width="640" height="480" autoplay></video>`;

    (renderer as any)._diff(oldParent, newParent);

    const video = oldParent.querySelector("video");
    expect(video?.getAttribute("src")).toBe("new.mp4");
    expect(video?.getAttribute("width")).toBe("640");
    expect(video?.hasAttribute("autoplay")).toBe(true);
  });

  test("should handle video with source elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <video>
        <source src="old.mp4" type="video/mp4">
      </video>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <video>
        <source src="new.webm" type="video/webm">
        <source src="new.mp4" type="video/mp4">
      </video>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const sources = oldParent.querySelectorAll("source");
    expect(sources.length).toBe(2);
    expect(sources[0].getAttribute("src")).toBe("new.webm");
    expect(sources[1].getAttribute("src")).toBe("new.mp4");
  });

  test("should handle audio element", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<audio src="old.mp3" controls></audio>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<audio src="new.mp3" controls loop></audio>`;

    (renderer as any)._diff(oldParent, newParent);

    const audio = oldParent.querySelector("audio");
    expect(audio?.getAttribute("src")).toBe("new.mp3");
    expect(audio?.hasAttribute("loop")).toBe(true);
  });

  test("should handle video with track elements (subtitles)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <video src="movie.mp4">
        <track kind="subtitles" src="en.vtt" srclang="en" label="English">
      </video>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <video src="movie.mp4">
        <track kind="subtitles" src="en.vtt" srclang="en" label="English">
        <track kind="subtitles" src="es.vtt" srclang="es" label="Spanish">
      </video>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const tracks = oldParent.querySelectorAll("track");
    expect(tracks.length).toBe(2);
    expect(tracks[1].getAttribute("srclang")).toBe("es");
  });

  test("should handle video boolean attributes (muted, autoplay, loop, controls)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<video src="video.mp4" muted autoplay></video>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<video src="video.mp4" controls loop></video>`;

    (renderer as any)._diff(oldParent, newParent);

    const video = oldParent.querySelector("video");
    expect(video?.hasAttribute("muted")).toBe(false);
    expect(video?.hasAttribute("autoplay")).toBe(false);
    expect(video?.hasAttribute("controls")).toBe(true);
    expect(video?.hasAttribute("loop")).toBe(true);
  });

  // ============================================================================
  // iframe Elements
  // ============================================================================

  test("should handle iframe src attribute update", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<iframe src="old-page.html" width="100" height="100"></iframe>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<iframe src="new-page.html" width="200" height="200"></iframe>`;

    (renderer as any)._diff(oldParent, newParent);

    const iframe = oldParent.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe("new-page.html");
    expect(iframe?.getAttribute("width")).toBe("200");
  });

  test("should handle iframe sandbox attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<iframe src="page.html"></iframe>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<iframe src="page.html" sandbox="allow-scripts"></iframe>`;

    (renderer as any)._diff(oldParent, newParent);

    const iframe = oldParent.querySelector("iframe");
    expect(iframe?.getAttribute("sandbox")).toBe("allow-scripts");
  });

  test("should handle iframe with srcdoc attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<iframe srcdoc="<p>Old</p>"></iframe>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<iframe srcdoc="<p>New</p>"></iframe>`;

    (renderer as any)._diff(oldParent, newParent);

    const iframe = oldParent.querySelector("iframe");
    expect(iframe?.getAttribute("srcdoc")).toBe("<p>New</p>");
  });

  test("should handle iframe loading attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<iframe src="page.html" loading="eager"></iframe>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<iframe src="page.html" loading="lazy"></iframe>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("iframe")?.getAttribute("loading")).toBe("lazy");
  });

  // ============================================================================
  // Object/Embed Elements
  // ============================================================================

  test("should handle object element", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<object data="old.swf" type="application/x-shockwave-flash"></object>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<object data="new.pdf" type="application/pdf"></object>`;

    (renderer as any)._diff(oldParent, newParent);

    const obj = oldParent.querySelector("object");
    expect(obj?.getAttribute("data")).toBe("new.pdf");
    expect(obj?.getAttribute("type")).toBe("application/pdf");
  });

  test("should handle embed element", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<embed src="old.swf" type="application/x-shockwave-flash">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<embed src="new.svg" type="image/svg+xml">`;

    (renderer as any)._diff(oldParent, newParent);

    const embed = oldParent.querySelector("embed");
    expect(embed?.getAttribute("src")).toBe("new.svg");
    expect(embed?.getAttribute("type")).toBe("image/svg+xml");
  });

  test("should handle object with param elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <object data="movie.swf">
        <param name="quality" value="low">
      </object>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <object data="movie.swf">
        <param name="quality" value="high">
        <param name="autoplay" value="true">
      </object>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const params = oldParent.querySelectorAll("param");
    expect(params.length).toBe(2);
    expect(params[0].getAttribute("value")).toBe("high");
    expect(params[1].getAttribute("name")).toBe("autoplay");
  });

  // ============================================================================
  // Form Input Property vs Attribute Divergence
  // ============================================================================

  test("should update input value attribute (not property)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input type="text" value="initial">`;

    const input = oldParent.querySelector("input") as HTMLInputElement;
    // Simulate user typing - property changes but attribute stays same
    input.value = "user typed this";

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input type="text" value="from-template">`;

    (renderer as any)._diff(oldParent, newParent);

    // Renderer updates attribute, not property
    expect(input.getAttribute("value")).toBe("from-template");
    // Note: The .value property behavior depends on browser implementation
  });

  test("should handle input placeholder attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input type="text" placeholder="Old placeholder">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input type="text" placeholder="New placeholder">`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("input")?.getAttribute("placeholder")).toBe("New placeholder");
  });

  test("should handle textarea value as content (not attribute)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<textarea>Old text</textarea>`;

    const textarea = oldParent.querySelector("textarea") as HTMLTextAreaElement;
    // Simulate user editing
    textarea.value = "User edited";

    const newParent = document.createElement("div");
    newParent.innerHTML = `<textarea>New text from template</textarea>`;

    (renderer as any)._diff(oldParent, newParent);

    // Content is updated via text node diffing
    expect(textarea.textContent).toBe("New text from template");
  });

  test("should handle select element selectedIndex via attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <select>
        <option value="a">A</option>
        <option value="b" selected>B</option>
      </select>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <select>
        <option value="a" selected>A</option>
        <option value="b">B</option>
      </select>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const options = oldParent.querySelectorAll("option");
    expect(options[0].hasAttribute("selected")).toBe(true);
    expect(options[1].hasAttribute("selected")).toBe(false);
  });

  test("should handle number input with min/max/step attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input type="number" min="0" max="100" step="1" value="50">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input type="number" min="10" max="200" step="5" value="100">`;

    (renderer as any)._diff(oldParent, newParent);

    const input = oldParent.querySelector("input");
    expect(input?.getAttribute("min")).toBe("10");
    expect(input?.getAttribute("max")).toBe("200");
    expect(input?.getAttribute("step")).toBe("5");
    expect(input?.getAttribute("value")).toBe("100");
  });

  // ============================================================================
  // ContentEditable Elements
  // ============================================================================

  test("should handle contenteditable attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div contenteditable="false">Not editable</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div contenteditable="true">Editable</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const div = oldParent.querySelector("div");
    expect(div?.getAttribute("contenteditable")).toBe("true");
    expect(div?.textContent).toBe("Editable");
  });

  test("should handle contenteditable content changes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div contenteditable="true"><p>Old paragraph</p></div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div contenteditable="true"><p>New paragraph</p><p>Second paragraph</p></div>`;

    (renderer as any)._diff(oldParent, newParent);

    const paragraphs = oldParent.querySelectorAll("div[contenteditable] p");
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].textContent).toBe("New paragraph");
    expect(paragraphs[1].textContent).toBe("Second paragraph");
  });

  test("should handle contenteditable with rich text elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div contenteditable="true"><b>Bold</b> text</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div contenteditable="true"><i>Italic</i> and <b>bold</b></div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("div[contenteditable] i")?.textContent).toBe("Italic");
    expect(oldParent.querySelector("div[contenteditable] b")?.textContent).toBe("bold");
  });

  // ============================================================================
  // Multiple Data Attributes Operations
  // ============================================================================

  test("should handle adding multiple data attributes at once", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div>Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div data-id="1" data-name="test" data-active="true" data-count="5">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const div = oldParent.querySelector("div");
    expect(div?.getAttribute("data-id")).toBe("1");
    expect(div?.getAttribute("data-name")).toBe("test");
    expect(div?.getAttribute("data-active")).toBe("true");
    expect(div?.getAttribute("data-count")).toBe("5");
  });

  test("should handle removing multiple data attributes at once", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div data-id="1" data-name="test" data-active="true" data-count="5">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div>Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const div = oldParent.querySelector("div");
    expect(div?.hasAttribute("data-id")).toBe(false);
    expect(div?.hasAttribute("data-name")).toBe(false);
    expect(div?.hasAttribute("data-active")).toBe(false);
    expect(div?.hasAttribute("data-count")).toBe(false);
  });

  test("should handle mixed add/update/remove of data attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div data-keep="same" data-update="old" data-remove="yes">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div data-keep="same" data-update="new" data-add="added">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const div = oldParent.querySelector("div");
    expect(div?.getAttribute("data-keep")).toBe("same");
    expect(div?.getAttribute("data-update")).toBe("new");
    expect(div?.getAttribute("data-add")).toBe("added");
    expect(div?.hasAttribute("data-remove")).toBe(false);
  });

  test("should handle data attributes with JSON values", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div data-config='{"theme":"light"}'>Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div data-config='{"theme":"dark","size":"large"}'>Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const config = oldParent.querySelector("div")?.getAttribute("data-config");
    expect(config).toBe('{"theme":"dark","size":"large"}');
  });

  test("should handle data attributes on nested elements", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <ul data-list="items">
        <li data-index="0">A</li>
        <li data-index="1">B</li>
      </ul>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <ul data-list="updated-items" data-count="3">
        <li data-index="0" data-new="true">A Updated</li>
        <li data-index="1">B</li>
        <li data-index="2">C</li>
      </ul>
    `;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("ul")?.getAttribute("data-list")).toBe("updated-items");
    expect(oldParent.querySelector("ul")?.getAttribute("data-count")).toBe("3");
    expect(oldParent.querySelectorAll("li").length).toBe(3);
    expect(oldParent.querySelector("li")?.getAttribute("data-new")).toBe("true");
  });

  // ============================================================================
  // HTML5 Interactive Elements
  // ============================================================================

  test("should handle details/summary elements with open attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <details>
        <summary>Click to expand</summary>
        <p>Hidden content</p>
      </details>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <details open>
        <summary>Click to collapse</summary>
        <p>Visible content</p>
      </details>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const details = oldParent.querySelector("details");
    expect(details?.hasAttribute("open")).toBe(true);
    expect(oldParent.querySelector("summary")?.textContent).toBe("Click to collapse");
    expect(oldParent.querySelector("p")?.textContent).toBe("Visible content");
  });

  test("should handle details open attribute removal", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<details open><summary>Title</summary><p>Content</p></details>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<details><summary>Title</summary><p>Content</p></details>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("details")?.hasAttribute("open")).toBe(false);
  });

  test("should handle dialog element with open attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<dialog>Hidden dialog</dialog>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<dialog open>Visible dialog</dialog>`;

    (renderer as any)._diff(oldParent, newParent);

    const dialog = oldParent.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(true);
    expect(dialog?.textContent).toBe("Visible dialog");
  });

  test("should handle dialog with form method", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <dialog open>
        <form method="dialog">
          <button value="cancel">Cancel</button>
          <button value="confirm">OK</button>
        </form>
      </dialog>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <dialog open>
        <form method="dialog">
          <button value="cancel">Cancel</button>
          <button value="confirm">Confirm</button>
          <button value="delete">Delete</button>
        </form>
      </dialog>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const buttons = oldParent.querySelectorAll("button");
    expect(buttons.length).toBe(3);
    expect(buttons[2].getAttribute("value")).toBe("delete");
  });

  test("should handle meter element attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<meter value="0.3" min="0" max="1" low="0.3" high="0.7" optimum="0.5">30%</meter>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<meter value="0.8" min="0" max="1" low="0.3" high="0.7" optimum="0.5">80%</meter>`;

    (renderer as any)._diff(oldParent, newParent);

    const meter = oldParent.querySelector("meter");
    expect(meter?.getAttribute("value")).toBe("0.8");
    expect(meter?.textContent).toBe("80%");
  });

  test("should handle progress element attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<progress value="25" max="100">25%</progress>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<progress value="75" max="100">75%</progress>`;

    (renderer as any)._diff(oldParent, newParent);

    const progress = oldParent.querySelector("progress");
    expect(progress?.getAttribute("value")).toBe("75");
    expect(progress?.textContent).toBe("75%");
  });

  test("should handle indeterminate progress (no value)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<progress value="50" max="100">50%</progress>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<progress max="100">Loading...</progress>`;

    (renderer as any)._diff(oldParent, newParent);

    const progress = oldParent.querySelector("progress");
    expect(progress?.hasAttribute("value")).toBe(false);
    expect(progress?.textContent).toBe("Loading...");
  });

  test("should handle datalist element with options", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <input list="browsers">
      <datalist id="browsers">
        <option value="Chrome">
        <option value="Firefox">
      </datalist>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <input list="browsers">
      <datalist id="browsers">
        <option value="Chrome">
        <option value="Firefox">
        <option value="Safari">
        <option value="Edge">
      </datalist>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const options = oldParent.querySelectorAll("datalist option");
    expect(options.length).toBe(4);
    expect(options[2].getAttribute("value")).toBe("Safari");
  });

  test("should handle output element", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<output name="result" for="a b">0</output>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<output name="result" for="a b">42</output>`;

    (renderer as any)._diff(oldParent, newParent);

    const output = oldParent.querySelector("output");
    expect(output?.textContent).toBe("42");
    expect(output?.getAttribute("for")).toBe("a b");
  });

  // ============================================================================
  // Picture/Source (Responsive Images)
  // ============================================================================

  test("should handle picture element with source and img", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <picture>
        <source media="(min-width: 800px)" srcset="large.jpg">
        <img src="small.jpg" alt="Image">
      </picture>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <picture>
        <source media="(min-width: 1200px)" srcset="xlarge.jpg">
        <source media="(min-width: 800px)" srcset="large.jpg">
        <img src="small.jpg" alt="Updated Image">
      </picture>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const sources = oldParent.querySelectorAll("source");
    expect(sources.length).toBe(2);
    expect(sources[0].getAttribute("media")).toBe("(min-width: 1200px)");
    expect(oldParent.querySelector("img")?.getAttribute("alt")).toBe("Updated Image");
  });

  test("should handle picture source with type attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <picture>
        <source type="image/webp" srcset="image.webp">
        <img src="image.jpg">
      </picture>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <picture>
        <source type="image/avif" srcset="image.avif">
        <source type="image/webp" srcset="image.webp">
        <img src="image.jpg">
      </picture>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const sources = oldParent.querySelectorAll("source");
    expect(sources.length).toBe(2);
    expect(sources[0].getAttribute("type")).toBe("image/avif");
  });

  test("should handle picture with srcset and sizes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <picture>
        <source srcset="small.jpg 400w, medium.jpg 800w" sizes="(max-width: 600px) 400px, 800px">
        <img src="fallback.jpg">
      </picture>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <picture>
        <source srcset="small.jpg 400w, medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px">
        <img src="fallback.jpg">
      </picture>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const source = oldParent.querySelector("source");
    expect(source?.getAttribute("srcset")).toContain("large.jpg 1200w");
    expect(source?.getAttribute("sizes")).toContain("1200px");
  });

  // ============================================================================
  // Key Case Sensitivity
  // ============================================================================

  test("should treat keys as case-sensitive", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="A">Uppercase A</div>
      <div key="a">Lowercase a</div>
      <div key="B">Uppercase B</div>
    `;

    const originalNodes = Array.from(oldParent.children);

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="a">Lowercase a Updated</div>
      <div key="A">Uppercase A Updated</div>
      <div key="B">Uppercase B Updated</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    // Keys are case-sensitive, so "A" and "a" are different
    expect(oldParent.children[0]).toBe(originalNodes[1]); // key="a"
    expect(oldParent.children[1]).toBe(originalNodes[0]); // key="A"
    expect(oldParent.children[2]).toBe(originalNodes[2]); // key="B"
  });

  test("should not confuse similar case keys", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="Item">Item</div>
      <div key="item">item</div>
      <div key="ITEM">ITEM</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="ITEM">ITEM Updated</div>
      <div key="Item">Item Updated</div>
      <div key="item">item Updated</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const keys = Array.from(oldParent.children).map((c) => c.getAttribute("key"));
    expect(keys).toEqual(["ITEM", "Item", "item"]);
  });

  test("should handle keys with mixed case and numbers", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div key="Item1">Item1</div>
      <div key="item1">item1</div>
      <div key="ITEM1">ITEM1</div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div key="item1">item1 first</div>
      <div key="ITEM1">ITEM1 second</div>
      <div key="Item1">Item1 third</div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.children[0].textContent).toBe("item1 first");
    expect(oldParent.children[1].textContent).toBe("ITEM1 second");
    expect(oldParent.children[2].textContent).toBe("Item1 third");
  });

  // ============================================================================
  // Multiple @ Event Attributes
  // ============================================================================

  test("should skip all @ event attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button @click="oldClick" @mouseenter="oldHover" @focus="oldFocus" class="btn">Click</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button @click="newClick" @mouseenter="newHover" @focus="newFocus" @blur="newBlur" class="btn-primary">Click Me</button>`;

    (renderer as any)._diff(oldParent, newParent);

    const button = oldParent.querySelector("button");
    // @ attributes should NOT be updated (handled by event system)
    expect(button?.getAttribute("@click")).toBe("oldClick");
    expect(button?.getAttribute("@mouseenter")).toBe("oldHover");
    expect(button?.getAttribute("@focus")).toBe("oldFocus");
    // Non-@ attributes should be updated
    expect(button?.getAttribute("class")).toBe("btn-primary");
    expect(button?.textContent).toBe("Click Me");
  });

  test("should preserve @ attributes when other attributes change", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input @input="handleInput" @change="handleChange" type="text" value="old">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input @input="newInput" @change="newChange" type="password" value="new" placeholder="Enter">`;

    (renderer as any)._diff(oldParent, newParent);

    const input = oldParent.querySelector("input");
    expect(input?.getAttribute("@input")).toBe("handleInput");
    expect(input?.getAttribute("@change")).toBe("handleChange");
    expect(input?.getAttribute("type")).toBe("password");
    expect(input?.getAttribute("value")).toBe("new");
    expect(input?.getAttribute("placeholder")).toBe("Enter");
  });

  test("should handle element with only @ attributes changing", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div @click="handler1" @dblclick="handler2" id="target">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div @click="newHandler1" @dblclick="newHandler2" @contextmenu="handler3" id="target">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const div = oldParent.querySelector("div");
    // Original @ attributes preserved
    expect(div?.getAttribute("@click")).toBe("handler1");
    expect(div?.getAttribute("@dblclick")).toBe("handler2");
    // id unchanged
    expect(div?.getAttribute("id")).toBe("target");
  });

  // ============================================================================
  // Comprehensive ARIA Attributes
  // ============================================================================

  test("should handle aria-hidden attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div aria-hidden="false">Visible</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div aria-hidden="true">Hidden</div>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("div")?.getAttribute("aria-hidden")).toBe("true");
  });

  test("should handle aria-expanded attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button aria-expanded="false" aria-controls="menu">Menu</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button aria-expanded="true" aria-controls="menu">Menu</button>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("button")?.getAttribute("aria-expanded")).toBe("true");
  });

  test("should handle multiple ARIA attributes", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <div role="dialog" aria-modal="false" aria-labelledby="title" aria-describedby="desc">
        Dialog
      </div>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <div role="alertdialog" aria-modal="true" aria-labelledby="title" aria-describedby="desc" aria-live="assertive">
        Alert Dialog
      </div>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const div = oldParent.querySelector("div");
    expect(div?.getAttribute("role")).toBe("alertdialog");
    expect(div?.getAttribute("aria-modal")).toBe("true");
    expect(div?.getAttribute("aria-live")).toBe("assertive");
  });

  test("should handle aria-selected and aria-current", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <ul role="tablist">
        <li role="tab" aria-selected="true">Tab 1</li>
        <li role="tab" aria-selected="false">Tab 2</li>
      </ul>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <ul role="tablist">
        <li role="tab" aria-selected="false">Tab 1</li>
        <li role="tab" aria-selected="true">Tab 2</li>
      </ul>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const tabs = oldParent.querySelectorAll("[role='tab']");
    expect(tabs[0].getAttribute("aria-selected")).toBe("false");
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
  });

  test("should handle aria-disabled and aria-readonly", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input aria-disabled="false" aria-readonly="false" aria-required="true">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input aria-disabled="true" aria-readonly="true" aria-required="false">`;

    (renderer as any)._diff(oldParent, newParent);

    const input = oldParent.querySelector("input");
    expect(input?.getAttribute("aria-disabled")).toBe("true");
    expect(input?.getAttribute("aria-readonly")).toBe("true");
    expect(input?.getAttribute("aria-required")).toBe("false");
  });

  test("should handle aria-valuenow, aria-valuemin, aria-valuemax", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div role="slider" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">50%</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div role="slider" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">75%</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const slider = oldParent.querySelector("[role='slider']");
    expect(slider?.getAttribute("aria-valuenow")).toBe("75");
  });

  // ============================================================================
  // Form-Related Attributes
  // ============================================================================

  test("should handle formaction attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button type="submit" formaction="/old-action">Submit</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button type="submit" formaction="/new-action">Submit</button>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("button")?.getAttribute("formaction")).toBe("/new-action");
  });

  test("should handle formmethod attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button type="submit" formmethod="get">Search</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button type="submit" formmethod="post">Submit</button>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("button")?.getAttribute("formmethod")).toBe("post");
  });

  test("should handle formtarget attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button type="submit" formtarget="_self">Submit</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button type="submit" formtarget="_blank">Submit in New Tab</button>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("button")?.getAttribute("formtarget")).toBe("_blank");
  });

  test("should handle formenctype attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button type="submit" formenctype="application/x-www-form-urlencoded">Submit</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button type="submit" formenctype="multipart/form-data">Upload</button>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("button")?.getAttribute("formenctype")).toBe("multipart/form-data");
  });

  test("should handle formnovalidate attribute", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<button type="submit">Submit with Validation</button>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<button type="submit" formnovalidate>Submit without Validation</button>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("button")?.hasAttribute("formnovalidate")).toBe(true);
  });

  test("should handle form attribute (associate input with form)", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<input type="text" form="form1">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<input type="text" form="form2">`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("input")?.getAttribute("form")).toBe("form2");
  });

  test("should handle multiple form-related attributes together", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = `
      <button type="submit"
              formaction="/old"
              formmethod="get"
              formtarget="_self"
              formenctype="application/x-www-form-urlencoded">
        Old Submit
      </button>
    `;

    const newParent = document.createElement("div");
    newParent.innerHTML = `
      <button type="submit"
              formaction="/new"
              formmethod="post"
              formtarget="_blank"
              formenctype="multipart/form-data"
              formnovalidate>
        New Submit
      </button>
    `;

    (renderer as any)._diff(oldParent, newParent);

    const button = oldParent.querySelector("button");
    expect(button?.getAttribute("formaction")).toBe("/new");
    expect(button?.getAttribute("formmethod")).toBe("post");
    expect(button?.getAttribute("formtarget")).toBe("_blank");
    expect(button?.getAttribute("formenctype")).toBe("multipart/form-data");
    expect(button?.hasAttribute("formnovalidate")).toBe(true);
  });

  // ============================================================================
  // _tempContainer Reuse
  // ============================================================================

  test("should properly clear tempContainer between patchDOM calls", () => {
    const container = document.createElement("div");
    container.innerHTML = `<p>Initial</p>`;

    // First patch
    renderer.patchDOM(container, `<p>First Update</p><span>Extra</span>`);
    expect(container.innerHTML).toBe("<p>First Update</p><span>Extra</span>");

    // Second patch - should not have artifacts from first
    renderer.patchDOM(container, `<div>Second Update</div>`);
    expect(container.innerHTML).toBe("<div>Second Update</div>");
    expect(container.querySelector("p")).toBeNull();
    expect(container.querySelector("span")).toBeNull();
  });

  test("should handle rapid consecutive patchDOM calls", () => {
    const container = document.createElement("div");

    renderer.patchDOM(container, `<p>1</p>`);
    renderer.patchDOM(container, `<p>2</p>`);
    renderer.patchDOM(container, `<p>3</p>`);
    renderer.patchDOM(container, `<p>4</p>`);
    renderer.patchDOM(container, `<p>5</p>`);

    expect(container.innerHTML).toBe("<p>5</p>");
  });

  test("should handle alternating content types in patchDOM", () => {
    const container = document.createElement("div");

    renderer.patchDOM(container, `<ul><li>List</li></ul>`);
    expect(container.querySelector("ul")).not.toBeNull();

    renderer.patchDOM(container, `<table><tr><td>Table</td></tr></table>`);
    expect(container.querySelector("table")).not.toBeNull();
    expect(container.querySelector("ul")).toBeNull();

    renderer.patchDOM(container, `Just text content`);
    expect(container.textContent).toBe("Just text content");
    expect(container.querySelector("table")).toBeNull();

    renderer.patchDOM(container, `<div><span>Nested</span></div>`);
    expect(container.querySelector("div span")?.textContent).toBe("Nested");
  });

  test("should handle empty string after content in patchDOM", () => {
    const container = document.createElement("div");
    container.innerHTML = `<p>Content</p><span>More</span>`;

    renderer.patchDOM(container, ``);

    expect(container.innerHTML).toBe("");
    expect(container.childNodes.length).toBe(0);
  });

  test("should handle patchDOM with same content (no-op)", () => {
    const container = document.createElement("div");
    const html = `<div class="test"><span>Content</span></div>`;
    container.innerHTML = html;

    const originalDiv = container.querySelector("div");

    renderer.patchDOM(container, html);

    // Same structure should preserve node identity
    expect(container.querySelector("div")).toBe(originalDiv);
  });

  // ============================================================================
  // Very Long Attribute Values
  // ============================================================================

  test("should handle base64 encoded image in src attribute", () => {
    const base64Short = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const base64Long = "data:image/png;base64," + "A".repeat(1000);

    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<img src="${base64Short}" alt="small">`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<img src="${base64Long}" alt="large">`;

    (renderer as any)._diff(oldParent, newParent);

    const img = oldParent.querySelector("img");
    expect(img?.getAttribute("src")).toBe(base64Long);
    expect(img?.getAttribute("alt")).toBe("large");
  });

  test("should handle very long data attribute value", () => {
    const longValue = JSON.stringify({
      items: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `This is a description for item ${i}`,
      })),
    });

    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div data-config='{"simple": true}'>Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div data-config='${longValue.replace(/'/g, "&#39;")}'>Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const config = oldParent.querySelector("div")?.getAttribute("data-config");
    expect(config).toContain("Item 99");
  });

  test("should handle long class attribute with many classes", () => {
    const manyClasses = Array.from({ length: 50 }, (_, i) => `class-${i}`).join(" ");

    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div class="simple">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div class="${manyClasses}">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const classList = oldParent.querySelector("div")?.getAttribute("class");
    expect(classList).toBe(manyClasses);
    expect(classList?.split(" ").length).toBe(50);
  });

  test("should handle long inline style attribute", () => {
    const longStyle = Array.from({ length: 20 }, (_, i) =>
      `--custom-prop-${i}: value${i}`
    ).join("; ");

    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<div style="color: red;">Content</div>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<div style="${longStyle}">Content</div>`;

    (renderer as any)._diff(oldParent, newParent);

    const style = oldParent.querySelector("div")?.getAttribute("style");
    expect(style).toContain("--custom-prop-19");
  });

  test("should handle long SVG path data", () => {
    const longPath = "M0 0 " + Array.from({ length: 100 }, (_, i) =>
      `L${i * 10} ${Math.sin(i) * 50 + 50}`
    ).join(" ");

    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<svg><path d="M0 0 L10 10"></path></svg>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<svg><path d="${longPath}"></path></svg>`;

    (renderer as any)._diff(oldParent, newParent);

    const path = oldParent.querySelector("path");
    expect(path?.getAttribute("d")).toBe(longPath);
  });

  test("should handle long href with query parameters", () => {
    const longQuery = Array.from({ length: 30 }, (_, i) =>
      `param${i}=value${i}`
    ).join("&");
    const longHref = `https://example.com/path?${longQuery}`;

    const oldParent = document.createElement("div");
    oldParent.innerHTML = `<a href="https://example.com">Link</a>`;

    const newParent = document.createElement("div");
    newParent.innerHTML = `<a href="${longHref}">Link with params</a>`;

    (renderer as any)._diff(oldParent, newParent);

    expect(oldParent.querySelector("a")?.getAttribute("href")).toBe(longHref);
  });
});

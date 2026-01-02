/**
 * @fileoverview Tests for the Renderer module of the Eleva framework
 *
 * These tests verify the DOM manipulation and rendering capabilities
 * of the Renderer module.
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

  test("should update element properties not in attributeToPropertyMap", () => {
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

  test("should throw error for invalid container or newHtml in patchDOM", () => {
    const testRenderer = new Renderer();

    expect(() => testRenderer.patchDOM(null as any, "<div>test</div>")).toThrow(
      "Container must be an HTMLElement"
    );

    expect(() => testRenderer.patchDOM(container, null as any)).toThrow(
      "newHtml must be a string"
    );

    Object.defineProperty((testRenderer as any)._tempContainer, "innerHTML", {
      set: function (value: string) {
        throw new Error("Mock error");
      },
      configurable: true,
    });
    expect(() => testRenderer.patchDOM(container, "<div>test</div>")).toThrow(
      "Failed to patch DOM: Mock error"
    );
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
    expect((oldParent.firstChild as HTMLElement).textContent).not.toBe("New Content");
  });

  test("should handle special style elements", () => {
    const testContainer = document.createElement("div");
    const style = document.createElement("style");
    style.setAttribute("data-e-style", "");
    testContainer.appendChild(style);

    const tempContainer = document.createElement("div");

    (renderer as any)._diff(testContainer, tempContainer);

    expect(testContainer.querySelector("style[data-e-style]")).not.toBeNull();

    (renderer as any)._removeNode(testContainer, style);
    expect(testContainer.querySelector("style[data-e-style]")).not.toBeNull();
  });

  test("should handle undefined nodes in diff", () => {
    const oldParent = document.createElement("div");
    const a = document.createElement("div");
    a.setAttribute("key", "a");
    const b = document.createElement("div");
    b.setAttribute("key", "b");
    const c = document.createElement("div");
    c.setAttribute("key", "c");
    oldParent.appendChild(a);
    oldParent.appendChild(b);
    oldParent.appendChild(c);

    const newParent = document.createElement("div");
    const b2 = document.createElement("div");
    b2.setAttribute("key", "b");
    const a2 = document.createElement("div");
    a2.setAttribute("key", "a");
    const c2 = document.createElement("div");
    c2.setAttribute("key", "c");
    newParent.appendChild(b2);
    newParent.appendChild(a2);
    newParent.appendChild(c2);

    expect(() => (renderer as any)._diff(oldParent, newParent)).not.toThrow();
    expect(oldParent.children[0].getAttribute("key")).toBe("b");
    expect(oldParent.children[1].getAttribute("key")).toBe("a");
    expect(oldParent.children[2].getAttribute("key")).toBe("c");
    expect(oldParent.children.length).toBe(3);
  });

  test("should handle different node types in patchNode", () => {
    const parent = document.createElement("div");
    const oldNode = document.createElement("p");
    oldNode.textContent = "Old";
    parent.appendChild(oldNode);
    const newNode = document.createElement("span");
    newNode.textContent = "New";

    (renderer as any)._patchNode(oldNode, newNode);

    expect(parent.firstChild!.nodeName).toBe("SPAN");
    expect((parent.firstChild as HTMLElement).textContent).toBe("New");
  });
});

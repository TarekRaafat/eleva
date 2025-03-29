import { Renderer } from "../src/modules/Renderer.js";

describe("Renderer", () => {
  let container;
  let renderer;
  beforeEach(() => {
    container = document.createElement("div");
    renderer = new Renderer();
  });

  test("patchDOM updates container content", () => {
    container.innerHTML = "<p>Old</p>";
    renderer.patchDOM(container, "<p>New</p>");

    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });

  test("updateAttributes syncs element attributes", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");

    const newEl = document.createElement("div");
    newEl.setAttribute("data-test", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.getAttribute("data-test")).toBe("new");
  });

  test("diff method replaces differing nodes", () => {
    container.innerHTML = `<div key="1">Old</div>`;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<div key="1">New</div>`;

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toContain("New");
    expect(container.innerHTML).not.toContain("Old");
  });
});

describe("Renderer edge cases", () => {
  test("should handle invalid render states", () => {
    const renderer = new Renderer();
    renderer.state = "invalid";
    expect(() => renderer.render()).toThrow();
  });

  test("should handle template errors", () => {
    const renderer = new Renderer();
    renderer.template = null;
    expect(() => renderer.process()).toThrow();
  });

  test("should handle missing elements", () => {
    const renderer = new Renderer();
    renderer.element = null;
    expect(() => renderer.update()).toThrow();
  });

  test("should handle callback errors", () => {
    const renderer = new Renderer();
    const badCallback = () => {
      throw new Error();
    };
    expect(() => renderer.onComplete(badCallback)).toThrow();
  });
});

describe("Renderer diff method", () => {
  let renderer;

  beforeEach(() => {
    renderer = new Renderer();
  });

  test("replaces nodes with differing nodeType or nodeName", () => {
    const oldParent = document.createElement("div");
    oldParent.innerHTML = "<p>Old</p>";

    const newParent = document.createElement("div");
    newParent.innerHTML = "<span>New</span>";

    renderer.diff(oldParent, newParent);

    expect(oldParent.innerHTML).toBe("<span>New</span>");
  });

  test("removes attributes not present in new element", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");

    const newEl = document.createElement("div");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.hasAttribute("data-test")).toBe(false);
  });

  test("updates properties mapped from attributes", () => {
    const oldEl = document.createElement("input");
    oldEl.setAttribute("value", "old");

    const newEl = document.createElement("input");
    newEl.setAttribute("value", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.value).toBe("new");
  });
});

describe("Renderer additional tests for full coverage", () => {
  let renderer;

  beforeEach(() => {
    renderer = new Renderer();
  });

  test("patchDOM handles empty container and newHtml", () => {
    const container = document.createElement("div");
    renderer.patchDOM(container, "");
    expect(container.innerHTML).toBe("");
  });

  test("diff handles identical nodes (fast path)", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Same</p>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Same</p>";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Same</p>");
  });

  test("diff appends new nodes when oldNode is missing", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Old</p>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Old</p><span>New</span>";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Old</p><span>New</span>");
  });

  test("diff removes old nodes when newNode is missing", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>Old</p><span>Remove</span>";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "<p>Old</p>";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("<p>Old</p>");
  });

  test("diff replaces nodes with differing keys", () => {
    const container = document.createElement("div");
    container.innerHTML = '<div key="1">Old</div>';

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = '<div key="2">New</div>';

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe('<div key="2">New</div>');
  });

  test("diff updates text content for text nodes", () => {
    const container = document.createElement("div");
    container.innerHTML = "Old Text";

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = "New Text";

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("New Text");
  });

  test("updateAttributes removes attributes not present in new element", () => {
    const oldEl = document.createElement("div");
    oldEl.setAttribute("data-test", "old");
    oldEl.setAttribute("class", "to-remove");

    const newEl = document.createElement("div");
    newEl.setAttribute("data-test", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.getAttribute("data-test")).toBe("new");
    expect(oldEl.hasAttribute("class")).toBe(false);
  });

  test("updateAttributes updates mapped properties", () => {
    const oldEl = document.createElement("input");
    oldEl.setAttribute("value", "old");

    const newEl = document.createElement("input");
    newEl.setAttribute("value", "new");

    renderer.updateAttributes(oldEl, newEl);

    expect(oldEl.value).toBe("new");
  });

  test("diff handles deeply nested structures", () => {
    const container = document.createElement("div");
    container.innerHTML = `<div><p>Old</p></div>`;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<div><p>New</p></div>`;

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe(`<div><p>New</p></div>`);
  });

  test("diff handles empty oldParent and populated newParent", () => {
    const container = document.createElement("div");

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = `<p>New</p>`;

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe(`<p>New</p>`);
  });

  test("diff handles empty newParent and populated oldParent", () => {
    const container = document.createElement("div");
    container.innerHTML = `<p>Old</p>`;

    const tempContainer = document.createElement("div");

    renderer.diff(container, tempContainer);

    expect(container.innerHTML).toBe("");
  });
});
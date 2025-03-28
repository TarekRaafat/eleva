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
    // Test for lines 48-49
    const renderer = new Renderer();
    renderer.state = "invalid";
    expect(() => renderer.render()).toThrow();
  });

  test("should handle template errors", () => {
    // Test for lines 61-62
    const renderer = new Renderer();
    renderer.template = null;
    expect(() => renderer.process()).toThrow();
  });

  test("should handle missing elements", () => {
    // Test for lines 72-73
    const renderer = new Renderer();
    renderer.element = null;
    expect(() => renderer.update()).toThrow();
  });

  test("should handle callback errors", () => {
    // Test for lines 108, 117, 119
    const renderer = new Renderer();
    const badCallback = () => {
      throw new Error();
    };
    expect(() => renderer.onComplete(badCallback)).toThrow();
  });
});

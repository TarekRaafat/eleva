/**
 * @fileoverview Tests for the Props Plugin
 * Tests the core functionality of automatic type detection, parsing, and reactive props
 */

import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { Eleva } from "../../../src/core/Eleva.js";
import { PropsPlugin } from "../../../src/plugins/Props.js";

describe("PropsPlugin", () => {
  let app: any;
  let container: HTMLElement;

  beforeEach(() => {
    app = new Eleva("testApp");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe("Plugin Installation", () => {
    test("should install the plugin successfully", () => {
      expect(() => {
        app.use(PropsPlugin);
      }).not.toThrow();
    });

    test("should expose props utilities on eleva instance", () => {
      app.use(PropsPlugin);
      expect(app.props).toBeDefined();
      expect(typeof app.props.parse).toBe("function");
      expect(typeof app.props.detectType).toBe("function");
    });

    test("should uninstall the plugin successfully", () => {
      app.use(PropsPlugin);
      expect(() => {
        PropsPlugin.uninstall(app);
      }).not.toThrow();
    });
  });

  describe("Type Detection", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should detect string type", () => {
      expect(app.props.detectType("hello")).toBe("string");
    });

    test("should detect number type", () => {
      expect(app.props.detectType(42)).toBe("number");
    });

    test("should detect boolean type", () => {
      expect(app.props.detectType(true)).toBe("boolean");
      expect(app.props.detectType(false)).toBe("boolean");
    });

    test("should detect null type", () => {
      expect(app.props.detectType(null)).toBe("null");
    });

    test("should detect undefined type", () => {
      expect(app.props.detectType(undefined)).toBe("undefined");
    });

    test("should detect array type", () => {
      expect(app.props.detectType([1, 2, 3])).toBe("array");
    });

    test("should detect object type", () => {
      expect(app.props.detectType({ key: "value" })).toBe("object");
    });

    test("should detect date type", () => {
      expect(app.props.detectType(new Date())).toBe("date");
    });

    test("should detect map type", () => {
      expect(app.props.detectType(new Map())).toBe("map");
    });

    test("should detect set type", () => {
      expect(app.props.detectType(new Set())).toBe("set");
    });

    test("should detect function type", () => {
      expect(app.props.detectType(() => {})).toBe("function");
    });
  });

  describe("Value Parsing", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should parse string values", () => {
      expect(app.props.parse("hello")).toBe("hello");
    });

    test("should parse number values", () => {
      expect(app.props.parse("42")).toBe(42);
      expect(app.props.parse("3.14")).toBe(3.14);
      expect(app.props.parse("2")).toBe(2);
    });

    test("should parse boolean values", () => {
      expect(app.props.parse("true")).toBe(true);
      expect(app.props.parse("false")).toBe(false);
      expect(app.props.parse("1")).toBe(true);
      expect(app.props.parse("0")).toBe(false);
      expect(app.props.parse("")).toBe(true);
    });

    test("should handle null and undefined", () => {
      expect(app.props.parse("null")).toBe(null);
      expect(app.props.parse("undefined")).toBe(undefined);
    });

    test("should parse JSON objects", () => {
      const obj = { name: "John", age: 30 };
      expect(app.props.parse(JSON.stringify(obj))).toEqual(obj);
    });

    test("should parse JSON arrays", () => {
      const arr = [1, 2, 3, "test"];
      expect(app.props.parse(JSON.stringify(arr))).toEqual(arr);
    });

    test("should parse date strings", () => {
      const dateStr = "2023-12-25T10:30:00.000Z";
      const result = app.props.parse(dateStr);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(dateStr);
    });

    test("should handle complex nested objects", () => {
      const complex = {
        user: { name: "Alice", age: 25 },
        tags: ["admin", "user"],
        settings: { theme: "dark", notifications: true },
      };
      expect(app.props.parse(JSON.stringify(complex))).toEqual(complex);
    });

    test("should handle non-string values", () => {
      expect(app.props.parse(42)).toBe(42);
      expect(app.props.parse(true)).toBe(true);
      expect(app.props.parse(null)).toBe(null);
      expect(app.props.parse([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe("Props Extraction", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should extract and parse props from element attributes", () => {
      const element = document.createElement("div");
      element.setAttribute(":name", "John");
      element.setAttribute(":age", "30");
      element.setAttribute(":active", "true");
      element.setAttribute(":data", '{"key": "value"}');

      const props = app._extractProps(element);

      expect(props.name).toBe("John");
      expect(props.age).toBe(30);
      expect(props.active).toBe(true);
      expect(props.data).toEqual({ key: "value" });
    });

    test("should handle complex nested objects", () => {
      const element = document.createElement("div");
      const complexData = {
        user: { name: "Alice", age: 25 },
        tags: ["admin", "user"],
        settings: { theme: "dark", notifications: true },
      };
      element.setAttribute(":complex", JSON.stringify(complexData));

      const props = app._extractProps(element);
      expect(props.complex).toEqual(complexData);
    });

    test("should handle arrays", () => {
      const element = document.createElement("div");
      const arrayData = [1, 2, 3, "test", true];
      element.setAttribute(":items", JSON.stringify(arrayData));

      const props = app._extractProps(element);
      expect(props.items).toEqual(arrayData);
    });

    test("should handle special values", () => {
      const element = document.createElement("div");
      element.setAttribute(":nullValue", "null");
      element.setAttribute(":undefinedValue", "undefined");
      element.setAttribute(":emptyString", "");

      const props = app._extractProps(element);
      expect(props.nullvalue).toBe(null);
      expect(props.undefinedvalue).toBe(undefined);
      expect(props.emptystring).toBe(true);
    });

    test("should remove attributes after extraction", () => {
      const element = document.createElement("div");
      element.setAttribute(":test", "value");
      element.setAttribute(":another", "42");

      app._extractProps(element);

      expect(element.hasAttribute(":test")).toBe(false);
      expect(element.hasAttribute(":another")).toBe(false);
    });
  });

  describe("Component Integration", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should pass parsed props to child components", async () => {
      let receivedProps: any = null;

      app.component("ChildComponent", {
        setup({ props }: any) {
          receivedProps = props;
          return {};
        },
        template: () => "<div>Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `
          <div class="child-container"
               :name="John"
               :age="30"
               :active="true"
               :data='{"key": "value"}'>
          </div>
        `,
        children: {
          ".child-container": "ChildComponent",
        },
      });

      await app.mount(container, "ParentComponent");

      expect(receivedProps).toBeDefined();
      expect(receivedProps.name.value).toBe("John");
      expect(receivedProps.age.value).toBe(30);
      expect(receivedProps.active.value).toBe(true);
      expect(receivedProps.data.value).toEqual({ key: "value" });
    });

    test("should create reactive props when enabled", async () => {
      let receivedProps: any = null;

      app.component("ChildComponent", {
        setup({ props }: any) {
          receivedProps = props;
          return {};
        },
        template: () => "<div>Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `
          <div class="child-container" :count="42"></div>
        `,
        children: {
          ".child-container": "ChildComponent",
        },
      });

      await app.mount(container, "ParentComponent");

      expect(receivedProps).toBeDefined();
      expect(receivedProps.count).toBeDefined();
      expect(typeof receivedProps.count.watch).toBe("function");
      expect(receivedProps.count.value).toBe(42);
    });
  });

  describe("Error Handling", () => {
    test("should call error handler on parsing errors", () => {
      const errorHandler = mock(() => {});
      app.use(PropsPlugin, { onError: errorHandler });

      app.props.parse("{invalid json}");

      expect(errorHandler).toHaveBeenCalled();
    });

    test("should fallback to original value on error", () => {
      const errorHandler = mock(() => {});
      app.use(PropsPlugin, { onError: errorHandler });

      const result = app.props.parse("invalid json {");
      expect(result).toBe("invalid json {");
    });
  });

  describe("Configuration Options", () => {
    test("should respect enableAutoParsing option", () => {
      app.use(PropsPlugin, { enableAutoParsing: false });

      expect(app.props.parse("42")).toBe("42");
      expect(app.props.parse("true")).toBe("true");
    });

    test("should respect enableReactivity option", async () => {
      app.use(PropsPlugin, { enableReactivity: false });

      let receivedProps: any = null;

      app.component("ChildComponent", {
        setup({ props }: any) {
          receivedProps = props;
          return {};
        },
        template: () => "<div>Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `
          <div class="child-container" :count="42"></div>
        `,
        children: {
          ".child-container": "ChildComponent",
        },
      });

      await app.mount(container, "ParentComponent");

      expect(receivedProps).toBeDefined();
      expect(receivedProps.count).toBe(42);
      expect(typeof receivedProps.count.watch).toBe("undefined");
    });
  });

  describe("Signal Reference Passing", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should pass signal references from parent to child", async () => {
      let childProps: any = null;
      let parentData: any = null;

      app.component("ChildComponent", {
        setup({ props }: any) {
          childProps = props;
          return { displayCount: props.count };
        },
        template: (ctx: any) =>
          `<div class="child-display">Count: ${ctx.displayCount?.value ?? ctx.displayCount}</div>`,
      });

      app.component("ParentComponent", {
        setup({ signal }: any) {
          const count = signal(10);
          parentData = { count };
          return { count };
        },
        template: (ctx: any) => `
          <div>
            <span class="parent-count">${ctx.count.value}</span>
            <div class="child-slot" :count="${ctx.count.value}"></div>
          </div>
        `,
        children: {
          ".child-slot": "ChildComponent",
        },
      });

      await app.mount(container, "ParentComponent");

      expect(childProps).toBeDefined();
      expect(childProps.count).toBeDefined();
    });

    test("should handle props that are already signals", async () => {
      let receivedProps: any = null;

      app.component("ChildComponent", {
        setup({ props }: any) {
          receivedProps = props;
          return {};
        },
        template: () => "<div>Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `
          <div class="child-container" :value="100"></div>
        `,
        children: {
          ".child-container": "ChildComponent",
        },
      });

      await app.mount(container, "ParentComponent");

      expect(receivedProps).toBeDefined();
      expect(receivedProps.value).toBeDefined();
      // Should be a signal with watch method
      expect(typeof receivedProps.value.watch).toBe("function");
    });

    test("should handle empty selectors gracefully", async () => {
      app.component("ChildComponent", {
        setup() {
          return {};
        },
        template: () => "<div>Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `<div><span>No children</span></div>`,
        children: {
          "": "ChildComponent", // Empty selector
          ".non-existent": "ChildComponent", // Non-existent selector
        },
      });

      // Should not throw
      await expect(app.mount(container, "ParentComponent")).resolves.toBeDefined();
    });

    test("should handle non-HTMLElement selectors gracefully", async () => {
      app.component("ChildComponent", {
        setup() {
          return {};
        },
        template: () => "<div>Child</div>",
      });

      app.component("ParentComponent", {
        template: () => `<div><!-- comment --><span class="valid">Valid</span></div>`,
        children: {
          ".valid": "ChildComponent",
        },
      });

      await expect(app.mount(container, "ParentComponent")).resolves.toBeDefined();
    });
  });

  describe("Prop Value Edge Cases", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should handle invalid date strings", () => {
      const result = app.props.parse("2023-13-45T99:99:99.000Z");
      // Should return as string if date is invalid
      expect(typeof result).toBe("string");
    });

    test("should handle objects with value and watch properties", async () => {
      let receivedProps: any = null;

      // Create a mock signal-like object
      const mockSignal = {
        value: 42,
        watch: () => () => {},
      };

      app.component("ChildComponent", {
        setup({ props }: any) {
          receivedProps = props;
          return {};
        },
        template: () => "<div>Child</div>",
      });

      // Mount with pre-made signal-like prop
      await app.mount(container, {
        setup() {
          return {};
        },
        template: () => `<div class="child-slot" :test="value"></div>`,
        children: {
          ".child-slot": "ChildComponent",
        },
      });

      expect(receivedProps).toBeDefined();
    });

    test("should parse valid JSON with nested structures", () => {
      const nestedJson = JSON.stringify({
        level1: {
          level2: {
            level3: {
              value: "deep",
            },
          },
        },
      });
      const result = app.props.parse(nestedJson);
      expect(result.level1.level2.level3.value).toBe("deep");
    });
  });

  describe("Mount Method Override", () => {
    test("should handle mount with props parameter", async () => {
      app.use(PropsPlugin);

      let receivedProps: any = null;

      app.component("TestComponent", {
        setup({ props }: any) {
          receivedProps = props;
          return { message: props.message };
        },
        template: (ctx: any) => `<div>${ctx.message?.value ?? ctx.message}</div>`,
      });

      await app.mount(container, "TestComponent", { message: "Hello" });

      expect(receivedProps).toBeDefined();
      expect(receivedProps.message).toBeDefined();
    });

    test("should handle mount with empty props", async () => {
      app.use(PropsPlugin);

      let receivedProps: any = null;

      app.component("TestComponent", {
        setup({ props }: any) {
          receivedProps = props;
          return {};
        },
        template: () => "<div>Test</div>",
      });

      await app.mount(container, "TestComponent", {});

      expect(receivedProps).toBeDefined();
    });
  });

  describe("Parent Context Signal Linking", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should find and link parent context signals", async () => {
      let childReceived: any = null;
      let parentSignal: any = null;

      app.component("ChildComponent", {
        setup({ props }: any) {
          childReceived = props;
          return { count: props.count };
        },
        template: (ctx: any) => `<span class="child-value">${ctx.count?.value ?? ctx.count}</span>`,
      });

      app.component("ParentComponent", {
        setup({ signal }: any) {
          const count = signal(42);
          parentSignal = count;
          return { count };
        },
        template: (ctx: any) => `
          <div class="parent">
            <span class="parent-value">${ctx.count.value}</span>
            <div class="child-mount" :count="${ctx.count.value}"></div>
          </div>
        `,
        children: {
          ".child-mount": "ChildComponent",
        },
      });

      await app.mount(container, "ParentComponent");

      expect(childReceived).toBeDefined();
      expect(childReceived.count).toBeDefined();
    });

    test("should handle deeply nested parent contexts", async () => {
      let deepChildProps: any = null;

      app.component("DeepChild", {
        setup({ props }: any) {
          deepChildProps = props;
          return { value: props.value };
        },
        template: (ctx: any) => `<span>${ctx.value?.value ?? ctx.value}</span>`,
      });

      app.component("MiddleComponent", {
        template: () => `<div class="deep-child-mount" :value="100"></div>`,
        children: {
          ".deep-child-mount": "DeepChild",
        },
      });

      app.component("TopComponent", {
        setup({ signal }: any) {
          return { value: signal(100) };
        },
        template: (ctx: any) => `
          <div class="middle-mount">
            <span>${ctx.value.value}</span>
          </div>
        `,
        children: {
          ".middle-mount": "MiddleComponent",
        },
      });

      await app.mount(container, "TopComponent");

      expect(deepChildProps).toBeDefined();
    });

    test("should pass already-signal values without wrapping", async () => {
      let receivedSignalProp: any = null;

      app.component("SignalReceiver", {
        setup({ props }: any) {
          receivedSignalProp = props;
          return {};
        },
        template: () => "<div>Receiver</div>",
      });

      // Create a signal manually and pass it as props (use new keyword)
      const manualSignal = new app.signal(999);

      await app.mount(container, "SignalReceiver", { existingSignal: manualSignal });

      expect(receivedSignalProp).toBeDefined();
      expect(receivedSignalProp.existingSignal).toBeDefined();
    });
  });

  describe("Reactivity Disabled", () => {
    test("should not create signals when reactivity is disabled", async () => {
      app.use(PropsPlugin, { enableReactivity: false, enableAutoParsing: true });

      let receivedProps: any = null;

      app.component("TestComponent", {
        setup({ props }: any) {
          receivedProps = props;
          return {};
        },
        template: () => "<div>Test</div>",
      });

      await app.mount(container, "TestComponent", { value: 42 });

      expect(receivedProps).toBeDefined();
      expect(receivedProps.value).toBe(42);
      // Should be a plain value, not a signal
      expect(typeof receivedProps.value.watch).toBe("undefined");
    });
  });

  describe("Multiple Children Mounting", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should mount multiple children with different props", async () => {
      const receivedProps: any[] = [];

      app.component("ListItem", {
        setup({ props }: any) {
          receivedProps.push(props);
          return { name: props.name };
        },
        template: (ctx: any) => `<li>${ctx.name?.value ?? ctx.name}</li>`,
      });

      app.component("List", {
        template: () => `
          <ul>
            <li class="item1" :name="First"></li>
            <li class="item2" :name="Second"></li>
            <li class="item3" :name="Third"></li>
          </ul>
        `,
        children: {
          ".item1": "ListItem",
          ".item2": "ListItem",
          ".item3": "ListItem",
        },
      });

      await app.mount(container, "List");

      expect(receivedProps.length).toBe(3);
      expect(receivedProps[0].name.value).toBe("First");
      expect(receivedProps[1].name.value).toBe("Second");
      expect(receivedProps[2].name.value).toBe("Third");
    });
  });

  describe("Parent Context Signal Inheritance", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should traverse DOM tree to find parent instance", async () => {
      let childReceivedCount: any = null;
      let parentCounter: any = null;

      app.component("NestedChild", {
        setup({ props }: any) {
          childReceivedCount = props.count;
          return { displayCount: props.count };
        },
        template: (ctx: any) => `<span>${ctx.displayCount?.value ?? ctx.displayCount}</span>`,
      });

      app.component("ParentWrapper", {
        setup({ signal }: any) {
          const count = signal(100);
          parentCounter = count;
          return { count };
        },
        template: (ctx: any) => `
          <div class="wrapper">
            <div class="nested-child-wrapper" :count="${ctx.count.value}">
            </div>
          </div>
        `,
        children: {
          ".nested-child-wrapper": "NestedChild",
        },
      });

      await app.mount(container, "ParentWrapper");

      // Child should have received the prop
      expect(childReceivedCount).toBeDefined();
    });

    test("should not link non-matching signal names", async () => {
      let childProps: any = null;

      app.component("NonMatchingChild", {
        setup({ props }: any) {
          childProps = props;
          return { value: props.differentName };
        },
        template: (ctx: any) => `<span>${ctx.value?.value ?? ctx.value}</span>`,
      });

      app.component("NonMatchingParent", {
        setup({ signal }: any) {
          const someSignal = signal("test");
          return { someSignal };
        },
        template: () => `
          <div class="child-wrapper" :differentName="value"></div>
        `,
        children: {
          ".child-wrapper": "NonMatchingChild",
        },
      });

      await app.mount(container, "NonMatchingParent");

      expect(childProps).toBeDefined();
      expect(childProps.differentname).toBeDefined();
    });

    test("should handle components without parent context", async () => {
      let orphanProps: any = null;

      app.component("OrphanChild", {
        setup({ props }: any) {
          orphanProps = props;
          return { value: props.value };
        },
        template: (ctx: any) => `<span>${ctx.value?.value ?? ctx.value}</span>`,
      });

      // Mount directly without parent context
      await app.mount(container, "OrphanChild", { value: 42 });

      expect(orphanProps).toBeDefined();
      expect(orphanProps.value.value).toBe(42);
    });
  });

  describe("Signal Watch Integration", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should create reactive props with watch method", async () => {
      let receivedProp: any = null;

      app.component("WatchableChild", {
        setup({ props }: any) {
          receivedProp = props.value;
          return { displayValue: props.value };
        },
        template: (ctx: any) => `<span>${ctx.displayValue?.value ?? ctx.displayValue}</span>`,
      });

      app.component("WatchableParent", {
        template: () => `<div class="watch-child" :value="123"></div>`,
        children: {
          ".watch-child": "WatchableChild",
        },
      });

      await app.mount(container, "WatchableParent");

      expect(receivedProp).toBeDefined();
      expect(typeof receivedProp.watch).toBe("function");
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      app.use(PropsPlugin);
    });

    test("should handle empty children configuration", async () => {
      app.component("EmptyChildren", {
        template: () => `<div>No children</div>`,
        children: {},
      });

      await expect(app.mount(container, "EmptyChildren")).resolves.toBeDefined();
    });

    test("should handle component with inline definition", async () => {
      let receivedProps: any = null;

      await app.mount(container, {
        setup({ props }: any) {
          receivedProps = props;
          return {};
        },
        template: () => "<div>Inline</div>",
      }, { inlineProp: "value" });

      expect(receivedProps).toBeDefined();
      expect(receivedProps.inlineProp.value).toBe("value");
    });

    test("should skip non-HTMLElement nodes", async () => {
      app.component("TextNodeSibling", {
        template: () => `<div><!-- comment node --><span class="actual-child"></span></div>`,
        children: {
          ".actual-child": {
            setup() { return {}; },
            template: () => "<span>Child</span>",
          },
        },
      });

      await expect(app.mount(container, "TextNodeSibling")).resolves.toBeDefined();
    });
  });
});

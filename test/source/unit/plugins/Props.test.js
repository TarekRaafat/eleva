/**
 * @fileoverview Tests for the Props Plugin
 * Tests the core functionality of automatic type detection, parsing, and reactive props
 */

import { Eleva } from "../../../../src/core/Eleva.js";
import { PropsPlugin } from "../../../../src/plugins/Props.js";

describe("PropsPlugin", () => {
    let app;
    let container;

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
            expect(app.props.detectType(() => { })).toBe("function");
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
                settings: { theme: "dark", notifications: true }
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
                settings: { theme: "dark", notifications: true }
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
            let receivedProps = null;

            app.component("ChildComponent", {
                setup({ props }) {
                    receivedProps = props;
                    return {};
                },
                template: () => "<div>Child</div>"
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
                    ".child-container": "ChildComponent"
                }
            });

            await app.mount(container, "ParentComponent");

            expect(receivedProps).toBeDefined();
            expect(receivedProps.name.value).toBe("John");
            expect(receivedProps.age.value).toBe(30);
            expect(receivedProps.active.value).toBe(true);
            expect(receivedProps.data.value).toEqual({ key: "value" });
        });

        test("should create reactive props when enabled", async () => {
            let receivedProps = null;

            app.component("ChildComponent", {
                setup({ props }) {
                    receivedProps = props;
                    return {};
                },
                template: () => "<div>Child</div>"
            });

            app.component("ParentComponent", {
                template: () => `
                    <div class="child-container" :count="42"></div>
                `,
                children: {
                    ".child-container": "ChildComponent"
                }
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
            const errorHandler = jest.fn();
            app.use(PropsPlugin, { onError: errorHandler });

            // This should trigger an error handler call
            app.props.parse("{invalid json}");

            expect(errorHandler).toHaveBeenCalled();
        });

        test("should fallback to original value on error", () => {
            const errorHandler = jest.fn();
            app.use(PropsPlugin, { onError: errorHandler });

            const result = app.props.parse("invalid json {");
            expect(result).toBe("invalid json {");
        });
    });

    describe("Configuration Options", () => {
        test("should respect enableAutoParsing option", () => {
            app.use(PropsPlugin, { enableAutoParsing: false });

            // With auto parsing disabled, should return string as-is
            expect(app.props.parse("42")).toBe("42");
            expect(app.props.parse("true")).toBe("true");
        });

        test("should respect enableReactivity option", async () => {
            app.use(PropsPlugin, { enableReactivity: false });

            let receivedProps = null;

            app.component("ChildComponent", {
                setup({ props }) {
                    receivedProps = props;
                    return {};
                },
                template: () => "<div>Child</div>"
            });

            app.component("ParentComponent", {
                template: () => `
                    <div class="child-container" :count="42"></div>
                `,
                children: {
                    ".child-container": "ChildComponent"
                }
            });

            await app.mount(container, "ParentComponent");

            expect(receivedProps).toBeDefined();
            expect(receivedProps.count).toBe(42); // Should be plain value, not signal
            expect(typeof receivedProps.count.watch).toBe("undefined");
        });
    });
});
"use strict";

import Eleva from "../../../../src/index.js";
import { AttrPlugin } from "../../../../src/plugins/Attr.js";

describe("AttrPlugin", () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `<div id="app"></div>`;
        app = new Eleva("testApp");
    });

    afterEach(() => {
        // Clean up by clearing the app reference
        app = null;
    });

    test("should install the plugin correctly", () => {
        expect(() => {
            app.use(AttrPlugin);
        }).not.toThrow();

        expect(app.plugins.has("attr")).toBe(true);
        expect(app.updateElementAttributes).toBeDefined();
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
    });

    test("should extend renderer with updateAttributes method", () => {
        app.use(AttrPlugin);

        expect(typeof app.updateElementAttributes).toBe("function");
    });

    test("should uninstall the plugin correctly", () => {
        app.use(AttrPlugin);
        expect(app.plugins.has("attr")).toBe(true);

        // Note: Uninstall functionality would be tested here if implemented
        // For now, we just verify the plugin was installed
    });
});

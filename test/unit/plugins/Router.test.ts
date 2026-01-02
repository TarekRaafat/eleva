/**
 * @fileoverview Tests for the Router Plugin
 */

import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import Eleva from "../../../src/index.js";
import { RouterPlugin } from "../../../src/plugins/Router.js";
import { flushPromises } from "../../utils.js";

describe("RouterPlugin", () => {
  let app: any;
  let router: any;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    app = new Eleva("test-app");
  });

  afterEach(() => {
    if (router) {
      router.destroy();
    }
    document.body.innerHTML = "";
  });

  describe("Installation", () => {
    test("should install router plugin successfully", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(app.router).toBeDefined();
      expect(app.navigate).toBeDefined();
      expect(app.getCurrentRoute).toBeDefined();
      expect(app.getRouteParams).toBeDefined();
      expect(app.getRouteQuery).toBeDefined();
    });

    test("should throw error if mount option is missing", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      expect(() => {
        app.use(RouterPlugin, {
          routes: [{ path: "/", component: HomePage }],
        });
      }).toThrow("[RouterPlugin] 'mount' option is required");
    });

    test("should throw error if routes option is missing", () => {
      expect(() => {
        app.use(RouterPlugin, {
          mount: "#app",
        });
      }).toThrow("[RouterPlugin] 'routes' option must be an array");
    });

    test("should return router instance", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(router).toBeDefined();
      expect(typeof router.navigate).toBe("function");
      expect(typeof router.start).toBe("function");
    });
  });

  describe("Route Configuration", () => {
    test("should register inline components automatically", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
      });

      const registeredComponents = Array.from(app._components.keys());
      expect(
        registeredComponents.some((name: string) =>
          name.includes("ElevaRouteComponent")
        )
      ).toBe(true);
    });

    test("should support route metadata", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          {
            path: "/",
            component: HomePage,
            meta: { title: "Home", requiresAuth: false },
          },
        ],
      });

      expect(router.routes[0].meta).toEqual({
        title: "Home",
        requiresAuth: false,
      });
    });

    test("should support global layout", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const MainLayout = { template: () => "<div><slot></slot></div>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        globalLayout: MainLayout,
        routes: [{ path: "/", component: HomePage }],
      });

      expect(router.options.globalLayout).toBeDefined();
    });
  });

  describe("Navigation", () => {
    test("should navigate to routes programmatically", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
      });

      await router.start();
      await router.navigate("/about");

      expect(router.currentRoute.value.path).toBe("/about");
    });

    test("should handle route parameters", async () => {
      const UserPage = {
        template: (ctx: any) => `<h1>User: ${ctx.router.params.id}</h1>`,
      };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/users/:id", component: UserPage }],
      });

      await router.start();
      await router.navigate("/users/123");

      expect(router.currentRoute.value.path).toBe("/users/123");
      expect(router.currentParams.value.id).toBe("123");
    });

    test("should handle query parameters", async () => {
      const SearchPage = {
        template: (ctx: any) => `<h1>Search: ${ctx.router.query.q}</h1>`,
      };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/search", component: SearchPage }],
      });

      await router.start();
      await router.navigate("/search?q=test");

      expect(router.currentRoute.value.path).toBe("/search");
      expect(router.currentQuery.value.q).toBe("test");
    });

    test("should handle complex navigation objects", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      await router.start();

      await router.navigate({
        path: "/",
        query: { tab: "overview" },
        replace: true,
        state: { from: "test" },
      });

      expect(router.currentRoute.value.path).toBe("/");
      expect(router.currentQuery.value.tab).toBe("overview");
    });
  });

  describe("Navigation Guards", () => {
    test("should execute route-specific beforeEnter guards", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };

      const routeGuard = mock(() => true);

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          {
            path: "/about",
            component: AboutPage,
            beforeEnter: routeGuard,
          },
        ],
      });

      await router.start();
      await router.navigate("/about");

      expect(routeGuard).toHaveBeenCalled();
    });

    test("should redirect when guard returns path", async () => {
      // Skip this test in SSR mode since it requires browser navigation
      if (typeof window === "undefined" || !window.history) {
        expect(true).toBe(true);
        return;
      }

      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };

      const redirectGuard = mock(() => "/");

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          {
            path: "/about",
            component: AboutPage,
            beforeEnter: redirectGuard,
          },
        ],
      });

      await router.start();
      await router.navigate("/about");
      // Wait for the async redirect navigation to complete
      await flushPromises();

      expect(redirectGuard).toHaveBeenCalled();
      expect(router.currentRoute.value.path).toBe("/");
    });
  });

  describe("Lifecycle Hooks", () => {
    test("should execute afterEnter hooks", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };

      const afterEnterHook = mock(() => {});

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          {
            path: "/about",
            component: AboutPage,
            afterEnter: afterEnterHook,
          },
        ],
      });

      await router.start();
      await router.navigate("/about");

      expect(afterEnterHook).toHaveBeenCalled();
    });
  });

  describe("Reactive State", () => {
    test("should provide reactive params state", async () => {
      const UserPage = { template: () => "<h1>User</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/users/:id", component: UserPage }],
      });

      await router.start();

      const paramChanges: any[] = [];
      router.currentParams.watch((params: any) => {
        paramChanges.push(params);
      });

      await router.navigate("/users/123");

      expect(paramChanges.length).toBeGreaterThan(0);
      expect(paramChanges[paramChanges.length - 1].id).toBe("123");
    });
  });

  describe("Plugin System", () => {
    test("should support router-level plugins", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      const testPlugin = {
        name: "test-plugin",
        install: mock(() => {}),
      };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      await router.start();

      router.use(testPlugin, { test: true });

      expect(testPlugin.install).toHaveBeenCalledWith(router, { test: true });
      expect(router.getPlugin("test-plugin")).toBe(testPlugin);
    });

    test("should prevent duplicate plugin registration", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      const testPlugin = {
        name: "test-plugin",
        install: mock(() => {}),
      };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      await router.start();

      router.use(testPlugin);
      router.use(testPlugin);

      expect(testPlugin.install).toHaveBeenCalledTimes(1);
    });

    test("should clean up plugins on destroy", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      const testPlugin = {
        name: "test-plugin",
        install: mock(() => {}),
        destroy: mock(() => {}),
      };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      // Manually set isStarted to test destroy logic (simulating non-SSR)
      router.isStarted = true;

      router.use(testPlugin);
      await router.destroy();

      expect(testPlugin.destroy).toHaveBeenCalledWith(router);
    });
  });

  describe("Utility Methods", () => {
    test("should provide utility methods on app instance", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
      });

      await router.start();

      expect(typeof app.navigate).toBe("function");
      expect(typeof app.getCurrentRoute).toBe("function");
      expect(typeof app.getRouteParams).toBe("function");
      expect(typeof app.getRouteQuery).toBe("function");

      await app.navigate("/about");
      expect(app.getCurrentRoute().path).toBe("/about");
    });
  });

  describe("Uninstall", () => {
    test("should clean up properly on uninstall", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      await router.start();

      await RouterPlugin.uninstall(app);

      expect(app.router).toBeUndefined();
      expect(app.navigate).toBeUndefined();
      expect(app.getCurrentRoute).toBeUndefined();
      expect(app.getRouteParams).toBeUndefined();
      expect(app.getRouteQuery).toBeUndefined();
    });
  });
});

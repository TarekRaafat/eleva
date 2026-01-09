/**
 * @fileoverview Tests for the Router Plugin
 * Tests the core functionality of client-side routing, navigation guards, and lifecycle hooks
 */

import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import Eleva from "../../../src/index.js";
import { RouterPlugin } from "../../../src/plugins/Router.js";
import { flushPromises } from "../../utils.js";

// =============================================================================
// Router Plugin Tests
// =============================================================================

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

  // ===========================================================================
  // Plugin Installation
  // ===========================================================================

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

  // ===========================================================================
  // Route Configuration
  // ===========================================================================

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

  // ===========================================================================
  // Navigation
  // ===========================================================================

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

  // ===========================================================================
  // Navigation Guards
  // ===========================================================================

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

  // ===========================================================================
  // Lifecycle Hooks
  // ===========================================================================

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

  // ===========================================================================
  // Reactive State
  // ===========================================================================

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

  // ===========================================================================
  // Plugin System
  // ===========================================================================

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

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

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

  // ===========================================================================
  // Uninstall
  // ===========================================================================

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

  // ===========================================================================
  // Dynamic Route Management
  // ===========================================================================

  describe("Dynamic Route Management", () => {
    beforeEach(() => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });
    });

    test("should add route dynamically", async () => {
      const NewPage = { template: () => "<h1>New Page</h1>" };

      const removeRoute = router.addRoute({
        path: "/new",
        component: NewPage,
        meta: { title: "New Page" },
      });

      expect(router.hasRoute("/new")).toBe(true);
      expect(typeof removeRoute).toBe("function");
    });

    test("should remove route using returned function", async () => {
      const NewPage = { template: () => "<h1>New Page</h1>" };

      const removeRoute = router.addRoute({
        path: "/new",
        component: NewPage,
      });

      expect(router.hasRoute("/new")).toBe(true);

      removeRoute();

      expect(router.hasRoute("/new")).toBe(false);
    });

    test("should remove route by path", async () => {
      const NewPage = { template: () => "<h1>New Page</h1>" };

      router.addRoute({
        path: "/new",
        component: NewPage,
      });

      const result = router.removeRoute("/new");

      expect(result).toBe(true);
      expect(router.hasRoute("/new")).toBe(false);
    });

    test("should return false when removing non-existent route", () => {
      const result = router.removeRoute("/non-existent");
      expect(result).toBe(false);
    });

    test("should get all routes", () => {
      const routes = router.getRoutes();
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
      expect(routes[0].path).toBe("/");
    });

    test("should get route by path", () => {
      const route = router.getRoute("/");
      expect(route).toBeDefined();
      expect(route.path).toBe("/");
    });

    test("should return undefined for non-existent route", () => {
      const route = router.getRoute("/non-existent");
      expect(route).toBeUndefined();
    });

    test("should not add duplicate routes", () => {
      const NewPage = { template: () => "<h1>New Page</h1>" };

      router.addRoute({ path: "/new", component: NewPage });
      const initialLength = router.routes.length;

      router.addRoute({ path: "/new", component: NewPage });

      expect(router.routes.length).toBe(initialLength);
    });

    test("should add route before wildcard", () => {
      const NotFoundPage = { template: () => "<h1>404</h1>" };
      const NewPage = { template: () => "<h1>New</h1>" };

      router.addRoute({ path: "*", component: NotFoundPage });
      router.addRoute({ path: "/new", component: NewPage });

      const wildcardIndex = router.routes.findIndex((r: any) => r.path === "*");
      const newRouteIndex = router.routes.findIndex((r: any) => r.path === "/new");

      expect(newRouteIndex).toBeLessThan(wildcardIndex);
    });

    test("should handle invalid route definitions", () => {
      const result1 = router.addRoute(null as any);
      const result2 = router.addRoute({} as any);

      expect(typeof result1).toBe("function");
      expect(typeof result2).toBe("function");
    });
  });

  // ===========================================================================
  // Hook Registration
  // ===========================================================================

  describe("Hook Registration", () => {
    test("should register and unregister onBeforeEach guard", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const guard = mock(() => true);

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
      });

      const unregister = router.onBeforeEach(guard);

      await router.start();
      await router.navigate("/about");

      expect(guard).toHaveBeenCalled();

      unregister();
    });

    test("should register onAfterEnter hook", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const hook = mock(() => {});

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
      });

      router.onAfterEnter(hook);

      await router.start();
      await router.navigate("/about");

      expect(hook).toHaveBeenCalled();
    });

    test("should register onAfterLeave hook", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const ContactPage = { template: () => "<h1>Contact</h1>" };
      const hook = mock(() => {});

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
          { path: "/contact", component: ContactPage },
        ],
      });

      router.onAfterLeave(hook);

      await router.start();
      // Navigate to about first to ensure we have a valid "from" route
      await router.navigate("/about");
      // Then navigate away to trigger afterLeave
      await router.navigate("/contact");

      expect(hook).toHaveBeenCalled();
    });

    test("should register onAfterEach hook", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const hook = mock(() => {});

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
      });

      router.onAfterEach(hook);

      await router.start();
      await router.navigate("/about");

      expect(hook).toHaveBeenCalled();
    });

    test("should register onError handler and return unregister function", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [{ path: "/", component: HomePage }],
      });

      const handler = mock(() => {});
      const unregister = router.onError(handler);

      // Should return unregister function
      expect(typeof unregister).toBe("function");
    });
  });

  // ===========================================================================
  // Global beforeEach Guard
  // ===========================================================================

  describe("Global beforeEach Guard", () => {
    test("should execute global onBeforeEach from options", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const globalGuard = mock(() => true);

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
        onBeforeEach: globalGuard,
      });

      await router.start();
      await router.navigate("/about");

      expect(globalGuard).toHaveBeenCalled();
    });

    test("should block navigation when global guard returns false", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
        onBeforeEach: () => false,
      });

      await router.start();
      const result = await router.navigate("/about");

      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // Route Leave Guards and Hooks
  // ===========================================================================

  describe("Route Leave Guards and Hooks", () => {
    test("should execute beforeLeave guard", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const ContactPage = { template: () => "<h1>Contact</h1>" };
      const beforeLeaveGuard = mock(() => true);

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage, beforeLeave: beforeLeaveGuard },
          { path: "/contact", component: ContactPage },
        ],
      });

      await router.start();
      // First navigate to /about
      await router.navigate("/about");
      // Then navigate away - this should trigger beforeLeave on /about
      await router.navigate("/contact");

      expect(beforeLeaveGuard).toHaveBeenCalled();
    });

    test("should execute afterLeave hook", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const ContactPage = { template: () => "<h1>Contact</h1>" };
      const afterLeaveHook = mock(() => {});

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage, afterLeave: afterLeaveHook },
          { path: "/contact", component: ContactPage },
        ],
      });

      await router.start();
      // First navigate to /about
      await router.navigate("/about");
      // Then navigate away - this should trigger afterLeave on /about
      await router.navigate("/contact");

      expect(afterLeaveHook).toHaveBeenCalled();
    });

    test("should block navigation when beforeLeave returns false", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const ContactPage = { template: () => "<h1>Contact</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage, beforeLeave: () => false },
          { path: "/contact", component: ContactPage },
        ],
      });

      await router.start();
      // First navigate to /about
      await router.navigate("/about");
      // Then try to navigate away - this should be blocked by beforeLeave
      const result = await router.navigate("/contact");

      expect(result).toBe(false);
      expect(router.currentRoute.value.path).toBe("/about");
    });
  });

  // ===========================================================================
  // Wildcard and 404 Routes
  // ===========================================================================

  describe("Wildcard and 404 Routes", () => {
    test("should match wildcard route for unknown paths", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const NotFoundPage = { template: () => "<h1>404</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "*", component: NotFoundPage },
        ],
      });

      await router.start();
      await router.navigate("/unknown/path");

      expect(router.currentRoute.value.matched.path).toBe("*");
    });

    test("should provide pathMatch param for wildcard routes", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const NotFoundPage = { template: () => "<h1>404</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "*", component: NotFoundPage },
        ],
      });

      await router.start();
      await router.navigate("/unknown/path");

      expect(router.currentRoute.value.params.pathMatch).toBe("unknown/path");
    });

    test("should emit error when no route matches and no wildcard", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const errorHandler = mock(() => {});

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      router.onError(errorHandler);

      await router.start();
      await router.navigate("/unknown");

      expect(errorHandler).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Route-Specific Layouts
  // ===========================================================================

  describe("Route-Specific Layouts", () => {
    test("should use route-specific layout", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const DashboardLayout = {
        template: () => '<div class="dashboard"><div id="root"></div></div>',
      };
      const DashboardPage = { template: () => "<h1>Dashboard</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          {
            path: "/dashboard",
            component: DashboardPage,
            layout: DashboardLayout,
          },
        ],
      });

      await router.start();
      await router.navigate("/dashboard");

      expect(router.currentLayout.value).not.toBe(null);
    });
  });

  // ===========================================================================
  // Same Route Detection
  // ===========================================================================

  describe("Same Route Detection", () => {
    test("should return true when navigating to same route", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      await router.start();

      // Navigate to same route should return true
      const result = await router.navigate("/");
      expect(result).toBe(true);
    });

    test("should detect same route with query params", async () => {
      const SearchPage = { template: () => "<h1>Search</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/search", component: SearchPage }],
      });

      await router.start();
      await router.navigate("/search?q=test");

      // Navigate to same route with same query should return true
      const result = await router.navigate("/search?q=test");
      expect(result).toBe(true);
    });
  });

  // ===========================================================================
  // Navigation with Replace
  // ===========================================================================

  describe("Navigation with Replace", () => {
    test("should support replace option in navigation", async () => {
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

      await router.navigate({ path: "/about", replace: true });

      expect(router.currentRoute.value.path).toBe("/about");
    });
  });

  // ===========================================================================
  // Router Lifecycle
  // ===========================================================================

  describe("Router Lifecycle", () => {
    test("should warn when starting already started router", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const warnCalls: any[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => warnCalls.push(args);

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
        autoStart: false,
      });

      await router.start();
      await router.start();

      expect(warnCalls.some((call) => call[0].includes("already started"))).toBe(true);
      console.warn = originalWarn;
    });

    test("should support stop as alias for destroy", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
        autoStart: false,
      });

      await router.start();
      expect(router.isStarted).toBe(true);

      await router.stop();
      expect(router.isStarted).toBe(false);
    });

    test("should set isReady signal after start", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
        autoStart: false,
      });

      expect(router.isReady.value).toBe(false);

      await router.start();

      expect(router.isReady.value).toBe(true);
    });

    test("should reset isReady on destroy", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
        autoStart: false,
      });

      await router.start();
      expect(router.isReady.value).toBe(true);

      await router.destroy();
      expect(router.isReady.value).toBe(false);
    });

    test("should emit router:ready event on start", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const readyHandler = mock(() => {});

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
        autoStart: false,
      });

      router.emitter.on("router:ready", readyHandler);
      await router.start();

      expect(readyHandler).toHaveBeenCalledWith(router);
    });
  });

  // ===========================================================================
  // Routing Modes
  // ===========================================================================

  describe("Routing Modes", () => {
    test("should use hash mode by default", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(router.options.mode).toBe("hash");
    });

    test("should support history mode", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        mode: "history",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(router.options.mode).toBe("history");
    });

    test("should support query mode", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        mode: "query",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(router.options.mode).toBe("query");
    });

    test("should support custom query param name", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        mode: "query",
        queryParam: "page",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(router.options.queryParam).toBe("page");
    });

    test("should throw error for invalid routing mode", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      expect(() => {
        app.use(RouterPlugin, {
          mount: "#app",
          mode: "invalid" as any,
          routes: [{ path: "/", component: HomePage }],
        });
      }).toThrow();
    });
  });

  // ===========================================================================
  // Custom Error Handler
  // ===========================================================================

  describe("Custom Error Handler", () => {
    test("should allow setting custom error handler", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      const customHandler = {
        handle: mock(() => {}),
        warn: mock(() => {}),
        log: mock(() => {}),
      };

      router.setErrorHandler(customHandler);
      expect(router.errorHandler).toBe(customHandler);
    });

    test("should reject invalid error handler", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const warnCalls: any[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => warnCalls.push(args);

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      router.setErrorHandler({ invalid: true });

      expect(warnCalls.some((call) => call[0].includes("Invalid error handler"))).toBe(true);
      console.warn = originalWarn;
    });
  });

  // ===========================================================================
  // Plugin Metadata
  // ===========================================================================

  describe("Plugin Metadata", () => {
    test("should have correct plugin name", () => {
      expect(RouterPlugin.name).toBe("router");
    });

    test("should have version string", () => {
      expect(typeof RouterPlugin.version).toBe("string");
      expect(RouterPlugin.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    test("should have description", () => {
      expect(typeof RouterPlugin.description).toBe("string");
      expect(RouterPlugin.description.length).toBeGreaterThan(0);
    });

    test("should register plugin metadata on app", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(app.plugins).toBeDefined();
      expect(app.plugins.get("router")).toBeDefined();
      expect(app.plugins.get("router").version).toBe(RouterPlugin.version);
    });
  });

  // ===========================================================================
  // Reactive Signals
  // ===========================================================================

  describe("Reactive Signals", () => {
    test("should have reactive currentRoute signal", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
        ],
      });

      const routeChanges: any[] = [];
      router.currentRoute.watch((route: any) => {
        routeChanges.push(route);
      });

      await router.start();
      await router.navigate("/about");

      expect(routeChanges.length).toBeGreaterThan(0);
    });

    test("should have reactive previousRoute signal", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const ContactPage = { template: () => "<h1>Contact</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
          { path: "/contact", component: ContactPage },
        ],
      });

      await router.start();
      // Navigate to about first to establish a known route
      await router.navigate("/about");
      // Then navigate to contact - previous should now be /about
      await router.navigate("/contact");

      expect(router.previousRoute.value).not.toBe(null);
      expect(router.previousRoute.value.path).toBe("/about");
    });

    test("should have reactive currentQuery signal", async () => {
      const SearchPage = { template: () => "<h1>Search</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/search", component: SearchPage }],
      });

      const queryChanges: any[] = [];
      router.currentQuery.watch((query: any) => {
        queryChanges.push(query);
      });

      await router.start();
      await router.navigate("/search?q=test&page=1");

      expect(queryChanges.length).toBeGreaterThan(0);
      const lastQuery = queryChanges[queryChanges.length - 1];
      expect(lastQuery.q).toBe("test");
      expect(lastQuery.page).toBe("1");
    });
  });

  // ===========================================================================
  // Path Building
  // ===========================================================================

  describe("Path Building", () => {
    test("should build path with params", async () => {
      const UserPage = { template: () => "<h1>User</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/users/:id", component: UserPage }],
      });

      await router.start();
      await router.navigate({
        path: "/users/:id",
        params: { id: "123" },
      });

      expect(router.currentRoute.value.path).toBe("/users/123");
    });

    test("should handle special characters in params", async () => {
      const UserPage = { template: () => "<h1>User</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/users/:name", component: UserPage }],
      });

      await router.start();
      await router.navigate({
        path: "/users/:name",
        params: { name: "John Doe" },
      });

      expect(router.currentRoute.value.params.name).toBe("John Doe");
    });
  });

  // ===========================================================================
  // Multiple Dynamic Params
  // ===========================================================================

  describe("Multiple Dynamic Params", () => {
    test("should handle multiple route params", async () => {
      const PostPage = { template: () => "<h1>Post</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/users/:userId/posts/:postId", component: PostPage }],
      });

      await router.start();
      await router.navigate("/users/123/posts/456");

      expect(router.currentParams.value.userId).toBe("123");
      expect(router.currentParams.value.postId).toBe("456");
    });
  });

  // ===========================================================================
  // View Element Finding
  // ===========================================================================

  describe("View Element Finding", () => {
    test("should use custom viewSelector", async () => {
      const Layout = {
        template: () => '<div><div class="content"></div></div>',
      };
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        viewSelector: "content",
        globalLayout: Layout,
        routes: [{ path: "/", component: HomePage }],
      });

      expect(router.options.viewSelector).toBe("content");
    });
  });

  // ===========================================================================
  // Router Plugin Management
  // ===========================================================================

  describe("Router Plugin Management", () => {
    test("should get all registered plugins", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      const testPlugin1 = { name: "plugin1", install: () => {} };
      const testPlugin2 = { name: "plugin2", install: () => {} };

      router.use(testPlugin1);
      router.use(testPlugin2);

      const plugins = router.getPlugins();
      expect(plugins.length).toBe(2);
      expect(plugins.some((p: any) => p.name === "plugin1")).toBe(true);
      expect(plugins.some((p: any) => p.name === "plugin2")).toBe(true);
    });

    test("should remove plugin by name", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      const destroyMock = mock(() => {});
      const testPlugin = {
        name: "removable",
        install: () => {},
        destroy: destroyMock,
      };

      router.use(testPlugin);
      expect(router.getPlugin("removable")).toBeDefined();

      const result = router.removePlugin("removable");
      expect(result).toBe(true);
      expect(router.getPlugin("removable")).toBeUndefined();
      expect(destroyMock).toHaveBeenCalled();
    });

    test("should return false when removing non-existent plugin", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      const result = router.removePlugin("non-existent");
      expect(result).toBe(false);
    });

    test("should throw error for plugin without install method", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(() => {
        router.use({ name: "invalid" });
      }).toThrow();
    });
  });

  // ===========================================================================
  // AutoStart Option
  // ===========================================================================

  describe("AutoStart Option", () => {
    test("should auto-start by default", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      // Wait for microtask to complete
      await flushPromises();
      await new Promise((r) => setTimeout(r, 10));

      expect(router.isStarted).toBe(true);
    });

    test("should not auto-start when autoStart is false", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [{ path: "/", component: HomePage }],
      });

      await flushPromises();

      expect(router.isStarted).toBe(false);
    });
  });

  // ===========================================================================
  // Mount Element Validation
  // ===========================================================================

  describe("Mount Element Validation", () => {
    test("should warn when mount element not found", async () => {
      const warnCalls: any[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => warnCalls.push(args);

      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#non-existent",
        autoStart: false,
        routes: [{ path: "/", component: HomePage }],
      });

      await router.start();

      expect(warnCalls.some((call) => call[0].includes("not found"))).toBe(true);
      console.warn = originalWarn;
    });
  });

  // ===========================================================================
  // Navigation Return Values
  // ===========================================================================

  describe("Navigation Return Values", () => {
    test("should return true on successful navigation", async () => {
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
      const result = await router.navigate("/about");

      expect(result).toBe(true);
    });

    test("should return false when navigation is blocked", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const ProtectedPage = { template: () => "<h1>Protected</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          {
            path: "/protected",
            component: ProtectedPage,
            beforeEnter: () => false,
          },
        ],
      });

      await router.start();
      const result = await router.navigate("/protected");

      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // Named Routes
  // ===========================================================================

  describe("Named Routes", () => {
    test("should support named routes", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/home", component: HomePage, name: "home" },
        ],
      });

      await router.start();
      await router.navigate("/home");

      expect(router.currentRoute.value).not.toBe(null);
      expect(router.currentRoute.value.name).toBe("home");
    });
  });

  // ===========================================================================
  // Route Metadata Access
  // ===========================================================================

  describe("Route Metadata Access", () => {
    test("should provide meta in route location", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          {
            path: "/home",
            component: HomePage,
            meta: { requiresAuth: true, title: "Home" },
          },
        ],
      });

      await router.start();
      await router.navigate("/home");

      expect(router.currentRoute.value).not.toBe(null);
      expect(router.currentRoute.value.meta.requiresAuth).toBe(true);
      expect(router.currentRoute.value.meta.title).toBe("Home");
    });
  });

  // ===========================================================================
  // Scroll Position Management
  // ===========================================================================

  describe("Scroll Position Management", () => {
    test("should have scroll positions map", () => {
      const HomePage = { template: () => "<h1>Home</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [{ path: "/", component: HomePage }],
      });

      expect(router._scrollPositions).toBeDefined();
      expect(router._scrollPositions instanceof Map).toBe(true);
    });
  });

  // ===========================================================================
  // Lazy Loading Components
  // ===========================================================================

  describe("Lazy Loading Components", () => {
    test("should support async component functions", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const LazyPage = async () => ({ default: { template: () => "<h1>Lazy</h1>" } });

      router = app.use(RouterPlugin, {
        mount: "#app",
        routes: [
          { path: "/", component: HomePage },
          { path: "/lazy", component: LazyPage },
        ],
      });

      await router.start();
      await router.navigate("/lazy");

      expect(router.currentRoute.value.path).toBe("/lazy");
    });
  });

  // ===========================================================================
  // Event Context Modification
  // ===========================================================================

  describe("Event Context Modification", () => {
    test("should allow cancelling navigation via beforeEach context", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const ContactPage = { template: () => "<h1>Contact</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
          { path: "/contact", component: ContactPage },
        ],
      });

      router.emitter.on("router:beforeEach", (context: any) => {
        if (context.to.path === "/contact") {
          context.cancelled = true;
        }
      });

      await router.start();
      // First navigate to about successfully
      await router.navigate("/about");
      // Then try to navigate to contact - should be blocked
      const result = await router.navigate("/contact");

      expect(result).toBe(false);
      expect(router.currentRoute.value.path).toBe("/about");
    });

    test("should allow redirecting via beforeEach context", async () => {
      const HomePage = { template: () => "<h1>Home</h1>" };
      const AboutPage = { template: () => "<h1>About</h1>" };
      const ContactPage = { template: () => "<h1>Contact</h1>" };
      const ProfilePage = { template: () => "<h1>Profile</h1>" };

      router = app.use(RouterPlugin, {
        mount: "#app",
        autoStart: false,
        routes: [
          { path: "/", component: HomePage },
          { path: "/about", component: AboutPage },
          { path: "/contact", component: ContactPage },
          { path: "/profile", component: ProfilePage },
        ],
      });

      router.emitter.on("router:beforeEach", (context: any) => {
        if (context.to.path === "/contact") {
          context.redirectTo = "/profile";
        }
      });

      await router.start();
      // First navigate to about
      await router.navigate("/about");
      // Then navigate to contact - should redirect to profile
      await router.navigate("/contact");
      await flushPromises();

      expect(router.currentRoute.value.path).toBe("/profile");
    });
  });
});

---
title: Router API Reference
description: Complete API reference for Eleva Router including methods, properties, plugins, TypeScript support, and troubleshooting.
---

# Router API Reference

> **Router Plugin** | Complete API reference.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `eleva` | `Eleva` | Parent Eleva instance |
| `options` | `RouterOptions` | Merged configuration options |
| `routes` | `RouteDefinition[]` | Registered routes array |
| `emitter` | `Emitter` | Event emitter instance |
| `isStarted` | `boolean` | Whether router is started |
| `currentRoute` | `Signal<RouteLocation \| null>` | Current route (reactive) |
| `previousRoute` | `Signal<RouteLocation \| null>` | Previous route (reactive) |
| `currentParams` | `Signal<Record<string, string>>` | Route params (reactive) |
| `currentQuery` | `Signal<Record<string, string>>` | Query params (reactive) |
| `currentLayout` | `Signal<MountResult \| null>` | Layout instance (reactive) |
| `currentView` | `Signal<MountResult \| null>` | View instance (reactive) |
| `isReady` | `Signal<boolean>` | Ready state (reactive) |

---

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `start` | `() => Promise<Router>` | Start the router |
| `stop` | `() => Promise<void>` | Stop the router |
| `destroy` | `() => Promise<void>` | Stop and cleanup (alias: stop) |
| `navigate` | `(location, params?) => Promise<boolean>` | Navigate to route |
| `onBeforeEach` | `(guard) => () => void` | Register global guard |
| `onAfterEnter` | `(hook) => () => void` | Register after-enter hook |
| `onAfterLeave` | `(hook) => () => void` | Register after-leave hook |
| `onAfterEach` | `(hook) => () => void` | Register after-each hook |
| `onError` | `(handler) => () => void` | Register error handler |
| `addRoute` | `(route) => () => void` | Add route dynamically |
| `removeRoute` | `(path) => boolean` | Remove route by path |
| `hasRoute` | `(path) => boolean` | Check if route exists |
| `getRoutes` | `() => RouteDefinition[]` | Get all routes |
| `getRoute` | `(path) => RouteDefinition \| undefined` | Get route by path |
| `use` | `(plugin, options?) => void` | Install plugin |
| `getPlugins` | `() => RouterPlugin[]` | Get all plugins |
| `getPlugin` | `(name) => RouterPlugin \| undefined` | Get plugin by name |
| `removePlugin` | `(name) => boolean` | Remove plugin |
| `setErrorHandler` | `(handler) => void` | Set error handler |

---

## Method Details

### navigate(location, options?)

The primary method for programmatic navigation.

**Signatures:**

```javascript
// Navigate by path string
await router.navigate("/users/123");

// Navigate by path with query
await router.navigate("/search?q=hello&page=1");

// Navigate with route object
await router.navigate({
  path: "/users/:id",
  params: { id: "123" },
  query: { tab: "settings" },
  hash: "#section"
});

// Navigate with replace (no history entry)
await router.navigate("/dashboard", { replace: true });
```

**Return Value:** `Promise<boolean>` - `true` if navigation succeeded, `false` if blocked by guard.

**Examples:**

```javascript
// Basic navigation
async function goToUser(userId) {
  const success = await router.navigate(`/users/${userId}`);
  if (!success) {
    console.log("Navigation was blocked");
  }
}

// With error handling
async function navigateSafely(path) {
  try {
    await router.navigate(path);
  } catch (error) {
    console.error("Navigation failed:", error);
    await router.navigate("/error");
  }
}

// Conditional navigation
async function submitForm() {
  const saved = await saveData();
  if (saved) {
    await router.navigate("/success");
  } else {
    await router.navigate("/error", { replace: true });
  }
}
```

### onBeforeEach(guard)

Register a global navigation guard that runs before every navigation.

**Signature:**

```javascript
const unsubscribe = router.onBeforeEach((to, from) => {
  // Return: true | false | "/redirect" | { path, query, ... }
});
```

**Examples:**

```javascript
// Authentication guard
const unsubAuth = router.onBeforeEach((to, from) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    return { path: "/login", query: { redirect: to.path } };
  }
  return true;
});

// Role-based access
router.onBeforeEach((to, from) => {
  if (to.meta?.roles) {
    const userRoles = getCurrentUserRoles();
    const hasAccess = to.meta.roles.some(role => userRoles.includes(role));
    if (!hasAccess) return "/unauthorized";
  }
});

// Confirm navigation away from unsaved changes
router.onBeforeEach((to, from) => {
  if (from?.meta?.hasUnsavedChanges && hasUnsavedChanges()) {
    const confirmed = confirm("You have unsaved changes. Leave anyway?");
    if (!confirmed) return false;
  }
});

// Async guard (e.g., check permissions from API)
router.onBeforeEach(async (to, from) => {
  if (to.meta?.checkPermission) {
    const allowed = await checkPermissionAPI(to.path);
    if (!allowed) return "/forbidden";
  }
});
```

### addRoute(route) / removeRoute(path)

Dynamically manage routes at runtime.

**Examples:**

```javascript
// Add route dynamically
const removeRoute = router.addRoute({
  path: "/admin/new-feature",
  component: NewFeaturePage,
  meta: { requiresAuth: true }
});

// Remove route when feature is disabled
if (featureDisabled) {
  router.removeRoute("/admin/new-feature");
}

// Add routes based on user permissions
async function setupUserRoutes(permissions) {
  if (permissions.includes("admin")) {
    router.addRoute({ path: "/admin", component: AdminPage });
  }
  if (permissions.includes("analytics")) {
    router.addRoute({ path: "/analytics", component: AnalyticsPage });
  }
}

// Cleanup routes on logout
function onLogout() {
  router.removeRoute("/admin");
  router.removeRoute("/analytics");
  router.navigate("/login");
}
```

### start() / stop() / destroy()

Control the router lifecycle.

**Examples:**

```javascript
// Basic startup
const router = app.use(Router, { /* config */ });
await router.start();

// Conditional startup
async function initApp() {
  const router = app.use(Router, { routes });

  // Wait for auth check before starting router
  const user = await checkAuthStatus();
  if (user) {
    setupAuthenticatedRoutes(router, user.permissions);
  }

  await router.start();
}

// Pause router (can restart later)
await router.stop();

// Destroy router (full cleanup, calls destroy on router plugins)
await router.destroy();
```

### Router.uninstall(app)

Completely remove the Router plugin from an Eleva instance. This is different from `stop()` or `destroy()`:

| Method | Purpose | Can Restart? | Removes from App? |
|--------|---------|:------------:|:-----------------:|
| `router.stop()` | Pause navigation | Yes | No |
| `router.destroy()` | Full router cleanup | No | No |
| `Router.uninstall(app)` | Remove plugin entirely | No | Yes |

**When to use `uninstall()`:**
- Completely removing routing from your app
- Switching to a different routing solution
- Full app teardown/cleanup

**Example:**

```javascript
import Eleva from "eleva";
import { Router } from "eleva/plugins";

const app = new Eleva("MyApp");
const router = app.use(Router, {
  mode: "hash",
  mount: "#app",
  routes: [/* ... */]
});

await router.start();

// Later, to completely remove the router plugin:
await Router.uninstall(app);

// After uninstall, these are removed:
// - app.router (undefined)
// - app.navigate (undefined)
// - app.getCurrentRoute (undefined)
// - app.getRouteParams (undefined)
// - app.getRouteQuery (undefined)
```

**What `Router.uninstall()` does:**

1. Calls `router.destroy()` which:
   - Calls `destroy()` on any router-level plugins
   - Removes event listeners (popstate, click handlers)
   - Unmounts the current layout component
   - Resets router state

2. Removes router from Eleva instance:
   - Deletes `app.router`
   - Deletes utility methods (`navigate`, `getCurrentRoute`, etc.)
   - Removes from plugin registry

```javascript
// Full app cleanup example
async function destroyApp() {
  // Uninstall plugins in reverse order (LIFO)
  await Router.uninstall(app);
  Store.uninstall(app);
  Attr.uninstall(app);

  // Unmount any remaining components
  // ...
}
```

### Reactive Properties Usage

Access current route information reactively:

```javascript
app.component("Breadcrumbs", {
  setup({ signal }) {
    // Access reactive route properties from router
    return {
      currentPath: app.router.currentRoute,
      params: app.router.currentParams,
      query: app.router.currentQuery
    };
  },

  template: (ctx) => `
    <nav class="breadcrumbs">
      <span>Path: ${ctx.currentPath.value?.path || "/"}</span>
      ${ctx.params.value?.id ? `<span>ID: ${ctx.params.value.id}</span>` : ""}
      ${ctx.query.value?.tab ? `<span>Tab: ${ctx.query.value.tab}</span>` : ""}
    </nav>
  `
});

// Watch for route changes
router.currentRoute.watch((route) => {
  // Update page title
  document.title = route?.meta?.title || "My App";

  // Track page view
  analytics.pageView(route?.path);
});

// Conditional rendering based on route
app.component("Navigation", {
  setup() {
    return { route: app.router.currentRoute };
  },
  template: (ctx) => `
    <nav>
      <a href="#/" class="${ctx.route.value?.path === "/" ? "active" : ""}">Home</a>
      <a href="#/about" class="${ctx.route.value?.path === "/about" ? "active" : ""}">About</a>
    </nav>
  `
});
```

---

## Error Handling

### Global Error Hook

```javascript
router.onError((error, to, from) => {
  console.error("Navigation error:", error.message);
  console.error("Failed navigation:", from?.path, "→", to?.path);

  // Handle specific errors
  if (error.message.includes("not found")) {
    router.navigate("/404");
  } else if (error.message.includes("network")) {
    router.navigate("/offline");
  }
});
```

### Custom Error Handler

Replace the default error handling behavior:

```javascript
router.setErrorHandler({
  // Called for critical errors (throws)
  handle(error, context, details = {}) {
    console.error(`[Router Error] ${context}:`, error.message, details);

    // Send to error tracking service
    errorTracker.capture(error, { context, details });

    // Re-throw formatted error
    throw new Error(`Router error in ${context}: ${error.message}`);
  },

  // Called for warnings (logs only)
  warn(message, details = {}) {
    console.warn(`[Router Warning] ${message}`, details);
  },

  // Called for non-critical errors (logs only)
  log(message, error, details = {}) {
    console.error(`[Router] ${message}`, error, details);
    errorTracker.capture(error, { message, details });
  }
});
```

### Error Event

```javascript
router.emitter.on("router:onError", (error, to, from) => {
  // Log to analytics
  analytics.trackError({
    type: "navigation_error",
    message: error.message,
    to: to?.path,
    from: from?.path
  });
});
```

### Error Types Reference

| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Network/Import failure | `error.message.includes("fetch")` | Show offline page, retry |
| Route not found | `error.message.includes("not found")` | Show 404 page |
| Guard rejection | Guard returns `false` | Stay on current page |
| Guard error | Guard throws | Navigate to error page |
| Component error | Try/catch in setup | Show error boundary |
| Permission denied | Guard returns redirect | Navigate to login/unauthorized |

---

## Router Plugins

Extend router functionality with reusable plugins.

### Plugin Interface

```javascript
const MyPlugin = {
  // REQUIRED: Unique plugin name
  name: "my-plugin",

  // OPTIONAL: Plugin version
  version: "1.0.0",

  // REQUIRED: Called when plugin is installed
  install(router, options = {}) {
    // Access router API
    // Register event handlers
    // Add custom functionality
  },

  // OPTIONAL: Called when router is destroyed
  destroy(router) {
    // Cleanup resources
  }
};
```

### Using Plugins

```javascript
// Install with options
router.use(MyPlugin, { option1: "value1" });

// Get all plugins
const plugins = router.getPlugins();
// [{ name: "my-plugin", version: "1.0.0", ... }]

// Get specific plugin
const myPlugin = router.getPlugin("my-plugin");

// Remove plugin
router.removePlugin("my-plugin");
```

### Example: Analytics Plugin

```javascript
const AnalyticsPlugin = {
  name: "analytics",
  version: "1.0.0",

  install(router, options = {}) {
    const { trackingId, debug = false } = options;

    // Initialize analytics
    if (trackingId) {
      initAnalytics(trackingId);
    }

    // Track page views
    router.emitter.on("router:afterEach", (to, from) => {
      if (debug) {
        console.log("[Analytics] Page view:", to.path);
      }

      trackPageView({
        path: to.path,
        title: to.meta.title,
        referrer: from?.fullUrl
      });
    });

    // Track errors
    router.emitter.on("router:onError", (error, to, from) => {
      trackException({
        description: error.message,
        fatal: false
      });
    });
  }
};

// Usage
router.use(AnalyticsPlugin, {
  trackingId: "UA-123456-1",
  debug: process.env.NODE_ENV === "development"
});
```

### Example: Page Title Plugin

```javascript
const PageTitlePlugin = {
  name: "page-title",
  version: "1.0.0",

  install(router, options = {}) {
    const {
      defaultTitle = "My App",
      separator = " | ",
      suffix = ""
    } = options;

    router.emitter.on("router:afterEach", (to) => {
      const pageTitle = to.meta.title;

      if (pageTitle) {
        document.title = pageTitle + separator + suffix;
      } else {
        document.title = defaultTitle;
      }
    });
  }
};

// Usage
router.use(PageTitlePlugin, {
  defaultTitle: "My App",
  separator: " - ",
  suffix: "My App"
});
// Route with meta.title = "Dashboard" → "Dashboard - My App"
// Route without meta.title → "My App"
```

### Example: Auth Plugin

```javascript
const AuthPlugin = {
  name: "auth",
  version: "1.0.0",

  install(router, options = {}) {
    const {
      loginPath = "/login",
      unauthorizedPath = "/unauthorized",
      isAuthenticated = () => false,
      hasRole = () => true,
      redirectParam = "redirect"
    } = options;

    router.emitter.on("router:beforeEach", (context) => {
      const { to } = context;

      // Check authentication
      if (to.meta.requiresAuth && !isAuthenticated()) {
        context.redirectTo = {
          path: loginPath,
          query: { [redirectParam]: to.fullUrl }
        };
        return;
      }

      // Check roles
      if (to.meta.roles && to.meta.roles.length > 0) {
        const hasRequiredRole = to.meta.roles.some(role => hasRole(role));
        if (!hasRequiredRole) {
          context.redirectTo = unauthorizedPath;
        }
      }
    });
  }
};

// Usage
router.use(AuthPlugin, {
  loginPath: "/login",
  isAuthenticated: () => !!localStorage.getItem("token"),
  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.roles?.includes(role);
  }
});
```

---

## TypeScript Support

The Router plugin includes comprehensive JSDoc type definitions for excellent IDE support.

### Importing Types

```javascript
/** @typedef {import('eleva/plugins').RouteDefinition} RouteDefinition */
/** @typedef {import('eleva/plugins').RouteLocation} RouteLocation */
/** @typedef {import('eleva/plugins').NavigationGuard} NavigationGuard */
/** @typedef {import('eleva/plugins').NavigationTarget} NavigationTarget */
/** @typedef {import('eleva/plugins').RouterOptions} RouterOptions */
/** @typedef {import('eleva/plugins').Router} Router */
```

### Type Definitions Reference

```typescript
// Routing mode
type RouterMode = "hash" | "history" | "query";

// Router configuration
interface RouterOptions {
  mode?: RouterMode;
  mount: string;
  routes: RouteDefinition[];
  viewSelector?: string;
  globalLayout?: RouteComponent;
  queryParam?: string;
  onBeforeEach?: NavigationGuard;
}

// Route definition
interface RouteDefinition {
  path: string;
  component: RouteComponent;
  layout?: RouteComponent;
  name?: string;
  meta?: Record<string, any>;
  beforeEnter?: NavigationGuard;
  afterEnter?: NavigationHook;
  beforeLeave?: NavigationGuard;
  afterLeave?: NavigationHook;
}

// Component types
type RouteComponent =
  | string                                           // Registered name
  | ComponentDefinition                              // Inline definition
  | (() => Promise<{ default: ComponentDefinition }>); // Lazy import

// Current route information
interface RouteLocation {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  meta: Record<string, any>;
  name?: string;
  fullUrl: string;
  matched: RouteDefinition;
}

// Navigation guard
type NavigationGuard = (
  to: RouteLocation,
  from: RouteLocation | null
) => NavigationGuardResult | Promise<NavigationGuardResult>;

type NavigationGuardResult = boolean | string | NavigationTarget | void;

// Navigation target
interface NavigationTarget {
  path: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  replace?: boolean;
  state?: Record<string, any>;
}

// Event contexts
interface NavigationContext {
  to: RouteLocation;
  from: RouteLocation | null;
  cancelled: boolean;
  redirectTo: string | NavigationTarget | null;
}

interface ScrollContext {
  to: RouteLocation;
  from: RouteLocation | null;
  savedPosition: { x: number; y: number } | null;
}
```

### Type-Safe Usage Examples

```javascript
/** @type {import('eleva/plugins').RouteDefinition[]} */
const routes = [
  {
    path: "/users/:id",
    component: UserPage,
    meta: { requiresAuth: true, title: "User Profile" }
  }
];

/** @type {import('eleva/plugins').NavigationGuard} */
const authGuard = (to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { path: "/login", query: { redirect: to.path } };
  }
};

/** @type {import('eleva/plugins').RouterPlugin} */
const myPlugin = {
  name: "my-plugin",
  version: "1.0.0",
  install(router) {
    router.onAfterEach((to, from) => {
      console.log(to.path);
    });
  }
};
```

---

## Complete SPA Example

```javascript
// File: main.js
import Eleva from "eleva";
import { Router } from "eleva/plugins";

// ============ Components ============

const HomePage = {
  template: () => `
    <div class="home">
      <h1>Welcome</h1>
      <nav>
        <a href="#/about">About</a>
        <a href="#/dashboard">Dashboard</a>
      </nav>
    </div>
  `
};

const AboutPage = {
  template: () => `
    <div class="about">
      <h1>About Us</h1>
      <a href="#/">Home</a>
    </div>
  `
};

const DashboardPage = {
  setup(ctx) {
    const user = ctx.signal(null);

    // Simulate fetching user
    setTimeout(() => {
      user.value = { name: "John Doe", email: "john@example.com" };
    }, 500);

    return { user };
  },
  template: (ctx) => `
    <div class="dashboard">
      <h1>Dashboard</h1>
      ${ctx.user.value
        ? `<p>Welcome, ${ctx.user.value.name}!</p>`
        : '<p>Loading...</p>'
      }
    </div>
  `
};

const LoginPage = {
  setup(ctx) {
    const login = () => {
      localStorage.setItem("token", "demo-token");
      const redirect = ctx.router.query.redirect || "/dashboard";
      ctx.router.navigate(redirect);
    };
    return { login };
  },
  template: (ctx) => `
    <div class="login">
      <h1>Login</h1>
      <button @click="login">Login</button>
    </div>
  `
};

const NotFoundPage = {
  template: (ctx) => `
    <div class="not-found">
      <h1>404 - Not Found</h1>
      <p>Path: ${ctx.router.params.pathMatch}</p>
      <a href="#/">Go Home</a>
    </div>
  `
};

// ============ Router Setup ============

const app = new Eleva("myApp");

const isAuthenticated = () => !!localStorage.getItem("token");

const router = app.use(Router, {
  mode: "hash",
  mount: "#app",
  routes: [
    { path: "/", component: HomePage },
    { path: "/about", component: AboutPage },
    { path: "/login", component: LoginPage },
    {
      path: "/dashboard",
      component: DashboardPage,
      meta: { requiresAuth: true, title: "Dashboard" }
    },
    { path: "*", component: NotFoundPage }
  ],
  onBeforeEach: (to, from) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
      return { path: "/login", query: { redirect: to.path } };
    }
  }
});

// Update page title
router.onAfterEach((to) => {
  document.title = to.meta.title || "My App";
});

// Start router
router.start().then(() => {
  console.log("App ready!");
});
```

---

## Migration from Other Routers

### From Vue Router

| Vue Router | Eleva Router | Notes |
|------------|--------------|-------|
| `new VueRouter({ routes })` | `app.use(Router, { routes })` | Plugin-based |
| `router.push('/path')` | `router.navigate('/path')` | Returns Promise<boolean> |
| `router.replace('/path')` | `router.navigate({ path, replace: true })` | Via options |
| `router.go(-1)` | `history.back()` | Use native History API |
| `router.beforeEach(guard)` | `router.onBeforeEach(guard)` | Returns unsubscribe |
| `router.afterEach(hook)` | `router.onAfterEach(hook)` | Returns unsubscribe |
| `$route.params` | `router.currentParams.value` | Signal-based |
| `$route.query` | `router.currentQuery.value` | Signal-based |
| `$route.meta` | `router.currentRoute.value.meta` | Via currentRoute |
| `<router-link to="/path">` | `<a href="#/path">` | Native links (hash) |
| `<router-view>` | `viewSelector` option | Configure in options |

### From React Router

| React Router | Eleva Router | Notes |
|--------------|--------------|-------|
| `<BrowserRouter>` | `mode: "history"` | Via options |
| `<HashRouter>` | `mode: "hash"` | Default mode |
| `useNavigate()` | `ctx.router.navigate()` | From context |
| `useParams()` | `router.currentParams.value` | Signal-based |
| `useLocation()` | `router.currentRoute.value` | Full location |
| `useSearchParams()` | `router.currentQuery.value` | Signal-based |
| `<Route element={<Page />}>` | `{ path, component: Page }` | Route definition |
| `<Outlet>` | `viewSelector` option | Layout slot |
| `loader` function | `beforeEnter` guard | Route-level |
| `errorElement` | `onError` hook | Global |

---

## Troubleshooting

### Common Issues

#### "Mount element not found"

```
[ElevaRouter] Mount element "#app" was not found in the DOM.
```

**Solution:** Ensure the mount element exists before calling `router.start()`:
```javascript
// Wait for DOM
document.addEventListener("DOMContentLoaded", async () => {
  await router.start();
});
```

#### "Component not registered"

```
Error: Component "MyPage" not registered.
```

**Solution:** Register components before defining routes:
```javascript
app.component("MyPage", MyPageDefinition);
// Then define routes
```

#### Navigation not working with History mode

**Solution:** Configure server fallback (see [Configuration - History Mode](./configuration.md#history-mode---clean-urls)).

#### Guards not blocking navigation

**Solution:** Ensure guard returns a value:
```javascript
// Wrong - no return
router.onBeforeEach((to) => {
  if (!isAuth) "/login";  // Missing return!
});

// Correct
router.onBeforeEach((to) => {
  if (!isAuth) return "/login";
});
```

#### Route params are strings

**Correct behavior.** URL parameters are always strings. Convert as needed:
```javascript
const id = parseInt(router.currentParams.value.id, 10);
```

### Debug Mode

```javascript
// Log all navigation events
const events = [
  "router:beforeEach", "router:beforeResolve", "router:afterResolve",
  "router:beforeRender", "router:afterRender", "router:scroll",
  "router:afterEnter", "router:afterLeave", "router:afterEach"
];

events.forEach(event => {
  router.emitter.on(event, (...args) => {
    console.log(`[${event}]`, ...args);
  });
});
```

---

## Batching Tips & Gotchas

Eleva uses **render batching** via `queueMicrotask` to optimize performance. This means DOM updates happen asynchronously after navigation.

### 1. DOM Updates After Navigation Are Async

```javascript
await router.navigate("/users/123");
console.log(document.querySelector('h1').textContent); // May show OLD content!

// To read updated DOM, wait for the next microtask:
await router.navigate("/users/123");
queueMicrotask(() => {
  console.log(document.querySelector('h1').textContent); // Now shows NEW content
});
```

### 2. Tests May Need Delays

```javascript
test("navigates to user page", async () => {
  await router.navigate("/users/123");

  // Wait for batched render
  await new Promise(resolve => queueMicrotask(resolve));

  expect(document.querySelector('.user-page')).not.toBeNull();
});
```

### 3. Guards and Hooks Are Synchronous

Navigation guards run synchronously before rendering, but the actual DOM update is still batched:

```javascript
router.onAfterEach((to, from) => {
  // Navigation completed, but DOM may not have updated yet
  console.log("Navigated to:", to.path);

  // Use queueMicrotask if you need to access the new DOM
  queueMicrotask(() => {
    document.querySelector('.page').focus();
  });
});
```

### 4. Multiple Navigations Are Debounced

```javascript
// Only the last navigation will take effect
router.navigate("/page1");
router.navigate("/page2");
router.navigate("/page3");  // This one wins
```

---

## Summary

The Eleva Router Plugin provides:

- **3 routing modes**: hash, history, query
- **7 reactive signals**: currentRoute, previousRoute, currentParams, currentQuery, currentLayout, currentView, isReady
- **13 events**: Full navigation lifecycle coverage
- **2 blocking events**: beforeEach, beforeResolve
- **4 hook methods**: onBeforeEach, onAfterEnter, onAfterLeave, onAfterEach, onError
- **5 route management methods**: addRoute, removeRoute, hasRoute, getRoutes, getRoute
- **Plugin system**: Extensible architecture for custom functionality

For questions or issues, visit the [GitHub repository](https://github.com/TarekRaafat/eleva).

---

[← Back to Lazy Loading](./lazy-loading.md) | [Back to Router Overview](./index.md) | [Store Plugin →](../store/index.md)

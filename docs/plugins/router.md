# Router Plugin

> **Version:** 1.0.0-rc.12 | **Type:** Client-Side Routing Plugin | **Bundle Size:** ~15KB minified | **Dependencies:** Eleva core

The Router Plugin is a powerful, reactive, and fully extensible routing solution for Eleva. It provides client-side navigation with support for multiple routing modes, navigation guards, lazy loading, layouts, and a comprehensive plugin system.

---

## TL;DR - Quick Reference

### Minimal Setup
```javascript
import { Eleva } from "eleva";
import { Router } from "eleva/plugins";

const app = new Eleva("myApp");
const router = app.use(Router, {
  mode: "hash",
  mount: "#app",
  routes: [
    { path: "/", component: HomePage },
    { path: "/users/:id", component: UserPage },
    { path: "*", component: NotFoundPage }
  ]
});
await router.start();
```

### Common Operations
```javascript
// Navigate
await router.navigate("/users/123");
await router.navigate({ path: "/users/:id", params: { id: "123" } });

// Access current route (reactive)
router.currentRoute.value      // Full route info
router.currentParams.value     // { id: "123" }
router.currentQuery.value      // { tab: "settings" }

// Watch for changes
router.currentRoute.watch((route) => console.log(route.path));

// Add guard
const unsub = router.onBeforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) return "/login";
});

// Stop router
await router.stop();
```

### Route Definition Cheatsheet
```javascript
{ path: "/", component: HomePage }                           // Static route
{ path: "/users/:id", component: UserPage }                  // Dynamic param
{ path: "/posts/:category/:slug", component: PostPage }      // Multiple params
{ path: "*", component: NotFoundPage }                       // Catch-all (404)
{ path: "/admin", component: () => import("./Admin.js") }    // Lazy loaded
{ path: "/dashboard", component: Page, layout: Layout }      // With layout
{ path: "/settings", component: Page, meta: { auth: true } } // With metadata
```

### Guard Return Values
| Return | Effect |
|--------|--------|
| `true` / `undefined` | Allow navigation |
| `false` | Block navigation |
| `"/path"` | Redirect to path |
| `{ path, query, ... }` | Redirect with options |

### Event Quick Reference
| Event | Can Block | Use Case |
|-------|-----------|----------|
| `router:beforeEach` | Yes | Auth guards, logging |
| `router:beforeResolve` | Yes | Loading indicators |
| `router:afterResolve` | No | Hide loading |
| `router:beforeRender` | No | Page transitions |
| `router:afterRender` | No | Animations |
| `router:scroll` | No | Scroll restoration |
| `router:afterEach` | No | Analytics |
| `router:onError` | No | Error reporting |

> **Template Context:** Use `${ctx.router.xxx}` in templates, but `@click="handler"` for events (no `ctx.`).

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Defining Routes](#defining-routes)
6. [Navigation](#navigation)
7. [Navigation Guards](#navigation-guards)
8. [Lifecycle Hooks](#lifecycle-hooks)
9. [Layouts](#layouts)
10. [Lazy Loading](#lazy-loading)
11. [Reactive State](#reactive-state)
12. [Events](#events)
13. [Dynamic Routes](#dynamic-routes)
14. [Scroll Behavior](#scroll-behavior)
15. [Error Handling](#error-handling)
16. [Router Plugins](#router-plugins)
17. [TypeScript Support](#typescript-support)
18. [API Reference](#api-reference)
19. [Examples](#examples)
20. [Migration Guide](#migration-from-other-routers)
21. [Troubleshooting](#troubleshooting)
22. [Batching Tips \& Gotchas](#batching-tips--gotchas)

---

## Features

| Feature | Description |
|---------|-------------|
| **Multiple Routing Modes** | Hash (`/#/path`), History (`/path`), or Query (`?view=/path`) |
| **Reactive State** | All route data exposed as Signals for reactive updates |
| **Navigation Guards** | Control navigation flow with sync/async guards |
| **Lifecycle Hooks** | Hook into navigation events for side effects |
| **Lazy Loading** | Code-split components with dynamic imports |
| **Layout System** | Wrap routes with reusable layout components |
| **Plugin Architecture** | Extend router functionality with plugins |
| **Scroll Management** | Built-in scroll position tracking |
| **Dynamic Routes** | Add/remove routes at runtime |
| **TypeScript-Friendly** | Comprehensive JSDoc type definitions |

---

## Installation

### Prerequisites
- Eleva core (`eleva`)
- Modern browser with ES6+ support

### Package Installation
```bash
# npm
npm install eleva

# yarn
yarn add eleva

# bun
bun add eleva
```

### Import
```javascript
// ES Modules (recommended)
import { Eleva } from "eleva";
import { Router } from "eleva/plugins";

// CommonJS
const { Eleva } = require("eleva");
const { Router } = require("eleva/plugins");
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/plugins"></script>
<script>
  const { Eleva } = window.Eleva;
  const { Router } = window.ElevaPlugins;
</script>
```

---

## Quick Start

This section walks through creating a basic single-page application with routing.

### Step 1: Create Components

```javascript
// File: components/HomePage.js
export const HomePage = {
  template: () => `
    <div class="page home-page">
      <h1>Welcome Home</h1>
      <p>This is the home page.</p>
      <nav>
        <a href="#/about">About</a>
        <a href="#/users/123">User 123</a>
      </nav>
    </div>
  `
};

// File: components/AboutPage.js
export const AboutPage = {
  template: () => `
    <div class="page about-page">
      <h1>About Us</h1>
      <a href="#/">Back Home</a>
    </div>
  `
};

// File: components/UserPage.js
export const UserPage = {
  setup(ctx) {
    // Access route params from context
    const userId = ctx.router.currentParams.value.id;
    return { userId };
  },
  template: (ctx) => `
    <div class="page user-page">
      <h1>User Profile</h1>
      <p>Viewing user ID: <strong>${ctx.userId}</strong></p>
      <a href="#/">Back Home</a>
    </div>
  `
};

// File: components/NotFoundPage.js
export const NotFoundPage = {
  template: () => `
    <div class="page not-found-page">
      <h1>404 - Page Not Found</h1>
      <a href="#/">Go Home</a>
    </div>
  `
};
```

### Step 2: Set Up Router

```javascript
// File: main.js
import { Eleva } from "eleva";
import { Router } from "eleva/plugins";
import { HomePage } from "./components/HomePage.js";
import { AboutPage } from "./components/AboutPage.js";
import { UserPage } from "./components/UserPage.js";
import { NotFoundPage } from "./components/NotFoundPage.js";

// 1. Create Eleva instance
const app = new Eleva("myApp");

// 2. Define routes
const routes = [
  { path: "/", component: HomePage },
  { path: "/about", component: AboutPage },
  { path: "/users/:id", component: UserPage },
  { path: "*", component: NotFoundPage }  // Must be last
];

// 3. Install router plugin
const router = app.use(Router, {
  mode: "hash",      // Use hash-based routing
  mount: "#app",     // Mount point in HTML
  routes: routes
});

// 4. Start the router
router.start().then(() => {
  console.log("Router started!");
  console.log("Current route:", router.currentRoute.value?.path);
});
```

### Step 3: HTML Structure

```html
<!-- File: index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Eleva App</title>
</head>
<body>
  <!-- Router mounts here -->
  <div id="app"></div>

  <script type="module" src="./main.js"></script>
</body>
</html>
```

### Expected Result

When you open the app:
1. URL `/#/` shows HomePage
2. Click "About" → URL becomes `/#/about`, shows AboutPage
3. Click "User 123" → URL becomes `/#/users/123`, shows UserPage with ID "123"
4. Navigate to `/#/unknown` → shows NotFoundPage

---

## Configuration

### Complete Options Reference

```javascript
const router = app.use(Router, {
  // REQUIRED: Where to mount the router
  mount: "#app",

  // REQUIRED: Route definitions
  routes: [],

  // Routing mode (default: "hash")
  // - "hash": Uses URL hash (/#/path) - no server config needed
  // - "history": Uses clean URLs (/path) - requires server config
  // - "query": Uses query params (?view=/path) - for embedded apps
  mode: "hash",

  // Selector for view container within layout (default: "root")
  // The router looks for: #root, .root, [data-root], or "root" element
  viewSelector: "root",

  // Default layout for all routes (optional)
  globalLayout: LayoutComponent,

  // Query parameter name for "query" mode (default: "view")
  queryParam: "view",

  // Global navigation guard (optional)
  onBeforeEach: (to, from) => {
    // Return true to allow, false to block, or string/object to redirect
  }
});
```

### Routing Modes Explained

#### Hash Mode (Default) - Recommended for Static Hosting

```javascript
{ mode: "hash" }
// URLs: https://example.com/#/users/123
```

**Pros:**
- Works without server configuration
- Perfect for GitHub Pages, Netlify, static hosts
- No 404 issues on page refresh

**Cons:**
- URLs contain `#` character
- Hash portion not sent to server

#### History Mode - Clean URLs

```javascript
{ mode: "history" }
// URLs: https://example.com/users/123
```

**Pros:**
- Clean, professional URLs
- Better for SEO (if server-rendered)

**Cons:**
- Requires server configuration to handle fallback
- Direct URL access returns 404 without proper server setup

**Server Configuration Examples:**

```nginx
# Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

```apache
# Apache (.htaccess)
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Query Mode - Embedded Applications

```javascript
{ mode: "query", queryParam: "view" }
// URLs: https://example.com?view=/users/123
```

**Pros:**
- Preserves existing URL structure
- Works in iframes and embedded contexts
- Existing query params preserved

**Cons:**
- Unusual URL format
- Long URLs with many query params

---

## Defining Routes

### Route Definition Structure

```javascript
{
  // REQUIRED: URL pattern
  path: "/users/:id",

  // REQUIRED: Component to render
  component: UserPage,

  // OPTIONAL: Layout wrapper
  layout: MainLayout,

  // OPTIONAL: Route name for programmatic navigation
  name: "user-profile",

  // OPTIONAL: Custom metadata
  meta: {
    requiresAuth: true,
    title: "User Profile",
    roles: ["user", "admin"]
  },

  // OPTIONAL: Guards and hooks
  beforeEnter: (to, from) => { /* ... */ },
  afterEnter: (to, from) => { /* ... */ },
  beforeLeave: (to, from) => { /* ... */ },
  afterLeave: (to, from) => { /* ... */ }
}
```

### Path Patterns

#### Static Paths
```javascript
{ path: "/", component: HomePage }           // Matches: /
{ path: "/about", component: AboutPage }     // Matches: /about
{ path: "/contact/us", component: Contact }  // Matches: /contact/us
```

#### Dynamic Parameters
```javascript
// Single parameter
{ path: "/users/:id", component: UserPage }
// Matches: /users/123, /users/abc
// Params: { id: "123" } or { id: "abc" }

// Multiple parameters
{ path: "/posts/:category/:slug", component: PostPage }
// Matches: /posts/tech/hello-world
// Params: { category: "tech", slug: "hello-world" }

// Parameters are always strings
// Access in component:
setup(ctx) {
  const id = ctx.router.currentParams.value.id;  // "123" (string)
  const numId = parseInt(id, 10);                // 123 (number)
}
```

#### Catch-All (Wildcard) Route
```javascript
// IMPORTANT: Must be the LAST route in the array
{ path: "*", component: NotFoundPage }
// Matches: /any/unknown/path
// Params: { pathMatch: "any/unknown/path" }
```

### Component Types

#### Inline Component
```javascript
{
  path: "/inline",
  component: {
    template: () => `<h1>Inline Component</h1>`
  }
}
```

#### Registered Component Name
```javascript
// First, register the component
app.component("MyPage", {
  template: () => `<h1>My Page</h1>`
});

// Then reference by name
{
  path: "/mypage",
  component: "MyPage"
}
```

#### Imported Component
```javascript
import { DashboardPage } from "./pages/Dashboard.js";

{
  path: "/dashboard",
  component: DashboardPage
}
```

#### Lazy-Loaded Component
```javascript
{
  path: "/admin",
  component: () => import("./pages/AdminPage.js")
  // Module must export: export default { ... } or export const AdminPage = { ... }
}
```

### Route Metadata

Metadata is arbitrary data attached to routes, accessible in guards and components.

```javascript
{
  path: "/admin/settings",
  component: AdminSettings,
  meta: {
    requiresAuth: true,           // Custom: auth required
    roles: ["admin"],             // Custom: required roles
    title: "Admin Settings",      // Custom: page title
    breadcrumb: "Settings",       // Custom: breadcrumb label
    transition: "slide-left"      // Custom: page transition
  }
}

// Access in guards
router.onBeforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return "/login";
  }
  if (to.meta.roles && !hasRoles(to.meta.roles)) {
    return "/unauthorized";
  }
});

// Access in components
setup(ctx) {
  const title = ctx.router.currentRoute.value.meta.title;
  document.title = title;
}
```

---

## Navigation

### Programmatic Navigation

#### Basic Navigation
```javascript
// Navigate to path
await router.navigate("/users/123");
// Result: URL changes to /#/users/123

// Navigate with inline params
await router.navigate("/users/:id", { id: "456" });
// Result: URL changes to /#/users/456
```

#### Navigation with Options
```javascript
await router.navigate({
  // Target path (can include :param placeholders)
  path: "/users/:id",

  // Replace :param placeholders in path
  params: { id: "123" },

  // Add query string (?key=value)
  query: { tab: "profile", sort: "name" },

  // Replace current history entry instead of pushing new one
  replace: true,

  // State object passed to history.pushState/replaceState
  state: { scrollPosition: 100, fromDashboard: true }
});
// Result: URL changes to /#/users/123?tab=profile&sort=name
```

#### Check Navigation Result
```javascript
const success = await router.navigate("/protected-page");

if (success) {
  console.log("Navigation succeeded");
} else {
  console.log("Navigation was blocked by a guard or failed");
}
```

#### Same-Route Navigation
```javascript
// Navigating to the current route returns true (no-op)
// Current URL: /#/users/123
const result = await router.navigate("/users/123");
console.log(result); // true (already there, considered successful)
```

### Template-Based Navigation

#### Hash Mode Links
```html
<!-- Direct hash links work automatically -->
<a href="#/">Home</a>
<a href="#/about">About</a>
<a href="#/users/123">User 123</a>
<a href="#/search?q=eleva">Search</a>
```

#### Programmatic from Template
```javascript
const NavComponent = {
  setup(ctx) {
    const goToUser = async (id) => {
      await ctx.router.navigate(`/users/${id}`);
    };

    const goToSearch = async (query) => {
      await ctx.router.navigate({
        path: "/search",
        query: { q: query }
      });
    };

    return { goToUser, goToSearch };
  },
  template: (ctx) => `
    <nav>
      <button @click="goToUser('123')">View User 123</button>
      <button @click="goToSearch('eleva')">Search Eleva</button>
    </nav>
  `
};
```

### Navigation Methods Summary

| Method | Description | Returns |
|--------|-------------|---------|
| `navigate(path)` | Navigate to path string | `Promise<boolean>` |
| `navigate(path, params)` | Navigate with param replacement | `Promise<boolean>` |
| `navigate(options)` | Navigate with full options | `Promise<boolean>` |

---

## Navigation Guards

Guards are functions that control the navigation flow. They can **allow**, **cancel**, or **redirect** navigation.

### Guard Execution Order

When navigating from `/a` to `/b`:

1. `router:beforeEach` event (can block)
2. Global guards registered via `router.onBeforeEach()`
3. Route-level `beforeLeave` guard on `/a`
4. Route-level `beforeEnter` guard on `/b`

### Guard Return Values

| Return Value | Type | Effect |
|--------------|------|--------|
| `true` | `boolean` | Allow navigation |
| `undefined` | `void` | Allow navigation (implicit) |
| `false` | `boolean` | Cancel navigation |
| `"/path"` | `string` | Redirect to path |
| `{ path: "/path", ... }` | `object` | Redirect with options |

### Global Guards

#### Via Options (Single Guard)
```javascript
app.use(Router, {
  mount: "#app",
  routes: [...],
  onBeforeEach: (to, from) => {
    console.log(`Navigating: ${from?.path || 'initial'} → ${to.path}`);

    // Allow navigation
    return true;
  }
});
```

#### Via Method (Multiple Guards)
```javascript
// Guard 1: Logging
const unsubLog = router.onBeforeEach((to, from) => {
  console.log(`Navigation: ${from?.path} → ${to.path}`);
  // No return = allow
});

// Guard 2: Authentication
const unsubAuth = router.onBeforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return "/login";  // Redirect to login
  }
});

// Guard 3: Authorization
const unsubRoles = router.onBeforeEach((to, from) => {
  if (to.meta.roles && !hasAnyRole(to.meta.roles)) {
    return { path: "/error", query: { code: "403" } };
  }
});

// Later: Remove specific guards
unsubLog();   // Remove logging guard
unsubAuth();  // Remove auth guard
```

### Route-Level Guards

```javascript
{
  path: "/settings",
  component: SettingsPage,
  meta: { requiresAuth: true },

  // Runs before entering this route
  beforeEnter: async (to, from) => {
    // Async validation
    const canAccess = await checkPermissions();
    if (!canAccess) {
      return "/unauthorized";
    }
    // Allow navigation (implicit return)
  },

  // Runs before leaving this route
  beforeLeave: (to, from) => {
    if (hasUnsavedChanges()) {
      // Browser confirm dialog
      const confirmed = confirm("You have unsaved changes. Leave anyway?");
      return confirmed;  // true = allow, false = cancel
    }
  }
}
```

### Async Guards

Guards can be async functions for API calls, permission checks, etc.

```javascript
router.onBeforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    try {
      // Validate session with server
      const response = await fetch("/api/auth/validate");
      const { valid } = await response.json();

      if (!valid) {
        return {
          path: "/login",
          query: { redirect: to.path }  // Remember where they wanted to go
        };
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      return "/error";
    }
  }
});
```

### Guard Parameters

```javascript
router.onBeforeEach((to, from) => {
  // `to` - Target route location
  console.log(to.path);          // "/users/123"
  console.log(to.params);        // { id: "123" }
  console.log(to.query);         // { tab: "settings" }
  console.log(to.meta);          // { requiresAuth: true }
  console.log(to.fullUrl);       // "/users/123?tab=settings"
  console.log(to.matched);       // Route definition object

  // `from` - Source route location (null on initial navigation)
  if (from) {
    console.log(from.path);      // "/dashboard"
  }
});
```

---

## Lifecycle Hooks

Hooks are functions for **side effects**. Unlike guards, they **cannot block** navigation.

### Available Hooks

| Hook | When Called | Use Cases |
|------|-------------|-----------|
| `onAfterEnter` | After new component mounted | Update title, focus element |
| `onAfterLeave` | After old component unmounted | Cleanup resources |
| `onAfterEach` | After navigation completes | Analytics, logging |
| `onError` | On navigation error | Error reporting |

### Hook Examples

```javascript
// Update document title after entering a route
const unsubTitle = router.onAfterEnter((to, from) => {
  document.title = to.meta.title || "My App";
});

// Clean up resources after leaving a route
const unsubCleanup = router.onAfterLeave((to, from) => {
  // Close any open modals
  closeAllModals();

  // Abort pending requests for the old route
  abortPendingRequests(from?.path);
});

// Track page views
const unsubAnalytics = router.onAfterEach((to, from) => {
  analytics.pageView({
    path: to.path,
    title: to.meta.title,
    referrer: from?.path
  });
});

// Report navigation errors
const unsubErrors = router.onError((error, to, from) => {
  errorReporter.capture(error, {
    context: "navigation",
    to: to?.path,
    from: from?.path
  });
});
```

### Cleanup Pattern

All hook methods return an unsubscribe function:

```javascript
// Store unsubscribe functions
const cleanupFns = [];

cleanupFns.push(router.onAfterEach((to) => { /* ... */ }));
cleanupFns.push(router.onError((err) => { /* ... */ }));

// Later, clean up all hooks
function cleanup() {
  cleanupFns.forEach(fn => fn());
  cleanupFns.length = 0;
}
```

---

## Layouts

Layouts wrap route components with shared UI elements (headers, sidebars, footers).

### How Layouts Work

```
┌─────────────────────────────────┐
│           Layout                │
│  ┌───────────────────────────┐  │
│  │         Header            │  │
│  ├───────────────────────────┤  │
│  │   ┌───────────────────┐   │  │
│  │   │  Route Component  │   │  │ ← viewSelector points here
│  │   │    (Page View)    │   │  │
│  │   └───────────────────┘   │  │
│  ├───────────────────────────┤  │
│  │         Footer            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Global Layout

Applied to all routes unless overridden.

```javascript
// Define layout component
const MainLayout = {
  template: () => `
    <div class="main-layout">
      <header class="header">
        <h1>My App</h1>
        <nav>
          <a href="#/">Home</a>
          <a href="#/about">About</a>
        </nav>
      </header>

      <main id="root">
        <!-- Route components render here -->
      </main>

      <footer class="footer">
        &copy; 2024 My App
      </footer>
    </div>
  `
};

// Apply globally
const router = app.use(Router, {
  mount: "#app",
  globalLayout: MainLayout,
  viewSelector: "root",  // Matches <main id="root">
  routes: [...]
});
```

### Per-Route Layout

Override the global layout for specific routes.

```javascript
const AdminLayout = {
  template: () => `
    <div class="admin-layout">
      <aside class="sidebar">
        <nav>
          <a href="#/admin">Dashboard</a>
          <a href="#/admin/users">Users</a>
          <a href="#/admin/settings">Settings</a>
        </nav>
      </aside>
      <main id="root"></main>
    </div>
  `
};

const routes = [
  // Uses global layout
  { path: "/", component: HomePage },
  { path: "/about", component: AboutPage },

  // Uses AdminLayout
  { path: "/admin", component: AdminDashboard, layout: AdminLayout },
  { path: "/admin/users", component: AdminUsers, layout: AdminLayout },

  // No layout (null explicitly disables)
  { path: "/login", component: LoginPage, layout: null },
  { path: "/fullscreen", component: FullscreenApp, layout: null }
];
```

### Lazy-Loaded Layout

```javascript
{
  path: "/admin",
  component: () => import("./pages/Admin.js"),
  layout: () => import("./layouts/AdminLayout.js")
}
```

---

## Lazy Loading

Reduce initial bundle size by loading route components on-demand.

### Basic Lazy Loading

```javascript
{
  path: "/dashboard",
  // Dynamic import - loaded when route is visited
  component: () => import("./pages/Dashboard.js")
}

// The module should export:
// export default DashboardComponent
// OR
// export const Dashboard = { ... }
```

### Loading Indicator

Show feedback while components load:

```javascript
// Simple loading indicator using events
router.emitter.on("router:beforeResolve", (context) => {
  document.getElementById("loading").style.display = "block";
});

router.emitter.on("router:afterResolve", (context) => {
  document.getElementById("loading").style.display = "none";
});
```

```html
<div id="app"></div>
<div id="loading" style="display: none;">Loading...</div>
```

### Advanced Loading Plugin

```javascript
const LoadingPlugin = {
  name: "loading-indicator",

  install(router, options = {}) {
    const {
      delay = 200,           // Don't show for fast loads
      minDuration = 500,     // Minimum display time
      element = "#loading"
    } = options;

    let loadingEl = null;
    let showTimeout = null;
    let startTime = 0;

    router.emitter.on("router:beforeResolve", () => {
      loadingEl = document.querySelector(element);
      startTime = Date.now();

      // Delay showing to avoid flash for fast loads
      showTimeout = setTimeout(() => {
        if (loadingEl) loadingEl.style.display = "block";
      }, delay);
    });

    router.emitter.on("router:afterResolve", () => {
      clearTimeout(showTimeout);

      // Ensure minimum display time
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        if (loadingEl) loadingEl.style.display = "none";
      }, remaining);
    });
  }
};

router.use(LoadingPlugin, { delay: 100, minDuration: 300 });
```

---

## Reactive State

All route data is exposed as **Signals** - reactive values that trigger updates when changed.

### Available Signals

| Signal | Type | Description |
|--------|------|-------------|
| `currentRoute` | `Signal<RouteLocation \| null>` | Complete current route info |
| `previousRoute` | `Signal<RouteLocation \| null>` | Previous route info |
| `currentParams` | `Signal<Record<string, string>>` | URL parameters |
| `currentQuery` | `Signal<Record<string, string>>` | Query string parameters |
| `currentLayout` | `Signal<MountResult \| null>` | Mounted layout instance |
| `currentView` | `Signal<MountResult \| null>` | Mounted view/page instance |
| `isReady` | `Signal<boolean>` | Router ready state |

### Accessing Values

```javascript
// Get current value with .value
const route = router.currentRoute.value;
console.log(route.path);    // "/users/123"
console.log(route.params);  // { id: "123" }
console.log(route.query);   // { tab: "settings" }
console.log(route.meta);    // { requiresAuth: true }

// Shorthand access
const params = router.currentParams.value;  // { id: "123" }
const query = router.currentQuery.value;    // { tab: "settings" }
const ready = router.isReady.value;         // true
```

### Watching Changes

```javascript
// Watch for route changes
const unsubRoute = router.currentRoute.watch((route) => {
  if (route) {
    console.log("Route changed to:", route.path);
    document.title = route.meta.title || "My App";
  }
});

// Watch for param changes (useful for data fetching)
const unsubParams = router.currentParams.watch((params) => {
  if (params.id) {
    fetchUserData(params.id);
  }
});

// Watch for query changes
const unsubQuery = router.currentQuery.watch((query) => {
  if (query.search) {
    performSearch(query.search);
  }
});

// Wait for router to be ready
router.isReady.watch((ready) => {
  if (ready) {
    console.log("Router initialized, current path:", router.currentRoute.value?.path);
  }
});

// Cleanup watchers when done
unsubRoute();
unsubParams();
unsubQuery();
```

### In Components

```javascript
const UserPage = {
  setup(ctx) {
    // Get initial value
    const userId = ctx.router.currentParams.value.id;
    const user = ctx.signal(null);
    const loading = ctx.signal(true);

    // Fetch initial data
    fetchUser(userId).then(data => {
      user.value = data;
      loading.value = false;
    });

    // Watch for param changes (same component, different user)
    ctx.router.currentParams.watch((params) => {
      if (params.id !== user.value?.id) {
        loading.value = true;
        fetchUser(params.id).then(data => {
          user.value = data;
          loading.value = false;
        });
      }
    });

    return { user, loading };
  },

  template: (ctx) => `
    <div class="user-page">
      ${ctx.loading.value
        ? '<p>Loading...</p>'
        : `<h1>${ctx.user.value.name}</h1>`
      }
    </div>
  `
};
```

---

## Events

The router emits events throughout the navigation lifecycle. Events enable plugins and extensions.

### Event Lifecycle Diagram

```
User triggers navigation
         │
         ▼
┌────────────────────────┐
│  router:beforeEach     │ ← Can BLOCK or REDIRECT
│  (guards run here)     │
└────────────────────────┘
         │ (if allowed)
         ▼
┌────────────────────────┐
│  router:beforeResolve  │ ← Can BLOCK or REDIRECT
│                        │   (show loading indicator)
└────────────────────────┘
         │
    [Load async components]
         │
         ▼
┌────────────────────────┐
│  router:afterResolve   │ ← (hide loading indicator)
└────────────────────────┘
         │
    [Unmount old component]
         │
         ▼
┌────────────────────────┐
│  router:afterLeave     │
└────────────────────────┘
         │
    [Update state]
         │
         ▼
┌────────────────────────┐
│  router:beforeRender   │ ← (start transition)
└────────────────────────┘
         │
    [Render new component]
         │
         ▼
┌────────────────────────┐
│  router:afterRender    │ ← (end transition)
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│  router:scroll         │ ← (handle scroll)
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│  router:afterEnter     │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│  router:afterEach      │ ← (analytics, cleanup)
└────────────────────────┘
```

### Complete Event Reference

| Event | Parameters | Can Block | Description |
|-------|------------|-----------|-------------|
| `router:ready` | `(router)` | No | Router started and ready |
| `router:beforeEach` | `(context)` | **Yes** | Before guards run |
| `router:beforeResolve` | `(context)` | **Yes** | Before async component loading |
| `router:afterResolve` | `(context)` | No | After components loaded |
| `router:afterLeave` | `(to, from)` | No | After old component unmounted |
| `router:beforeRender` | `(context)` | No | Before DOM rendering |
| `router:afterRender` | `(context)` | No | After DOM rendering |
| `router:scroll` | `(context)` | No | For scroll behavior |
| `router:afterEnter` | `(to, from)` | No | After new component mounted |
| `router:afterEach` | `(to, from)` | No | Navigation complete |
| `router:onError` | `(error, to, from)` | No | Navigation error |
| `router:routeAdded` | `(route)` | No | Dynamic route added |
| `router:routeRemoved` | `(route)` | No | Dynamic route removed |

### Blocking Events (Context Object)

Events that can block receive a context object you can modify:

```javascript
// Block navigation
router.emitter.on("router:beforeEach", (context) => {
  // context.to - Target RouteLocation
  // context.from - Source RouteLocation (or null)
  // context.cancelled - Set to true to cancel
  // context.redirectTo - Set to path or object to redirect

  if (shouldBlockNavigation(context.to)) {
    context.cancelled = true;
    return;
  }

  if (shouldRedirect(context.to)) {
    context.redirectTo = "/other-page";
    return;
  }
});

// Block before component loading
router.emitter.on("router:beforeResolve", (context) => {
  // Same context properties as beforeEach, plus:
  // context.route - The matched RouteDefinition

  if (maintenanceMode) {
    context.redirectTo = "/maintenance";
  }
});
```

### Non-Blocking Events Usage

```javascript
// Analytics
router.emitter.on("router:afterEach", (to, from) => {
  gtag("event", "page_view", {
    page_path: to.path,
    page_title: to.meta.title
  });
});

// Page transitions
router.emitter.on("router:beforeRender", ({ to, from }) => {
  const direction = determineDirection(to, from);
  document.body.dataset.transition = direction;
});

router.emitter.on("router:afterRender", () => {
  requestAnimationFrame(() => {
    document.body.dataset.transition = "";
  });
});

// Scroll restoration
router.emitter.on("router:scroll", ({ to, from, savedPosition }) => {
  if (savedPosition) {
    // Back/forward navigation - restore position
    window.scrollTo(savedPosition.x, savedPosition.y);
  } else if (to.fullUrl.includes("#")) {
    // Anchor link - scroll to element
    const id = to.fullUrl.split("#")[1];
    document.getElementById(id)?.scrollIntoView();
  } else {
    // New navigation - scroll to top
    window.scrollTo(0, 0);
  }
});
```

---

## Dynamic Routes

Add, remove, and query routes at runtime.

### Adding Routes

```javascript
// Add a single route
const removeRoute = router.addRoute({
  path: "/new-feature",
  component: NewFeaturePage,
  meta: { addedDynamically: true }
});

// The route is immediately available
await router.navigate("/new-feature");

// Remove it later
removeRoute();
```

### Removing Routes

```javascript
// Remove by path
const wasRemoved = router.removeRoute("/new-feature");
console.log(wasRemoved); // true if found and removed, false otherwise
```

### Querying Routes

```javascript
// Check if route exists
if (router.hasRoute("/admin")) {
  console.log("Admin route is registered");
}

// Get all routes
const allRoutes = router.getRoutes();
console.log(allRoutes.map(r => r.path));
// ["/", "/about", "/users/:id", "*"]

// Get specific route
const userRoute = router.getRoute("/users/:id");
console.log(userRoute?.meta); // { requiresAuth: true }
```

### Route Change Events

```javascript
router.emitter.on("router:routeAdded", (route) => {
  console.log("Route added:", route.path);

  // Update sitemap, navigation menu, etc.
  updateNavigationMenu();
});

router.emitter.on("router:routeRemoved", (route) => {
  console.log("Route removed:", route.path);
});
```

### Use Case: Micro-Frontends

```javascript
// Load micro-frontend module and register its routes
async function loadMicroFrontend(name) {
  const module = await import(`./micro-frontends/${name}/index.js`);
  const { routes } = module;

  // Store remove functions for cleanup
  const removeFunctions = routes.map(route =>
    router.addRoute({
      ...route,
      path: `/${name}${route.path}`,
      meta: { ...route.meta, microFrontend: name }
    })
  );

  return () => removeFunctions.forEach(fn => fn());
}

// Usage
const unloadProducts = await loadMicroFrontend("products");
// Later: unloadProducts();
```

---

## Scroll Behavior

The router automatically tracks scroll positions and provides hooks for custom scroll behavior.

### Automatic Scroll Position Saving

The router saves `{ x, y }` scroll positions per route path. When navigating back/forward (browser buttons), the saved position is available.

### Custom Scroll Behavior

```javascript
router.emitter.on("router:scroll", ({ to, from, savedPosition }) => {
  // savedPosition is available for back/forward navigation (popstate)
  // It's null for new navigation (click, router.navigate)

  if (savedPosition) {
    // Browser back/forward - restore exact position
    window.scrollTo({
      left: savedPosition.x,
      top: savedPosition.y,
      behavior: "instant"
    });
  } else if (to.fullUrl.includes("#")) {
    // Hash/anchor navigation
    const hash = to.fullUrl.split("#")[1];
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  } else {
    // New page - scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
```

### Scroll to Top on Every Navigation

```javascript
router.emitter.on("router:scroll", () => {
  window.scrollTo(0, 0);
});
```

### Preserve Scroll Position on Specific Routes

```javascript
const preserveScrollRoutes = ["/search", "/feed"];

router.emitter.on("router:scroll", ({ to, from, savedPosition }) => {
  // Don't scroll on routes that should preserve position
  if (preserveScrollRoutes.includes(to.path)) {
    return;
  }

  // Normal scroll behavior
  if (savedPosition) {
    window.scrollTo(savedPosition.x, savedPosition.y);
  } else {
    window.scrollTo(0, 0);
  }
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

### Example Plugins

#### Analytics Plugin

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

#### Page Title Plugin

```javascript
const PageTitlePlugin = {
  name: "page-title",

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

#### Auth Plugin

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

#### Loading Indicator Plugin

```javascript
const LoadingPlugin = {
  name: "loading",

  install(router, options = {}) {
    const {
      showDelay = 200,
      hideDelay = 0,
      onShow = () => {},
      onHide = () => {}
    } = options;

    let showTimer = null;
    let isLoading = false;

    router.emitter.on("router:beforeResolve", () => {
      clearTimeout(showTimer);
      showTimer = setTimeout(() => {
        isLoading = true;
        onShow();
      }, showDelay);
    });

    router.emitter.on("router:afterRender", () => {
      clearTimeout(showTimer);
      if (isLoading) {
        setTimeout(() => {
          isLoading = false;
          onHide();
        }, hideDelay);
      }
    });
  },

  destroy() {
    // Cleanup handled by event unsubscription
  }
};

// Usage
router.use(LoadingPlugin, {
  showDelay: 150,
  onShow: () => document.body.classList.add("loading"),
  onHide: () => document.body.classList.remove("loading")
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

/** @type {import('eleva/plugins').Router} */
const myPlugin = {
  name: "my-plugin",
  install(router) {
    router.onAfterEach((to, from) => {
      console.log(to.path);
    });
  }
};
```

---

## API Reference

### Router Properties

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

### Router Methods

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
| `getPlugins` | `() => Router[]` | Get all plugins |
| `getPlugin` | `(name) => Router \| undefined` | Get plugin by name |
| `removePlugin` | `(name) => boolean` | Remove plugin |
| `setErrorHandler` | `(handler) => void` | Set error handler |

---

## Examples

### Complete SPA Example

```javascript
// File: main.js
import { Eleva } from "eleva";
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
      const redirect = ctx.router.currentQuery.value.redirect || "/dashboard";
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
      <p>Path: ${ctx.router.currentParams.value.pathMatch}</p>
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

**Solution:** Configure server fallback (see [History Mode](#history-mode---clean-urls)).

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

Eleva uses **render batching** via `queueMicrotask` to optimize performance. This means DOM updates happen asynchronously after navigation. Here's what you need to know when using the Router plugin:

### 1. DOM Updates After Navigation Are Async

After calling `navigate()`, the DOM won't update immediately:

```javascript
await router.navigate("/users/123");
console.log(document.querySelector('h1').textContent); // May show OLD content!

// To read updated DOM, wait for the next microtask:
await router.navigate("/users/123");
queueMicrotask(() => {
  console.log(document.querySelector('h1').textContent); // Now shows NEW content
});
```

### 2. Route Component Mounting Is Batched

When the router mounts a new component, the component's template rendering follows the same batching rules:

```javascript
// In your page component
setup({ router }) {
  const data = signal(null);

  // Fetch data based on route params
  fetchUser(router.currentParams.value.id).then(user => {
    data.value = user;
    // DOM update happens in next microtask, not immediately
  });

  return { data };
}
```

### 3. Tests May Need Delays

When testing router navigation, allow time for batched renders:

```javascript
test("navigates to user page", async () => {
  await router.navigate("/users/123");

  // Wait for batched render
  await new Promise(resolve => queueMicrotask(resolve));

  expect(document.querySelector('.user-page')).not.toBeNull();
});
```

### 4. Guards and Hooks Are Synchronous

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

### 5. Multiple Navigations Are Debounced

If you trigger multiple navigations rapidly, only the final one will complete:

```javascript
// Only the last navigation will take effect
router.navigate("/page1");
router.navigate("/page2");
router.navigate("/page3");  // This one wins
```

### 6. Combine with Store Updates

When navigation triggers store updates, both are batched together:

```javascript
router.onAfterEach((to) => {
  // Store update + route component render = single batch
  store.dispatch("setCurrentPage", to.meta.title);
});
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

[← Back to Plugins](./index.md) | [Previous: Props Plugin](./props.md) | [Next: Store Plugin →](./store.md)

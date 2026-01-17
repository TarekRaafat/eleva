---
title: Router Configuration
description: Configure Eleva Router with routing modes, route definitions, layouts, and options.
---

# Router Configuration

> **Router Plugin** | Routing modes, route definitions, and layout configuration.

---

## Configuration Options

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

---

## Routing Modes

### Hash Mode (Default) - Recommended for Static Hosting

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

### History Mode - Clean URLs

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

### Query Mode - Embedded Applications

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
// Access in component (params is a getter, no .value needed):
setup(ctx) {
  const id = ctx.router.params.id;     // "123" (string)
  const numId = parseInt(id, 10);      // 123 (number)
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

See [Lazy Loading](./lazy-loading.md) for advanced code splitting strategies.

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

## Next Steps

- [Navigation](./navigation.md) - Programmatic navigation and reactive state
- [Guards](./guards.md) - Protect routes with navigation guards
- [Lazy Loading](./lazy-loading.md) - Code splitting strategies

---

[← Back to Router](./index.md) | [Next: Navigation →](./navigation.md)

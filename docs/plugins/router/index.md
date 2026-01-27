---
title: Eleva.js Router Plugin - Client-Side Routing
description: Eleva.js Router plugin for SPA navigation with hash/history modes, navigation guards, lazy loading, and layouts. 15KB.
image: /imgs/eleva.js%20Full%20Logo.png
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Eleva.js Router Plugin - Client-Side Routing",
  "description": "Eleva.js Router plugin for SPA navigation with hash/history modes, navigation guards, lazy loading, and layouts. 15KB.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-01-17T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "email": "tarek.m.raaf@gmail.com",
    "url": "https://github.com/TarekRaafat"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Eleva.js",
    "url": "https://elevajs.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://elevajs.com/plugins/router/"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Plugins",
  "keywords": ["eleva", "elevajs", "Eleva.js", "router plugin", "client-side routing", "SPA", "navigation guards", "lazy loading"]
}
</script>

# Router Plugin

> **Version:** 1.1.0 | **Type:** Client-Side Routing Plugin | **Bundle Size:** ~15KB minified | **Dependencies:** Eleva core

The Router Plugin is a powerful, reactive, and fully extensible routing solution for Eleva. It provides client-side navigation with support for multiple routing modes, navigation guards, lazy loading, layouts, and a comprehensive plugin system.

---

## TL;DR - Quick Reference

### Minimal Setup
```javascript
import Eleva from "eleva";
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
// Router starts automatically (autoStart: true by default)
```

> ⚠️ **No Manual Mount Needed**
>
> When using the Router plugin, you **don't need to call `app.mount()`**. The router automatically handles mounting components based on the current route.
>
> ```javascript
> // ❌ Don't do this when using Router
> app.use(Router, { mount: '#app', routes });
> app.mount('#app', 'HomePage'); // Not needed!
>
> // ✅ Correct - Router handles mounting automatically
> app.use(Router, { mount: '#app', routes });
> // That's it! Router will mount the matched component (autoStart: true)
> ```

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

// Stop router (can restart)
await router.stop();

// Destroy router (full cleanup)
await router.destroy();

// Uninstall plugin entirely
await Router.uninstall(app);
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

> **Note:** Nested routes (`children` property) are not supported. Use shared layouts with flat routes instead. See [Configuration](./configuration.md#nested-routes).

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
| `router:notFound` | No | Custom 404 handling |
| `router:error` | No | Error reporting |

> **Template Context:** Use `${ctx.router.xxx}` in templates, but `@click="handler"` for events (no `ctx.`).

---

## Documentation

| Section | Description |
|---------|-------------|
| [Configuration](./configuration.md) | Routes, routing modes, options, layouts |
| [Navigation](./navigation.md) | Programmatic navigation, reactive state, events |
| [Guards](./guards.md) | Navigation guards and lifecycle hooks |
| [Lazy Loading](./lazy-loading.md) | Code splitting strategies |
| [API Reference](./api.md) | Complete API, error handling, plugins, TypeScript |

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
import Eleva from "eleva";
import { Router } from "eleva/plugins";

// CommonJS
const Eleva = require("eleva");
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
    // Access route params from context (params is a getter, no .value needed)
    const userId = ctx.router.params.id;
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
import Eleva from "eleva";
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
  { path: "*", component: NotFoundPage }  // Catch-all (conventionally last)
];

// 3. Install router plugin (starts automatically by default)
const router = app.use(Router, {
  mode: "hash",      // Use hash-based routing
  mount: "#app",     // Mount point in HTML
  routes: routes
});

// Router starts automatically (autoStart: true by default)
// Use isReady signal to know when router is ready
router.isReady.watch((ready) => {
  if (ready) {
    console.log("Router started!");
    console.log("Current route:", router.currentRoute.value?.path);
  }
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

## Next Steps

- [Configuration](./configuration.md) - Learn about routing modes, route definitions, and layouts
- [Navigation](./navigation.md) - Programmatic navigation and reactive state
- [Guards](./guards.md) - Protect routes with navigation guards

---

[← Back to Plugins](../index.md) | [Next: Configuration →](./configuration.md)

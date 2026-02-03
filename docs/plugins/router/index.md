---
title: Eleva.js Router Plugin - Client-Side Routing
description: Build SPAs with Eleva Router. Hash/history modes, navigation guards, lazy loading, nested layouts. Lightweight alternative to Vue Router or React Router.
image: /imgs/eleva.js%20Full%20Logo.png
---

<link rel="canonical" href="https://elevajs.com/plugins/router/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/router/">
<meta property="og:title" content="Router Plugin - Eleva.js">
<meta property="og:description" content="Build SPAs with Eleva Router. Hash/history modes, navigation guards, lazy loading. Lightweight alternative to Vue Router or React Router.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/router/">
<meta name="twitter:title" content="Router Plugin - Eleva.js">
<meta name="twitter:description" content="Build SPAs with Eleva Router. Hash/history modes, navigation guards, lazy loading. Lightweight alternative to Vue Router or React Router.">
<meta name="twitter:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">

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
    "email": "tarek.m.raafat@gmail.com",
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

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Plugins", "item": "https://elevajs.com/plugins/" },
    { "@type": "ListItem", "position": 3, "name": "Router", "item": "https://elevajs.com/plugins/router/" }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Eleva Router",
  "alternateName": ["@eleva/router", "eleva-router", "Eleva.js Router"],
  "description": "Client-side routing plugin for Eleva.js. Hash/history modes, navigation guards, lazy loading, nested layouts, and reactive route state. Lightweight Vue Router/React Router alternative.",
  "url": "https://elevajs.com/plugins/router/",
  "applicationCategory": "DeveloperApplication",
  "applicationSubCategory": "JavaScript Router Plugin",
  "operatingSystem": "Cross-platform (Web Browser)",
  "softwareVersion": "1.1.1",
  "datePublished": "2026-01-12",
  "downloadUrl": "https://www.npmjs.com/package/eleva",
  "installUrl": "https://www.npmjs.com/package/eleva",
  "fileSize": "15KB",
  "storageRequirements": "15KB minified",
  "softwareRequirements": "Eleva.js core framework",
  "featureList": [
    "Hash and history routing modes",
    "Navigation guards (beforeEach, afterEach)",
    "Lazy loading with dynamic imports",
    "Nested layouts",
    "Route parameters and query strings",
    "Programmatic navigation",
    "Reactive route state",
    "404 handling"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat",
    "email": "tarek.m.raafat@gmail.com"
  },
  "license": "https://opensource.org/licenses/MIT",
  "isAccessibleForFree": true,
  "codeRepository": "https://github.com/TarekRaafat/eleva",
  "isPartOf": {
    "@type": "SoftwareApplication",
    "name": "Eleva.js",
    "url": "https://elevajs.com"
  },
  "sameAs": [
    "https://www.npmjs.com/package/eleva",
    "https://github.com/TarekRaafat/eleva",
    "https://www.jsdelivr.com/package/npm/eleva",
    "https://unpkg.com/eleva",
    "https://bundlephobia.com/package/eleva"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Eleva Router - Minimal Setup Example",
  "description": "Complete minimal router setup for Eleva.js showing hash mode configuration, route definitions with parameters, and automatic component mounting. No manual app.mount() needed.",
  "programmingLanguage": {
    "@type": "ComputerLanguage",
    "name": "JavaScript"
  },
  "runtimePlatform": "Browser (ES6+)",
  "codeSampleType": "full solution",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat"
  },
  "isPartOf": {
    "@type": "SoftwareApplication",
    "name": "Eleva Router",
    "url": "https://elevajs.com/plugins/router/"
  },
  "license": "https://opensource.org/licenses/MIT",
  "learningResourceType": "Tutorial",
  "teaches": ["Client-side routing", "Hash mode", "Route parameters", "SPA navigation"]
}
</script>

# Router Plugin

> **Version:** 1.1.1 | **Type:** Client-Side Routing Plugin | **Bundle Size:** ~15KB minified | **Dependencies:** Eleva core

The Router Plugin is a powerful, reactive, and fully extensible routing solution for Eleva. It provides client-side navigation with support for multiple routing modes, navigation guards, lazy loading, layouts, and a comprehensive plugin system.

---

## Prerequisites

Before using the Router Plugin, you should be familiar with:

- [Getting Started](../../getting-started.md) — Basic Eleva setup and your first app
- [Core Concepts](../../core-concepts.md) — Signals, lifecycle hooks, and reactivity
- [Components](../../components.md) — Component structure, props, and children

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
> app.mount(document.querySelector('#app'), 'HomePage'); // Not needed!
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
| `router:error` | No | Error reporting |

> **No `router:notFound` Event:** When no route matches and no `*` route exists, the router emits `router:error`. Define a catch-all route (`{ path: "*", component: NotFoundPage }`) for 404 handling.
>
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
<!-- Option 1: Bundled plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva-plugins.umd.min.js"></script>
<script>
  const app = new Eleva("MyApp");
  app.use(ElevaPlugins.Router, { /* options */ });
</script>

<!-- Option 2: Individual plugin -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/router.umd.min.js"></script>
<script>
  const app = new Eleva("MyApp");
  app.use(ElevaRouterPlugin, { /* options */ });
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
- [Lazy Loading](./lazy-loading.md) - Load components on demand
- [API Reference](./api.md) - Complete API documentation

---

## Related Documentation

- [Store Plugin](../store/) - Combine with global state for authenticated routes
- [Migration from React](../../migration/from-react.md) - React Router → Eleva Router
- [Migration from Vue](../../migration/from-vue.md) - Vue Router → Eleva Router
- [Complete Apps](../../examples/apps/) - See Router in action

---

[← Back to Plugins](../index.md) | [Next: Configuration →](./configuration.md)

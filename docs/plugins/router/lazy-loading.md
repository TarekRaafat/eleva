---
title: Lazy Loading & Code Splitting
description: Speed up your Eleva app with lazy loading. Code-split routes, load components on demand, and reduce initial bundle size for faster page loads.
---

<!-- REVU Analytics -->
<script async src="https://cdn.revu.ai/behavior"></script>
<script>
  window.revu = window.revu || new Proxy({q:[]}, {
    get: (t, m) => m in t ? t[m] : (...a) => t.q.push([m, ...a]),
  });
  revu.init({ apiKey: "revu_pk_prod_KFdyizGp4I0cWia36eNmWg" });
</script>

<link rel="canonical" href="https://elevajs.com/plugins/router/lazy-loading.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/router/lazy-loading.html">
<meta property="og:title" content="Lazy Loading & Code Splitting - Eleva.js">
<meta property="og:description" content="Speed up your Eleva app with lazy loading. Code-split routes, load components on demand, and reduce initial bundle size for faster page loads.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/router/lazy-loading.html">
<meta name="twitter:title" content="Lazy Loading & Code Splitting - Eleva.js">
<meta name="twitter:description" content="Speed up your Eleva app with lazy loading. Code-split routes, load components on demand, and reduce initial bundle size for faster page loads.">
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
  "headline": "Eleva.js Lazy Loading & Code Splitting",
  "description": "Reduce bundle size with lazy loading and code splitting strategies in Eleva Router.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-02-08T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat",
    "email": "tarek.m.raafat@gmail.com"
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
    "@id": "https://elevajs.com/plugins/router/lazy-loading.html"
  },
  "articleSection": "Plugins",
  "keywords": ["eleva router", "lazy loading", "code splitting", "dynamic imports", "bundle optimization", "performance"]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Plugins", "item": "https://elevajs.com/plugins/" },
    { "@type": "ListItem", "position": 3, "name": "Router", "item": "https://elevajs.com/plugins/router/" },
    { "@type": "ListItem", "position": 4, "name": "Lazy Loading", "item": "https://elevajs.com/plugins/router/lazy-loading.html" }
  ]
}
</script>

# Lazy Loading & Code Splitting

> **Router Plugin** | Reduce bundle size with on-demand component loading.

---

## Prerequisites

Before implementing lazy loading, ensure you understand:

- [Router Plugin Overview](./index.md) — Basic routing setup
- [Router Configuration](./configuration.md) — Route definitions
- [Components](../../components.md) — Component structure and exports

---

## Basic Lazy Loading

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

---

## Loading Indicator

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

---

## Code Splitting Strategies

### Route-Based Splitting (Recommended)

Split code by route for optimal loading:

```javascript
const router = app.use(Router, {
  routes: [
    // Eagerly loaded - small, critical components
    { path: "/", component: HomePage },
    { path: "/login", component: LoginPage },

    // Lazy loaded - large feature modules
    { path: "/dashboard", component: () => import("./pages/Dashboard.js") },
    { path: "/settings", component: () => import("./pages/Settings.js") },
    { path: "/admin", component: () => import("./pages/Admin.js") },

    // Catch-all - always eager (should be small)
    { path: "*", component: NotFoundPage }
  ]
});
```

### Feature-Based Splitting

Group related routes into feature bundles:

```javascript
// Feature: Analytics module
const analyticsRoutes = [
  {
    path: "/analytics",
    component: () => import("./features/analytics/Dashboard.js")
  },
  {
    path: "/analytics/reports",
    component: () => import("./features/analytics/Reports.js")
  },
  {
    path: "/analytics/settings",
    component: () => import("./features/analytics/Settings.js")
  }
];

// Feature: User management module
const userRoutes = [
  {
    path: "/users",
    component: () => import("./features/users/List.js")
  },
  {
    path: "/users/:id",
    component: () => import("./features/users/Profile.js")
  }
];

// Register all routes
const router = app.use(Router, {
  routes: [
    { path: "/", component: HomePage },
    ...analyticsRoutes,
    ...userRoutes,
    { path: "*", component: NotFoundPage }
  ]
});
```

### Preloading Critical Routes

Preload routes that users are likely to visit:

```javascript
// Preload function
function preloadRoute(path) {
  const route = router.getRoute(path);
  if (route && typeof route.component === "function") {
    route.component(); // Trigger dynamic import
  }
}

// Preload after initial page load
window.addEventListener("load", () => {
  setTimeout(() => {
    preloadRoute("/dashboard");  // Preload dashboard after home loads
    preloadRoute("/settings");   // Preload settings
  }, 2000); // Wait 2s to avoid competing with initial load
});

// Preload on hover
document.addEventListener("mouseover", (e) => {
  const link = e.target.closest("a[href^='#/']");
  if (link) {
    const path = link.getAttribute("href").slice(1);
    preloadRoute(path);
  }
});
```

### Conditional Loading

Load different component versions based on conditions:

```javascript
{
  path: "/editor",
  component: () => {
    // Load lightweight editor for mobile
    if (window.innerWidth < 768) {
      return import("./pages/EditorMobile.js");
    }
    // Load full editor for desktop
    return import("./pages/EditorDesktop.js");
  }
}
```

### Loading with Named Exports

Handle modules with named exports:

```javascript
// If module exports: export { Dashboard, DashboardSettings }
{
  path: "/dashboard",
  component: () => import("./pages/Dashboard.js").then(m => m.Dashboard)
}

// Or using async/await style
{
  path: "/settings",
  component: async () => {
    const { Settings } = await import("./pages/Settings.js");
    return Settings;
  }
}
```

---

## Advanced Loading Plugin

```javascript
const LoadingPlugin = {
  name: "loading-indicator",
  version: "1.0.0",

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

## Lazy-Loaded Layouts

Layouts can also be lazy-loaded:

```javascript
{
  path: "/admin",
  component: () => import("./pages/Admin.js"),
  layout: () => import("./layouts/AdminLayout.js")
}
```

---

## Error Handling for Lazy Loading

Handle failures when dynamically importing components:

```javascript
// Retry failed imports
const withRetry = (importFn, retries = 3) => async () => {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};

const routes = [
  {
    path: "/dashboard",
    component: withRetry(() => import("./pages/Dashboard.js"))
  }
];

// Global handler for import failures
router.onError((error, to, from) => {
  if (error.message.includes("Failed to fetch") ||
      error.message.includes("Loading chunk")) {
    // Network error - show offline page
    router.navigate("/offline");
  }
});
```

---

## Best Practices

1. **Eager load critical routes** - Home, login, error pages should load immediately
2. **Lazy load feature modules** - Dashboard, admin, settings can wait
3. **Use preloading wisely** - Preload likely next pages after initial load
4. **Add loading indicators** - Show feedback for slow connections
5. **Handle errors gracefully** - Provide retry logic and fallback pages
6. **Consider mobile users** - Conditional loading for different devices

---

## Next Steps

- [API Reference](./api.md) - Complete method reference and error handling

## See Also

- [Performance Best Practices](../../examples/patterns/best-practices/performance.md) - Optimize load times
- [Router Guards](./guards.md) - Protect lazy-loaded routes
- [Custom Plugin Development](../../examples/custom-plugin/development.md) - Build lazy-loading plugins

---

[← Back to Guards](./guards.md) | [Next: API Reference →](./api.md)

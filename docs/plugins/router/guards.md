---
title: Navigation Guards
description: Protect routes with Eleva Router guards. Implement authentication, role-based access, and navigation lifecycle hooks. Block or redirect unauthorized users.
---

<!-- REVU Analytics -->
<script async src="https://cdn.revu.ai/behavior"></script>
<script>
  window.revu = window.revu || new Proxy({q:[]}, {
    get: (t, m) => m in t ? t[m] : (...a) => t.q.push([m, ...a]),
  });
  revu.init({ apiKey: "revu_pk_prod_KFdyizGp4I0cWia36eNmWg" });
</script>

<link rel="canonical" href="https://elevajs.com/plugins/router/guards.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/router/guards.html">
<meta property="og:title" content="Navigation Guards - Eleva.js">
<meta property="og:description" content="Protect routes with Eleva Router guards. Implement authentication, role-based access, and navigation lifecycle hooks. Block or redirect unauthorized users.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/router/guards.html">
<meta name="twitter:title" content="Navigation Guards - Eleva.js">
<meta name="twitter:description" content="Protect routes with Eleva Router guards. Implement authentication, role-based access, and navigation lifecycle hooks. Block or redirect unauthorized users.">
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
  "headline": "Eleva.js Navigation Guards",
  "description": "Control navigation flow with guards and lifecycle hooks in Eleva Router.",
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
    "@id": "https://elevajs.com/plugins/router/guards.html"
  },
  "articleSection": "Plugins",
  "keywords": ["eleva router", "navigation guards", "route guards", "beforeEnter", "authentication", "route protection"]
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
    { "@type": "ListItem", "position": 4, "name": "Guards", "item": "https://elevajs.com/plugins/router/guards.html" }
  ]
}
</script>

# Navigation Guards

> **Router Plugin** | Control navigation flow with guards and lifecycle hooks.

---

## Prerequisites

Before implementing guards, ensure you understand:

- [Router Plugin Overview](./index.md) — Basic routing setup
- [Router Configuration](./configuration.md) — Route definitions and options
- [Core Concepts](../../core-concepts.md) — Lifecycle hooks

---

## Guard Execution Order

When navigating from `/a` to `/b`:

1. `router:beforeEach` event (can block)
2. Global guards registered via `router.onBeforeEach()`
3. Route-level `beforeLeave` guard on `/a`
4. Route-level `beforeEnter` guard on `/b`

---

## Guard Return Values

| Return Value | Type | Effect |
|--------------|------|--------|
| `true` | `boolean` | Allow navigation |
| `undefined` | `void` | Allow navigation (implicit) |
| `false` | `boolean` | Cancel navigation |
| `"/path"` | `string` | Redirect to path |
| `{ path: "/path", ... }` | `object` | Redirect with options |

---

## Global Guards

### Via Options (Single Guard)
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

### Via Method (Multiple Guards)
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

---

## Route-Level Guards

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

---

## Async Guards

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

---

## Guard Parameters

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

## Common Guard Patterns

### Authentication Guard

```javascript
router.onBeforeEach((to, from) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    return { path: "/login", query: { redirect: to.path } };
  }
  return true;
});
```

### Role-Based Access

```javascript
router.onBeforeEach((to, from) => {
  if (to.meta?.roles) {
    const userRoles = getCurrentUserRoles();
    const hasAccess = to.meta.roles.some(role => userRoles.includes(role));
    if (!hasAccess) return "/unauthorized";
  }
});
```

### Unsaved Changes Warning

```javascript
router.onBeforeEach((to, from) => {
  if (from?.meta?.hasUnsavedChanges && hasUnsavedChanges()) {
    const confirmed = confirm("You have unsaved changes. Leave anyway?");
    if (!confirmed) return false;
  }
});
```

### Async Permission Check

```javascript
router.onBeforeEach(async (to, from) => {
  if (to.meta?.checkPermission) {
    const allowed = await checkPermissionAPI(to.path);
    if (!allowed) return "/forbidden";
  }
});
```

---

## Next Steps

- [Lazy Loading](./lazy-loading.md) - Code splitting strategies
- [API Reference](./api.md) - Complete method reference

## See Also

- [Store Plugin](../store/) - Manage auth state for guards
- [Router Configuration](./configuration.md) - Route meta and setup
- [Migration from React](../../migration/from-react.md) - React Router guards equivalent

---

[← Back to Navigation](./navigation.md) | [Next: Lazy Loading →](./lazy-loading.md)

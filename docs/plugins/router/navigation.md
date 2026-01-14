---
title: Router Navigation
description: Programmatic navigation, reactive state, events, dynamic routes, and scroll behavior in Eleva Router.
---

# Router Navigation

This guide covers programmatic navigation, reactive state management, events, dynamic routes, and scroll behavior.

---

## Programmatic Navigation

### Basic Navigation
```javascript
// Navigate to path
await router.navigate("/users/123");
// Result: URL changes to /#/users/123

// Navigate with inline params
await router.navigate("/users/:id", { id: "456" });
// Result: URL changes to /#/users/456
```

### Navigation with Options
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

### Check Navigation Result
```javascript
const success = await router.navigate("/protected-page");

if (success) {
  console.log("Navigation succeeded");
} else {
  console.log("Navigation was blocked by a guard or failed");
}
```

### Same-Route Navigation
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

## Next Steps

- [Guards](./guards.md) - Navigation guards and lifecycle hooks
- [Lazy Loading](./lazy-loading.md) - Code splitting strategies
- [API Reference](./api.md) - Complete method reference

---

[← Back to Configuration](./configuration.md) | [Next: Guards →](./guards.md)

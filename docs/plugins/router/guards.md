---
title: Navigation Guards
description: Control navigation flow with guards and lifecycle hooks in Eleva Router.
---

# Navigation Guards

Guards are functions that control the navigation flow. They can **allow**, **cancel**, or **redirect** navigation.

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

---

[← Back to Navigation](./navigation.md) | [Next: Lazy Loading →](./lazy-loading.md)

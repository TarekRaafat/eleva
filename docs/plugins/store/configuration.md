---
title: Store Configuration
description: Configure Eleva Store. Set up localStorage/sessionStorage persistence, enable DevTools integration, and customize error handling for production apps.
---

<!-- REVU Analytics -->
<script async src="https://cdn.revu.ai/behavior"></script>
<script>
  window.revu = window.revu || new Proxy({q:[]}, {
    get: (t, m) => m in t ? t[m] : (...a) => t.q.push([m, ...a]),
  });
  revu.init({ apiKey: "revu_pk_prod_KFdyizGp4I0cWia36eNmWg" });
</script>

<link rel="canonical" href="https://elevajs.com/plugins/store/configuration.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/store/configuration.html">
<meta property="og:title" content="Store Configuration - Eleva.js">
<meta property="og:description" content="Configure Eleva Store. Set up localStorage/sessionStorage persistence, enable DevTools integration, and customize error handling for production apps.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/store/configuration.html">
<meta name="twitter:title" content="Store Configuration - Eleva.js">
<meta name="twitter:description" content="Configure Eleva Store. Set up localStorage/sessionStorage persistence, enable DevTools integration, and customize error handling for production apps.">
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
  "headline": "Eleva.js Store Configuration",
  "description": "Configure Eleva Store with persistence, DevTools, and error handling options.",
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
    "@id": "https://elevajs.com/plugins/store/configuration.html"
  },
  "articleSection": "Plugins",
  "keywords": ["eleva store", "store configuration", "persistence", "localStorage", "DevTools", "state management"]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Plugins", "item": "https://elevajs.com/plugins/" },
    { "@type": "ListItem", "position": 3, "name": "Store", "item": "https://elevajs.com/plugins/store/" },
    { "@type": "ListItem", "position": 4, "name": "Configuration", "item": "https://elevajs.com/plugins/store/configuration.html" }
  ]
}
</script>

# Store Configuration

> **Store Plugin** | Persistence, DevTools, and configuration options.

---

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `state` | `Object` | `{}` | Initial state properties |
| `actions` | `Object` | `{}` | Action functions for state mutations |
| `namespaces` | `Object` | `{}` | Namespaced modules with their own state/actions |
| `persistence` | `Object` | See below | Persistence configuration |
| `devTools` | `boolean` | `false` | Enable DevTools integration |
| `onError` | `Function` | `null` | Error handler callback |

---

## Full Configuration Example

```javascript
// file: full-store-config.js
app.use(Store, {
  // Initial state
  state: {
    theme: "light",
    language: "en",
    notifications: []
  },

  // Actions
  actions: {
    setTheme: (state, theme) => state.theme.value = theme,
    setLanguage: (state, lang) => state.language.value = lang,
    addNotification: (state, notification) => {
      state.notifications.value = [...state.notifications.value, {
        id: Date.now(),
        ...notification
      }];
    },
    clearNotifications: (state) => state.notifications.value = []
  },

  // Namespaced modules
  namespaces: {
    auth: {
      state: { user: null, token: null },
      actions: {
        login: (state, payload) => { /* ... */ },
        logout: (state) => { /* ... */ }
      }
    }
  },

  // Persistence
  persistence: {
    enabled: true,
    key: "myapp-store",
    storage: "localStorage",
    include: ["theme", "language", "auth.token"]  // Only persist these
  },

  // DevTools
  devTools: process.env.NODE_ENV === "development",

  // Error handling
  onError: (error, context) => {
    console.error(`Store error [${context}]:`, error);
    // Send to error tracking service
  }
});
```

---

## Persistence

The Store plugin can automatically persist state to browser storage.

### Persistence Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable state persistence |
| `key` | `string` | `"eleva-store"` | Storage key name |
| `storage` | `string` | `"localStorage"` | `"localStorage"` or `"sessionStorage"` |
| `include` | `string[]` | `null` | State paths to persist (whitelist) |
| `exclude` | `string[]` | `null` | State paths to exclude (blacklist) |

### Basic Persistence

```javascript
app.use(Store, {
  state: { theme: "light", count: 0 },
  persistence: {
    enabled: true,
    key: "my-app-store",
    storage: "localStorage"  // or "sessionStorage"
  }
});
// All state is persisted to localStorage under "my-app-store"
```

### Selective Persistence with Include

```javascript
app.use(Store, {
  state: {
    theme: "light",      // Will be persisted
    user: null,          // Will NOT be persisted
    tempData: {}         // Will NOT be persisted
  },
  persistence: {
    enabled: true,
    key: "my-app-store",
    include: ["theme"]   // Only persist theme
  }
});
```

### Selective Persistence with Exclude

```javascript
app.use(Store, {
  state: {
    theme: "light",      // Will be persisted
    user: null,          // Will be persisted
    tempData: {}         // Will NOT be persisted
  },
  persistence: {
    enabled: true,
    key: "my-app-store",
    exclude: ["tempData"]  // Persist everything except tempData
  }
});
```

### Namespaced Persistence

```javascript
app.use(Store, {
  namespaces: {
    auth: {
      state: { user: null, token: null }
    },
    ui: {
      state: { theme: "light", sidebar: true }
    }
  },
  persistence: {
    enabled: true,
    include: ["auth.token", "ui.theme"]  // Use dot notation for namespaced state
  }
});
```

### Manual Persistence Control

```javascript
// Clear persisted state
app.store.clearPersistedState();

// Get current state snapshot (for manual persistence)
const snapshot = app.store.getState();
localStorage.setItem("backup", JSON.stringify(snapshot));

// Restore state
const backup = JSON.parse(localStorage.getItem("backup"));
app.store.replaceState(backup);
```

### Best Practice: Be Selective with Persistence

```javascript
// Good - persist only what's needed
persistence: {
  include: ["auth.token", "cart.items", "ui.theme"]
}

// Avoid - persisting everything (may include sensitive/stale data)
persistence: { enabled: true }
```

---

## DevTools Integration

The Store plugin supports integration with browser DevTools for debugging.

### Enabling DevTools

```javascript
app.use(Store, {
  state: { /* ... */ },
  actions: { /* ... */ },
  devTools: true  // Enable in development
});

// Or conditionally
app.use(Store, {
  devTools: process.env.NODE_ENV === "development"
});
```

### DevTools Features

When enabled, the store:
1. Registers with `window.__ELEVA_DEVTOOLS__` if available
2. Notifies DevTools of all mutations
3. Keeps a history of the last 100 mutations

### Manual Debugging

```javascript
// Access mutation history
console.log(app.store.mutations);
// [
//   { type: "increment", payload: undefined, timestamp: 1234567890 },
//   { type: "setUser", payload: { name: "John" }, timestamp: 1234567891 },
//   ...
// ]

// Get current state snapshot
console.log(app.store.getState());

// Time-travel (restore previous state)
const previousState = { count: 5, user: null };
app.store.replaceState(previousState);
```

---

## Error Handling

### Global Error Handler

Set up a global error handler to catch all store-related errors:

```javascript
app.use(Store, {
  state: { /* ... */ },
  actions: { /* ... */ },
  onError: (error, context) => {
    // context tells you where the error occurred
    console.error(`[Store Error] ${context}:`, error);

    // Send to error tracking service
    errorTracker.captureException(error, {
      tags: { component: "store", context }
    });

    // Show user-friendly notification
    if (context.startsWith("action:")) {
      showToast("An error occurred. Please try again.");
    }
  }
});
```

### Action-Level Error Handling

Handle errors within individual actions:

```javascript
app.use(Store, {
  state: {
    users: [],
    error: null,
    isLoading: false
  },
  actions: {
    fetchUsers: async (state) => {
      state.isLoading.value = true;
      state.error.value = null;

      try {
        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        state.users.value = await response.json();
      } catch (error) {
        // Store error in state for UI to display
        state.error.value = error.message;

        // Re-throw if you want global handler to also catch it
        // throw error;
      } finally {
        state.isLoading.value = false;
      }
    }
  }
});
```

### Error Handling Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Global onError** | Logging, error tracking | Send all errors to Sentry/LogRocket |
| **Action try/catch** | Store error in state | Show error message in UI |
| **Component try/catch** | Local error handling | Retry logic, fallback UI |
| **Error state** | Display errors to user | `state.error`, `state.auth.error` |

---

## Subscriptions

Subscribe to state mutations for logging, analytics, or side effects.

### Basic Subscription

```javascript
const unsubscribe = app.store.subscribe((mutation, state) => {
  console.log("=== State Mutation ===");
  console.log("Action:", mutation.type);
  console.log("Payload:", mutation.payload);
  console.log("Time:", new Date(mutation.timestamp));
});

// Stop listening
unsubscribe();
```

### Analytics Integration

```javascript
// file: analytics-subscription.js
app.store.subscribe((mutation, state) => {
  // Track specific actions
  if (mutation.type.startsWith("cart.")) {
    analytics.track("Cart Action", {
      action: mutation.type,
      payload: mutation.payload,
      cartTotal: state.cart?.total?.value
    });
  }

  if (mutation.type === "auth.login") {
    analytics.identify(state.auth.user.value.id);
  }
});
```

### Logging Middleware

```javascript
// file: logging-middleware.js
if (process.env.NODE_ENV === "development") {
  app.store.subscribe((mutation, state) => {
    console.group(`Action: ${mutation.type}`);
    console.log("Payload:", mutation.payload);
    console.log("State after:", app.store.getState());
    console.groupEnd();
  });
}
```

### Synchronizing with External Services

```javascript
// file: sync-subscription.js

// Sync auth state with API
app.store.subscribe(async (mutation, state) => {
  if (mutation.type === "auth.loginSuccess") {
    // Set auth header for future requests
    api.setAuthToken(state.auth.token.value);
  }

  if (mutation.type === "auth.logout") {
    // Clear auth header
    api.clearAuthToken();
    // Notify server
    await api.post("/api/logout");
  }
});
```

### Clean Up Subscriptions

```javascript
// In component setup
setup({ store }) {
  const unsubscribe = store.subscribe(/* ... */);

  return {
    onUnmount: () => {
      unsubscribe();  // Clean up!
    }
  };
}
```

---

## Next Steps

- [Usage Patterns](./patterns.md) - Real-world examples
- [Advanced](./advanced.md) - Dynamic modules and async patterns
- [API Reference](./api.md) - Complete method reference

## See Also

- [Local Storage Patterns](../../examples/patterns/storage.md) — Manual persistence patterns
- [Router Guards](../router/guards.md) — Use persisted auth state
- [Task Manager App](../../examples/apps/task-manager.md) — Persistence in practice

---

[← Back to Core Concepts](./core-concepts.md) | [Next: Usage Patterns →](./patterns.md)

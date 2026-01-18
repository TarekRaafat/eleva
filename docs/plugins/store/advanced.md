---
title: Store Advanced Topics
description: Dynamic modules, async patterns, complex state organization, and debugging strategies for Eleva Store.
---

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4L689921Q"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag("js", new Date());
  gtag("config", "G-S4L689921Q");
</script>

# Store Advanced Topics

> **Store Plugin** | Dynamic modules, async patterns, and complex state.

---

## Dynamic Modules

Register and unregister modules at runtime for code splitting and lazy loading.

### Registering a Module

```javascript
// file: dynamic-module-example.js

// Later in your app, maybe after a route change
store.registerModule("analytics", {
  state: {
    events: [],
    sessionId: null
  },
  actions: {
    trackEvent: (state, event) => {
      state.analytics.events.value = [
        ...state.analytics.events.value,
        { ...event, timestamp: Date.now() }
      ];
    },
    setSession: (state, sessionId) => {
      state.analytics.sessionId.value = sessionId;
    }
  }
});

// Module is now available
store.state.analytics.events.value;  // []
store.dispatch("analytics.trackEvent", { name: "page_view", page: "/home" });
```

### Unregistering a Module

```javascript
// When the module is no longer needed
store.unregisterModule("analytics");
// store.state.analytics is now undefined
```

### Practical Example: Lazy-loaded Feature

```javascript
// file: feature-loader.js

// Main app setup (minimal)
app.use(Store, {
  state: { theme: "light" }
});

// When user accesses admin section
async function loadAdminFeatures() {
  // Dynamically import admin module definition
  const { adminModule } = await import("./modules/admin.js");

  // Register it
  app.store.registerModule("admin", adminModule);

  // Now admin state/actions are available
  await app.store.dispatch("admin.loadDashboard");
}

// When user leaves admin section
function unloadAdminFeatures() {
  app.store.unregisterModule("admin");
}
```

---

## Organizing Complex State

For large applications, follow these patterns to keep state manageable.

### Feature-Based Namespaces

Organize state by feature/domain rather than by type:

```javascript
// Good - organized by feature
app.use(Store, {
  namespaces: {
    // User-related state
    user: {
      state: {
        profile: null,
        preferences: {},
        notifications: []
      },
      actions: {
        updateProfile: (state, profile) => { /* ... */ },
        setPreference: (state, { key, value }) => { /* ... */ }
      }
    },

    // Product catalog
    products: {
      state: {
        items: [],
        categories: [],
        selectedCategory: null,
        searchQuery: "",
        isLoading: false
      },
      actions: {
        fetchProducts: async (state) => { /* ... */ },
        setCategory: (state, category) => { /* ... */ },
        search: (state, query) => { /* ... */ }
      }
    },

    // Shopping cart
    cart: {
      state: {
        items: [],
        coupon: null,
        shippingMethod: null
      },
      actions: {
        addItem: (state, item) => { /* ... */ },
        applyCoupon: (state, code) => { /* ... */ }
      }
    },

    // Checkout flow
    checkout: {
      state: {
        step: 1,
        shippingAddress: null,
        billingAddress: null,
        paymentMethod: null,
        isProcessing: false,
        error: null
      },
      actions: {
        setStep: (state, step) => { /* ... */ },
        submitOrder: async (state) => { /* ... */ }
      }
    }
  }
});
```

---

## Async Action Patterns

### Loading State Pattern

```javascript
namespaces: {
  products: {
    state: {
      items: [],
      isLoading: false,
      error: null,
      lastFetched: null
    },
    actions: {
      fetchStart: (state) => {
        state.products.isLoading.value = true;
        state.products.error.value = null;
      },
      fetchSuccess: (state, items) => {
        state.products.items.value = items;
        state.products.isLoading.value = false;
        state.products.lastFetched.value = Date.now();
      },
      fetchError: (state, error) => {
        state.products.error.value = error;
        state.products.isLoading.value = false;
      }
    }
  }
}

// Orchestrating action
app.store.createAction("products.fetch", async (state) => {
  await app.dispatch("products.fetchStart");

  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch");
    const items = await response.json();
    await app.dispatch("products.fetchSuccess", items);
  } catch (error) {
    await app.dispatch("products.fetchError", error.message);
  }
});
```

### Optimistic Updates Pattern

```javascript
actions: {
  toggleTodoOptimistic: async (state, todoId) => {
    // 1. Save previous state for rollback
    const previousTodos = [...state.todos.value];

    // 2. Optimistically update UI immediately
    state.todos.value = state.todos.value.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );

    try {
      // 3. Sync with server
      const response = await fetch(`/api/todos/${todoId}/toggle`, {
        method: "PATCH"
      });

      if (!response.ok) throw new Error("Failed to update");
    } catch (error) {
      // 4. Rollback on failure
      state.todos.value = previousTodos;
      throw error;
    }
  }
}
```

### Debounced Action Pattern

```javascript
// For search/autocomplete
let searchTimeout = null;

app.store.createAction("search.debounced", (state, query) => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    state.search.isLoading.value = true;

    try {
      const results = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      state.search.results.value = await results.json();
    } finally {
      state.search.isLoading.value = false;
    }
  }, 300);
});
```

### Polling Pattern

```javascript
let pollingInterval = null;

app.store.createAction("notifications.startPolling", (state, intervalMs = 30000) => {
  // Clear existing interval
  if (pollingInterval) clearInterval(pollingInterval);

  // Fetch immediately
  app.dispatch("notifications.fetch");

  // Then poll
  pollingInterval = setInterval(() => {
    app.dispatch("notifications.fetch");
  }, intervalMs);
});

app.store.createAction("notifications.stopPolling", () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
});
```

### Retry Pattern

```javascript
actions: {
  fetchWithRetry: async (state, { url, maxRetries = 3 }) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    throw lastError;
  }
}
```

---

## Debugging Strategies

### Console Logging

Enable detailed logging in development:

```javascript
if (process.env.NODE_ENV === "development") {
  // Log all mutations
  app.store.subscribe((mutation, state) => {
    console.group(`%c[Store] ${mutation.type}`, "color: #42b883; font-weight: bold");
    console.log("Payload:", mutation.payload);
    console.log("Timestamp:", new Date(mutation.timestamp).toISOString());
    console.log("State after:", JSON.parse(JSON.stringify(app.store.getState())));
    console.groupEnd();
  });
}
```

### State Snapshots

Take snapshots for debugging:

```javascript
// Create snapshot utility
const stateSnapshots = [];

function takeSnapshot(label = "") {
  stateSnapshots.push({
    label,
    timestamp: Date.now(),
    state: app.store.getState()
  });
  console.log(`Snapshot taken: ${label || stateSnapshots.length}`);
}

function compareSnapshots(index1, index2) {
  const s1 = stateSnapshots[index1];
  const s2 = stateSnapshots[index2];
  console.log("Comparing:", s1.label, "vs", s2.label);
  console.log("Diff:", JSON.stringify(s1.state) === JSON.stringify(s2.state) ? "No changes" : "Changed");
}

// Usage
takeSnapshot("before login");
await store.dispatch("auth.login", credentials);
takeSnapshot("after login");
```

### Action Tracing

Track action call chains:

```javascript
const actionTrace = [];

app.store.subscribe((mutation) => {
  actionTrace.push({
    action: mutation.type,
    payload: mutation.payload,
    timestamp: mutation.timestamp,
    stack: new Error().stack  // Capture call stack
  });

  // Keep only last 50 actions
  if (actionTrace.length > 50) actionTrace.shift();
});

// Debug helper
window.debugStore = {
  getTrace: () => actionTrace,
  getState: () => app.store.getState(),
  dispatch: (action, payload) => app.store.dispatch(action, payload)
};
```

### Time-Travel Debugging

Implement basic time-travel:

```javascript
const stateHistory = [];
let historyIndex = -1;

app.store.subscribe((mutation, state) => {
  // Remove any "future" states if we're not at the end
  if (historyIndex < stateHistory.length - 1) {
    stateHistory.splice(historyIndex + 1);
  }

  stateHistory.push({
    action: mutation.type,
    state: JSON.parse(JSON.stringify(app.store.getState()))
  });
  historyIndex = stateHistory.length - 1;
});

function timeTravel(index) {
  if (index < 0 || index >= stateHistory.length) return;
  historyIndex = index;
  app.store.replaceState(stateHistory[index].state);
  console.log(`Time-traveled to: ${stateHistory[index].action}`);
}

function undo() {
  if (historyIndex > 0) timeTravel(historyIndex - 1);
}

function redo() {
  if (historyIndex < stateHistory.length - 1) timeTravel(historyIndex + 1);
}

// Expose for debugging
window.timeTravel = { undo, redo, history: stateHistory, goto: timeTravel };
```

---

## Batching Tips & Gotchas

Eleva uses **render batching** via `queueMicrotask` to optimize performance.

### 1. Multiple Dispatches Are Batched

```javascript
// These three dispatches result in ONE DOM update, not three
store.dispatch("increment");
store.dispatch("setUser", { name: "John" });
store.dispatch("setTheme", "dark");
// DOM updates after all three complete
```

### 2. DOM Updates Are Async

```javascript
store.dispatch("increment");
console.log(document.querySelector('.count').textContent); // Still shows OLD value!

// To read updated DOM, wait for the microtask:
store.dispatch("increment");
queueMicrotask(() => {
  console.log(document.querySelector('.count').textContent); // Now shows NEW value
});
```

### 3. Tests May Need Delays

```javascript
test("counter increments", async () => {
  store.dispatch("increment");

  // Wait for batched render
  await new Promise(resolve => queueMicrotask(resolve));

  expect(document.querySelector('.count').textContent).toBe("1");
});
```

### 4. Subscription Callbacks Are Synchronous

While DOM updates are batched, `store.subscribe()` callbacks fire immediately:

```javascript
store.subscribe((mutation, state) => {
  // This fires immediately after dispatch
  console.log("Action dispatched:", mutation.type);

  // But DOM hasn't updated yet!
  // Use queueMicrotask if you need to read the DOM
});
```

### 5. Async Actions and Batching

Each `await` in an async action creates a new batch boundary:

```javascript
actions: {
  loadData: async (state) => {
    state.loading.value = true;  // Batch 1

    const data = await fetchData();  // Batch boundary

    state.data.value = data;         // Batch 2
    state.loading.value = false;     // Batch 2 (same batch)
  }
}
```

---

## Next Steps

- [API Reference](./api.md) - Complete method reference and TypeScript support

---

[← Back to Usage Patterns](./patterns.md) | [Next: API Reference →](./api.md)

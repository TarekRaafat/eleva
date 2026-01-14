---
title: Setup & Lifecycle Hooks
description: Eleva.js best practices for setup function organization and lifecycle hook usage.
---

# Setup & Lifecycle Hooks

> **Version:** 1.0.0 | Setup patterns, lifecycle hooks, and cleanup best practices.

---

## Setup Function

### When to Use Setup

| Scenario | Use Setup? | Example |
|----------|------------|---------|
| Component has reactive state | Yes | `signal(0)`, `signal([])` |
| Component handles events | Yes | Click handlers, form submission |
| Component uses lifecycle hooks | Yes | `onMount`, `onUnmount` |
| Component receives props | Yes | Access via `props` parameter |
| Component emits events | Yes | Access via `emitter` parameter |
| Purely static display | Optional | Can omit setup entirely |

```javascript
// With setup - component has state and behavior
app.component("Counter", {
  setup: ({ signal }) => {
    const count = signal(0);
    return {
      count,
      increment: () => count.value++
    };
  },
  template: (ctx) => `<button @click="increment">${ctx.count.value}</button>`
});

// Without setup - purely static component
app.component("Logo", {
  template: () => `<img src="/logo.png" alt="Logo" />`
});
```

### Context Destructuring

```javascript
// Destructure only what's needed
setup: ({ signal }) => {
  const count = signal(0);
  return { count };
}

// Multiple utilities
setup: ({ signal, emitter, props }) => {
  const items = signal(props.initialItems || []);
  emitter.on("refresh", () => loadItems());
  return { items };
}
```

### Setup Organization

Structure your setup function in this order:

```javascript
setup: ({ signal, emitter, props }) => {
  // 1. Props extraction
  const { userId, initialData } = props;

  // 2. Reactive state (signals)
  const items = signal(initialData || []);
  const loading = signal(false);

  // 3. Computed/derived values (functions that read signals)
  const getItemCount = () => items.value.length;

  // 4. Actions/handlers (functions that modify state)
  async function loadItems() {
    loading.value = true;
    const response = await fetch(`/api/users/${userId}/items`);
    items.value = await response.json();
    loading.value = false;
  }

  // 5. Event subscriptions
  let unsubscribe = null;

  // 6. Return public interface + lifecycle hooks
  return {
    // State & functions
    items,
    loading,
    getItemCount,
    loadItems,

    // Lifecycle hooks (returned, not destructured!)
    onMount: () => {
      loadItems();
      unsubscribe = emitter.on("refresh:items", loadItems);
    },
    onUnmount: () => {
      if (unsubscribe) unsubscribe();
    }
  };
}
```

### What to Return

Only return what the template needs:

```javascript
// Avoid: Returning everything
setup: ({ signal }) => {
  const count = signal(0);
  const internalCache = new Map();  // Not needed in template
  const helperFn = () => { /* ... */ };  // Only used internally

  function increment() {
    helperFn();
    count.value++;
    internalCache.set(count.value, Date.now());
  }

  return { count, increment, internalCache, helperFn };  // Too much!
}

// Better: Return only template-facing API
setup: ({ signal }) => {
  const count = signal(0);
  const internalCache = new Map();
  const helperFn = () => { /* ... */ };

  function increment() {
    helperFn();
    count.value++;
    internalCache.set(count.value, Date.now());
  }

  return { count, increment };  // Only what template needs
}
```

### Function Patterns

| Pattern | When to Use |
|---------|-------------|
| Arrow with implicit return | Simple state, no logic |
| Arrow with block body | Most components (recommended) |
| Regular function | Need `this` binding (rare) |

```javascript
// Arrow with implicit return - simplest components
app.component("SimpleCounter", {
  setup: ({ signal }) => ({ count: signal(0) }),
  template: (ctx) => `<p>${ctx.count.value}</p>`
});

// Arrow with block - most common, recommended
app.component("Counter", {
  setup: ({ signal }) => {
    const count = signal(0);
    const increment = () => count.value++;
    return { count, increment };
  },
  template: (ctx) => `
    <button @click="increment">${ctx.count.value}</button>
  `
});
```

---

## Lifecycle Hooks

### Available Hooks

| Hook | When Called | Common Use Cases |
|------|-------------|------------------|
| `onBeforeMount` | Before component renders to DOM | Validate props, prepare data |
| `onMount` | After component renders to DOM | Fetch data, set up subscriptions |
| `onBeforeUpdate` | Before component re-renders | Compare old/new state |
| `onUpdate` | After component re-renders | DOM measurements, third-party sync |
| `onUnmount` | Before component is destroyed | Cleanup subscriptions, timers |

### Execution Order

```
Component Created
    |
    v
onBeforeMount  <- Props validated, initial data ready
    |
    v (DOM renders)
onMount        <- DOM available, fetch data, set up listeners
    |
    v (User interacts, state changes)
onBeforeUpdate <- Before re-render
    |
    v (DOM updates)
onUpdate       <- After re-render
    |
    v (Component removed)
onUnmount      <- Cleanup everything
```

### How Lifecycle Hooks Work

**Important:** Lifecycle hooks are **returned from setup**, not destructured from it. They receive a context object with `container` and `context`.

```javascript
setup: ({ signal }) => {
  const count = signal(0);

  return {
    count,
    // Hooks are returned as properties
    onMount: ({ container, context }) => {
      console.log("Mounted to:", container);
    },
    onUnmount: ({ container, context }) => {
      console.log("Unmounting...");
    }
  };
}
```

### onMount: The Most Common Hook

Use for initialization that requires the DOM or async operations:

```javascript
setup: ({ signal }) => {
  const users = signal([]);
  const loading = signal(true);

  async function fetchUsers() {
    const response = await fetch("/api/users");
    users.value = await response.json();
    loading.value = false;
  }

  return {
    users,
    loading,
    onMount: async () => {
      await fetchUsers();
    }
  };
}
```

**Common onMount use cases:**
- Fetching initial data from APIs
- Setting up event listeners (window, document)
- Initializing third-party libraries
- Starting timers or intervals
- Focusing input elements

### onUnmount: Essential for Cleanup

**Always clean up** what you set up in `onMount`:

```javascript
setup: ({ signal }) => {
  const windowWidth = signal(window.innerWidth);
  let intervalId = null;
  let resizeHandler = null;

  return {
    windowWidth,
    onMount: () => {
      resizeHandler = () => { windowWidth.value = window.innerWidth; };
      window.addEventListener("resize", resizeHandler);
      intervalId = setInterval(() => console.log("Tick"), 1000);
    },
    onUnmount: () => {
      window.removeEventListener("resize", resizeHandler);
      clearInterval(intervalId);
    }
  };
}
```

**What to clean up:**

| Resource | Cleanup Method |
|----------|----------------|
| Event listeners | `removeEventListener()` |
| Timers | `clearTimeout()`, `clearInterval()` |
| Subscriptions | Call unsubscribe function |
| WebSocket | `socket.close()` |
| AbortController | `controller.abort()` |
| Third-party libraries | Library-specific destroy method |

### Lifecycle Anti-Patterns

```javascript
// DON'T: Heavy synchronous work in onBeforeMount
return {
  onBeforeMount: () => {
    const result = heavyComputation(millionItems);  // Blocks rendering!
  }
};

// DON'T: Forget cleanup - this causes memory leaks!
return {
  onMount: () => {
    window.addEventListener("scroll", handleScroll);
    // Memory leak if not removed in onUnmount!
  }
  // Missing onUnmount cleanup!
};

// DON'T: Set state in onUpdate (infinite loop)
return {
  onUpdate: () => {
    count.value++;  // Triggers another update - infinite loop!
  }
};

// DON'T: Async in onBeforeMount (won't wait)
return {
  onBeforeMount: async () => {
    await fetchData();  // Render happens before this completes
  }
};

// DO: Async in onMount
return {
  onMount: async () => {
    await fetchData();  // Safe, DOM already rendered
  }
};

// DO: Always clean up what you set up
let handler = null;
return {
  onMount: () => {
    handler = () => console.log("scrolled");
    window.addEventListener("scroll", handler);
  },
  onUnmount: () => {
    window.removeEventListener("scroll", handler);
  }
};
```

### Decision Guide

| Task | Recommended Hook |
|------|------------------|
| Fetch initial data | `onMount` |
| Validate props | `onBeforeMount` |
| Set up event listeners | `onMount` |
| Remove event listeners | `onUnmount` |
| Clear timers/intervals | `onUnmount` |
| Cancel pending requests | `onUnmount` |
| Initialize third-party library | `onMount` |
| Destroy third-party library | `onUnmount` |
| Focus an input element | `onMount` |
| Measure DOM elements | `onMount` or `onUpdate` |

---

## Next Steps

- **[Signals & Templates](./signals-templates.md)** - Reactivity and template syntax
- **[Performance](./performance.md)** - Optimization techniques

---

[← Selectors & Structure](./selectors-structure.md) | [Signals & Templates →](./signals-templates.md)

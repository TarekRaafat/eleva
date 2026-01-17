---
title: Eleva.js Best Practices
description: Comprehensive guide to Eleva best practices - component structure, setup patterns, signals, lifecycle hooks, and general guidelines.
---

# Best Practices

> **Version:** 1.0.1 | Patterns and guidelines for building maintainable Eleva applications.

---

## Component Structure Order

Follow this recommended order for component properties:

```javascript
app.component("MyComponent", {
  // 1. Setup - Initialize state (optional)
  setup({ signal, emitter, props }) {
    const state = signal(initialValue);
    return { state, /* ...other exports */ };
  },

  // 2. Template - Define HTML structure (required)
  template: (ctx) => `
    <div>${ctx.state.value}</div>
  `,

  // 3. Style - Component-scoped CSS (optional)
  style: `
    div { color: blue; }
  `,

  // 4. Children - Child component mappings (optional)
  children: {
    ".child-container": "ChildComponent"
  }
});
```

**Why this order?**
- `setup` initializes the data that `template` and `style` might reference
- `template` defines the structure that `style` will style
- `style` applies to the template's elements
- `children` maps to elements created in the template

---

## Setup Function Patterns

### When to Use Setup

| Scenario | Use Setup? | Example |
|----------|------------|---------|
| Component has reactive state | Yes | `signal(0)`, `signal([])` |
| Component handles events | Yes | Click handlers, form submission |
| Component uses lifecycle hooks | Yes | `onMount`, `onUnmount` |
| Component receives props | Yes | Access via `props` parameter |
| Component emits events | Yes | Access via `emitter` parameter |
| Purely static display | Optional | Can omit setup entirely |

### Organizing Setup Logic

Structure your setup function in this order for consistency:

```javascript
setup: ({ signal, emitter, props }) => {
  // 1. Props extraction (if needed)
  const { userId, initialData } = props;

  // 2. Reactive state (signals)
  const items = signal(initialData || []);
  const loading = signal(false);
  const error = signal(null);

  // 3. Computed/derived values (functions that read signals)
  const getSelectedItem = () => items.value.find(i => i.selected);
  const getItemCount = () => items.value.length;

  // 4. Actions/handlers (functions that modify state)
  async function loadItems() {
    loading.value = true;
    try {
      const response = await fetch(`/api/users/${userId}/items`);
      items.value = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  // 5. Event subscription ref (will be set in onMount)
  let unsubscribe = null;

  // 6. Return public interface + lifecycle hooks
  return {
    // State
    items,
    loading,
    error,
    // Computed
    getSelectedItem,
    getItemCount,
    // Actions
    loadItems,
    // Lifecycle hooks
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

### Setup Return Value: What to Export

Only return what the template needs:

```javascript
// Avoid: Returning everything
setup: ({ signal }) => {
  const count = signal(0);
  const internalCache = new Map();  // Not needed in template
  const helperFn = () => { /* ... */ };  // Only used internally

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

---

## Signal Reactivity Patterns

### When to Use Signals vs Regular Variables

| Data Type | Use Signal? | Why |
|-----------|-------------|-----|
| UI state (counts, toggles, form values) | Yes | Triggers re-render on change |
| Data from API | Yes | UI updates when data loads |
| Derived/computed values | No | Use functions instead |
| Constants | No | Never changes |
| Internal helpers (caches, refs) | No | Not displayed in UI |

```javascript
setup: ({ signal }) => {
  // Use signals for reactive UI state
  const count = signal(0);
  const isOpen = signal(false);
  const items = signal([]);

  // Don't use signals for constants
  const API_URL = "/api/users";
  const MAX_ITEMS = 100;

  // Don't use signals for internal refs
  let timerRef = null;
  const cache = new Map();

  // Don't use signals for computed values - use functions
  const getItemCount = () => items.value.length;
  const getTotal = () => items.value.reduce((a, b) => a + b.price, 0);

  return { count, isOpen, items, getItemCount, getTotal };
}
```

### Object & Array Immutability

**CRITICAL: Mutations Don't Trigger Reactivity**

Eleva's signals use **identity comparison** (`===`) to detect changes. When you mutate an object or array, the reference stays the same, so Eleva doesn't know anything changed.

```javascript
const user = signal({ name: "John", settings: { theme: "dark" } });
const items = signal([1, 2, 3]);

// WRONG: Mutation (won't trigger re-render!)
user.value.name = "Jane";
items.value.push(4);

// CORRECT: Replacement (triggers re-render!)
user.value = { ...user.value, name: "Jane" };
items.value = [...items.value, 4];
```

**Array Operations Quick Reference:**

| Instead of (won't work) | Use this (works) |
|------------------------|------------------|
| `arr.value.push(item)` | `arr.value = [...arr.value, item]` |
| `arr.value.pop()` | `arr.value = arr.value.slice(0, -1)` |
| `arr.value.shift()` | `arr.value = arr.value.slice(1)` |
| `arr.value.splice(i, 1)` | `arr.value = arr.value.filter((_, idx) => idx !== i)` |
| `arr.value[i] = x` | `arr.value = arr.value.map((v, idx) => idx === i ? x : v)` |

### Computed/Derived Values

Use functions for values derived from signals:

```javascript
setup: ({ signal }) => {
  const items = signal([
    { name: "Widget", price: 10, qty: 2 },
    { name: "Gadget", price: 25, qty: 1 }
  ]);
  const taxRate = signal(0.08);

  // Computed as functions - recalculated on each render
  const getSubtotal = () =>
    items.value.reduce((sum, item) => sum + item.price * item.qty, 0);

  const getTax = () => getSubtotal() * taxRate.value;
  const getTotal = () => getSubtotal() + getTax();

  return { items, taxRate, getSubtotal, getTax, getTotal };
}
```

### Debouncing Signal Updates

For frequent updates (like search input), debounce to avoid excessive operations:

```javascript
setup: ({ signal }) => {
  const searchQuery = signal("");
  const results = signal([]);
  let debounceTimer = null;

  function handleSearch(query) {
    searchQuery.value = query;
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      if (query.length >= 2) {
        const response = await fetch(`/api/search?q=${query}`);
        results.value = await response.json();
      }
    }, 300);  // 300ms debounce
  }

  return {
    searchQuery,
    results,
    handleSearch,
    onUnmount: () => clearTimeout(debounceTimer)
  };
}
```

---

## Lifecycle Hook Patterns

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
| Sync state with external system | `onUpdate` |

### Lifecycle Anti-Patterns

```javascript
// DON'T: Heavy synchronous work in onBeforeMount
return {
  onBeforeMount: () => {
    const result = heavyComputation(millionItems);  // Blocks rendering!
  }
};

// DON'T: Forget cleanup - causes memory leaks!
return {
  onMount: () => {
    window.addEventListener("scroll", handleScroll);
    // Missing onUnmount cleanup!
  }
};

// DON'T: Set state in onUpdate (infinite loop)
return {
  onUpdate: () => {
    count.value++;  // Triggers another update - infinite loop!
  }
};

// DO: Always clean up what you set up
let handler = null;
return {
  onMount: () => {
    handler = () => {};
    window.addEventListener("scroll", handler);
  },
  onUnmount: () => {
    window.removeEventListener("scroll", handler);
  }
};
```

---

## Template Patterns

### Context Reference Rules

> **Quick Rule:** `${}` needs `ctx.` — `@events` and `:props` don't.

```javascript
template: (ctx) => `
  <p>${ctx.count.value}</p>              <!-- JavaScript: use ctx -->
  <button @click="increment">+</button>  <!-- Event: no ctx -->
  <child :data="items.value"></child>    <!-- Prop: no ctx -->
`
```

### Conditional Rendering

```javascript
// Ternary for simple conditions
template: (ctx) => `
  ${ctx.isLoading.value
    ? `<div class="spinner">Loading...</div>`
    : `<div class="content">${ctx.data.value}</div>`
  }
`

// Logical AND for show/hide
template: (ctx) => `
  ${ctx.showError.value && `<div class="error">${ctx.error.value}</div>`}
`

// Multiple conditions
template: (ctx) => {
  if (ctx.loading.value) return `<div>Loading...</div>`;
  if (ctx.error.value) return `<div>Error: ${ctx.error.value}</div>`;
  return `<div>${ctx.data.value}</div>`;
}
```

### List Rendering

Always use `key` attributes for optimal diffing:

```javascript
template: (ctx) => `
  <ul>
    ${ctx.items.value.map(item => `
      <li key="${item.id}">${item.name}</li>
    `).join('')}
  </ul>
`
```

---

## Children Patterns

### Selector Guidelines

| Selector Type | Example | Use Case |
|---------------|---------|----------|
| **Class** | `".item"` | Multiple elements, list items |
| **ID** | `"#sidebar"` | Single unique element |
| **Data attribute** | `"[data-component]"` | Explicit component markers |

### Nesting Depth Guidelines

| Depth | Recommendation |
|-------|----------------|
| 1-2 levels | Ideal, easy to understand |
| 3 levels | Acceptable, consider flattening |
| 4+ levels | Too deep, refactor |

---

## Component Communication

### Decision Guide

| Scenario | Solution | Why |
|----------|----------|-----|
| Pass value to child | Props | Direct value passing |
| Child notifies parent | Emitter | Events flow up |
| Siblings communicate | Emitter | Decoupled messaging |
| Many components need same data | Store | Central state |

### Anti-Patterns

```javascript
// DON'T: Use JSON.stringify for props (not needed!)
:data='${JSON.stringify(object)}'  // Old approach
:data="object"                     // Just pass directly

// DON'T: Use Store for parent-child only communication
store.dispatch("setParentData", data);  // Overkill, use props

// DON'T: Mutate store state directly
store.state.user.value = newUser;  // Use actions instead
store.dispatch("setUser", newUser);  // Correct
```

---

## General Guidelines

1. **Modularity:** Build your application using small, reusable components.
2. **Reactivity:** Use signals to update only the necessary parts of your UI.
3. **Simplicity:** Keep templates clean and logic minimal.
4. **Naming:** Use PascalCase for component names (`UserProfile`, not `user-profile`).
5. **Single Responsibility:** Each component should do one thing well.
6. **Props Down, Events Up:** Pass data to children via props, communicate up via emitter.
7. **Use Store Sparingly:** Only for truly global state, not for local component data.
8. **Testing:** Write tests for components and plugins.
9. **Documentation:** Maintain clear documentation for your application.

---

## Use Cases

| Use Case | Description |
|----------|-------------|
| **Performance-Critical Applications** | From simple counters to data-intensive dashboards with 10K+ rows (via virtual scrolling) |
| **Bundle-Sensitive Projects** | At ~6KB with zero dependencies, ideal for embedded widgets, micro-frontends |
| **Rapid Prototyping** | Quick experimentation without build tooling overhead |
| **Progressive Enhancement** | Add interactivity to server-rendered pages |
| **Customizable Solutions** | Unopinionated architecture with plugin support |

> **Note:** For enterprise applications requiring extensive tooling ecosystems, consider React or Vue. Eleva's performance scales well, but its ecosystem is still growing.

---

## Performance Tips

### Large Lists

For lists with 1000+ items, use a single template with keyed rows:

```javascript
template: (ctx) => `
  <table>
    <tbody>
      ${ctx.rows.value.map(row => `
        <tr key="${row.id}">
          <td>${row.id}</td>
          <td>${row.label}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
`
```

### Virtual Scrolling

For 10K+ rows, use [virtual scrolling](./examples/patterns/best-practices/performance.md#virtual-scrolling-10k-rows) - renders only visible rows.

### Batch State Updates

Eleva automatically batches multiple signal changes:

```javascript
// All 3 changes result in just 1 render
x.value = 10;
y.value = 20;
z.value = 30;
```

---

## Summary

| Category | Key Points |
|----------|------------|
| **Setup** | Organize by: props → state → computed → actions → hooks |
| **Signals** | Use `.value`; replace don't mutate; use functions for computed |
| **Lifecycle** | Always clean up in `onUnmount`; don't update state in `onUpdate` |
| **Templates** | `${}` uses `ctx.`; `@events` and `:props` don't |
| **Children** | Keep nesting shallow; use specific selectors |
| **Communication** | Props (down), Emitter (up), Store (global) |

---

## Next Steps

- **[Examples](./examples/index.md)** - Real-world patterns
- **[FAQ](./faq.md)** - Common questions and troubleshooting
- **[Plugins](./plugins/index.md)** - Router, Store, Attr documentation

---

[← Plugin System](./plugin-system.md) | [Back to Main Docs](./index.md) | [FAQ →](./faq.md)

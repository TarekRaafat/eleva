---
title: Best Practices - Performance & Architecture
description: Eleva.js best practices for selector performance, component structure, lifecycle hooks, signal reactivity, templates, communication patterns, and manual render optimization with direct DOM control. Write efficient code.
---

# Best Practices

Comprehensive guide to writing efficient, maintainable Eleva components.

## Table of Contents

- [Selector Performance](#selector-performance)
- [Component Structure](#component-structure)
- [Setup Function](#setup-function)
- [Lifecycle Hooks](#lifecycle-hooks)
- [Signal Reactivity](#signal-reactivity)
- [Templates](#templates)
  - [Parameterized Event Handlers](#parameterized-event-handlers)
- [Children & Composition](#children--composition)
- [Communication Patterns](#communication-patterns)
- [General Guidelines](#general-guidelines)
  - [Preventing Unnecessary Re-renders](#preventing-unnecessary-re-renders)
    - [Gating Signal Updates](#1-gating-signal-updates)
    - [Template Partitioning](#2-template-partitioning)
    - [Component Isolation](#3-component-isolation)
    - [Direct DOM Access](#4-direct-dom-access-bypassing-reactivity)
    - [Hybrid Approach](#5-hybrid-approach)

---

## Selector Performance

Choosing the right selector impacts performance, especially when mounting many components dynamically.

### Performance Ranking

| Selector Type | Performance | DOM Method Used | Best For |
|---------------|-------------|-----------------|----------|
| **ID** `#app` | Fastest | `getElementById()` | Root components, unique elements |
| **Component Name** `UserCard` | Very Fast | Direct element matching | Child component mounting |
| **Class** `.container` | Fast | `getElementsByClassName()` | Lists, multiple instances |
| **Tag** `div` | Fast | `getElementsByTagName()` | Rare, not recommended |
| **Attribute** `[data-component]` | Moderate | `querySelectorAll()` | Dynamic/generated elements |
| **Complex** `div.app > .content` | Slowest | `querySelectorAll()` | Avoid if possible |

### Examples

```js
// Best - ID selector for root mounting (uses getElementById)
app.mount(document.getElementById("app"), "App");

// Good - Component name for children (direct matching)
children: {
  "UserCard": "UserCard"
}

// Good - Simple class for lists
children: {
  ".todo-item": "TodoItem"
}

// Acceptable - Data attribute (useful for explicit markers)
children: {
  "[data-widget='sidebar']": "Sidebar"
}

// Avoid - Complex nested selectors
children: {
  "div.wrapper > main.content .item": "Item"  // Slow, fragile
}

// Avoid - Tag-only selectors
children: {
  "div": "SomeComponent"  // Too generic, may match unintended elements
}
```

### Selector Guidelines

1. **Use IDs for root component mounting** - They're unique and fastest to query
2. **Use component names for direct child mounting** - Clearest intent, good performance
3. **Use classes for lists** - Efficient for multiple instances of the same component
4. **Keep selectors simple** - One ID, one class, or one component name; avoid nesting
5. **Avoid tag-only selectors** - Too generic, can cause unintended matches

The performance difference is negligible for a single mount, but becomes noticeable when dynamically creating many components. ID selectors are approximately 2-3x faster than complex CSS selectors.

---

## Component Structure

### Property Order

For consistency and readability, define component properties in this order:

```js
app.component("MyComponent", {
  // 1. Setup - Initialize state and functions
  setup({ signal, emitter, props }) {
    const state = signal(initialValue);
    return { state };
  },

  // 2. Template - Define the component's HTML structure
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

```js
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

```js
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

```js
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

```js
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

```js
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

```js
setup: ({ signal }) => {
  const count = signal(0);

  return {
    count,
    // Hooks are returned as properties
    onMount: ({ container, context }) => {
      console.log("Mounted to:", container);
    },
    onUnmount: ({ container, context, cleanup }) => {
      console.log("Unmounting...");
    }
  };
}
```

### onMount: The Most Common Hook

Use for initialization that requires the DOM or async operations:

```js
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

```js
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

```js
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

## Signal Reactivity

### When to Use Signals

| Data Type | Use Signal? | Why |
|-----------|-------------|-----|
| UI state (counts, toggles, form values) | Yes | Triggers re-render on change |
| Data from API | Yes | UI updates when data loads |
| Derived/computed values | No | Use functions instead |
| Constants | No | Never changes |
| Internal helpers (caches, refs) | No | Not displayed in UI |

```js
setup: ({ signal }) => {
  // Use signals for reactive UI state
  const count = signal(0);
  const items = signal([]);

  // Don't use signals for constants
  const API_URL = "/api/users";  // Regular variable

  // Don't use signals for computed values
  const getItemCount = () => items.value.length;  // Function

  return { count, items, getItemCount };
}
```

### Accessing Signal Values

Always use `.value` to read or write:

```js
// Correct: Access with .value
template: (ctx) => `
  <p>Count: ${ctx.count.value}</p>
  <p>Items: ${ctx.items.value.length}</p>
`

// Wrong: Forgetting .value
template: (ctx) => `
  <p>Count: ${ctx.count}</p>        <!-- Shows [object Signal] -->
`
```

### Updating Signals

```js
setup: ({ signal }) => {
  const count = signal(0);
  const user = signal({ name: "John", age: 25 });
  const items = signal(["a", "b", "c"]);

  // Primitives - direct assignment
  function increment() {
    count.value++;
  }

  // Objects - replace entire object for reactivity
  function updateUser(name) {
    user.value = { ...user.value, name };
  }

  // Arrays - replace with new array
  function addItem(item) {
    items.value = [...items.value, item];
  }

  function removeItem(index) {
    items.value = items.value.filter((_, i) => i !== index);
  }

  return { count, user, items, increment, updateUser, addItem, removeItem };
}
```

### Signal Anti-Patterns

> **Why Mutations Don't Work:** Signals use identity comparison (`===`). When you call `.push()` or modify a property, the reference stays the same, so Eleva sees no change. You must assign a **new** array/object to trigger reactivity.

```js
// ❌ DON'T: Mutate arrays/objects in place (same reference = no update!)
items.value.push(newItem);      // Won't trigger update!
items.value.splice(0, 1);       // Won't trigger update!
items.value[0] = "new";         // Won't trigger update!
user.value.name = "Jane";       // Won't trigger update!

// ✅ DO: Replace with new reference (new reference = triggers update!)
items.value = [...items.value, newItem];           // Add item
items.value = items.value.slice(1);                // Remove first
items.value = items.value.filter((_, i) => i !== 0); // Remove by index
items.value = items.value.map((v, i) => i === 0 ? "new" : v); // Update item
user.value = { ...user.value, name: "Jane" };      // Update property

// ❌ DON'T: Forget .value in template
`${ctx.count}`  // Wrong - shows [object Signal]

// ✅ DO: Always use .value
`${ctx.count.value}`  // Correct - shows the actual value
```

---

## Templates

### Template as Function vs String

| Type | Use When | Example |
|------|----------|---------|
| Function (ctx) | Component has state or props | `(ctx) => \`<p>${ctx.name.value}</p>\`` |
| String | Purely static content | `"<p>Hello World</p>"` |

```js
// Function - most common, recommended
template: (ctx) => `<div>${ctx.count.value}</div>`

// String - static only
template: "<header><h1>Site Title</h1></header>"
```

### Event Handlers

```js
// Named functions - preferred for complex logic
setup: ({ signal }) => {
  const count = signal(0);
  function handleClick() {
    console.log("Clicked!");
    count.value++;
  }
  return { count, handleClick };
},
template: (ctx) => `
  <button @click="handleClick">${ctx.count.value}</button>
`

// Inline - for simple one-liners
template: (ctx) => `
  <button @click="count.value++">${ctx.count.value}</button>
`
```

### Parameterized Event Handlers

When passing arguments to event handlers, wrap the call in an arrow function:

```js
setup: ({ signal }) => {
  const items = signal([{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }]);

  const selectItem = (id) => {
    console.log("Selected:", id);
  };

  const removeItem = (id) => {
    items.value = items.value.filter(item => item.id !== id);
  };

  return { items, selectItem, removeItem };
},
template: (ctx) => `
  <ul>
    ${ctx.items.value.map(item => `
      <li key="${item.id}">
        <span @click="() => selectItem(${item.id})">${item.name}</span>
        <button @click="() => removeItem(${item.id})">×</button>
      </li>
    `).join("")}
  </ul>
`
```

**Why arrow functions?**

| Syntax | Behavior | Result |
|--------|----------|--------|
| `@click="handleClick"` | References function directly | Works |
| `@click="removeItem(5)"` | Executes immediately during render | Broken |
| `@click="() => removeItem(5)"` | Creates function that calls on click | Works |

The arrow function defers execution until the actual click event occurs.

### Template Anti-Patterns

```js
// DON'T: Use ctx. in event handlers or props
`<button @click="ctx.handleClick">`  // Wrong
`:user="ctx.user"`                   // Wrong

// DO: Reference values directly (no ctx. prefix)
`<button @click="handleClick">`     // Correct
`:user="user"`                      // Correct

// DON'T: Missing ctx. in template literals (${}
`<p>${count.value}</p>`  // Wrong - count is undefined

// DO: Include ctx. in template literal interpolation
`<p>${ctx.count.value}</p>`  // Correct

// RULE: ${} needs ctx., @events and :props don't
```

---

## Children & Composition

### When to Use Children

| Scenario | Use Children? |
|----------|---------------|
| Component has sub-components | Yes |
| Building layouts with slots | Yes |
| List items need their own component | Yes |
| Simple, self-contained component | No |

### Selector Patterns for Children

| Selector Type | Example | Use Case |
|---------------|---------|----------|
| **Class** | `".item"` | Multiple elements, list items |
| **ID** | `"#sidebar"` | Single unique element |
| **Data attribute** | `"[data-component]"` | Explicit component markers |
| **Component name** | `"UserCard"` | Direct component mounting |

```js
// Class selector - for lists/multiple instances
children: {
  ".user-card": "UserCard",
  ".comment": "Comment"
}

// ID selector - for unique elements
children: {
  "#header": "Header",
  "#footer": "Footer"
}

// Data attribute - explicit and clear
children: {
  "[data-component='sidebar']": "Sidebar"
}
```

### Passing Props to Children

```html
<div class="user-card" :user="user" :editable="true"></div>
```

```js
children: {
  ".user-card": "UserCard"  // UserCard receives { user, editable }
}
```

### Children Anti-Patterns

```js
// DON'T: Overly generic selectors
children: {
  "div": "SomeComponent"  // Too broad
}

// DON'T: Deep nesting without reason
children: {
  ".level1": {
    ".level2": {
      ".level3": "DeepComponent"  // Hard to maintain
    }
  }
}

// DO: Use specific selectors
children: {
  ".product-card": "ProductCard",
  "#featured-product": "FeaturedProduct"
}
```

### Decision Guide

| Scenario | Recommendation |
|----------|----------------|
| List of items | Use class selector: `".item": "Item"` |
| Single unique component | Use ID selector: `"#sidebar": "Sidebar"` |
| Reusable component | Register and reference by name |
| Dynamic component switching | Use data attributes with state |

---

## Communication Patterns

### Props (Parent to Child)

```js
// Parent
template: (ctx) => `
  <div class="child" :message="Hello" :count="count.value"></div>
`,
children: { ".child": "Child" }

// Child
setup: ({ props }) => {
  console.log(props.message);  // "Hello"
  return { message: props.message };
}
```

### Emitter (Child to Parent / Siblings)

```js
// Child - emit event
setup: ({ emitter }) => {
  function handleClick() {
    emitter.emit("item:selected", { id: 123 });
  }
  return { handleClick };
}

// Parent - listen for event
setup: ({ emitter }) => {
  let unsubscribe = null;

  return {
    onMount: () => {
      unsubscribe = emitter.on("item:selected", (data) => {
        console.log("Selected:", data.id);
      });
    },
    onUnmount: () => {
      if (unsubscribe) unsubscribe();
    }
  };
}
```

### Store (Global State)

```js
// Setup store
const store = app.use(Store, {
  state: { user: null, theme: "light" },
  actions: {
    setUser: (state, user) => ({ ...state, user }),
    toggleTheme: (state) => ({
      ...state,
      theme: state.theme === "light" ? "dark" : "light"
    })
  }
});

// Use in component
setup: ({ signal }) => {
  const theme = signal(store.getState().theme);
  store.subscribe((state) => {
    theme.value = state.theme;
  });
  return { theme };
}
```

### Decision Guide

| Need | Solution |
|------|----------|
| Pass data to child | Props |
| Child notifies parent | Emitter |
| Sibling communication | Emitter or Store |
| Global state | Store |
| Multiple components share state | Store |

---

## General Guidelines

### Do's

- **Keep components focused** - One responsibility per component
- **Use meaningful names** - `UserProfileCard` not `Card1`
- **Clean up in onUnmount** - Prevent memory leaks
- **Use signals for UI state** - Enables reactivity
- **Keep selectors simple** - Prefer IDs and classes

### Don'ts

- **Don't mutate arrays/objects in place** - Replace for reactivity
- **Don't forget .value** - Always access signal values correctly
- **Don't over-nest components** - Keep hierarchy shallow
- **Don't use generic selectors** - Be specific with `div`, `span`
- **Don't skip cleanup** - Always unsubscribe and clear timers

### Performance Tips

1. **Batch signal updates** - Multiple updates in one function
2. **Use memoization** - Cache expensive computations
3. **Lazy load components** - Load on demand when possible
4. **Keep templates simple** - Complex logic in setup, not template
5. **Minimize DOM queries** - Use efficient selectors
6. **Use keyed reconciliation for lists** - Add `key` attribute for efficient DOM diffing

### Preventing Unnecessary Re-renders

Eleva gives developers direct control over the DOM through its Signal-based reactivity and Renderer. Unlike frameworks that abstract DOM updates behind a virtual DOM, Eleva's architecture means **you control exactly when and how the DOM updates** by controlling signal changes. This direct control enables precise manual optimization for performance-critical sections.

#### When Manual Optimization Is Needed

Eleva's automatic render batching (`queueMicrotask`) handles most cases efficiently—multiple signal updates in the same synchronous block trigger only one re-render. Manual optimization is needed when:

| Scenario | Problem | Solution |
|----------|---------|----------|
| High-frequency events (mousemove, scroll) | Too many signal updates | Throttle/debounce |
| Noisy data streams (WebSocket, sensors) | Minor changes trigger renders | Conditional updates |
| Complex component with mixed update rates | Entire template re-renders | Template partitioning or component isolation |
| Animation or real-time visualization | Need direct DOM manipulation | Direct DOM access |

#### 1. Gating Signal Updates

Since Eleva re-renders when signals change, the most direct optimization is **preventing unnecessary signal updates**:

**Conditional Updates** - Only update when changes are meaningful:

```js
setup: ({ signal }) => {
  const data = signal(0);

  const updateIfSignificant = (value) => {
    // Only trigger re-render if change exceeds threshold
    if (Math.abs(value - data.value) > 10) {
      data.value = value;
    }
  };

  return { data, updateIfSignificant };
}
```

**Debounced Updates** - Delay updates until activity stops (ideal for input fields):

```js
setup: ({ signal }) => {
  const searchQuery = signal("");
  let debounceTimer = null;

  const updateDebounced = (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery.value = value;  // Only updates after 300ms of no input
    }, 300);
  };

  return {
    searchQuery,
    updateDebounced,
    onUnmount: () => clearTimeout(debounceTimer)
  };
}
```

**Throttled Updates** - Limit update frequency (ideal for scroll/mousemove):

```js
setup: ({ signal }) => {
  const position = signal({ x: 0, y: 0 });
  let lastUpdate = 0;

  const updateThrottled = (newPos) => {
    const now = Date.now();
    if (now - lastUpdate >= 16) {  // Cap at ~60fps
      position.value = newPos;
      lastUpdate = now;
    }
  };

  return { position, updateThrottled };
}
```

#### 2. Template Partitioning

For complex components where only part of the UI needs frequent updates, partition your template using conditional rendering to minimize DOM diffing work:

```js
app.component("StockDashboard", {
  setup: ({ signal }) => {
    const stocks = signal([]);           // Changes frequently
    const selectedStock = signal(null);  // Changes frequently
    const userSettings = signal({});     // Rarely changes
    const staticContent = {              // Never changes - not a signal
      title: "Stock Dashboard",
      footer: "Data delayed 15 minutes"
    };

    return { stocks, selectedStock, userSettings, staticContent };
  },

  template: (ctx) => `
    <div class="dashboard">
      <!-- Static section - no signals, never re-diffed meaningfully -->
      <header>${ctx.staticContent.title}</header>

      <!-- Dynamic section - minimal, focused updates -->
      <div class="stock-list">
        ${ctx.stocks.value.map(stock => `
          <div key="${stock.symbol}"
               class="${ctx.selectedStock.value === stock.symbol ? 'selected' : ''}"
               @click="() => selectedStock.value = '${stock.symbol}'">
            <span class="symbol">${stock.symbol}</span>
            <span class="price">${stock.price}</span>
          </div>
        `).join("")}
      </div>

      <footer>${ctx.staticContent.footer}</footer>
    </div>
  `
});
```

**Key technique:** Use plain objects (not signals) for truly static content. Eleva's renderer will still diff them, but they won't trigger re-renders on their own, and the diffing cost is minimal for unchanged content.

#### 3. Component Isolation

Extract frequently-updating sections into child components. Each component has its own render cycle, so updates in a child don't re-render the parent:

```js
// Parent - renders only when its own signals change
app.component("Dashboard", {
  setup: ({ signal }) => ({
    userName: signal("John")  // Rarely changes
  }),
  template: (ctx) => `
    <div class="dashboard">
      <header>Welcome, ${ctx.userName.value}</header>
      <div id="live-ticker"></div>  <!-- Child handles its own updates -->
      <div id="chart"></div>        <!-- Another isolated child -->
      <footer>Static content here</footer>
    </div>
  `,
  children: {
    "#live-ticker": "LiveTicker",
    "#chart": "RealTimeChart"
  }
});

// Child - re-renders at 60fps without affecting parent
app.component("LiveTicker", {
  setup: ({ signal }) => {
    const prices = signal([]);
    let intervalId = null;

    return {
      prices,
      onMount: () => {
        intervalId = setInterval(() => {
          // High-frequency updates isolated to this component
          prices.value = fetchLatestPrices();
        }, 16);
      },
      onUnmount: () => clearInterval(intervalId)
    };
  },
  template: (ctx) => `
    <div class="ticker">
      ${ctx.prices.value.map(p => `<span key="${p.id}">${p.value}</span>`).join("")}
    </div>
  `
});
```

#### 4. Direct DOM Access (Bypassing Reactivity)

For maximum performance in animation-heavy or real-time visualization sections, bypass Eleva's reactive system entirely and manipulate the DOM directly using the `container` reference in lifecycle hooks:

```js
app.component("RealTimeChart", {
  setup: ({ signal }) => {
    const data = signal([]);
    let canvas = null;
    let ctx = null;
    let animationId = null;

    // Direct DOM manipulation for performance-critical rendering
    const drawFrame = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw directly - no signals, no re-renders
      const points = data.value;
      ctx.beginPath();
      points.forEach((point, i) => {
        const x = (i / points.length) * canvas.width;
        const y = canvas.height - (point / 100) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      animationId = requestAnimationFrame(drawFrame);
    };

    // Update data without triggering Eleva re-render
    const pushDataPoint = (value) => {
      const current = data.value;
      current.push(value);
      if (current.length > 100) current.shift();
      // Note: mutating in place intentionally to avoid re-render
      // The canvas drawFrame reads data.value directly
    };

    return {
      data,
      pushDataPoint,
      onMount: ({ container }) => {
        // Get direct DOM reference
        canvas = container.querySelector("canvas");
        ctx = canvas.getContext("2d");
        drawFrame();
      },
      onUnmount: () => {
        cancelAnimationFrame(animationId);
      }
    };
  },

  // Template renders once, canvas updates happen via direct DOM access
  template: () => `
    <div class="chart-container">
      <canvas width="800" height="400"></canvas>
    </div>
  `
});
```

**When to use direct DOM access:**
- Canvas-based visualizations
- WebGL rendering
- High-frequency animations (60+ fps)
- Real-time data streams where re-rendering is too expensive

#### 5. Hybrid Approach

Combine reactive UI with direct DOM updates for the best of both worlds:

```js
app.component("PerformanceMonitor", {
  setup: ({ signal }) => {
    // Reactive state for UI controls (normal Eleva reactivity)
    const isRunning = signal(false);
    const displayMode = signal("chart");

    // Non-reactive state for high-frequency data
    let metricsBuffer = [];
    let chartElement = null;

    const updateChart = () => {
      if (!chartElement) return;
      // Direct DOM update - bypasses Eleva entirely
      chartElement.style.setProperty("--value", metricsBuffer[metricsBuffer.length - 1]);
    };

    const addMetric = (value) => {
      metricsBuffer.push(value);
      if (metricsBuffer.length > 1000) metricsBuffer.shift();
      updateChart();  // Direct DOM, no re-render
    };

    return {
      isRunning,
      displayMode,
      addMetric,
      toggleRunning: () => { isRunning.value = !isRunning.value; },
      onMount: ({ container }) => {
        chartElement = container.querySelector(".chart-bar");
      }
    };
  },

  template: (ctx) => `
    <div class="monitor">
      <!-- Reactive UI - re-renders when signals change -->
      <div class="controls">
        <button @click="toggleRunning">
          ${ctx.isRunning.value ? "Stop" : "Start"}
        </button>
        <select @change="(e) => displayMode.value = e.target.value">
          <option value="chart">Chart</option>
          <option value="table">Table</option>
        </select>
      </div>

      <!-- Performance-critical section - updated via direct DOM access -->
      <div class="chart-bar" style="--value: 0;"></div>
    </div>
  `,

  style: `
    .chart-bar {
      width: calc(var(--value) * 1%);
      height: 20px;
      background: linear-gradient(90deg, green, red);
      transition: width 16ms linear;
    }
  `
});
```

#### Decision Guide

| Update Frequency | Approach | Example |
|------------------|----------|---------|
| User-triggered (clicks, form submits) | Normal signals | Form validation, toggles |
| Moderate (every few seconds) | Normal signals | API polling, notifications |
| High (multiple per second) | Throttle/debounce signals | Search input, scroll position |
| Very high (60+ fps) | Direct DOM access | Canvas, animations, real-time charts |
| Mixed in same component | Hybrid approach | Dashboard with controls + live data |

> **Key insight:** Eleva's direct DOM control means you choose the optimization strategy. Gate signal updates for reactive optimization, or bypass signals entirely for maximum performance. The `container` reference in lifecycle hooks gives you direct DOM access when you need it.

### Large List Performance

For large lists (1,000+ items), Eleva's single-template approach with keyed reconciliation is the most efficient pattern:

```js
app.component("data-table", {
  setup: ({ signal }) => ({
    rows: signal([])
  }),
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
});
```

**Why this works:**
- The `key` attribute enables efficient DOM diffing
- Only changed elements are updated in the DOM
- Minimal memory overhead (~1.37 KB/row for 10K rows)
- No component instance overhead per row

**Avoid component splitting for large lists:**
| Pattern | 10K Rows Memory | Recommendation |
|---------|-----------------|----------------|
| Single template with keys | ~28.9 MB | Recommended |
| Separate component per row | ~125 MB | Avoid for large lists |

Component splitting creates per-instance overhead (signals, context, lifecycle) that far exceeds any benefit for simple list items. Reserve component splitting for complex, interactive sub-components (not simple table rows).

### Virtual Scrolling (10K+ Rows)

For very large datasets (10,000+ rows), virtual scrolling renders only visible rows. This dramatically improves both memory usage and update performance.

**Verified Benchmark Results (10,000 rows):**

| Metric | Standard | Virtual Scrolling | Improvement |
|--------|----------|-------------------|-------------|
| Memory | ~29 MB | ~5 MB | **5.5x less** |
| Create 10K rows | ~250ms | ~21ms | **12x faster** |
| Update every 10th row | ~86ms | ~9ms | **9.5x faster** |
| DOM rows rendered | 10,000 | ~17 | **588x fewer** |

```js
// Configuration
const ROW_HEIGHT = 37;
const VIEWPORT_HEIGHT = 400;
const VISIBLE_COUNT = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + 6;

app.component("virtual-table", {
  setup: ({ signal }) => {
    const rows = signal([]);
    const scrollTop = signal(0);

    const handleScroll = (e) => {
      scrollTop.value = e.target.scrollTop;
    };

    // ... other methods (add, update, remove, etc.)

    return { rows, scrollTop, handleScroll };
  },

  template: (ctx) => {
    // Calculate visible slice
    const allRows = ctx.rows.value;
    const scroll = ctx.scrollTop.value;
    const startIndex = Math.max(0, Math.floor(scroll / ROW_HEIGHT) - 3);
    const endIndex = Math.min(allRows.length, startIndex + VISIBLE_COUNT);
    const items = allRows.slice(startIndex, endIndex);
    const offset = startIndex * ROW_HEIGHT;
    const totalHeight = allRows.length * ROW_HEIGHT;

    return `
      <div class="virtual-viewport"
           style="height: ${VIEWPORT_HEIGHT}px; overflow-y: auto;"
           @scroll="handleScroll">
        <div style="height: ${totalHeight}px; position: relative;">
          <table style="position: absolute; top: ${offset}px; width: 100%;">
            <tbody>
              ${items.map(row => `
                <tr key="${row.id}" style="height: ${ROW_HEIGHT}px;">
                  <td>${row.id}</td>
                  <td>${row.label}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
});
```

**For row interactions (select, remove), use arrow functions:**

```js
setup: ({ signal }) => {
  const rows = signal([]);
  const selected = signal(null);

  const selectRow = (id) => {
    selected.value = id;
  };

  const removeRow = (id) => {
    rows.value = rows.value.filter(row => row.id !== id);
  };

  return { rows, selected, selectRow, removeRow, /* ... */ };
},

template: (ctx) => {
  // ... virtual scrolling calculation ...

  const renderRow = (row) => `
    <tr key="${row.id}" class="${ctx.selected.value === row.id ? 'selected' : ''}">
      <td><a @click="() => selectRow(${row.id})">${row.label}</a></td>
      <td><a @click="() => removeRow(${row.id})">×</a></td>
    </tr>
  `;

  // ... rest of template
}
```

**Why virtual scrolling works:**
- Renders only ~17 visible rows instead of 10,000
- Updates are near-instant (~9ms vs ~86ms)
- Memory stays constant (~5 MB) regardless of data size
- Combined with Eleva's efficient memory footprint, you can handle virtually unlimited data

**When to use:**

| Dataset Size | Recommended Approach |
|--------------|---------------------|
| < 1,000 rows | Single template with keys |
| 1,000 - 10,000 rows | Single template with keys (Eleva handles this efficiently) |
| 10,000+ rows | Virtual scrolling |

> 💡 **Tip:** Eleva's low memory overhead makes it ideal for data-intensive applications. The combination of Eleva + virtual scrolling delivers performance that rivals or exceeds heavier frameworks while maintaining a ~2.3 KB footprint.

---

[← Back to Patterns](./index.md) | [Forms →](./forms.md)

---
title: Eleva.js Core Concepts
description: Deep dive into Eleva's core modules - Signals, TemplateEngine, Emitters, Renderer, and Lifecycle Hooks. Learn reactivity and event handling.
---

# Core Concepts

> **Version:** 1.0.0 | This guide covers the fundamental building blocks of Eleva applications.

---

## Overview

Eleva is built on five core modules that work together to create reactive, component-based applications:

| Module | Purpose | Key Methods |
|--------|---------|-------------|
| **Signal** | Reactive state | `.value`, `.watch()` |
| **Emitter** | Event handling | `.on()`, `.off()`, `.emit()` |
| **TemplateEngine** | Expression evaluation | `.evaluate()` |
| **Renderer** | DOM diffing | `.patchDOM()` |
| **Eleva** | App orchestration | `.component()`, `.mount()`, `.use()` |

---

## Signal (Reactivity)

The **Signal** provides fine-grained reactivity by updating only the affected DOM parts when values change.

### Creating Signals

```javascript
// In component setup
setup({ signal }) {
  const count = signal(0);           // Number
  const user = signal(null);         // Object
  const items = signal([]);          // Array
  const isLoading = signal(false);   // Boolean

  return { count, user, items, isLoading };
}
```

### Reading and Writing Values

```javascript
// Read value
console.log(count.value);  // 0

// Write value (triggers re-render)
count.value = 1;

// Update objects/arrays
user.value = { name: "Alice", age: 30 };
items.value = [...items.value, newItem];
```

### Watching for Changes

```javascript
const count = signal(0);

// Register a watcher
const unwatch = count.watch((newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} → ${newVal}`);
});

count.value = 1;  // Logs: "Count changed: 0 → 1"

// Unsubscribe when done
unwatch();
```

### Automatic Render Batching

Eleva automatically batches multiple signal changes into a single render:

```javascript
// All 3 changes result in just 1 render
x.value = 10;
y.value = 20;
z.value = 30;
```

| Scenario | Without Batching | With Batching |
|----------|------------------|---------------|
| Drag events (60/sec x 3 signals) | 180 renders/sec | 60 renders/sec |
| Form reset (10 fields) | 10 renders | 1 render |
| API response (5 state updates) | 5 renders | 1 render |

**Key Features:**
- Microtask-based update batching
- Automatic watcher cleanup
- Type-safe value handling
- Efficient update propagation
- Memory leak prevention through unsubscribe

---

## TemplateEngine

The **TemplateEngine** evaluates expressions in `@events` and `:props` attributes against the component context.

### How It Works

```javascript
// Internal usage for event handlers
const handler = TemplateEngine.evaluate("handleClick", context);
// handler is now the actual function reference

// Internal usage for props
const userData = TemplateEngine.evaluate("user.value", context);
// userData is the actual object value
```

**Key Features:**
- Static method-based API
- Expression evaluation in component context
- Function caching for performance
- Error handling for invalid expressions
- Support for complex object access and method calls

---

## Template Interpolation

Eleva uses JavaScript template literals for value interpolation, with special syntax for events and props.

### Understanding the Syntax

| Syntax | Evaluated By | Requires `ctx.`? | Example |
|--------|--------------|:----------------:|---------|
| `${...}` | JavaScript | Yes | `${ctx.count.value}` |
| `@event="..."` | TemplateEngine | No | `@click="increment"` |
| `:prop="..."` | TemplateEngine | No | `:user="userData.value"` |

> **Quick Rule:** `${}` needs `ctx.` — `@events` and `:props` don't.

### Value Interpolation with `${...}`

```javascript
const Counter = {
  setup: ({ signal }) => ({ count: signal(0) }),
  template: (ctx) => `<p>Count: ${ctx.count.value}</p>`
};
```

**Advantages:**
- Native JavaScript syntax—no learning curve
- Full IDE support (autocomplete, type checking)
- Access to all JavaScript features (methods, conditionals, etc.)

### Event Handlers with `@event`

Event handlers are evaluated against your component context (no `ctx.` needed):

```javascript
const Counter = {
  setup: ({ signal }) => {
    const count = signal(0);
    const increment = () => count.value++;
    return { count, increment };
  },
  template: (ctx) => `
    <p>Count: ${ctx.count.value}</p>
    <button @click="increment">+</button>
  `
};
```

You can also use inline expressions:

```javascript
template: (ctx) => `
  <button @click="() => count.value++">+</button>
`
```

### Passing Props with `:prop`

Props are evaluated against your component context (no `ctx.` needed):

```javascript
const Parent = {
  setup: ({ signal }) => ({
    user: signal({ name: "John", age: 30 }),
    items: ["a", "b", "c"]
  }),
  template: (ctx) => `
    <child-comp
      :user="user.value"
      :items="items"
      :count="10 + 5">
    </child-comp>
  `,
  children: { "child-comp": "ChildComponent" }
};
```

**Key benefit:** No need for `JSON.stringify` — objects and arrays are passed directly!

### Context Reference Rules

| Syntax | Uses `ctx.`? | Example |
|--------|:------------:|---------|
| `${...}` | Yes | `${ctx.count.value}` |
| `@event="..."` | No | `@click="increment"` |
| `:prop="..."` | No | `:user="userData.value"` |

**Why the difference?** JavaScript template literals (`${}`) are evaluated where `ctx` is the function parameter. TemplateEngine evaluates `@event` and `:prop` expressions with your context already unwrapped.

### Common Mistakes

```javascript
// WRONG: Using ctx. in event handlers
template: (ctx) => `<button @click="ctx.handleClick">Click</button>`

// CORRECT: No ctx. in event handlers
template: (ctx) => `<button @click="handleClick">Click</button>`
```

```javascript
// WRONG: Using ctx. in props
template: (ctx) => `<child :user="ctx.userData.value"></child>`

// CORRECT: No ctx. in props
template: (ctx) => `<child :user="userData.value"></child>`
```

```javascript
// WRONG: Missing ctx. in template literals
template: (ctx) => `<p>Count: ${count.value}</p>`

// CORRECT: Use ctx. in template literals
template: (ctx) => `<p>Count: ${ctx.count.value}</p>`
```

---

## Setup Context vs. Event Context

Understanding how data flows during component initialization and event handling is key.

### Setup Context

**When It's Used:** Passed to the component's `setup` function during initialization.

**What It Contains:** Utilities (like the `signal` function), component props, emitter, and lifecycle hooks.

```javascript
const MyComponent = {
  setup: ({ signal, emitter, props }) => {
    const counter = signal(0);
    return { counter };
  },
  template: (ctx) => `
    <div>
      <p>Counter: ${ctx.counter.value}</p>
    </div>
  `,
};
```

**Available context properties:**

| Property | Type | Description |
|----------|------|-------------|
| `signal` | Function | Create reactive state: `signal(initialValue)` |
| `emitter` | Object | Event bus: `emit()`, `on()`, `off()` |
| `props` | Object | Props passed from parent component |

### Event Context

**When It's Used:** Provided when an event handler is triggered.

**What It Contains:** The reactive state from `setup` along with event-specific data.

```javascript
const MyComponent = {
  setup: ({ signal }) => {
    const counter = signal(0);
    function increment(event) {
      console.log("Event type:", event.type);
      counter.value++;
    }
    return { counter, increment };
  },
  template: (ctx) => `
    <div>
      <p>Counter: ${ctx.counter.value}</p>
      <button @click="increment">Increment</button>
    </div>
  `,
};
```

---

## Emitter (Event Handling)

The **Emitter** enables inter-component communication through events using a publish-subscribe pattern.

### Basic Usage

```javascript
const emitter = new Emitter();

// Subscribe to event
emitter.on("greet", (name) => console.log(`Hello, ${name}!`));

// Emit event
emitter.emit("greet", "Alice");  // Logs: "Hello, Alice!"

// Unsubscribe
emitter.off("greet", handler);
```

### In Components

```javascript
// Child emits events
setup({ emitter }) {
  function handleClick(item) {
    emitter.emit("item:selected", item);
    emitter.emit("cart:add", { id: item.id, qty: 1 });
  }
  return { handleClick };
}

// Parent listens for events
setup({ emitter }) {
  emitter.on("item:selected", (item) => {
    console.log("Selected:", item);
  });
  return {};
}
```

**Key Features:**
- Synchronous event propagation
- Multiple handlers per event
- Automatic event cleanup
- Memory-efficient handler management

---

## Renderer (DOM Diffing)

The **Renderer** efficiently updates the DOM through direct manipulation, avoiding the overhead of virtual DOM implementations.

### How It Works

```javascript
const renderer = new Renderer();

const container = document.getElementById("app");
const newHtml = "<div>Updated content</div>";

renderer.patchDOM(container, newHtml);
```

**Key Features:**
- Direct DOM manipulation for optimal performance
- Efficient attribute updates
- Smart node comparison and replacement
- Support for key-based reconciliation
- Handles text nodes and element nodes appropriately

---

## Eleva (Core)

The **Eleva** class orchestrates component registration, mounting, plugin integration, lifecycle management, and events.

### Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `new Eleva(name, config)` | Creates an app instance | `Eleva` |
| `use(plugin, options)` | Integrates a plugin | `Eleva` or plugin result |
| `component(name, definition)` | Registers a component | `Eleva` |
| `mount(container, compName, props)` | Mounts to DOM | `Promise<MountResult>` |

```javascript
const app = new Eleva("MyApp");

// Register component
app.component("Counter", {
  setup: ({ signal }) => ({ count: signal(0) }),
  template: (ctx) => `<div>${ctx.count.value}</div>`
});

// Mount component
const instance = await app.mount(document.getElementById("app"), "Counter");

// Unmount when done
await instance.unmount();
```

---

## Lifecycle Hooks

Eleva provides lifecycle hooks that allow you to execute code at specific stages of a component's lifecycle. Hooks are **returned from setup**, not destructured from context.

### Available Hooks

| Hook | When Called | Common Use Cases |
|------|-------------|------------------|
| `onBeforeMount` | Before component renders to DOM | Validate props, prepare data |
| `onMount` | After component renders to DOM | Fetch data, set up subscriptions, DOM access |
| `onBeforeUpdate` | Before component re-renders | Compare old/new state, cancel updates |
| `onUpdate` | After component re-renders | DOM measurements, third-party library sync |
| `onUnmount` | Before component is destroyed | Cleanup subscriptions, timers, listeners |

### Execution Order

```
 Component Created
         │
         ▼
┌─────────────────┐
│ onBeforeMount   │  ← Props validated, initial data ready
└────────┬────────┘
         │
   (DOM renders)
         │
         ▼
┌─────────────────┐
│ onMount         │  ← DOM available, fetch data, set up listeners
└────────┬────────┘
         │
(User interacts, state changes)
         │
         ▼
┌─────────────────┐
│ onBeforeUpdate  │  ← Before re-render
└────────┬────────┘
         │
   (DOM updates)
         │
         ▼
┌─────────────────┐
│ onUpdate        │  ← After re-render
└────────┬────────┘
         │
(Component removed)
         │
         ▼
┌─────────────────┐
│ onUnmount       │  ← Cleanup everything
└─────────────────┘
```

### Hook Patterns

**Sync and Async Support:** All hooks support both synchronous and asynchronous functions. Async hooks are awaited by the framework.

```javascript
// Sync hooks
setup: ({ signal }) => ({
  count: signal(0),
  onMount: () => console.log("Mounted!"),
  onUnmount: () => console.log("Unmounting!")
})

// Async hooks (awaited by framework)
setup: ({ signal }) => ({
  data: signal(null),
  onMount: async ({ context }) => {
    const res = await fetch("/api/data");
    context.data.value = await res.json();
  }
})
```

### onMount: The Most Common Hook

Use `onMount` for initialization that requires the DOM or async operations:

```javascript
setup: ({ signal }) => {
  const users = signal([]);
  const loading = signal(true);
  const error = signal(null);

  return {
    users,
    loading,
    error,
    onMount: async () => {
      try {
        const response = await fetch("/api/users");
        users.value = await response.json();
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
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
      // Set up resize listener
      resizeHandler = () => { windowWidth.value = window.innerWidth; };
      window.addEventListener("resize", resizeHandler);

      // Set up interval
      intervalId = setInterval(() => {
        console.log("Tick");
      }, 1000);
    },
    onUnmount: () => {
      // Clean up everything!
      window.removeEventListener("resize", resizeHandler);
      clearInterval(intervalId);
    }
  };
}
```

**What to clean up in onUnmount:**

| Resource | Cleanup Method |
|----------|----------------|
| Event listeners | `removeEventListener()` |
| Timers | `clearTimeout()`, `clearInterval()` |
| Subscriptions | Call unsubscribe function |
| WebSocket | `socket.close()` |
| AbortController | `controller.abort()` |
| Third-party libraries | Library-specific destroy method |

### Async Operations with Cleanup

Handle async operations properly with cleanup:

```javascript
setup: ({ signal }) => {
  const data = signal(null);
  const loading = signal(true);
  let abortController = null;

  return {
    data,
    loading,
    onMount: async () => {
      abortController = new AbortController();

      try {
        const response = await fetch("/api/data", {
          signal: abortController.signal
        });
        data.value = await response.json();
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch failed:", err);
        }
      } finally {
        loading.value = false;
      }
    },
    onUnmount: () => {
      if (abortController) {
        abortController.abort();
      }
    }
  };
}
```

---

## Summary

| Concept | Purpose | Key Points |
|---------|---------|------------|
| **Signals** | Reactive state | Use `.value` to read/write; changes trigger re-renders |
| **Templates** | HTML generation | Use `${}` with `ctx.`; `@events` and `:props` without |
| **Emitter** | Event communication | Publish-subscribe pattern for cross-component messaging |
| **Renderer** | DOM updates | Efficient diffing without virtual DOM overhead |
| **Lifecycle** | Hook into component life | Returned from setup, support sync/async |

---

## Next Steps

- **[Components](./components.md)** - Registration, children, props, styles
- **[Architecture](./architecture.md)** - Data flow diagrams
- **[Best Practices](./best-practices.md)** - Patterns and guidelines
- **[Examples](./examples/index.md)** - Real-world patterns

---

[← Getting Started](./getting-started.md) | [Back to Main Docs](./index.md) | [Components →](./components.md)

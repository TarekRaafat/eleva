---
title: Eleva.js Store Plugin - Centralized State Management
description: Eleva.js Store plugin for reactive global state with actions, namespaces, persistence, and devtools. Redux-like patterns in 6KB.
image: /imgs/eleva.js%20Full%20Logo.png
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Eleva.js Store Plugin - Centralized State Management",
  "description": "Eleva.js Store plugin for reactive global state with actions, namespaces, persistence, and devtools. Redux-like patterns in 6KB.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-01-17T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "email": "tarek.m.raaf@gmail.com",
    "url": "https://github.com/TarekRaafat"
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
    "@id": "https://elevajs.com/plugins/store/"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Plugins",
  "keywords": ["eleva", "elevajs", "Eleva.js", "store plugin", "state management", "reactive state", "actions", "persistence"]
}
</script>

# Store Plugin

> **Version:** 1.0.0 | **Type:** State Management Plugin | **Bundle Size:** ~6KB minified | **Dependencies:** Eleva core (Signal system)

The Store plugin provides centralized, reactive state management for Eleva applications. It enables sharing data across the entire application with automatic UI updates, action-based mutations, namespace organization, and built-in persistence.

---

## TL;DR - Quick Reference

### 30-Second Setup

```javascript
// file: app.js
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("MyApp");

app.use(Store, {
  state: { count: 0 },
  actions: {
    increment: (state) => state.count.value++
  }
});

app.component("Counter", {
  setup({ store }) {
    return {
      count: store.state.count,
      increment: () => store.dispatch("increment")
    };
  },
  template: (ctx) => `
    <button @click="increment">Count: ${ctx.count.value}</button>
  `
});

app.mount(document.getElementById("app"), "Counter");
// Result: Button showing "Count: 0", increments on click
```

### API Cheatsheet

**In components (`ctx.store`):**

| Method | Description | Returns |
|--------|-------------|---------|
| `store.state` | Reactive state object | `Object<Signal>` |
| `store.dispatch(action, payload?)` | Execute an action | `Promise<any>` |
| `store.subscribe(callback)` | Listen to all mutations | `() => void` |
| `store.getState()` | Get non-reactive snapshot | `Object` |
| `store.registerModule(name, module)` | Add dynamic module | `void` |
| `store.unregisterModule(name)` | Remove module | `void` |
| `store.createState(key, value)` | Add state property | `Signal` |
| `store.createAction(name, fn)` | Add action | `void` |
| `store.signal` | Signal constructor | `Function` |

**App instance only (`app.store`):**

| Method | Description | Returns |
|--------|-------------|---------|
| `store.replaceState(newState)` | Replace entire state | `void` |
| `store.clearPersistedState()` | Clear storage | `void` |

### State Access Patterns

| Pattern | Example |
|---------|---------|
| Read state | `store.state.count.value` |
| In template | `${ctx.count.value}` |
| Namespaced state | `store.state.auth.user.value` |
| Dispatch action | `store.dispatch("increment")` |
| Dispatch with payload | `store.dispatch("setUser", { name: "John" })` |
| Namespaced action | `store.dispatch("auth.login", credentials)` |

### Configuration Quick Reference

```javascript
app.use(Store, {
  state: { /* initial state */ },
  actions: { /* action functions */ },
  namespaces: { /* organized modules */ },
  persistence: {
    enabled: true,
    key: "app-store",
    storage: "localStorage",  // or "sessionStorage"
    include: ["theme"],       // only persist these
    exclude: ["tempData"]     // don't persist these
  },
  devTools: true,
  onError: (error, context) => console.error(error)
});
```

> **Template Context:** Use `${ctx.count.value}` in templates, but `@click="increment"` for events (no `ctx.`).

---

## Documentation

| Section | Description |
|---------|-------------|
| [Core Concepts](./core-concepts.md) | State, actions, and namespaces |
| [Configuration](./configuration.md) | Options, persistence, and DevTools |
| [Usage Patterns](./patterns.md) | Counter, todo list, auth, shopping cart |
| [Advanced](./advanced.md) | Dynamic modules, async patterns, complex state |
| [API Reference](./api.md) | Complete API, TypeScript, troubleshooting |

---

## Features

| Feature | Description |
|---------|-------------|
| **Reactive State** | State wrapped in Signals for automatic UI updates |
| **Action-Based Mutations** | Predictable state changes with dispatch |
| **Namespace Organization** | Modular state for large applications |
| **Built-in Persistence** | Automatic localStorage/sessionStorage sync |
| **Async Support** | Native async/await in actions |
| **Subscriptions** | Listen to all state mutations |
| **Dynamic Modules** | Register/unregister modules at runtime |
| **DevTools Integration** | Debug state changes in development |
| **TypeScript Support** | Full type definitions included |

---

## Installation

### Via npm

```bash
npm install eleva
```

```javascript
// ESM
import Eleva from "eleva";
import { Store } from "eleva/plugins";

// or individual import
import { Store } from "eleva/plugins/store";
```

### Via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/store.umd.min.js"></script>

<script>
  const app = new Eleva("MyApp");
  app.use(ElevaStore.Store, { /* options */ });
</script>
```

### Basic Setup

```javascript
// file: main.js
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("MyApp");

// Install with initial state and actions
app.use(Store, {
  state: {
    theme: "light",
    user: null,
    counter: 0
  },
  actions: {
    setTheme: (state, theme) => state.theme.value = theme,
    setUser: (state, user) => state.user.value = user,
    increment: (state) => state.counter.value++,
    decrement: (state) => state.counter.value--
  }
});
```

---

## Quick Start Example

```javascript
import Eleva from "eleva";
import { Store } from "eleva/plugins";

const app = new Eleva("CounterApp");

app.use(Store, {
  state: { count: 0 },
  actions: {
    increment: (state) => state.count.value++,
    decrement: (state) => state.count.value--,
    reset: (state) => state.count.value = 0,
    setCount: (state, value) => state.count.value = value
  }
});

app.component("Counter", {
  setup({ store }) {
    return {
      count: store.state.count,
      increment: () => store.dispatch("increment"),
      decrement: () => store.dispatch("decrement"),
      reset: () => store.dispatch("reset")
    };
  },
  template: (ctx) => `
    <div class="counter">
      <h2>Count: ${ctx.count.value}</h2>
      <button @click="decrement">-</button>
      <button @click="reset">Reset</button>
      <button @click="increment">+</button>
    </div>
  `
});

app.mount(document.getElementById("app"), "Counter");
// Result: Interactive counter with increment, decrement, and reset
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     STORE DATA FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      │
│  │  Component  │      │  Component  │      │  Component  │      │
│  │      A      │      │      B      │      │      C      │      │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘      │
│         │                    │                    │             │
│         │   store.dispatch("action", payload)     │             │
│         └──────────────────┬──────────────────────┘             │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      STORE                              │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │                    Actions                      │    │    │
│  │  │  increment: (state) => state.count.value++      │    │    │
│  │  └────────────────────┬────────────────────────────┘    │    │
│  │                       │                                 │    │
│  │                       ▼                                 │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │                    State                        │    │    │
│  │  │  count: Signal(0)                               │    │    │
│  │  │  user: Signal(null)                             │    │    │
│  │  └────────────────────┬────────────────────────────┘    │    │
│  │                       │  Signal notifies watchers       │    │
│  │                       ▼                                 │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              Subscribers                        │    │    │
│  │  │  - Logging, Analytics, Persistence              │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  Component  │    │  Component  │    │  Component  │          │
│  │  A (update) │    │  B (update) │    │  C (update) │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flow Description

1. **Component dispatches action** → `store.dispatch("action", payload)`
2. **Store executes action** → Action function mutates state signals
3. **State signals notify** → All watching components are notified
4. **Subscribers called** → Logging, analytics, persistence run
5. **Components re-render** → Only affected components update
6. **Persistence saves** → If enabled, state is saved to storage

---

## Next Steps

- [Core Concepts](./core-concepts.md) - Learn about state, actions, and namespaces
- [Configuration](./configuration.md) - Set up persistence and DevTools
- [Usage Patterns](./patterns.md) - Real-world examples

---

[← Back to Plugins](../index.md) | [Next: Core Concepts →](./core-concepts.md)

---
title: Eleva.js Store Plugin - Centralized State Management
description: Manage global state with Eleva Store. Actions, namespaces, localStorage persistence, and devtools. A lightweight Redux/Vuex alternative in just ~2KB gzipped.
image: /imgs/eleva.js%20Full%20Logo.png
---

<link rel="canonical" href="https://elevajs.com/plugins/store/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/store/">
<meta property="og:title" content="Store Plugin - Eleva.js">
<meta property="og:description" content="Manage global state with Eleva Store. Actions, namespaces, localStorage persistence. A lightweight Redux/Vuex alternative.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/store/">
<meta name="twitter:title" content="Store Plugin - Eleva.js">
<meta name="twitter:description" content="Manage global state with Eleva Store. Actions, namespaces, localStorage persistence. A lightweight Redux/Vuex alternative.">
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
  "headline": "Eleva.js Store Plugin - Centralized State Management",
  "description": "Eleva.js Store plugin for reactive global state with actions, namespaces, persistence, and devtools. Redux-like patterns in ~2KB gzipped.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "datePublished": "2026-01-01T00:00:00Z",
  "dateModified": "2026-02-08T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "email": "tarek.m.raafat@gmail.com",
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

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Plugins", "item": "https://elevajs.com/plugins/" },
    { "@type": "ListItem", "position": 3, "name": "Store", "item": "https://elevajs.com/plugins/store/" }
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Eleva Store",
  "alternateName": ["@eleva/store", "eleva-store", "Eleva.js Store"],
  "description": "Centralized state management plugin for Eleva.js. Actions, namespaces, localStorage/sessionStorage persistence, and devtools integration. Lightweight Redux/Vuex/Pinia alternative.",
  "url": "https://elevajs.com/plugins/store/",
  "applicationCategory": "DeveloperApplication",
  "applicationSubCategory": "JavaScript State Management Plugin",
  "operatingSystem": "Cross-platform (Web Browser)",
  "softwareVersion": "1.2.0",
  "datePublished": "2026-01-12",
  "downloadUrl": "https://www.npmjs.com/package/eleva",
  "installUrl": "https://www.npmjs.com/package/eleva",
  "fileSize": "2KB gzipped",
  "storageRequirements": "~6KB minified (~2KB gzipped)",
  "softwareRequirements": "Eleva.js core framework",
  "featureList": [
    "Reactive global state with signals",
    "Action-based state mutations",
    "Namespace organization",
    "localStorage persistence",
    "sessionStorage persistence",
    "Emitter events for cross-plugin observability",
    "DevTools integration",
    "State subscriptions",
    "Module system"
  ],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat",
    "email": "tarek.m.raafat@gmail.com"
  },
  "license": "https://opensource.org/licenses/MIT",
  "isAccessibleForFree": true,
  "codeRepository": "https://github.com/TarekRaafat/eleva",
  "isPartOf": {
    "@type": "SoftwareApplication",
    "name": "Eleva.js",
    "url": "https://elevajs.com"
  },
  "sameAs": [
    "https://www.npmjs.com/package/eleva",
    "https://github.com/TarekRaafat/eleva",
    "https://www.jsdelivr.com/package/npm/eleva",
    "https://unpkg.com/eleva",
    "https://bundlephobia.com/package/eleva"
  ]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "Eleva Store - 30-Second Setup Example",
  "description": "Complete Store plugin example showing global state definition, actions for state mutations, and component integration with store.state and store.dispatch().",
  "programmingLanguage": {
    "@type": "ComputerLanguage",
    "name": "JavaScript"
  },
  "runtimePlatform": "Browser (ES6+)",
  "codeSampleType": "full solution",
  "author": {
    "@type": "Person",
    "name": "Tarek Raafat",
    "url": "https://github.com/TarekRaafat"
  },
  "isPartOf": {
    "@type": "SoftwareApplication",
    "name": "Eleva Store",
    "url": "https://elevajs.com/plugins/store/"
  },
  "license": "https://opensource.org/licenses/MIT",
  "learningResourceType": "Tutorial",
  "teaches": ["Global state management", "Actions", "State dispatch", "Reactive updates"]
}
</script>

# Store Plugin

> **Version:** 1.2.0 | **Type:** State Management Plugin | **Bundle Size:** ~6KB minified (~2KB gzipped) | **Dependencies:** Eleva core (Signal system)

The Store plugin provides centralized, reactive state management for Eleva applications. It enables sharing data across the entire application with automatic UI updates, action-based mutations, namespace organization, and built-in persistence.

---

## Prerequisites

Before using the Store Plugin, you should be familiar with:

- [Getting Started](../../getting-started.md) — Basic Eleva setup and your first app
- [Core Concepts](../../core-concepts.md) — Signals, emitters, and reactivity
- [Components](../../components.md) — Component structure and setup function

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
| `store.getState()` | Get non-reactive snapshot (filtered by persistence config) | `Object` |
| `store.registerModule(name, module)` | Add dynamic module | `void` |
| `store.unregisterModule(name)` | Remove module | `void` |
| `store.createState(key, value)` | Add state property | `Signal` |
| `store.createAction(name, fn)` | Add action | `void` |
| `store.signal` | Signal class (use with `new`) | `Class` |

**App instance only (`app.store`):**

| Method | Description | Returns |
|--------|-------------|---------|
| `store.replaceState(newState)` | Replace state (filtered by persistence config) | `void` |
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
| **Emitter Events** | `store:*` events via `eleva.emitter` for cross-plugin observability |
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
<!-- Option 1: Bundled plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva-plugins.umd.min.js"></script>

<script>
  const app = new Eleva("MyApp");
  app.use(ElevaPlugins.Store, { /* options */ });
</script>

<!-- Option 2: Individual plugin -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/store.umd.min.js"></script>

<script>
  const app = new Eleva("MyApp");
  app.use(ElevaStore, { /* options */ });
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
- [Advanced](./advanced.md) - Middleware, DevTools, and computed state
- [API Reference](./api.md) - Complete API documentation

---

## Related Documentation

- [State Patterns](../../examples/patterns/state/) - State management examples
- [Router Plugin](../router/) - Combine for route-based state
- [Migration from React](../../migration/from-react.md) - Redux/Context → Eleva Store
- [Migration from Vue](../../migration/from-vue.md) - Vuex/Pinia → Eleva Store
- [Storage Patterns](../../examples/patterns/storage.md) - Persistence examples

---

[← Back to Plugins](../index.md) | [Next: Core Concepts →](./core-concepts.md)

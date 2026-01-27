---
title: Eleva.js Plugins - Router, Store & Attr
description: Extend Eleva.js with official plugins for routing, state management, and attribute binding. Tree-shakeable, zero-config, and fully typed.
image: /imgs/eleva.js%20Full%20Logo.png
---

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
  "headline": "Eleva.js Plugins - Router, Store & Attr",
  "description": "Extend Eleva.js with official plugins for routing, state management, and attribute binding. Tree-shakeable, zero-config, and fully typed.",
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
    "@id": "https://elevajs.com/plugins/"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Plugins",
  "keywords": ["eleva", "elevajs", "Eleva.js", "plugins", "router", "store", "attr", "state management", "routing"]
}
</script>

# Eleva Plugins

> **Version:** 1.1.0 | **All plugins are optional and tree-shakeable**

Eleva's plugin system extends the core framework with powerful optional features. Plugins come in two types: **Core Plugins** maintained by the Eleva team, and **External Plugins** created by the community.

---

## Plugin Types

| Type | Source | Installation | Compatibility |
|------|--------|--------------|---------------|
| **Core Plugins** | Bundled with Eleva | `import { X } from "eleva/plugins"` | Guaranteed |
| **External Plugins** | Community/Ecosystem | `npm install eleva-plugin-x` | Check version |

### Core Plugins (Official)

Core plugins are **built and maintained by the Eleva team**. They are:
- Bundled with the `eleva` package (no extra installation)
- Tested against every Eleva release
- Guaranteed to work with the current version
- Documented in this official documentation

```javascript
// Core plugins - import from "eleva/plugins"
import { Attr, Router, Store } from "eleva/plugins";
```

### External Plugins (Community)

External plugins are **created by the community**. They are:
- Installed separately via npm/yarn/pnpm
- Maintained by their respective authors
- May have different release cycles
- Should specify compatible Eleva versions

```javascript
// External plugins - import from their package
import { SomePlugin } from "eleva-plugin-some";
import { AnotherPlugin } from "@community/eleva-another";

// Usage is the same
app.use(SomePlugin, { /* options */ });
```

> **Creating External Plugins?** See the [Custom Plugin Guide](../examples/custom-plugin/index.md) for the plugin API.

---

## Quick Start

```javascript
import Eleva from "eleva";
import { Attr, Router, Store } from "eleva/plugins";

const app = new Eleva("MyApp");

// Install plugins as needed
app.use(Attr);
app.use(Store, { state: { count: 0 } });
app.use(Router, { routes: [...] });
```

> **Template Context Quick Rule:** `${}` needs `ctx.` — `@events` and `:props` don't.
> ```js
> template: (ctx) => `
>   <p>${ctx.count.value}</p>        // ✓ ${} uses ctx.
>   <button @click="increment">+</button>  // ✓ @event no ctx.
>   <child :data="items.value"></child>    // ✓ :prop no ctx.
> `
> ```
> See [Template Syntax](../index.md#template-syntax) for details.

---

## Core Plugins

| Plugin | Purpose | Size | Docs |
|--------|---------|------|------|
| **Attr** | ARIA, data-*, boolean attribute handling | ~2.2KB | [View →](./attr/) |
| **Router** | Client-side routing & navigation guards | ~15KB | [View →](./router/) |
| **Store** | Global state management & persistence | ~6KB | [View →](./store/) |

---

## Core Plugin Overview

### Attr Plugin

Intelligent attribute binding for accessibility and dynamic properties.

```javascript
app.use(Attr);

app.component("Button", {
  setup: ({ signal }) => ({ disabled: signal(false) }),
  template: (ctx) => `
    <button
      aria-disabled="${ctx.disabled.value}"
      disabled="${ctx.disabled.value}">
      Click me
    </button>
  `
});
```

**Key Features:**
- ARIA attribute handling
- Data attribute binding
- Boolean attribute management
- Dynamic property detection

[Full Attr Documentation →](./attr/)

---

### Router Plugin

Complete client-side routing with navigation guards and reactive state.

```javascript
const router = app.use(Router, {
  mode: "hash",
  mount: "#app",
  routes: [
    { path: "/", component: HomePage },
    { path: "/users/:id", component: UserPage },
    { path: "*", component: NotFoundPage }
  ]
});
// Router starts automatically (autoStart: true by default)

// Navigate programmatically
await router.navigate("/users/123");

// Access reactive route state
router.currentRoute.watch(route => console.log(route.path));
```

**Key Features:**
- Hash, history, and query routing modes
- Navigation guards (global and per-route)
- Reactive route signals
- Lazy component loading
- Layout system

[Full Router Documentation →](./router/)

---

### Store Plugin

Centralized state management with persistence and subscriptions.

```javascript
app.use(Store, {
  state: { count: 0, user: null },
  actions: {
    increment: (state) => state.count.value++,
    setUser: (state, user) => state.user.value = user
  },
  persist: { key: "app-state", storage: "localStorage" }
});

app.component("Counter", {
  setup: ({ store }) => ({
    count: store.state.count,
    increment: () => store.dispatch("increment")
  }),
  template: (ctx) => `
    <button @click="increment">Count: ${ctx.count.value}</button>
  `
});
```

**Key Features:**
- Reactive state with Signals
- Action-based mutations
- Namespace organization
- Built-in persistence
- Subscription system

[Full Store Documentation →](./store/)

---

## Installation

### Via Package Manager

```bash
npm install eleva
# or
yarn add eleva
# or
pnpm add eleva
# or
bun add eleva
```

### Import Patterns

```javascript
// Import specific plugins (recommended)
import { Attr } from "eleva/plugins";
import { Router } from "eleva/plugins";
import { Store } from "eleva/plugins";

// Import all plugins
import { Attr, Router, Store } from "eleva/plugins";

// Import from specific paths (alternative)
import { Attr } from "eleva/plugins/attr";
import { Router } from "eleva/plugins/router";
import { Store } from "eleva/plugins/store";
```

### Via CDN

```html
<!-- All plugins bundled -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva-plugins.umd.min.js"></script>

<!-- Individual plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/attr.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/router.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/store.umd.min.js"></script>
```

---

## When to Use Each Core Plugin

| Scenario | Recommended Plugin |
|----------|-------------------|
| Building accessible UIs | Attr |
| Multi-page SPA navigation | Router |
| Sharing state across components | Store |
| Form handling with validation | Attr |
| Authenticated routes | Router + Store |
| E-commerce cart | Store |

---

## Core Plugin Compatibility

All core plugins work independently or together:

```javascript
// Use all plugins together
const app = new Eleva("MyApp");

app.use(Attr);                    // Attribute handling
app.use(Store, { state: {} });    // State management
app.use(Router, { routes: [] }); // Routing

// Plugins enhance each other
app.component("Dashboard", {
  setup: ({ store, router }) => ({
    user: store.state.user,
    navigate: (path) => router.navigate(path)
  }),
  template: (ctx) => `
    <div
      aria-label="Dashboard for ${ctx.user.value?.name}"
      data-user-id="${ctx.user.value?.id}">
      <button @click="() => navigate('/settings')">Settings</button>
    </div>
  `
});
```

---

## External Plugins (Ecosystem)

The Eleva community creates and maintains external plugins that extend the framework's capabilities. External plugins follow the same `app.use()` API but are installed separately.

### Using External Plugins

```javascript
// 1. Install the plugin
// npm install eleva-plugin-analytics

// 2. Import and use
import Eleva from "eleva";
import { Analytics } from "eleva-plugin-analytics";

const app = new Eleva("MyApp");
app.use(Analytics, { trackingId: "UA-XXXXX" });
```

### Creating Your Own Plugin

Plugins receive the Eleva instance and can extend it with new functionality:

```javascript
// my-plugin.js
export const MyPlugin = {
  name: "MyPlugin",
  version: "1.0.0",
  install(eleva, options = {}) {
    // Add properties to the app
    eleva.myFeature = { /* ... */ };

    // Extend component context
    const originalMount = eleva.mount.bind(eleva);
    eleva.mount = async (container, name, props) => {
      // Add plugin data to components
      return originalMount(container, name, {
        ...props,
        myPlugin: options
      });
    };
  }
};
```

> **Full Guide:** See the [Custom Plugin Guide](../examples/custom-plugin/index.md) for detailed instructions, best practices, and examples.

### Plugin Conventions

When creating or using external plugins:

| Convention | Description |
|------------|-------------|
| **Package naming** | `eleva-plugin-*` or `@scope/eleva-*` |
| **Version compatibility** | Specify `peerDependencies: { "eleva": "^1.0.0" }` |
| **Export structure** | Named export matching plugin name |
| **Options** | Accept configuration object in `install()` |
| **Documentation** | Include compatible Eleva versions |

---

[← Back to Main Docs](../index.md) | [Attr Plugin →](./attr/index.md)

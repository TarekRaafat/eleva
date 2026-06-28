---
title: Eleva.js Plugins - Router, Store, Attr & Agent
description: Official Eleva.js plugins. Router for SPA navigation, Store for state management, Attr for accessibility, Agent for AI integration. All tree-shakeable, typed, and zero-config.
image: /imgs/eleva.js%20Full%20Logo.png
---

<!-- REVU Analytics -->
<script async src="https://cdn.revu.ai/behavior"></script>
<script>
  window.revu = window.revu || new Proxy({q:[]}, {
    get: (t, m) => m in t ? t[m] : (...a) => t.q.push([m, ...a]),
  });
  revu.init({ apiKey: "revu_pk_prod_KFdyizGp4I0cWia36eNmWg" });
</script>

<link rel="canonical" href="https://elevajs.com/plugins/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://elevajs.com/plugins/">
<meta property="og:title" content="Plugins - Eleva.js">
<meta property="og:description" content="Official Eleva.js plugins: Router for SPA navigation, Store for state management, Attr for accessibility, Agent for AI integration. All tree-shakeable, typed, and zero-config.">
<meta property="og:image" content="https://elevajs.com/imgs/eleva.js%20Full%20Logo.png">
<meta property="og:site_name" content="Eleva.js">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://elevajs.com/plugins/">
<meta name="twitter:title" content="Plugins - Eleva.js">
<meta name="twitter:description" content="Official Eleva.js plugins: Router for SPA navigation, Store for state management, Attr for accessibility, Agent for AI integration. All tree-shakeable, typed, and zero-config.">
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
  "headline": "Eleva.js Plugins - Router, Store, Attr & Agent",
  "description": "Extend Eleva.js with official plugins for routing, state management, attribute binding, and AI agent integration. Tree-shakeable, zero-config, and fully typed.",
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
    "@id": "https://elevajs.com/plugins/"
  },
  "proficiencyLevel": "Intermediate",
  "articleSection": "Plugins",
  "keywords": ["eleva", "elevajs", "Eleva.js", "plugins", "router", "store", "attr", "agent", "state management", "routing", "AI integration"]
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://elevajs.com/" },
    { "@type": "ListItem", "position": 2, "name": "Plugins", "item": "https://elevajs.com/plugins/" }
  ]
}
</script>

# Eleva Plugins

> **Version:** 1.2.0 | **All plugins are optional and tree-shakeable**

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
import { Attr, Router, Store, Agent } from "eleva/plugins";
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
import { Attr, Router, Store, Agent } from "eleva/plugins";

const app = new Eleva("MyApp");

// Install plugins as needed
app.use(Attr);
app.use(Store, { state: { count: 0 } });
app.use(Router, { routes: [...] });
app.use(Agent, { actions: { ping: () => "pong" } });
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

| Plugin | Purpose | Size (gzipped) | Docs |
|--------|---------|----------------|------|
| **Attr** | ARIA, data-*, boolean attribute handling | ~1.0KB | [View →](./attr/) |
| **Router** | Client-side routing & navigation guards | ~4.6KB | [View →](./router/) |
| **Store** | Global state management & persistence | ~2.0KB | [View →](./store/) |
| **Agent** | AI/agent integration, action registry & audit log | ~3.5KB | [View →](./agent/) |

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
  persistence: { key: "app-state", storage: "localStorage" }
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

### Agent Plugin

AI and agent integration with action registry, command bus, and audit logging.

```javascript
app.use(Agent, {
  actions: { ping: () => "pong" },
  permissions: { "ui-agent": { actions: ["ping"] } }
});

app.component("SmartWidget", {
  setup: ({ agent }) => ({
    run: async () => {
      const result = await agent.execute("ping");
      console.log(result); // "pong"
    },
    tools: () => agent.listActions()
  }),
  template: (ctx) => `
    <button @click="run">Ping Agent</button>
  `
});
```

**Key Features:**
- Action registry with typed schemas
- Structured command bus
- Audit logging with rotation
- Capability-based permissions
- State inspection and snapshots

[Full Agent Documentation →](./agent/)

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
import { Agent } from "eleva/plugins";

// Import all plugins
import { Attr, Router, Store, Agent } from "eleva/plugins";

// Import from specific paths (alternative)
import { Attr } from "eleva/plugins/attr";
import { Router } from "eleva/plugins/router";
import { Store } from "eleva/plugins/store";
import { Agent } from "eleva/plugins/agent";
```

### Via CDN

```html
<!-- Option 1: All plugins bundled -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva-plugins.umd.min.js"></script>
<script>
  // Access via ElevaPlugins global
  app.use(ElevaPlugins.Attr);
  app.use(ElevaPlugins.Router, { /* options */ });
  app.use(ElevaPlugins.Store, { /* options */ });
  app.use(ElevaPlugins.Agent, { /* options */ });
</script>

<!-- Option 2: Individual plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/attr.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/router.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/store.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/agent.umd.min.js"></script>
<script>
  // Each plugin is a direct global — use it directly
  app.use(ElevaAttr);
  app.use(ElevaRouter, { /* options */ });
  app.use(ElevaStore, { /* options */ });
  app.use(ElevaAgent, { /* options */ });
</script>
```

**When to use each:**
| Approach | Best For |
|----------|----------|
| Bundled | Using 2+ plugins, simpler setup |
| Individual | Using only 1 plugin, smaller bundle size |

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
| AI/LLM tool integration | Agent |
| Cross-component messaging | Agent |
| Action audit trail and logging | Agent |
| Multi-agent coordination | Agent + Store |

---

## Core Plugin Compatibility

All core plugins work independently or together:

```javascript
// Use all plugins together
const app = new Eleva("MyApp");

app.use(Attr);                    // Attribute handling
app.use(Store, { state: {} });    // State management
app.use(Router, { routes: [] }); // Routing
app.use(Agent, { emitterEvents: ["router:", "store:"] }); // Agent integration

// Plugins enhance each other
app.component("Dashboard", {
  setup: ({ store, router, agent }) => ({
    user: store.state.user,
    navigate: (path) => router.navigate(path),
    tools: () => agent.listActions()
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

---

## Quick Links to Plugin Documentation

### Attr Plugin
- [Overview](./attr/) · [Features](./attr/features.md) · [Patterns](./attr/patterns.md) · [API Reference](./attr/api.md)

### Router Plugin
- [Overview](./router/) · [Configuration](./router/configuration.md) · [Navigation](./router/navigation.md) · [Guards](./router/guards.md) · [Lazy Loading](./router/lazy-loading.md) · [API Reference](./router/api.md)

### Store Plugin
- [Overview](./store/) · [Core Concepts](./store/core-concepts.md) · [Configuration](./store/configuration.md) · [Patterns](./store/patterns.md) · [Advanced](./store/advanced.md) · [API Reference](./store/api.md)

### Agent Plugin
- [Overview](./agent/) · [Patterns](./agent/patterns.md) · [API Reference](./agent/api.md)

---

[← Back to Main Docs](../index.md) | [Attr Plugin →](./attr/index.md)

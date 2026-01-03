# Eleva Plugins

> **Version:** 1.0.0-rc.10 | **All plugins are optional and tree-shakeable**

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
import { Attr, Props, Router, Store } from "eleva/plugins";
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

> **Creating External Plugins?** See the [Custom Plugin Guide](../examples/custom-plugin.md) for the plugin API.

---

## Quick Start

```javascript
import Eleva from "eleva";
import { Attr, Props, Router, Store } from "eleva/plugins";

const app = new Eleva("MyApp");

// Install plugins as needed
app.use(Attr);
app.use(Props);
app.use(Store, { state: { count: 0 } });
app.use(Router, { routes: [...] });
```

> **Template Context Quick Rule:** `${}` needs `ctx.` — `{{ }}` and `@events` don't.
> ```js
> template: (ctx) => `
>   <p>${ctx.count.value}</p>        // ✓ ${} uses ctx.
>   <p>{{ count.value }}</p>          // ✓ {{ }} no ctx.
>   <button @click="increment">+</button>  // ✓ @event no ctx.
> `
> ```
> See [Template Interpolation](../index.md#template-interpolation) for details.

---

## Core Plugins

| Plugin | Purpose | Size | Docs |
|--------|---------|------|------|
| **Attr** | ARIA, data-*, boolean attribute handling | ~2.4KB | [View →](./attr.md) |
| **Props** | Complex prop parsing & reactivity | ~4.2KB | [View →](./props.md) |
| **Router** | Client-side routing & navigation guards | ~15KB | [View →](./router.md) |
| **Store** | Global state management & persistence | ~6KB | [View →](./store.md) |

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

[Full Attr Documentation →](./attr.md)

---

### Props Plugin

Advanced props handling with automatic type detection and reactivity.

```javascript
app.use(Props);

// Parent passes complex data
app.component("Parent", {
  setup: ({ signal }) => ({ user: signal({ name: "John", age: 30 }) }),
  template: (ctx) => `
    <div class="child" :user='${JSON.stringify(ctx.user.value)}'></div>
  `,
  children: { ".child": "Child" }
});

// Child receives parsed, reactive props
app.component("Child", {
  setup: ({ props }) => ({ user: props.user }),
  template: (ctx) => `<p>${ctx.user.value.name} is ${ctx.user.value.age}</p>`
});
```

**Key Features:**
- Automatic type parsing (objects, arrays, dates, booleans)
- Reactive prop updates
- Custom error handling

[Full Props Documentation →](./props.md)

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

await router.start();

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

[Full Router Documentation →](./router.md)

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

[Full Store Documentation →](./store.md)

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
import { Props } from "eleva/plugins";
import { Router } from "eleva/plugins";
import { Store } from "eleva/plugins";

// Import all plugins
import { Attr, Props, Router, Store } from "eleva/plugins";

// Import from specific paths (alternative)
import { Attr } from "eleva/plugins/attr";
import { Router } from "eleva/plugins/router";
```

### Via CDN

```html
<!-- All plugins bundled -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/eleva-plugins.umd.min.js"></script>

<!-- Individual plugins -->
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/attr.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/props.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/router.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/eleva/dist/plugins/store.umd.min.js"></script>
```

---

## When to Use Each Core Plugin

| Scenario | Recommended Plugin |
|----------|-------------------|
| Building accessible UIs | Attr |
| Passing complex data to children | Props |
| Multi-page SPA navigation | Router |
| Sharing state across components | Store |
| Form handling with validation | Attr + Props |
| Authenticated routes | Router + Store |
| E-commerce cart | Store + Props |

---

## Core Plugin Compatibility

All core plugins work independently or together:

```javascript
// Use all plugins together
const app = new Eleva("MyApp");

app.use(Attr);                    // Attribute handling
app.use(Props);                   // Props parsing
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

> **Full Guide:** See the [Custom Plugin Guide](../examples/custom-plugin.md) for detailed instructions, best practices, and examples.

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

[← Back to Main Docs](../index.md)

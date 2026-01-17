---
title: Eleva.js Plugin System
description: Learn how to create, install, and use plugins in Eleva. Covers plugin structure, capabilities, lifecycle, and built-in plugins.
---

# Plugin System

> **Core Docs** | Creating, installing, and using plugins.

The Plugin System provides a powerful way to extend the framework's functionality. Plugins can add new features, modify existing behavior, or integrate with external libraries.

---

## Plugin Structure

A plugin in Eleva is an object with required and optional properties:

```javascript
const MyPlugin = {
  name: "myPlugin",       // Required: Unique identifier
  version: "1.0.0",       // Optional: Semantic version string
  install(eleva, options) {
    // Required: Plugin installation logic
    const originalMount = eleva.mount;
    eleva._originalMount = originalMount;  // Store for cleanup
    eleva.mount = function(...args) {
      // Enhanced behavior
      return originalMount.call(this, ...args);
    };
  },
  uninstall(eleva) {
    // Optional but recommended: Cleanup logic
    if (eleva._originalMount) {
      eleva.mount = eleva._originalMount;
      delete eleva._originalMount;
    }
  }
};
```

| Property | Type | Required | Description |
|----------|------|:--------:|-------------|
| `name` | string | Yes | Unique identifier for the plugin |
| `version` | string | No | Semantic version (e.g., "1.0.0") |
| `install` | function | Yes | Called when plugin is registered via `app.use()` |
| `uninstall` | function | No | Called to clean up and restore original behavior |

---

## Installing Plugins

Plugins are installed using the `use` method:

```javascript
const app = new Eleva("myApp");
app.use(MyPlugin, { /* optional configuration */ });
```

The `use` method:
- Calls the plugin's `install` function with the Eleva instance and options
- Stores the plugin in an internal registry
- Returns the Eleva instance for method chaining

---

## Plugin Capabilities

### 1. Extend the Eleva Instance

```javascript
install(eleva) {
  eleva.newMethod = () => { /* ... */ };
}
```

### 2. Add Component Features

```javascript
install(eleva) {
  eleva.component("enhanced-component", {
    template: (ctx) => `...`,
    setup: (ctx) => ({ /* ... */ })
  });
}
```

### 3. Modify Component Behavior

```javascript
install(eleva) {
  const originalMount = eleva.mount;
  eleva.mount = function(container, compName, props) {
    // Add pre-mount logic
    const result = originalMount.call(this, container, compName, props);
    // Add post-mount logic
    return result;
  };
}
```

### 4. Add Global State or Services

```javascript
install(eleva) {
  eleva.services = {
    api: new ApiService(),
    storage: new StorageService()
  };
}
```

---

## Plugin Development Best Practices

### 1. Naming Conventions

- Use unique, descriptive names for plugins
- Follow the pattern: `eleva-{plugin-name}` for published plugins

### 2. Error Handling

- Implement proper error handling in plugin methods
- Provide meaningful error messages for debugging

### 3. Documentation

- Document plugin options and methods
- Include usage examples
- Specify any dependencies or requirements

### 4. Performance

- Keep plugin initialization lightweight
- Use lazy loading for heavy features
- Clean up resources when components unmount

---

## Example Plugin: Logger

Here's a complete example of a custom plugin with proper cleanup:

```javascript
const Logger = {
  name: "logger",
  version: "1.0.0",

  install(eleva, options = {}) {
    const { level = "info" } = options;

    // Add logging methods to Eleva instance
    eleva.log = {
      info: (msg) => console.log(`[INFO] ${msg}`),
      warn: (msg) => console.warn(`[WARN] ${msg}`),
      error: (msg) => console.error(`[ERROR] ${msg}`),
    };

    // Store original for cleanup
    const originalMount = eleva.mount;
    eleva._logger_originalMount = originalMount;

    // Enhance component mounting with logging
    eleva.mount = async function(container, compName, props) {
      eleva.log.info(`Mounting component: ${compName}`);
      const result = await originalMount.call(this, container, compName, props);
      eleva.log.info(`Component mounted: ${compName}`);
      return result;
    };
  },

  uninstall(eleva) {
    // Restore original mount method
    if (eleva._logger_originalMount) {
      eleva.mount = eleva._logger_originalMount;
      delete eleva._logger_originalMount;
    }

    // Remove added properties
    delete eleva.log;

    // Remove from plugin registry
    if (eleva._plugins) {
      eleva._plugins.delete(this.name);
    }
  }
};

// Usage
const app = new Eleva("myApp");
app.use(Logger, { level: "debug" });

// Later, to uninstall:
// Logger.uninstall(app);
```

---

## Plugin Lifecycle

### 1. Installation

- Plugin is registered with the Eleva instance via `app.use()`
- `install` function is called with the instance and options
- Plugin is stored in the internal `_plugins` Map
- Returns the Eleva instance for method chaining

### 2. Runtime

- Plugin methods are available throughout the application lifecycle
- Can interact with components and the Eleva instance
- Can respond to component lifecycle events
- Plugin state persists across all component mounts/unmounts

### 3. Cleanup (Uninstall)

Plugins can implement an `uninstall()` method for proper cleanup:

```javascript
const MyPlugin = {
  name: "myPlugin",
  install(eleva, options) {
    // Store originals for later restoration
    const originalMount = eleva.mount;
    eleva._myPlugin_originalMount = originalMount;

    // Wrap methods
    eleva.mount = function(...args) {
      console.log("Enhanced mount");
      return originalMount.call(this, ...args);
    };

    // Add properties
    eleva.myFeature = { /* ... */ };
  },
  uninstall(eleva) {
    // Restore wrapped methods
    if (eleva._myPlugin_originalMount) {
      eleva.mount = eleva._myPlugin_originalMount;
      delete eleva._myPlugin_originalMount;
    }

    // Remove added properties
    delete eleva.myFeature;

    // Remove from plugin registry
    if (eleva._plugins) {
      eleva._plugins.delete(this.name);
    }
  }
};
```

**What to clean up in `uninstall()`:**

| Resource | Cleanup Action |
|----------|----------------|
| Wrapped methods (`mount`, `_patchNode`, etc.) | Restore to original functions |
| Added properties (`eleva.store`, `eleva.router`) | Delete from instance |
| Event listeners | Remove all subscriptions |
| Timers/intervals | Clear all timers |
| Plugin registry entry | Remove from `_plugins` Map |

---

## Plugin vs Component Cleanup

Understanding the difference between plugin cleanup and component cleanup is important:

```
┌─────────────────────────────────────────────────────────────┐
│  App Level (Eleva instance)                                 │
│  ├── Plugins live here (Store, Router, Attr)                │
│  │   └── Cleanup: plugin.uninstall(eleva)                   │
│  │   └── Lifetime: Entire app session                       │
│  │                                                          │
│  └── Components mount/unmount throughout app lifetime       │
│      └── Component Level                                    │
│          └── Cleanup: onUnmount({ cleanup })                │
│          └── cleanup = { watchers, listeners, children }    │
│          └── Lifetime: Until component unmounts             │
└─────────────────────────────────────────────────────────────┘
```

**Key distinction:**
- **Component `cleanup` object** contains component-level resources (signal watchers, template event listeners, child components) that are auto-cleaned by Eleva
- **Plugin `uninstall()`** handles app-level resources (wrapped methods, global state, plugin properties) that must be manually restored

Plugins are **NOT** included in the component `cleanup` object because:
1. Plugins are app-level, components are instance-level
2. A component unmounting should not affect global plugins
3. Plugins persist across the entire app lifecycle

---

## Uninstall Order (LIFO)

When multiple plugins wrap the same methods, uninstall in **reverse order** (Last In, First Out):

```javascript
// Installation order
app.use(PluginA);  // Wraps mount first
app.use(PluginB);  // Wraps mount second (wraps PluginA's wrapper)

// Uninstall in reverse order
PluginB.uninstall(app);  // Unwrap second layer first
PluginA.uninstall(app);  // Unwrap first layer last
```

**Why LIFO matters:**

```javascript
// Original: eleva.mount
// After PluginA: PluginA.wrapper -> eleva.mount
// After PluginB: PluginB.wrapper -> PluginA.wrapper -> eleva.mount

// If you uninstall PluginA first (wrong order):
// Result: PluginB.wrapper -> eleva.mount (broken chain!)

// Correct LIFO order:
// Remove PluginB: PluginA.wrapper -> eleva.mount
// Remove PluginA: eleva.mount (original restored!)
```

### What Goes Wrong Without LIFO

#### Problem 1: Storage Key Collision

If two plugins use the same storage key (e.g., both use `_originalMount`), the second plugin overwrites the first's saved reference:

```javascript
// Plugin A installs first
eleva._originalMount = realOriginal;
eleva.mount = A_wrapper;

// Plugin B installs second - OVERWRITES A's saved original!
eleva._originalMount = A_wrapper;  // Lost reference to realOriginal!
eleva.mount = B_wrapper;

// Wrong order uninstall (A first):
A.uninstall(app);
// A restores: mount = _originalMount (A_wrapper, not realOriginal!)
// A deletes _originalMount

B.uninstall(app);
// B tries: mount = _originalMount
// ERROR: _originalMount is undefined!
```

#### Problem 2: Orphaned Wrappers

Even without key collision, wrong order breaks the wrapper chain:

```javascript
// State after installation:
// mount = B_wrapper → A_wrapper → original

// Wrong: Uninstall A first
A.uninstall(app);
// A restores: mount = original (bypassing B_wrapper!)
// B_wrapper is now orphaned - never gets called

// Any B functionality silently stops working!
```

#### Problem 3: Inconsistent State

```javascript
// After wrong-order uninstall:
// - Some plugin behavior may persist unexpectedly
// - Some plugin behavior may silently fail
// - Memory leaks from orphaned closures
// - Intermittent errors that are hard to debug
```

### Consequences Summary

| Issue | Symptom |
|-------|---------|
| **Silent bypass** | Plugin functionality stops working without errors |
| **Reference errors** | `Cannot read property of undefined` |
| **Partial cleanup** | Some plugin behavior persists unexpectedly |
| **Memory leaks** | Orphaned closures holding references |
| **Inconsistent state** | App works sometimes, fails other times |

### Best Practice: Namespaced Storage Keys

When creating custom plugins, always use **namespaced storage keys** to avoid collisions:

```javascript
// BAD: Generic key (may collide with other plugins)
const BadPlugin = {
  install(eleva) {
    eleva._originalMount = eleva.mount;  // Collision risk!
    eleva.mount = wrapper;
  }
};

// GOOD: Namespaced key (unique to this plugin)
const GoodPlugin = {
  install(eleva) {
    eleva._goodPlugin_originalMount = eleva.mount;  // Safe!
    eleva.mount = wrapper;
  },
  uninstall(eleva) {
    if (eleva._goodPlugin_originalMount) {
      eleva.mount = eleva._goodPlugin_originalMount;
      delete eleva._goodPlugin_originalMount;
    }
  }
};
```

### Built-in Plugins: No Direct Conflicts

The built-in plugins wrap **different methods**, so they don't conflict with each other:

| Plugin | Wraps | Storage Key |
|--------|-------|-------------|
| Attr | `renderer._patchNode` | `renderer._originalPatchNode` |
| Store | `mount`, `_mountComponents` | `_originalMount`, `_originalMountComponents` |
| Router | Nothing (uses own system) | N/A |

> **Warning for Custom Plugin Authors:** The Store plugin uses generic keys (`_originalMount`). If your custom plugin also wraps `mount()`, use a namespaced key like `_myPlugin_originalMount` to avoid conflicts with Store.

**Always follow LIFO order** for:
- Compatibility with custom plugins
- Future-proofing against framework changes
- Consistent, predictable behavior

---

## TypeScript Support

Eleva provides TypeScript declarations for plugin development:

```typescript
// Plugin type definitions
type PluginInstallFunction = (eleva: Eleva, options: PluginOptions) => void | Eleva | unknown;
type PluginUninstallFunction = (eleva: Eleva) => void;
type PluginOptions = Record<string, unknown>;

interface ElevaPlugin {
  name: string;                        // Required: unique identifier
  version?: string;                    // Optional: semantic version
  install: PluginInstallFunction;      // Required: installation logic
  uninstall?: PluginUninstallFunction; // Optional: cleanup logic
}

// Router plugins have an additional destroy hook
interface RouterPlugin {
  name: string;
  version?: string;
  install: (router: Router, options?: Record<string, any>) => void;
  destroy?: (router: Router) => void | Promise<void>;
}
```

This ensures type safety when developing plugins in TypeScript.

---

## Built-in Plugins

Eleva comes with three powerful built-in plugins:

| Plugin | Purpose | Size | Docs |
|--------|---------|------|------|
| **Attr** | ARIA, data-*, boolean attributes | ~2.4KB | [View →](./plugins/attr/) |
| **Router** | Client-side routing & guards | ~15KB | [View →](./plugins/router/) |
| **Store** | Global state management | ~6KB | [View →](./plugins/store/) |

### Attr Plugin

Advanced attribute handling with ARIA support:

```javascript
import { Attr } from 'eleva/plugins';

app.use(Attr, {
  enableAria: true,
  enableData: true,
  enableBoolean: true,
  enableDynamic: true
});
```

**Features:**
- ARIA Support - Automatic ARIA attribute handling
- Data Attributes - Seamless data attribute management
- Boolean Attributes - Intelligent boolean processing
- Dynamic Properties - Automatic property detection

[Full Attr Documentation →](./plugins/attr/)

### Router Plugin

Client-side routing with reactive state:

```javascript
import { Router } from 'eleva/plugins';

const router = app.use(Router, {
  mount: '#app',
  mode: 'hash',
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
    { path: '/users/:id', component: UserPage }
  ]
});

await router.start();
```

**Features:**
- Multiple Routing Modes - Hash, History API, Query parameter
- Navigation Guards - Global and route-specific
- Reactive State - Real-time route state updates
- Lazy Loading - Async component imports

[Full Router Documentation →](./plugins/router/)

### Store Plugin

Centralized state management:

```javascript
import { Store } from 'eleva/plugins';

app.use(Store, {
  state: { count: 0, user: null },
  actions: {
    increment: (state) => state.count.value++,
    setUser: (state, user) => state.user.value = user
  },
  persist: { key: "app-state", storage: "localStorage" }
});
```

**Features:**
- Reactive State - Signal-based state
- Actions - Controlled state mutations
- Namespaces - Organized state modules
- Persistence - Built-in localStorage/sessionStorage

[Full Store Documentation →](./plugins/store/)

### Plugin Installation

```javascript
import Eleva from 'eleva';
import { Attr, Router, Store } from 'eleva/plugins';

const app = new Eleva("MyApp");

// Install plugins
app.use(Attr);
app.use(Store, { state: {} });
app.use(Router, { routes: [] });
```

### Built-in Plugin Cleanup

All built-in plugins implement proper `uninstall()` methods:

| Plugin | What `uninstall()` Restores |
|--------|----------------------------|
| **Attr** | Restores `renderer._patchNode()`, removes `updateElementAttributes` |
| **Store** | Restores `mount()` and `_mountComponents()`, removes `store`, `dispatch`, `getState`, `subscribe`, `createAction` |
| **Router** | Calls `router.destroy()`, removes `router`, `navigate`, `getCurrentRoute`, `getRouteParams`, `getRouteQuery` |

**Router's `destroy()` method additionally:**
- Calls `destroy()` on any router-level plugins
- Removes event listeners (popstate, click handlers)
- Unmounts the current layout component
- Resets router state

```javascript
// Example: Proper cleanup order (LIFO)
app.use(Attr);
app.use(Store, { state: {} });
app.use(Router, { routes: [] });

// Later, to uninstall all plugins:
await Router.uninstall(app);  // Last installed, first uninstalled
Store.uninstall(app);
Attr.uninstall(app);
```

### Bundle Sizes

| Plugin | Minified | Gzipped |
|--------|----------|---------|
| Core | ~6KB | ~2.3KB |
| Attr | ~2.4KB | ~1KB |
| Router | ~15KB | ~5KB |
| Store | ~6KB | ~2KB |

---

## Creating a Custom Plugin

### Step 1: Define the Plugin

```javascript
// my-analytics-plugin.js
export const Analytics = {
  name: "analytics",
  version: "1.0.0",

  install(eleva, options = {}) {
    const { trackingId, debug = false } = options;

    // Initialize analytics
    if (debug) {
      console.log(`Analytics initialized with ID: ${trackingId}`);
    }

    // Add tracking methods
    eleva.analytics = {
      track(event, data) {
        if (debug) {
          console.log(`[Analytics] ${event}:`, data);
        }
        // Send to analytics service
      },
      page(path) {
        this.track('pageview', { path });
      }
    };

    // Store original for cleanup
    const originalMount = eleva.mount;
    eleva._analytics_originalMount = originalMount;

    // Auto-track component mounts
    eleva.mount = async function(container, compName, props) {
      const result = await originalMount.call(this, container, compName, props);
      eleva.analytics.track('component_mount', { component: compName });
      return result;
    };
  },

  uninstall(eleva) {
    // Restore original mount
    if (eleva._analytics_originalMount) {
      eleva.mount = eleva._analytics_originalMount;
      delete eleva._analytics_originalMount;
    }

    // Remove added properties
    delete eleva.analytics;

    // Remove from plugin registry
    if (eleva._plugins) {
      eleva._plugins.delete(this.name);
    }
  }
};
```

### Step 2: Use the Plugin

```javascript
import Eleva from 'eleva';
import { Analytics } from './my-analytics-plugin.js';

const app = new Eleva("MyApp");
app.use(Analytics, {
  trackingId: 'UA-XXXXX-Y',
  debug: true
});

// Now available throughout your app
app.analytics.track('button_click', { button: 'signup' });
```

### Step 3: Publish (Optional)

```json
// package.json
{
  "name": "eleva-plugin-analytics",
  "version": "1.0.0",
  "main": "dist/index.js",
  "peerDependencies": {
    "eleva": "^1.0.0"
  }
}
```

---

## Plugin Patterns

### Extending Setup Context

```javascript
install(eleva) {
  const originalMount = eleva.mount.bind(eleva);

  eleva.mount = async (container, compName, props) => {
    // Inject custom utilities into setup context
    const enhancedProps = {
      ...props,
      myUtility: () => { /* ... */ }
    };
    return originalMount(container, compName, enhancedProps);
  };
}
```

### Adding Lifecycle Hooks

```javascript
install(eleva) {
  eleva.onComponentMount = (callback) => {
    const originalMount = eleva.mount.bind(eleva);
    eleva.mount = async (...args) => {
      const result = await originalMount(...args);
      callback(result);
      return result;
    };
  };
}
```

### Global Event Bus

```javascript
install(eleva) {
  const events = new Map();

  eleva.bus = {
    on(event, handler) {
      if (!events.has(event)) events.set(event, []);
      events.get(event).push(handler);
      return () => this.off(event, handler);
    },
    off(event, handler) {
      const handlers = events.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    },
    emit(event, data) {
      const handlers = events.get(event);
      if (handlers) handlers.forEach(h => h(data));
    }
  };
}
```

---

## Next Steps

- **[Built-in Plugins](./plugins/index.md)** - Detailed plugin documentation
- **[Custom Plugin Guide](./examples/custom-plugin/index.md)** - Advanced plugin development
- **[Best Practices](./best-practices.md)** - Patterns and guidelines

---

[← Architecture](./architecture.md) | [Back to Main Docs](./index.md) | [Best Practices →](./best-practices.md)

---
title: Eleva.js Plugin System
description: Learn how to create, install, and use plugins in Eleva. Covers plugin structure, capabilities, lifecycle, and built-in plugins.
---

# Plugin System

> **Version:** 1.0.0 | This guide covers creating, installing, and using plugins to extend Eleva's functionality.

The Plugin System provides a powerful way to extend the framework's functionality. Plugins can add new features, modify existing behavior, or integrate with external libraries.

---

## Plugin Structure

A plugin in Eleva is an object with three required properties:

```javascript
const MyPlugin = {
  name: "myPlugin",       // Unique identifier for the plugin
  version: "1.0.0",       // Semantic version string
  install(eleva, options) {
    // Plugin installation logic
  },
};
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Unique identifier for the plugin |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `install` | function | Receives Eleva instance and options |

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

Here's a complete example of a custom plugin:

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

    // Enhance component mounting with logging
    const originalMount = eleva.mount;
    eleva.mount = async function(container, compName, props) {
      eleva.log.info(`Mounting component: ${compName}`);
      const result = await originalMount.call(this, container, compName, props);
      eleva.log.info(`Component mounted: ${compName}`);
      return result;
    };
  },
};

// Usage
const app = new Eleva("myApp");
app.use(Logger, { level: "debug" });
```

---

## Plugin Lifecycle

### 1. Installation

- Plugin is registered with the Eleva instance
- `install` function is called with the instance and options
- Plugin is stored in the internal registry

### 2. Runtime

- Plugin methods are available throughout the application lifecycle
- Can interact with components and the Eleva instance
- Can respond to component lifecycle events

### 3. Cleanup

- Plugins should clean up any resources they've created
- Remove event listeners and subscriptions
- Reset any modified behavior

---

## TypeScript Support

Eleva provides TypeScript declarations for plugin development:

```typescript
interface ElevaPlugin {
  name: string;
  version: string;
  install(eleva: Eleva, options?: Record<string, any>): void;
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

    // Auto-track component mounts
    const originalMount = eleva.mount;
    eleva.mount = async function(container, compName, props) {
      const result = await originalMount.call(this, container, compName, props);
      eleva.analytics.track('component_mount', { component: compName });
      return result;
    };
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

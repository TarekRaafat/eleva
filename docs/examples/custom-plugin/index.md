---
title: Creating Custom Plugins
description: Complete guide to building Eleva.js plugins. Learn plugin architecture, registration, and the basics of extending Eleva.
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Create a Custom Eleva.js Plugin",
  "description": "Learn how to create, register, and use custom plugins for Eleva.js to extend the framework's functionality.",
  "image": "https://elevajs.com/imgs/eleva.js%20Full%20Logo.png",
  "totalTime": "PT15M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Eleva.js application"
    },
    {
      "@type": "HowToSupply",
      "name": "Text editor or IDE"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "Node.js (v18 or higher)"
    },
    {
      "@type": "HowToTool",
      "name": "npm (v9 or higher)"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Define the plugin object",
      "text": "Create a JavaScript object with required properties: name (unique identifier), version (semantic version string), and install function that receives the Eleva instance and options.",
      "url": "https://elevajs.com/examples/custom-plugin/#plugin-basics"
    },
    {
      "@type": "HowToStep",
      "name": "Implement the install method",
      "text": "Add your plugin's functionality inside the install(eleva, options) method. This can include adding methods, wrapping existing methods, or creating new services on the Eleva instance.",
      "url": "https://elevajs.com/examples/custom-plugin/#quick-start"
    },
    {
      "@type": "HowToStep",
      "name": "Register the plugin with app.use()",
      "text": "Call app.use(MyPlugin) or app.use(MyPlugin, options) to register your plugin. The install method is called immediately with the Eleva instance.",
      "url": "https://elevajs.com/examples/custom-plugin/#registering-plugins"
    },
    {
      "@type": "HowToStep",
      "name": "Use the plugin in components",
      "text": "Access your plugin's features via the app instance in component setup functions. For example: app.myFeature.someMethod().",
      "url": "https://elevajs.com/examples/custom-plugin/#accessing-plugin-features"
    },
    {
      "@type": "HowToStep",
      "name": "Implement uninstall for cleanup (optional)",
      "text": "Add an uninstall(eleva) method to restore original methods and remove added properties. This enables proper cleanup when the plugin is removed.",
      "url": "https://elevajs.com/examples/custom-plugin/#plugin-cleanup-uninstall"
    }
  ]
}
</script>

# Creating a Custom Plugin for Eleva

> **Version:** 1.0.1 | Complete guide to creating, testing, and publishing Eleva plugins.

---

## Documentation Pages

- **[Getting Started](./index.md)** (this page) - Quick start, basics, registration
- **[Development Guide](./development.md)** - Project setup, testing strategies
- **[Best Practices](./best-practices.md)** - Error handling, TypeScript, publishing

---

## Quick Start

Here's a complete, minimal example of creating and registering a custom plugin:

```js
import Eleva from "eleva";

// 1. Define the plugin
const UtilsPlugin = {
  name: "utils",                          // Required: unique identifier
  version: "1.0.0",                       // Required: semantic version string
  install(eleva, options = {}) {          // Required: called when plugin is registered
    // Add utility methods to the Eleva instance
    eleva.utils = {
      formatDate: (date) => new Date(date).toLocaleDateString(),
      capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
      debounce: (fn, delay = 300) => {
        let timer;
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => fn(...args), delay);
        };
      }
    };
  }
};

// 2. Create Eleva instance
const app = new Eleva("MyApp");

// 3. Register the plugin with app.use()
app.use(UtilsPlugin);                     // Without options
// OR
app.use(UtilsPlugin, { locale: "en-US" }); // With options

// 4. Use the plugin in components
app.component("DateDisplay", {
  setup: () => ({
    formatted: app.utils.formatDate(Date.now())  // Access via app instance
  }),
  template: (ctx) => `<p>Today: ${ctx.formatted}</p>`
});

app.mount(document.getElementById("app"), "DateDisplay");
```

---

## Prerequisites

Before you start, ensure you have:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Basic understanding of JavaScript/TypeScript
- Familiarity with Eleva's core concepts

---

## Plugin Basics

An Eleva plugin is a JavaScript object that extends the framework's functionality. Every plugin must have:

1. A unique `name` property (string)
2. A `version` property following semantic versioning (string)
3. An `install` method that receives the Eleva instance and options

```js
const MyPlugin = {
  name: "myPlugin",
  version: "1.0.0",
  install(eleva, options) {
    // Plugin implementation
  }
};
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Unique identifier for the plugin |
| `version` | `string` | Yes | Semantic version (e.g., "1.0.0", "2.1.3") |
| `install` | `function` | Yes | Called with `(eleva, options)` during registration |
| `uninstall` | `function` | No | Optional cleanup when plugin is removed |

---

## Registering Plugins

Plugins are registered using the `app.use()` method. This method calls the plugin's `install` function with the Eleva instance and any provided options.

### Basic Registration

```js
import Eleva from "eleva";
import MyPlugin from "./my-plugin.js";

const app = new Eleva("MyApp");

// Register without options
app.use(MyPlugin);

// Register with options
app.use(MyPlugin, { option1: "value1", option2: true });
```

### Registration Order Matters

Plugins are installed in the order they are registered. If plugins depend on each other, register dependencies first:

```js
// Logger should be registered before Analytics (Analytics uses Logger)
app.use(LoggerPlugin);
app.use(AnalyticsPlugin);  // Can now use app.log from LoggerPlugin
```

### Accessing Plugin Features

After registration, plugin features are available on the Eleva instance:

```js
// In your plugin
install(eleva, options) {
  eleva.myFeature = { /* ... */ };
}

// After registration
app.use(MyPlugin);
console.log(app.myFeature);  // Available immediately

// In components via the app instance
app.component("MyComponent", {
  setup: () => ({
    doSomething: () => app.myFeature.someMethod()
  }),
  template: (ctx) => `<button @click="doSomething">Click</button>`
});
```

### Return Values

The `app.use()` method returns the result of `plugin.install()`. Use this for plugins that expose an API:

```js
// Plugin that returns an API
const RouterPlugin = {
  name: "router",
  version: "1.0.0",
  install(eleva, options) {
    const router = new Router(eleva, options);
    eleva.router = router;
    return router;  // Return for direct access
  }
};

// Usage
const router = app.use(RouterPlugin, { routes: [...] });
await router.start();  // Direct access to returned API
```

### What Happens During Registration

1. Eleva calls `plugin.install(eleva, options)`
2. The plugin modifies the Eleva instance (adds methods, wraps existing methods, etc.)
3. The plugin is stored internally (prevents duplicate registration)
4. The return value of `install()` is returned to the caller

---

## Plugin Cleanup (Uninstall)

Plugins can implement an optional `uninstall()` method for proper cleanup. This is recommended when your plugin wraps existing methods or adds properties to the Eleva instance.

### Basic Cleanup Pattern

```js
const MyPlugin = {
  name: "myPlugin",
  version: "1.0.0",

  install(eleva, options) {
    // Store original method for later restoration
    const originalMount = eleva.mount;
    eleva._myPlugin_originalMount = originalMount;

    // Wrap the method
    eleva.mount = function(...args) {
      console.log("Enhanced mount");
      return originalMount.call(this, ...args);
    };

    // Add new properties
    eleva.myFeature = { /* ... */ };
  },

  uninstall(eleva) {
    // Restore original method
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

// Usage
app.use(MyPlugin);

// Later, to uninstall:
MyPlugin.uninstall(app);
```

### What to Clean Up

| Resource | Cleanup Action |
|----------|----------------|
| Wrapped methods | Restore to original functions |
| Added properties | Delete from Eleva instance |
| Event listeners | Remove all subscriptions |
| Timers/intervals | Clear all timers |
| Plugin registry entry | Remove from `_plugins` Map |

### Uninstall Order (LIFO)

When multiple plugins wrap the same methods, uninstall in **reverse order** (Last In, First Out):

```js
// Installation order
app.use(PluginA);  // Wraps mount first
app.use(PluginB);  // Wraps mount second

// Uninstall in reverse order
PluginB.uninstall(app);  // Uninstall last plugin first
PluginA.uninstall(app);  // Then earlier plugins
```

> **Note:** See the [Plugin System documentation](../../plugin-system.md#plugin-vs-component-cleanup) for details on how plugin cleanup differs from component cleanup.

---

## Next Steps

- **[Development Guide](./development.md)** - Set up a plugin project, write tests
- **[Best Practices](./best-practices.md)** - Error handling, TypeScript support

---

[← Back to Examples](../index.md) | [Development Guide →](./development.md)

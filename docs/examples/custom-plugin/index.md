---
title: Creating Custom Plugins
description: Complete guide to building Eleva.js plugins. Learn plugin architecture, registration, and the basics of extending Eleva.
---

# Creating a Custom Plugin for Eleva

This comprehensive guide walks you through creating, testing, and publishing plugins for Eleva.

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

## Next Steps

- **[Development Guide](./development.md)** - Set up a plugin project, write tests
- **[Best Practices](./best-practices.md)** - Error handling, TypeScript support

---

[← Back to Examples](../index.md) | [Development Guide →](./development.md)

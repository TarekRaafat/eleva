---
title: Create Custom Plugins
description: Complete guide to building Eleva.js plugins. Learn plugin architecture, lifecycle hooks, TypeScript support, testing strategies, and npm publishing best practices.
---

# Creating a Custom Plugin for Eleva

This comprehensive guide will walk you through creating, testing, and publishing plugins for Eleva. Whether you're building a simple utility or a complex feature set, this guide covers everything you need to know.

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

## Table of Contents
- [Creating a Custom Plugin for Eleva](#creating-a-custom-plugin-for-eleva)
  - [Quick Start](#quick-start)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Plugin Basics](#plugin-basics)
  - [Registering Plugins](#registering-plugins)
  - [Creating Your First Plugin](#creating-your-first-plugin)
    - [Step 1: Set Up Your Project](#step-1-set-up-your-project)
    - [Step 2: Create Your Plugin](#step-2-create-your-plugin)
    - [Step 3: Create a Demo Application](#step-3-create-a-demo-application)
    - [Step 4: Configure Development Environment](#step-4-configure-development-environment)
  - [Plugin Development](#plugin-development)
    - [Core Concepts](#core-concepts)
    - [Advanced Features](#advanced-features)
  - [Testing Your Plugin](#testing-your-plugin)
    - [Basic Tests](#basic-tests)
    - [Testing Edge Cases](#testing-edge-cases)
    - [Testing Registration](#testing-registration)
    - [Testing with Components](#testing-with-components)
  - [Publishing Your Plugin](#publishing-your-plugin)
  - [Best Practices](#best-practices)
  - [TypeScript Support](#typescript-support)
  - [Next Steps](#next-steps)

## Prerequisites

Before you start, ensure you have:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Basic understanding of JavaScript/TypeScript
- Familiarity with Eleva's core concepts

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

## Creating Your First Plugin

Let's create a simple plugin that adds logging capabilities to Eleva.

### Step 1: Set Up Your Project

```bash
# Create a new directory for your plugin
mkdir eleva-simple-logger
cd eleva-simple-logger

# Initialize npm project
npm init -y

# Install Eleva as a peer dependency
npm install eleva --save-peer

# Install development dependencies
npm install --save-dev vite vitest @types/node
```

### Step 2: Create Your Plugin

Create `src/index.js`:

```js
const Logger = {
  name: "logger",
  version: "1.0.0",
  install(eleva, options) {
    const { level = 'info', prefix = '[Eleva]' } = options || {};
    
    // Add logging methods to Eleva instance
    eleva.log = {
      info: (msg) => console.log(`${prefix} [INFO] ${msg}`),
      warn: (msg) => console.warn(`${prefix} [WARN] ${msg}`),
      error: (msg) => console.error(`${prefix} [ERROR] ${msg}`),
      debug: (msg) => level === 'debug' && console.debug(`${prefix} [DEBUG] ${msg}`)
    };

    // Enhance component mounting with logging
    const originalMount = eleva.mount;
    eleva.mount = async function(container, compName, props) {
      eleva.log.info(`Mounting component: ${compName}`);
      const result = await originalMount.call(this, container, compName, props);
      eleva.log.info(`Component mounted: ${compName}`);
      return result;
    };

    // Log installation
    eleva.log.info('Logger plugin installed');
  }
};

export default Logger;
```

### Step 3: Create a Demo Application

Create `demo/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Logger Plugin Demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/demo/main.js"></script>
  </body>
</html>
```

Create `demo/main.js`:

```js
import Eleva from 'eleva';
import Logger from '../src/index.js';

const app = new Eleva('LoggerDemo');

// Use the plugin with custom options
app.use(Logger, {
  level: 'debug',
  prefix: '[MyApp]'
});

// Create a test component
app.component('TestComponent', {
  setup: ({ signal }) => {
    const count = signal(0);
    return { count };
  },
  template: (ctx) => `
    <div>
      <h1>Logger Plugin Demo</h1>
      <p>Count: ${ctx.count.value}</p>
      <button @click="() => count.value++">Increment</button>
    </div>
  `
});

// Mount the component
app.mount(document.querySelector('#app'), 'TestComponent');
```

### Step 4: Configure Development Environment

Create `vite.config.js`:

```js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'demo',
  build: {
    lib: {
      entry: resolve(__dirname, '../src/index.js'),
      formats: ['es', 'umd'],
      name: 'ElevaLogger'
    }
  }
});
```

Update `package.json`:

```json
{
  "name": "eleva-simple-logger",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/eleva-simple-logger.umd.js",
  "module": "dist/eleva-simple-logger.es.js",
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Plugin Development

### Core Concepts

1. **Plugin Lifecycle**
   - Installation: When the plugin is added to Eleva
   - Runtime: During application execution
   - Cleanup: When the application is destroyed

2. **Extending Eleva**
   - Adding methods to the Eleva instance
   - Creating new components
   - Modifying existing behavior
   - Adding global services

3. **Component Integration**
   - Creating reusable components
   - Managing component state
   - Handling component lifecycle

### Advanced Features

1. **State Management**
```js
install(eleva) {
  eleva.store = {
    state: new Map(),
    set(key, value) {
      this.state.set(key, value);
      eleva.emitter.emit('store:update', { key, value });
    },
    get(key) {
      return this.state.get(key);
    }
  };
}
```

2. **Middleware System**
```js
install(eleva) {
  const middlewares = [];
  
  eleva.useMiddleware = (middleware) => {
    middlewares.push(middleware);
  };
  
  const originalMount = eleva.mount;
  eleva.mount = async function(...args) {
    for (const middleware of middlewares) {
      await middleware(...args);
    }
    return originalMount.apply(this, args);
  };
}
```

3. **Plugin Composition**
```js
const ComposedPlugin = {
  name: "composed",
  version: "1.0.0",
  install(eleva, options) {
    // Use other plugins
    eleva.use(Logger, options.logger);
    eleva.use(Store, options.store);
  }
};
```

## Testing Your Plugin

Comprehensive testing ensures your plugin works correctly in all scenarios.

### Basic Tests

Create `test/plugin.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Eleva from 'eleva';
import Logger from '../src/index.js';

describe('Logger Plugin', () => {
  let app;

  beforeEach(() => {
    app = new Eleva('TestApp');
    app.use(Logger, { level: 'debug' });
  });

  it('should add logging methods to Eleva', () => {
    expect(app.log).toBeDefined();
    expect(app.log.info).toBeDefined();
    expect(app.log.warn).toBeDefined();
    expect(app.log.error).toBeDefined();
  });

  it('should log component mounting', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    app.component('Test', {
      template: () => '<div>Test</div>'
    });

    await app.mount(document.createElement('div'), 'Test');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Mounting component: Test')
    );
  });
});
```

### Testing Edge Cases

```js
describe('Logger Plugin - Edge Cases', () => {
  it('should work without options', () => {
    const app = new Eleva('TestApp');

    // Should not throw
    expect(() => app.use(Logger)).not.toThrow();
    expect(app.log).toBeDefined();
  });

  it('should use default options when none provided', () => {
    const app = new Eleva('TestApp');
    app.use(Logger);

    const consoleSpy = vi.spyOn(console, 'log');
    app.log.info('test message');

    // Default prefix is '[Eleva]'
    expect(consoleSpy).toHaveBeenCalledWith('[Eleva] [INFO] test message');
  });

  it('should handle invalid options gracefully', () => {
    const app = new Eleva('TestApp');

    // Should not throw with invalid option types
    expect(() => app.use(Logger, { level: 123 })).not.toThrow();
  });

  it('should not break if used before any components', () => {
    const app = new Eleva('TestApp');
    app.use(Logger);

    // Should work even with no components registered
    expect(() => app.log.info('early log')).not.toThrow();
  });
});
```

### Testing Registration

```js
describe('Plugin Registration', () => {
  it('should throw if plugin has no install method', () => {
    const app = new Eleva('TestApp');
    const invalidPlugin = { name: 'invalid', version: '1.0.0' };

    expect(() => app.use(invalidPlugin)).toThrow();
  });

  it('should return the install result', () => {
    const app = new Eleva('TestApp');
    const pluginWithReturn = {
      name: 'returner',
      version: '1.0.0',
      install: (eleva) => ({ api: 'value' })
    };

    const result = app.use(pluginWithReturn);
    expect(result).toEqual({ api: 'value' });
  });

  it('should pass options to install', () => {
    const app = new Eleva('TestApp');
    const installSpy = vi.fn();
    const plugin = {
      name: 'spy',
      version: '1.0.0',
      install: installSpy
    };

    app.use(plugin, { custom: 'option' });

    expect(installSpy).toHaveBeenCalledWith(app, { custom: 'option' });
  });
});
```

### Testing with Components

```js
describe('Plugin Integration with Components', () => {
  it('should be accessible in component setup', async () => {
    const app = new Eleva('TestApp');
    app.use(Logger);

    let loggerAccessed = false;

    app.component('TestComp', {
      setup: () => {
        loggerAccessed = app.log !== undefined;
        return {};
      },
      template: () => '<div>Test</div>'
    });

    await app.mount(document.createElement('div'), 'TestComp');
    expect(loggerAccessed).toBe(true);
  });
});
```

## Publishing Your Plugin

1. **Prepare for Publishing**
   ```bash
   # Build your plugin
   npm run build
   
   # Test the build
   npm run preview
   ```

2. **Publish to npm**
   ```bash
   # Login to npm
   npm login
   
   # Publish your plugin
   npm publish
   ```

3. **Documentation**
   Create a README.md with:
   - Installation instructions
   - Usage examples
   - API documentation
   - Configuration options
   - Contributing guidelines

## Best Practices

1. **Naming and Organization**
   - Use the `eleva-` prefix for published plugins
   - Follow semantic versioning
   - Maintain a clear project structure

2. **Error Handling**

   Robust error handling ensures plugins fail gracefully and provide meaningful feedback:

   ```js
   const RobustPlugin = {
     name: "robust",
     version: "1.0.0",
     install(eleva, options = {}) {
       // Validate required options
       if (options.apiKey && typeof options.apiKey !== "string") {
         throw new Error("[RobustPlugin] apiKey must be a string");
       }

       // Validate Eleva instance has required features
       if (typeof eleva.mount !== "function") {
         throw new Error("[RobustPlugin] Invalid Eleva instance");
       }

       // Warn about deprecated options (don't throw)
       if (options.legacyMode !== undefined) {
         console.warn("[RobustPlugin] legacyMode is deprecated, use modernMode instead");
       }

       // Safe method wrapping with error boundaries
       const originalMount = eleva.mount.bind(eleva);
       eleva.mount = async function(...args) {
         try {
           return await originalMount(...args);
         } catch (error) {
           console.error("[RobustPlugin] Mount failed:", error);
           throw error;  // Re-throw to maintain expected behavior
         }
       };

       // Add methods with built-in error handling
       eleva.robust = {
         safeOperation: (data) => {
           try {
             if (!data) {
               console.warn("[RobustPlugin] safeOperation called with no data");
               return null;
             }
             return processData(data);
           } catch (error) {
             console.error("[RobustPlugin] safeOperation failed:", error);
             return null;  // Return safe default
           }
         }
       };
     }
   };
   ```

   **Error Handling Checklist:**
   | Scenario | Action |
   |----------|--------|
   | Invalid required options | Throw descriptive error |
   | Invalid optional options | Use defaults, optionally warn |
   | Deprecated options | Warn but continue |
   | Runtime errors in plugin methods | Catch, log, return safe default |
   | Runtime errors in wrapped methods | Catch, log, re-throw |
   | Missing Eleva features | Throw or gracefully degrade |

3. **Edge Cases**

   Handle these common edge cases in your plugin:

   ```js
   const EdgeCasePlugin = {
     name: "edgeCase",
     version: "1.0.0",
     _installed: false,  // Track installation state

     install(eleva, options = {}) {
       // Prevent duplicate installation
       if (this._installed) {
         console.warn("[EdgeCasePlugin] Already installed, skipping");
         return eleva.edgeCase;  // Return existing instance
       }

       // Handle missing optional dependencies gracefully
       const hasStore = typeof eleva.store !== "undefined";
       if (!hasStore && options.useStore) {
         console.warn("[EdgeCasePlugin] Store plugin not found, some features disabled");
       }

       // Set defaults for all options
       const config = {
         enabled: options.enabled ?? true,
         maxItems: options.maxItems ?? 100,
         debug: options.debug ?? false,
         ...options
       };

       // Validate option ranges
       if (config.maxItems < 1 || config.maxItems > 10000) {
         console.warn("[EdgeCasePlugin] maxItems out of range (1-10000), using default");
         config.maxItems = 100;
       }

       eleva.edgeCase = {
         config,
         // Methods can check enabled state
         doSomething: () => {
           if (!config.enabled) return;
           // ... implementation
         }
       };

       this._installed = true;
       return eleva.edgeCase;
     },

     // Optional: uninstall support
     uninstall(eleva) {
       if (!this._installed) return;
       delete eleva.edgeCase;
       this._installed = false;
     }
   };
   ```

4. **Performance**
   - Lazy load heavy features
   - Clean up resources properly
   - Use efficient data structures

5. **Security**
   - Validate user input
   - Sanitize data
   - Follow security best practices

## TypeScript Support

Create `src/index.d.ts`:

```typescript
import Eleva from 'eleva';

// Plugin interface - every plugin must implement this
export interface ElevaPlugin<TOptions = Record<string, unknown>> {
  /** Unique plugin identifier */
  name: string;
  /** Semantic version string */
  version: string;
  /** Called when plugin is registered via app.use() */
  install(eleva: Eleva, options?: TOptions): void | unknown;
  /** Optional cleanup when plugin is removed */
  uninstall?(eleva: Eleva): void;
}

// Extend Eleva interface with plugin features
declare module 'eleva' {
  interface Eleva {
    log: {
      info(message: string): void;
      warn(message: string): void;
      error(message: string): void;
      debug(message: string): void;
    };
  }
}

// Plugin-specific options
export interface LoggerOptions {
  level?: 'info' | 'warn' | 'error' | 'debug';
  prefix?: string;
}

// Typed plugin export
declare const Logger: ElevaPlugin<LoggerOptions>;
export default Logger;
```

### Implementing a Typed Plugin

```typescript
import type { ElevaPlugin } from './index';

interface MyPluginOptions {
  debug?: boolean;
  maxItems?: number;
}

const MyPlugin: ElevaPlugin<MyPluginOptions> = {
  name: "myPlugin",
  version: "1.0.0",
  install(eleva, options = {}) {
    const { debug = false, maxItems = 100 } = options;
    // TypeScript will enforce correct option types
    eleva.myPlugin = { debug, maxItems };
  }
};

export default MyPlugin;
```

## Next Steps

- Join the [Eleva community](https://github.com/TarekRaafat/eleva/discussions)
- Share your plugins
- Contribute to the ecosystem
- Check out the [official plugins](../plugins/index.md) for inspiration

Remember: The best plugins are those that solve real problems while maintaining Eleva's philosophy of simplicity and performance.

---

[← Back to Examples](./index.md) | [Previous: Simple Blog](./apps/blog.md)
